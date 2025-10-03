// Biz Contact Scraper - Popup Script
// Manages UI, settings persistence, and communication with background script

// DOM elements
const urlsTextarea = document.getElementById('urls');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const exportBtn = document.getElementById('exportBtn');
const statusPanel = document.getElementById('statusPanel');
const resultsPanel = document.getElementById('resultsPanel');
const domainList = document.getElementById('domainList');
const statusActive = document.getElementById('statusActive');
const statusQueue = document.getElementById('statusQueue');
const statusActiveCount = document.getElementById('statusActiveCount');

// Settings elements
const stopAfterFirstEmailCheckbox = document.getElementById('stopAfterFirstEmail');
const maxExtraPagesInput = document.getElementById('maxExtraPages');
const maxConcurrentTabsInput = document.getElementById('maxConcurrentTabs');
const aboutKeywordsInput = document.getElementById('aboutKeywords');
const contactKeywordsInput = document.getElementById('contactKeywords');
const otherKeywordsInput = document.getElementById('otherKeywords');
const customKeywordsInput = document.getElementById('customKeywords');

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get(['scraperSettings'], (result) => {
    if (result.scraperSettings) {
      const settings = result.scraperSettings;
      
      stopAfterFirstEmailCheckbox.checked = settings.stopAfterFirstEmail || false;
      maxExtraPagesInput.value = settings.maxExtraPages || 3;
      maxConcurrentTabsInput.value = settings.maxConcurrentTabs || 1;
      
      aboutKeywordsInput.value = (settings.aboutKeywords || []).join(', ');
      contactKeywordsInput.value = (settings.contactKeywords || []).join(', ');
      otherKeywordsInput.value = (settings.otherKeywords || []).join(', ');
      customKeywordsInput.value = (settings.customKeywords || []).join(', ');
    } else {
      // Set defaults
      aboutKeywordsInput.value = 'about, about-us, about us, our story, who we are';
      contactKeywordsInput.value = 'contact, contact-us, contact us, get in touch';
      otherKeywordsInput.value = 'team, staff, people, leadership';
      customKeywordsInput.value = '';
    }
  });
}

// Save settings to storage
function saveSettings() {
  const settings = {
    stopAfterFirstEmail: stopAfterFirstEmailCheckbox.checked,
    maxExtraPages: parseInt(maxExtraPagesInput.value) || 3,
    maxConcurrentTabs: Math.max(1, Math.min(3, parseInt(maxConcurrentTabsInput.value) || 1)),
    aboutKeywords: aboutKeywordsInput.value.split(',').map(k => k.trim()).filter(k => k),
    contactKeywords: contactKeywordsInput.value.split(',').map(k => k.trim()).filter(k => k),
    otherKeywords: otherKeywordsInput.value.split(',').map(k => k.trim()).filter(k => k),
    customKeywords: customKeywordsInput.value.split(',').map(k => k.trim()).filter(k => k)
  };

  chrome.storage.local.set({ scraperSettings: settings });
  return settings;
}

// Update UI state
function updateUI(state) {
  if (state.isActive) {
    statusActive.textContent = 'Running...';
    statusActive.style.color = '#4CAF50';
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    statusPanel.style.display = 'block';
  } else {
    statusActive.textContent = 'Idle';
    statusActive.style.color = '#666';
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    
    // Only hide status panel if there are no results
    if (!state.domains || Object.keys(state.domains).length === 0) {
      statusPanel.style.display = 'none';
    }
  }

  statusQueue.textContent = state.queueLength || 0;
  statusActiveCount.textContent = state.activeCount || 0;

  // Update results
  if (state.domains && Object.keys(state.domains).length > 0) {
    resultsPanel.style.display = 'block';
    renderDomains(state.domains);
  } else {
    resultsPanel.style.display = 'none';
  }
}

// Render domain results
function renderDomains(domains) {
  domainList.innerHTML = '';
  
  const sortedDomains = Object.entries(domains).sort((a, b) => {
    // Sort by status (processing first, then pending, then finished)
    const statusOrder = { processing: 0, pending: 1, finished: 2 };
    const aOrder = statusOrder[a[1].status] || 3;
    const bOrder = statusOrder[b[1].status] || 3;
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // Then by domain name
    return a[0].localeCompare(b[0]);
  });

  sortedDomains.forEach(([domain, data]) => {
    const item = document.createElement('div');
    item.className = `domain-item ${data.status}`;
    
    const domainName = document.createElement('div');
    domainName.className = 'domain-name';
    domainName.textContent = `${domain} (${data.status})`;
    item.appendChild(domainName);

    if (data.emails && data.emails.length > 0) {
      const emails = document.createElement('div');
      emails.className = 'domain-emails';
      emails.textContent = `✓ Found ${data.emails.length} email(s): ${data.emails.join(', ')}`;
      item.appendChild(emails);
    } else if (data.status === 'finished') {
      const noEmails = document.createElement('div');
      noEmails.className = 'domain-emails';
      noEmails.textContent = '✗ No emails found';
      item.appendChild(noEmails);
    }

    if (data.error) {
      const error = document.createElement('div');
      error.className = 'domain-error';
      error.textContent = `⚠ Error: ${data.error}`;
      item.appendChild(error);
    }

    domainList.appendChild(item);
  });
}

// Start scraping
startBtn.addEventListener('click', () => {
  const urls = urlsTextarea.value
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  if (urls.length === 0) {
    alert('Please enter at least one URL');
    return;
  }

  // Save settings before starting
  saveSettings();

  // Send message to background script
  chrome.runtime.sendMessage({
    type: 'START_SCRAPING',
    urls: urls
  }, (response) => {
    if (response && response.success) {
      // UI will be updated via state update messages
    }
  });
});

// Stop scraping
stopBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({
    type: 'STOP_SCRAPING'
  }, (response) => {
    if (response && response.success) {
      // UI will be updated via state update messages
    }
  });
});

// Export results
exportBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({
    type: 'EXPORT_RESULTS'
  }, (response) => {
    if (response && response.results) {
      const csvLines = ['Domain,Status,Email Count,Emails,Error'];
      
      response.results.forEach(result => {
        const emails = result.emails.join('; ');
        const error = result.error || '';
        csvLines.push(`"${result.domain}","${result.status}",${result.emailCount},"${emails}","${error}"`);
      });

      const csv = csvLines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `biz-contacts-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  });
});

// Listen for state updates from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STATE_UPDATE') {
    updateUI(message.state);
  }
});

// Auto-save settings when changed
stopAfterFirstEmailCheckbox.addEventListener('change', saveSettings);
maxExtraPagesInput.addEventListener('change', saveSettings);
maxConcurrentTabsInput.addEventListener('change', saveSettings);
aboutKeywordsInput.addEventListener('blur', saveSettings);
contactKeywordsInput.addEventListener('blur', saveSettings);
otherKeywordsInput.addEventListener('blur', saveSettings);
customKeywordsInput.addEventListener('blur', saveSettings);

// Load initial state
loadSettings();

chrome.runtime.sendMessage({
  type: 'GET_STATE'
}, (response) => {
  if (response) {
    updateUI(response);
  }
});

console.log('Biz Contact Scraper popup script loaded');
