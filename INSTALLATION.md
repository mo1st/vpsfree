# Biz Contact Scraper - Installation Guide

## Quick Start

### Installation Steps

1. **Download the Extension**
   - Clone this repository or download as ZIP
   - Extract to a folder on your computer

2. **Load in Chrome**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `extension` folder from this repository
   - The extension icon should appear in your toolbar

3. **First Use**
   - Click the extension icon
   - Configure your settings (optional)
   - Paste URLs (one per line)
   - Click "Start Scraping"

## Detailed Installation

### Requirements

- Google Chrome (version 88+) or Chromium-based browser (Edge, Brave, Opera)
- Developer mode enabled in extensions

### Step-by-Step Installation

#### 1. Get the Extension Files

**Option A: Clone with Git**
```bash
git clone https://github.com/mo1st/vpsfree.git
cd vpsfree/extension
```

**Option B: Download ZIP**
1. Go to the repository page
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Navigate to the `extension` folder

#### 2. Open Chrome Extensions Page

- **Method 1**: Type `chrome://extensions/` in the address bar
- **Method 2**: Menu → More Tools → Extensions
- **Method 3**: Keyboard shortcut (Chrome): Three-dot menu → Extensions

#### 3. Enable Developer Mode

Look for the "Developer mode" toggle in the top-right corner and turn it ON.

#### 4. Load the Extension

1. Click "Load unpacked" button
2. Navigate to the `extension` folder (where manifest.json is located)
3. Click "Select Folder" or "Open"

#### 5. Verify Installation

You should see:
- Extension card with "Biz Contact Scraper" name
- Green icon showing it's enabled
- Extension icon in the Chrome toolbar (you may need to pin it)

### Troubleshooting Installation

#### Extension Not Loading

**Error: "Manifest file is missing or unreadable"**
- Make sure you selected the `extension` folder (not the parent folder)
- Verify `manifest.json` exists in the folder

**Error: "Invalid manifest version"**
- Make sure you're using Chrome 88 or later
- Update Chrome if needed

**Error: Permission warnings**
- The extension needs these permissions to function:
  - `tabs`: To open and manage tabs for scraping
  - `storage`: To save your settings
  - `activeTab`: To interact with web pages
  - `scripting`: To extract emails from pages
  - `<all_urls>`: To access any website you want to scrape

#### Icon Not Showing

- Click the puzzle icon in Chrome toolbar
- Find "Biz Contact Scraper"
- Click the pin icon to keep it visible

## Configuration

### Settings Overview

The extension has several configurable settings accessible from the popup:

#### Basic Settings

1. **Stop after first email** (checkbox)
   - When enabled: Stops checking additional pages once an email is found
   - When disabled: Continues checking up to max extra pages
   - Default: Disabled

2. **Max extra pages** (number, 0-10)
   - How many About/Contact pages to check per domain
   - Higher = more thorough, but slower
   - Default: 3

3. **Max concurrent tabs** (number, 1-3)
   - How many domains to process simultaneously
   - 1 = Most stable, least resource intensive
   - 3 = Fastest, most resource intensive
   - Default: 1

#### Keyword Settings

These control which pages the extension will follow:

1. **About keywords**
   - Default: about, about-us, about us, our story, who we are
   - Match pages about the company

2. **Contact keywords**
   - Default: contact, contact-us, contact us, get in touch
   - Match contact/inquiry pages

3. **Other keywords**
   - Default: team, staff, people, leadership
   - Match team/people pages

4. **Custom keywords**
   - Add your own keywords
   - Useful for industry-specific pages

### Saving Settings

Settings are automatically saved when you:
- Check/uncheck boxes
- Change numbers
- Edit keywords (on blur/tab out)

Settings persist across:
- Browser restarts
- Extension reloads
- Multiple scraping sessions

## Usage Guide

### Basic Workflow

1. **Gather URLs**
   - Perform a Bing search for businesses
   - Copy URLs from search results
   - Or use direct website URLs

2. **Open Extension**
   - Click the extension icon in toolbar

3. **Paste URLs**
   - One URL per line in the text area
   - Can mix Bing redirects and direct URLs

4. **Configure (Optional)**
   - Adjust concurrency for speed vs stability
   - Set max extra pages
   - Enable/disable stop after first email

5. **Start Scraping**
   - Click "Start Scraping"
   - Monitor real-time progress

6. **Review Results**
   - See emails found per domain
   - Check status (pending/processing/finished)
   - Note any errors

7. **Export**
   - Click "Export Results"
   - Save CSV file to Downloads

### Advanced Usage

#### Optimizing for Speed

For fastest results:
1. Set "Max concurrent tabs" to 3
2. Set "Max extra pages" to 1
3. Enable "Stop after first email"

Trade-off: May miss some emails

#### Optimizing for Thoroughness

For most comprehensive results:
1. Set "Max concurrent tabs" to 1 (more stable)
2. Set "Max extra pages" to 5 or more
3. Disable "Stop after first email"
4. Add custom keywords for your industry

Trade-off: Slower processing

#### Industry-Specific Configurations

**Law Firms:**
- Custom keywords: attorneys, lawyers, legal team, practice areas

**Medical Practices:**
- Custom keywords: physicians, doctors, providers, patient portal

**Real Estate:**
- Custom keywords: agents, brokers, listings, properties

**Education:**
- Custom keywords: faculty, administration, admissions, departments

### Best Practices

1. **Start Small**: Test with 5-10 URLs first
2. **Use Concurrency Wisely**: Start with 1, increase if stable
3. **Save Results**: Export after each session
4. **Respect Websites**: Don't overload servers with too many concurrent requests
5. **Check Manually**: Verify important emails manually

## Updating

### Manual Update

1. Download new version
2. Remove old extension from `chrome://extensions/`
3. Load unpacked new version
4. Settings will be preserved (stored in browser)

### Development Updates

If you modify the code:
1. Go to `chrome://extensions/`
2. Click the reload icon on the extension card
3. Close and reopen popup to see changes

## Uninstallation

1. Go to `chrome://extensions/`
2. Find "Biz Contact Scraper"
3. Click "Remove"
4. Confirm removal

Note: This will delete saved settings. Export results before uninstalling if needed.

## Support

For issues or questions:
1. Check TESTING.md for troubleshooting
2. Review README.md for feature documentation
3. Create an issue on GitHub

## Privacy

- All processing happens locally in your browser
- No data sent to external servers
- Found emails stored only in browser session
- Export saves to local Downloads folder
- Settings stored in browser's local storage

## License

MIT License - See LICENSE file for details
