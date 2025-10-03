// Biz Contact Scraper - Background Script
// Implements robust queue engine with concurrency control, resilient tab handling, and domain deduplication

const WAIT_TIMEOUT_MS = 30000; // 30 seconds timeout for tab loads
const HEARTBEAT_INTERVAL_MS = 2000; // Broadcast status every 2 seconds while active

// State management
let state = {
  isActive: false,
  domains: {}, // { domain: { status: 'pending'|'processing'|'finished', emails: [], error: null, followups: [] } }
  queue: [], // Array of { domain, url }
  activeCount: 0,
  settings: {
    aboutKeywords: ['about', 'about-us', 'about us', 'our story', 'who we are'],
    contactKeywords: ['contact', 'contact-us', 'contact us', 'get in touch'],
    otherKeywords: ['team', 'staff', 'people', 'leadership'],
    customKeywords: [],
    maxExtraPages: 3,
    stopAfterFirstEmail: false,
    maxConcurrentTabs: 1
  }
};

let heartbeatTimer = null;

// Load settings from storage
chrome.storage.local.get(['scraperSettings'], (result) => {
  if (result.scraperSettings) {
    state.settings = { ...state.settings, ...result.scraperSettings };
  }
});

// Listen for settings updates
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.scraperSettings) {
    state.settings = { ...state.settings, ...changes.scraperSettings.newValue };
  }
});

// Normalize Bing redirect URLs
function normalizeBingUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // Check if it's a Bing URL
    if (urlObj.hostname.includes('bing.com')) {
      // Try to extract the real URL from query parameters
      const params = urlObj.searchParams;
      
      // Check common Bing redirect parameters: u, r, url
      for (const param of ['url', 'u', 'r']) {
        const target = params.get(param);
        if (target) {
          try {
            // Handle base64-encoded URLs (including a1 prefix)
            let decoded = target;
            if (decoded.startsWith('a1')) {
              decoded = decoded.substring(2);
            }
            // Try to decode as base64
            try {
              const base64Decoded = atob(decoded);
              if (base64Decoded.startsWith('http')) {
                return base64Decoded;
              }
            } catch (e) {
              // Not base64, use as-is
            }
            // URL decode
            decoded = decodeURIComponent(decoded);
            if (decoded.startsWith('http')) {
              return decoded;
            }
          } catch (e) {
            // Continue to next parameter
          }
        }
      }
    }
    
    return url;
  } catch (e) {
    return url;
  }
}

// Extract root domain from URL
function getRootDomain(url) {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.hostname.split('.');
    // Get the last two parts (domain.tld) or three for country codes (domain.co.uk)
    if (parts.length >= 2) {
      const tld = parts[parts.length - 1];
      const sld = parts[parts.length - 2];
      // Check for two-part TLDs like co.uk, com.au, etc.
      if (parts.length >= 3 && ['co', 'com', 'org', 'net', 'gov', 'ac'].includes(sld)) {
        return parts.slice(-3).join('.');
      }
      return parts.slice(-2).join('.');
    }
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
}

// Broadcast current state to popup
function broadcastState() {
  chrome.runtime.sendMessage({
    type: 'STATE_UPDATE',
    state: {
      isActive: state.isActive,
      domains: state.domains,
      queueLength: state.queue.length,
      activeCount: state.activeCount
    }
  }).catch(() => {
    // Popup may not be open, ignore errors
  });
}

// Start heartbeat when active
function startHeartbeat() {
  if (heartbeatTimer) return;
  heartbeatTimer = setInterval(() => {
    if (state.isActive) {
      broadcastState();
    } else {
      stopHeartbeat();
    }
  }, HEARTBEAT_INTERVAL_MS);
}

// Stop heartbeat
function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

