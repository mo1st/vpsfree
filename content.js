// Content script for additional page-level operations
// This runs on every page but is currently minimal as main logic is in background.js

console.log('Email scraper content script loaded');

// Listen for messages from background script if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractEmails') {
    const emails = extractEmailsFromPage();
    sendResponse({ emails });
  }
  return true;
});

// Extract emails from current page
function extractEmailsFromPage() {
  const emails = new Set();
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
  
  return Array.from(emails);
}
