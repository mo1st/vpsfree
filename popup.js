// NEW: Settings management and UI logic
const DEFAULT_SETTINGS = {
  followAbout: true,
  followContact: true,
  followOther: false,
  otherKeywords: 'team,company,impressum,imprint',
  maxExtraPages: 3,
  stopAfterFirstEmail: true
};

let currentSettings = { ...DEFAULT_SETTINGS };

// Load settings from storage
async function loadSettings() {
  try {
    const stored = await chrome.storage.local.get('scraperSettings');
    if (stored.scraperSettings) {
      // Merge with defaults to handle missing keys
      currentSettings = { ...DEFAULT_SETTINGS, ...stored.scraperSettings };
    }
    applySettingsToUI();
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Apply settings to UI elements
function applySettingsToUI() {
  document.getElementById('followAbout').checked = currentSettings.followAbout;
  document.getElementById('followContact').checked = currentSettings.followContact;
  document.getElementById('followOther').checked = currentSettings.followOther;
  document.getElementById('otherKeywords').value = currentSettings.otherKeywords;
  document.getElementById('maxExtraPages').value = currentSettings.maxExtraPages;
  document.getElementById('stopAfterFirstEmail').checked = currentSettings.stopAfterFirstEmail;
  
  // Show/hide other keywords based on followOther
  toggleOtherKeywordsVisibility();
  validateMaxPages();
}

// Save settings to storage
async function saveSettings() {
  try {
    await chrome.storage.local.set({ scraperSettings: currentSettings });
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Toggle visibility of other keywords textarea
function toggleOtherKeywordsVisibility() {
  const followOther = document.getElementById('followOther').checked;
  const otherKeywordsRow = document.getElementById('otherKeywordsRow');
  otherKeywordsRow.style.display = followOther ? 'block' : 'none';
}

// Validate max pages input
function validateMaxPages() {
  const input = document.getElementById('maxExtraPages');
  const warning = document.getElementById('maxPagesWarning');
  const value = parseInt(input.value);
  
  if (isNaN(value) || value < 0 || value > 10) {
    warning.style.display = 'block';
    // Clamp value
    const clamped = Math.max(0, Math.min(10, isNaN(value) ? 3 : value));
    input.value = clamped;
    currentSettings.maxExtraPages = clamped;
  } else {
    warning.style.display = 'none';
    currentSettings.maxExtraPages = value;
  }
}

// Initialize event listeners for settings
function initSettingsListeners() {
  document.getElementById('followAbout').addEventListener('change', (e) => {
    currentSettings.followAbout = e.target.checked;
    saveSettings();
  });
  
  document.getElementById('followContact').addEventListener('change', (e) => {
    currentSettings.followContact = e.target.checked;
    saveSettings();
  });
  
  document.getElementById('followOther').addEventListener('change', (e) => {
    currentSettings.followOther = e.target.checked;
    toggleOtherKeywordsVisibility();
    saveSettings();
  });
  
  let keywordsTimeout;
  document.getElementById('otherKeywords').addEventListener('input', (e) => {
    clearTimeout(keywordsTimeout);
    keywordsTimeout = setTimeout(() => {
      currentSettings.otherKeywords = e.target.value;
      saveSettings();
    }, 500);
  });
  
  document.getElementById('maxExtraPages').addEventListener('change', (e) => {
    validateMaxPages();
    saveSettings();
  });
  
  document.getElementById('stopAfterFirstEmail').addEventListener('change', (e) => {
    currentSettings.stopAfterFirstEmail = e.target.checked;
    saveSettings();
  });
}

// Show status message
function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = type;
  statusDiv.style.display = 'block';
  
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
}

// Start scraping process
async function startScraping() {
  const urlsText = document.getElementById('urls').value.trim();
  
  if (!urlsText) {
    showStatus('Please enter at least one URL', 'error');
    return;
  }
  
  const urls = urlsText.split('\n').map(u => u.trim()).filter(u => u);
  
  if (urls.length === 0) {
    showStatus('Please enter at least one valid URL', 'error');
    return;
  }
  
  // Disable button during scraping
  const scrapeBtn = document.getElementById('scrapeBtn');
  scrapeBtn.disabled = true;
  scrapeBtn.textContent = 'Scraping...';
  
  showStatus(`Starting scrape of ${urls.length} URL(s)...`, 'info');
  
  try {
    // Send message to background script to start scraping
    const response = await chrome.runtime.sendMessage({
      action: 'startScraping',
      urls: urls,
      settings: currentSettings
    });
    
    if (response.success) {
      showStatus('Scraping completed!', 'success');
      displayResults(response.results);
    } else {
      showStatus(`Error: ${response.error}`, 'error');
    }
  } catch (error) {
    showStatus(`Error: ${error.message}`, 'error');
  } finally {
    scrapeBtn.disabled = false;
    scrapeBtn.textContent = 'Start Scraping';
  }
}

// Display results in table
function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  const tableDiv = document.getElementById('resultsTable');
  
  if (!results || Object.keys(results).length === 0) {
    tableDiv.innerHTML = '<p>No emails found.</p>';
    resultsDiv.style.display = 'block';
    return;
  }
  
  let html = '<table><thead><tr><th>Domain</th><th>Root URL</th><th>Emails Found</th><th>Pages Visited</th></tr></thead><tbody>';
  
  for (const [domain, data] of Object.entries(results)) {
    const emails = data.emails.join(', ');
    const pagesVisited = data.pagesVisited || 1;
    html += `<tr>
      <td>${domain}</td>
      <td><a href="${data.rootUrl}" target="_blank">${data.rootUrl}</a></td>
      <td>${emails || 'None'}</td>
      <td>${pagesVisited}</td>
    </tr>`;
  }
  
  html += '</tbody></table>';
  tableDiv.innerHTML = html;
  resultsDiv.style.display = 'block';
  
  // Store results for export
  window.currentResults = results;
}

// Clear results
function clearResults() {
  document.getElementById('resultsTable').innerHTML = '';
  document.getElementById('results').style.display = 'none';
  document.getElementById('urls').value = '';
  window.currentResults = null;
  showStatus('Results cleared', 'info');
}

// Export as CSV
function exportCSV() {
  if (!window.currentResults) {
    showStatus('No results to export', 'error');
    return;
  }
  
  let csv = 'Domain,Root URL,Emails,Pages Visited\n';
  
  for (const [domain, data] of Object.entries(window.currentResults)) {
    const emails = data.emails.join('; ');
    const pagesVisited = data.pagesVisited || 1;
    csv += `"${domain}","${data.rootUrl}","${emails}",${pagesVisited}\n`;
  }
  
  downloadFile(csv, 'email-scraper-results.csv', 'text/csv');
}

// Export as JSON
function exportJSON() {
  if (!window.currentResults) {
    showStatus('No results to export', 'error');
    return;
  }
  
  const json = JSON.stringify(window.currentResults, null, 2);
  downloadFile(json, 'email-scraper-results.json', 'application/json');
}

// Download file helper
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  initSettingsListeners();
  
  document.getElementById('scrapeBtn').addEventListener('click', startScraping);
  document.getElementById('clearBtn').addEventListener('click', clearResults);
  document.getElementById('exportCsvBtn').addEventListener('click', exportCSV);
  document.getElementById('exportJsonBtn').addEventListener('click', exportJSON);
});