// Resilient tab wait - resolves on complete, removed, or timeout
function waitForTabReady(tabId) {
  return new Promise((resolve) => {
    let completed = false;
    let updateListener = null;
    let removedListener = null;
    let timeoutId = null;

    const cleanup = () => {
      if (completed) return;
      completed = true;
      
      if (updateListener) {
        chrome.tabs.onUpdated.removeListener(updateListener);
      }
      if (removedListener) {
        chrome.tabs.onRemoved.removeListener(removedListener);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    const finish = (reason) => {
      cleanup();
      resolve({ completed: true, reason });
    };

    // Listen for tab updates
    updateListener = (updatedTabId, changeInfo, tab) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        finish('complete');
      }
    };
    chrome.tabs.onUpdated.addListener(updateListener);

    // Listen for tab removal
    removedListener = (removedTabId) => {
      if (removedTabId === tabId) {
        finish('removed');
      }
    };
    chrome.tabs.onRemoved.addListener(removedListener);

    // Timeout fallback
    timeoutId = setTimeout(() => {
      finish('timeout');
    }, WAIT_TIMEOUT_MS);

    // Check if tab is already complete
    chrome.tabs.get(tabId).then((tab) => {
      if (tab.status === 'complete') {
        finish('already-complete');
      }
    }).catch(() => {
      finish('error');
    });
  });
}

// Process a single domain
async function processDomain(domain, url) {
  state.activeCount++;
  state.domains[domain].status = 'processing';
  broadcastState();

  let tabId = null;

  try {
    // Create tab
    const tab = await chrome.tabs.create({ url, active: false });
    tabId = tab.id;

    // Wait for tab to be ready
    const waitResult = await waitForTabReady(tabId);
    
    // Get final URL after any redirects
    let finalUrl = url;
    try {
      const updatedTab = await chrome.tabs.get(tabId);
      finalUrl = updatedTab.url;
      
      // Check if we were redirected to a different domain
      const finalDomain = getRootDomain(finalUrl);
      if (finalDomain !== domain) {
        // Update domain mapping
        if (!state.domains[finalDomain]) {
          state.domains[finalDomain] = {
            status: 'processing',
            emails: [],
            followups: [],
            error: null
          };
        }
        // Merge data if needed
        if (state.domains[domain].emails.length === 0 && state.domains[finalDomain].emails.length === 0) {
          // Continue processing under new domain
          delete state.domains[domain];
          domain = finalDomain;
        }
      }
    } catch (e) {
      // Tab may have been closed, continue anyway
    }

    // Try to execute content script even if timeout occurred
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: extractContactInfo,
        args: [state.settings]
      });

      if (results && results[0] && results[0].result) {
        const { emails, followups } = results[0].result;
        
        // Store results
        state.domains[domain].emails = [...new Set([...state.domains[domain].emails, ...emails])];
        state.domains[domain].followups = [...new Set([...state.domains[domain].followups, ...followups])];

        // Queue followup pages if needed
        if (!state.settings.stopAfterFirstEmail || state.domains[domain].emails.length === 0) {
          const currentFollowupCount = state.domains[domain].followups.length;
          const limit = Math.min(followups.length, state.settings.maxExtraPages);
          
          for (let i = 0; i < limit && i < state.settings.maxExtraPages; i++) {
            const followupUrl = followups[i];
            if (!state.queue.some(item => item.url === followupUrl)) {
              state.queue.push({ domain, url: followupUrl });
            }
          }
        }
      }
    } catch (error) {
      // Content script execution failed (may happen on chrome:// pages or if tab closed)
      state.domains[domain].error = error.message;
    }

    // Close the tab
    if (tabId) {
      try {
        await chrome.tabs.remove(tabId);
      } catch (e) {
        // Tab may already be closed
      }
    }

  } catch (error) {
    state.domains[domain].error = error.message;
  } finally {
    state.activeCount--;
    
    // Mark domain as finished if no more items in queue for it
    const hasMoreInQueue = state.queue.some(item => item.domain === domain);
    if (!hasMoreInQueue && state.domains[domain]) {
      state.domains[domain].status = 'finished';
    }
    
    broadcastState();
  }
}

