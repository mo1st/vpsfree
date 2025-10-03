// Biz Contact Scraper - Content Script
// Optimized email extraction with categorized followup links

// This script is injected via manifest but main extraction happens via executeScript
// This provides a fallback and allows for future enhancements

(function() {
  'use strict';

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXTRACT_CONTACT_INFO') {
      const result = extractContactInfo(message.settings);
      sendResponse(result);
      return true;
    }
  });

  function extractContactInfo(settings) {
    const emails = new Set();
    const followups = new Set();

    // Fast email extraction from body text first (with size cap)
    // This is much faster than walking the DOM tree node by node
    const bodyText = document.body.innerText.substring(0, 100000); // Cap at 100KB to avoid performance issues
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const foundInBody = bodyText.match(emailRegex) || [];
    
    foundInBody.forEach(email => {
      // Filter out common false positives
      const lowerEmail = email.toLowerCase();
      if (!lowerEmail.includes('example.com') && 
          !lowerEmail.includes('domain.com') &&
          !lowerEmail.includes('your-email.com') &&
          !lowerEmail.includes('test.com')) {
        emails.add(lowerEmail);
      }
    });

    // If no emails found in body text, walk text nodes (slower but more thorough)
    if (emails.size === 0) {
      try {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null
        );

        let node;
        let nodeCount = 0;
        const maxNodes = 10000; // Prevent infinite loops on very large pages

        while ((node = walker.nextNode()) && nodeCount < maxNodes) {
          nodeCount++;
          const matches = node.textContent.match(emailRegex) || [];
          matches.forEach(email => {
            const lowerEmail = email.toLowerCase();
            if (!lowerEmail.includes('example.com') && 
                !lowerEmail.includes('domain.com') &&
                !lowerEmail.includes('your-email.com') &&
                !lowerEmail.includes('test.com')) {
              emails.add(lowerEmail);
            }
          });

          // Early exit if we found emails
          if (emails.size > 0) {
            break;
          }
        }
      } catch (e) {
        console.error('Error walking text nodes:', e);
      }
    }

    // Find followup links based on keywords
    const allKeywords = [
      ...(settings.aboutKeywords || []),
      ...(settings.contactKeywords || []),
      ...(settings.otherKeywords || []),
      ...(settings.customKeywords || [])
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
            const keywordLower = keyword.toLowerCase();
            if (linkText.includes(keywordLower) || linkHref.includes(keywordLower)) {
              followups.add(href);
              break;
            }
          }
        }
      } catch (e) {
        // Invalid URL or cross-origin, skip
      }
    });

    return {
      emails: Array.from(emails),
      followups: Array.from(followups)
    };
  }

  console.log('Biz Contact Scraper content script loaded');
})();
