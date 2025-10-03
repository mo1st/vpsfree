# Biz Contact Scraper

A robust Chrome extension for extracting business contact emails from search results with advanced stability, performance, and deduplication features.

## Features

### Stability Improvements

- **Resilient Tab Load Handling**: Uses a robust wait mechanism that resolves on tab completion, removal, or timeout (30 seconds)
- **No Memory Leaks**: Properly cleans up all event listeners to prevent issues in subsequent runs
- **Graceful Error Handling**: Attempts content script execution even after timeout; continues processing on failures
- **Accurate Status Completion**: Ensures all domains are marked as "finished" when processing completes

### Performance Enhancements

- **Concurrent Processing**: Configure 1-3 concurrent tabs to process multiple domains simultaneously
- **Optimized Email Extraction**: Fast-path email scanning using `innerText` (with 100KB cap) before falling back to DOM tree walking
- **Periodic Status Updates**: Real-time heartbeat broadcasts keep the UI synchronized while processing

### Smart URL Handling

- **Bing Redirect Normalization**: Automatically handles Bing search result URLs with:
  - Query parameter extraction (url, u, r parameters)
  - Base64-encoded URLs (including a1-prefixed variants)
  - Post-navigation domain verification
- **Domain Deduplication**: Multiple URLs pointing to the same root domain are processed only once
- **Redirect Following**: Final destination domain is used for grouping after redirects

### Intelligent Email Discovery

- **Keyword-Based Followup**: Automatically discovers and follows relevant pages:
  - About pages (about, about-us, our story, etc.)
  - Contact pages (contact, contact-us, get in touch, etc.)
  - Team pages (team, staff, people, leadership, etc.)
  - Custom keywords (user-configurable)
- **Configurable Depth**: Set maximum extra pages to check per domain (0-10)
- **Email Filtering**: Excludes common false positives (example.com, domain.com, etc.)
- **Early Exit Option**: Stop after finding first email on a domain

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `extension` folder
6. The extension icon should appear in your toolbar

## Usage

### Basic Workflow

1. Click the extension icon to open the popup
2. Paste URLs (one per line) into the text area:
   - Direct website URLs: `https://example.com`
   - Bing search results: URLs from Bing search will be automatically normalized
3. Configure settings (optional):
   - **Stop after first email**: Enable to skip followup pages once an email is found
   - **Max extra pages**: Number of About/Contact/etc. pages to check (default: 3)
   - **Max concurrent tabs**: Process 1-3 domains at once (default: 1)
   - **Keywords**: Customize which page types to follow
4. Click "Start Scraping"
5. Monitor progress in real-time:
   - Status shows Active/Idle state
   - Queue shows pending domains
   - Active shows currently processing tabs
   - Results show found emails per domain
6. Click "Export Results" to download a CSV file

### Performance Tips

- **Single Tab (1)**: Most stable, uses minimal resources
- **Two Tabs (2)**: 2x faster for multiple domains, moderate resource use
- **Three Tabs (3)**: 3x faster for multiple domains, higher resource use

Start with 1 tab and increase if your system can handle it.

### Settings

#### Keyword Configuration

Customize which pages to follow by editing keyword lists:

- **About Keywords**: Pages about the company (about, about-us, our story, who we are)
- **Contact Keywords**: Contact pages (contact, contact-us, get in touch)
- **Other Keywords**: Team/people pages (team, staff, people, leadership)
- **Custom Keywords**: Any additional keywords you want to search for

Keywords are matched in both link text and URLs (case-insensitive).

#### Processing Options

- **Stop after first email**: When enabled, stops checking additional pages once an email is found on a domain
- **Max extra pages**: Limits how many followup pages to check per domain (0-10)
- **Max concurrent tabs**: Number of domains to process simultaneously (1-3)

All settings are automatically saved and persist across browser sessions.

## Troubleshooting

### Extension Not Working

- Ensure you're using Chrome or a Chromium-based browser
- Check that the extension is enabled in `chrome://extensions/`
- Reload the extension if you made changes to the code

### No Emails Found

- Some websites may not display emails publicly
- Try increasing "Max extra pages" to check more pages
- Add custom keywords for pages specific to your target industry

### Performance Issues

- Reduce "Max concurrent tabs" to 1
- Reduce "Max extra pages" to limit the number of pages checked
- Enable "Stop after first email" to skip unnecessary page checks

### Status Stuck

This version includes fixes for the status hanging issue:
- Robust timeout handling (30 seconds per page)
- Automatic tab cleanup
- Proper event listener cleanup
- Final status broadcast when queue drains

If you still experience issues:
1. Click "Stop" to reset
2. Reload the extension
3. Try again with fewer URLs

## Technical Details

### Architecture

- **Manifest V3**: Uses the latest Chrome extension architecture
- **Service Worker**: Background script runs as a service worker
- **Content Script**: Injected into pages for email extraction
- **Storage API**: Persistent settings storage

### Files

- `manifest.json`: Extension configuration
- `background.js`: Queue engine, tab management, state coordination
- `contentScript.js`: Email and link extraction logic
- `popup.html`: User interface
- `popup.js`: UI logic and settings management
- `README.md`: This file

### Queue Engine

The background script implements a sophisticated queue system:

1. **URL Normalization**: Bing redirects are normalized before queueing
2. **Domain Deduplication**: Only one entry per root domain
3. **Concurrent Processing**: Configurable parallelism (1-3 tabs)
4. **Resilient Waiting**: Timeout, completion, and removal detection
5. **Dynamic Followups**: Additional pages queued based on discovered links
6. **Proper Finalization**: All domains marked finished when complete

### Email Extraction

Two-phase approach for optimal performance:

1. **Fast Path**: Scan `document.body.innerText` (capped at 100KB) with regex
2. **Slow Path**: If no emails found, walk text nodes (more thorough but slower)

### Status Synchronization

- **Heartbeat**: Status broadcast every 2 seconds while active
- **Event-Driven**: Updates on state changes (start, complete, error)
- **Persistent**: Results remain visible after completion

## Privacy & Security

- No data is sent to external servers
- All processing happens locally in your browser
- Found emails are stored only in your browser session
- CSV export saves to your local Downloads folder

## License

MIT License - Feel free to modify and distribute

## Version History

### 1.0.0 (Current)

- Initial release
- Robust tab load handling with timeout/complete/removed detection
- Accurate status completion and finalization
- Configurable concurrent processing (1-3 tabs)
- Optimized email extraction with fast/slow paths
- Bing redirect normalization (query params + base64)
- Domain deduplication by root domain
- Periodic heartbeat status updates
- Settings persistence
- CSV export functionality