// Main queue processor
async function processQueue() {
  while (state.queue.length > 0 && state.isActive) {
    // Wait if we're at max concurrency
    while (state.activeCount >= state.settings.maxConcurrentTabs && state.isActive) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!state.isActive) break;

    const item = state.queue.shift();
    if (item) {
      // Don't wait for completion - process in parallel up to maxConcurrentTabs
      processDomain(item.domain, item.url);
    }
  }

  // Wait for all active tasks to complete
  while (state.activeCount > 0 && state.isActive) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Finalize all domains
  for (const domain in state.domains) {
    if (state.domains[domain].status !== 'finished') {
      state.domains[domain].status = 'finished';
    }
  }

  state.isActive = false;
  broadcastState();
  stopHeartbeat();
}

// Content script function (injected into pages)
function extractContactInfo(settings) {
  const emails = new Set();
  const followups = new Set();

  // Fast email extraction from body text first (with size cap)
  const bodyText = document.body.innerText.substring(0, 100000); // Cap at 100KB
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const foundInBody = bodyText.match(emailRegex) || [];
  foundInBody.forEach(email => {
    // Filter out common false positives
    if (!email.includes('example.com') && !email.includes('domain.com')) {
      emails.add(email.toLowerCase());
    }
  });

  // If no emails found in body text, walk text nodes (slower but more thorough)
  if (emails.size === 0) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while (node = walker.nextNode()) {
      const matches = node.textContent.match(emailRegex) || [];
      matches.forEach(email => {
        if (!email.includes('example.com') && !email.includes('domain.com')) {
          emails.add(email.toLowerCase());
        }
      });
    }
  }

  // Find followup links based on keywords
  const allKeywords = [
    ...settings.aboutKeywords,
    ...settings.contactKeywords,
    ...settings.otherKeywords,
    ...settings.customKeywords
  ];

  const links = document.querySelectorAll('a[href]');
  const currentDomain = window.location.hostname;

  links.forEach(link => {
    try {
      const href = link.href;
      const linkUrl = new URL(href);
      
      // Only follow links on the same domain
      if (linkUrl.hostname === currentDomain) {
        const linkText = (link.textContent || '').toLowerCase().trim();
        const linkHref = href.toLowerCase();

        // Check if link matches any keyword
        for (const keyword of allKeywords) {
          if (linkText.includes(keyword.toLowerCase()) || linkHref.includes(keyword.toLowerCase())) {
            followups.add(href);
            break;
          }
        }
      }
    } catch (e) {
      // Invalid URL, skip
    }
  });

  return {
    emails: Array.from(emails),
    followups: Array.from(followups)
  };
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_SCRAPING') {
    const { urls } = message;
    
    // Reset state
    state.isActive = true;
    state.domains = {};
    state.queue = [];
    state.activeCount = 0;

    // Normalize and deduplicate URLs by destination domain
    const domainMap = new Map(); // domain -> url (first URL for that domain)

    urls.forEach(rawUrl => {
      const normalizedUrl = normalizeBingUrl(rawUrl.trim());
      if (normalizedUrl) {
        const domain = getRootDomain(normalizedUrl);
        if (!domainMap.has(domain)) {
          domainMap.set(domain, normalizedUrl);
        }
      }
    });

    // Initialize domains and queue
    domainMap.forEach((url, domain) => {
      state.domains[domain] = {
        status: 'pending',
        emails: [],
        followups: [],
        error: null
      };
      state.queue.push({ domain, url });
    });

    startHeartbeat();
    broadcastState();
    processQueue();

    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'STOP_SCRAPING') {
    state.isActive = false;
    state.queue = [];
    stopHeartbeat();
    broadcastState();
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'GET_STATE') {
    sendResponse({
      isActive: state.isActive,
      domains: state.domains,
      queueLength: state.queue.length,
      activeCount: state.activeCount
    });
    return true;
  }

  if (message.type === 'EXPORT_RESULTS') {
    const results = [];
    for (const domain in state.domains) {
      const domainData = state.domains[domain];
      results.push({
        domain,
        status: domainData.status,
        emails: domainData.emails,
        emailCount: domainData.emails.length,
        error: domainData.error
      });
    }
    sendResponse({ results });
    return true;
  }
});

console.log('Biz Contact Scraper background script loaded');
