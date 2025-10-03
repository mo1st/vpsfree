// NEW: Bing URL normalization utility
function normalizeInputURL(url) {
  try {
    const urlObj = new URL(url);
    
    // Check if this is a Bing redirect URL
    if (urlObj.hostname === 'www.bing.com' || urlObj.hostname === 'bing.com') {
      // Check for redirect patterns
      // Pattern 1: /ck/a or /link with url parameter
      if (urlObj.pathname === '/ck/a' || urlObj.pathname.includes('/link')) {
        const urlParam = urlObj.searchParams.get('url') || urlObj.searchParams.get('u');
        if (urlParam) {
          const decoded = decodeURIComponent(urlParam);
          if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
            return decoded;
          }
        }
      }
      
      // Pattern 2: Query parameter with target URL
      const urlParam = urlObj.searchParams.get('url') || urlObj.searchParams.get('u');
      if (urlParam) {
        const decoded = decodeURIComponent(urlParam);
        if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
          return decoded;
        }
      }
    }
    
    // Return original URL if no normalization needed
    return url;
  } catch (error) {
    console.error('Error normalizing URL:', url, error);
    return null;
  }
}

// Extract root domain from URL
function getRootDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    console.error('Error extracting domain:', url, error);
    return null;
  }
}

// UPDATED: Keyword-based page categorization
const ABOUT_KEYWORDS = ['about', 'about-us', 'aboutus', 'who-we-are', 'our-story', 'our-team'];
const CONTACT_KEYWORDS = ['contact', 'contact-us', 'contactus', 'impressum', 'imprint', 'get-in-touch'];

function categorizeLink(url, settings) {
  const urlLower = url.toLowerCase();
  
  // Check About category
  if (settings.followAbout) {
    for (const keyword of ABOUT_KEYWORDS) {
      if (urlLower.includes(keyword)) {
        return 'about';
      }
    }
  }
  
  // Check Contact category
  if (settings.followContact) {
    for (const keyword of CONTACT_KEYWORDS) {
      if (urlLower.includes(keyword)) {
        return 'contact';
      }
    }
  }
  
  // Check Other/Custom category
  if (settings.followOther && settings.otherKeywords) {
    const customKeywords = settings.otherKeywords
      .split(/[,\n]/)
      .map(k => k.trim().toLowerCase())
      .filter(k => k && !ABOUT_KEYWORDS.includes(k) && !CONTACT_KEYWORDS.includes(k));
    
    for (const keyword of customKeywords) {
      if (urlLower.includes(keyword)) {
        return 'other';
      }
    }
  }
  
  return null;
}

// Background script state
let scrapingResults = {};
let scrapingQueue = [];
let visitedUrls = new Set();
let currentSettings = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startScraping') {
    handleScraping(request.urls, request.settings)
      .then(results => sendResponse({ success: true, results }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

// Main scraping handler
async function handleScraping(inputUrls, settings) {
  // Reset state
  scrapingResults = {};
  scrapingQueue = [];
  visitedUrls = new Set();
  currentSettings = settings;
  
  // NEW: Normalize Bing URLs and group by domain
  const normalizedUrls = inputUrls
    .map(url => normalizeInputURL(url))
    .filter(url => url !== null);
  
  if (normalizedUrls.length === 0) {
    throw new Error('No valid URLs after normalization');
  }
  
  // Group URLs by domain
  const domainMap = {};
  for (const url of normalizedUrls) {
    const domain = getRootDomain(url);
    if (domain) {
      if (!domainMap[domain]) {
        domainMap[domain] = {
          rootUrl: url,
          emails: [],
          pagesVisited: 0,
          queuedUrls: [url],
          settingsSnapshot: { ...settings }
        };
      }
    }
  }
  
  scrapingResults = domainMap;
  
  // Process each domain
  for (const [domain, data] of Object.entries(scrapingResults)) {
    await processDomain(domain, data);
  }
  
  return scrapingResults;
}

// Process a single domain
async function processDomain(domain, domainData) {
  const maxPages = 1 + currentSettings.maxExtraPages;
  const queue = [...domainData.queuedUrls];
  
  while (queue.length > 0 && domainData.pagesVisited < maxPages) {
    const url = queue.shift();
    
    if (visitedUrls.has(url)) {
      continue;
    }
    
    visitedUrls.add(url);
    
    try {
      // Scrape the page
      const result = await scrapePage(url);
      
      if (result.emails && result.emails.length > 0) {
        // Add unique emails
        for (const email of result.emails) {
          if (!domainData.emails.includes(email)) {
            domainData.emails.push(email);
          }
        }
        
        // NEW: Stop after first email if setting enabled
        if (currentSettings.stopAfterFirstEmail && domainData.emails.length > 0) {
          domainData.pagesVisited++;
          break; // Stop processing this domain
        }
      }
      
      domainData.pagesVisited++;
      
      // NEW: Add categorized follow-up links if within page limit
      if (domainData.pagesVisited < maxPages && result.followUpLinks) {
        for (const link of result.followUpLinks) {
          const category = categorizeLink(link, currentSettings);
          if (category && !visitedUrls.has(link)) {
            const linkDomain = getRootDomain(link);
            if (linkDomain === domain) {
              queue.push(link);
            }
          }
        }
      }
      
      // Small delay to avoid overwhelming the server
      await sleep(500);
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }
}

// Scrape a single page
async function scrapePage(url) {
  try {
    // Create a new tab
    const tab = await chrome.tabs.create({ url, active: false });
    
    // Wait for page to load
    await waitForTabLoad(tab.id);
    
    // Execute content script to extract emails and links
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageData
    });
    
    // Close the tab
    await chrome.tabs.remove(tab.id);
    
    return results[0].result || { emails: [], followUpLinks: [] };
  } catch (error) {
    console.error('Error in scrapePage:', error);
    return { emails: [], followUpLinks: [] };
  }
}

// Wait for tab to finish loading
function waitForTabLoad(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(resolve, 1000); // Additional wait for dynamic content
      }
    });
  });
}

// Extract emails and links from page (injected into page context)
function extractPageData() {
  const emails = new Set();
  const followUpLinks = new Set();
  
  // Email regex pattern
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  
  // Extract from page text
  const bodyText = document.body.innerText;
  const emailMatches = bodyText.match(emailRegex);
  if (emailMatches) {
    emailMatches.forEach(email => emails.add(email.toLowerCase()));
  }
  
  // Extract from mailto links
  const mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');
  mailtoLinks.forEach(link => {
    const href = link.getAttribute('href');
    const email = href.replace('mailto:', '').split('?')[0];
    if (email) {
      emails.add(email.toLowerCase());
    }
  });
  
  // Extract potential follow-up links (all internal links)
  const currentDomain = window.location.hostname.replace(/^www\./, '');
  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    try {
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Convert relative URLs to absolute
      const absoluteUrl = new URL(href, window.location.href);
      
      // Only include same-domain links
      const linkDomain = absoluteUrl.hostname.replace(/^www\./, '');
      if (linkDomain === currentDomain) {
        // Remove hash and query params for deduplication
        const cleanUrl = absoluteUrl.origin + absoluteUrl.pathname;
        followUpLinks.add(cleanUrl);
      }
    } catch (e) {
      // Skip invalid URLs
    }
  });
  
  return {
    emails: Array.from(emails),
    followUpLinks: Array.from(followUpLinks)
  };
}

// Sleep utility
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
