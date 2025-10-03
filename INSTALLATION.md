# Installation Guide

## Prerequisites
- Google Chrome browser (version 88 or higher)
- Developer mode enabled in Chrome extensions

## Installation Steps

### Step 1: Download the Extension
1. Clone or download this repository to your local machine
2. Extract the files if downloaded as ZIP

### Step 2: Enable Developer Mode in Chrome
1. Open Google Chrome
2. Navigate to `chrome://extensions/` or:
   - Click the three-dot menu (⋮) in the top-right corner
   - Select "More tools" → "Extensions"
3. Toggle "Developer mode" ON in the top-right corner

### Step 3: Load the Extension
1. Click the "Load unpacked" button
2. Navigate to the folder containing the extension files
3. Select the folder and click "Open" or "Select Folder"

### Step 4: Verify Installation
1. The "Email Scraper" extension should appear in your extensions list
2. You should see the extension icon in your Chrome toolbar
3. Click the icon to open the popup and verify the UI loads correctly

## Quick Start

### Basic Usage
1. Click the Email Scraper icon in your Chrome toolbar
2. Enter one or more URLs (one per line) in the text area
3. Click "Start Scraping"
4. View results in the table below

### Using with Bing Search Results
1. Perform a search on Bing.com
2. Right-click on search result links and select "Copy link address"
3. Paste the URLs into the extension
4. The extension will automatically normalize Bing redirect URLs

### Configuring Settings
1. Open the "Crawl Settings" section in the popup
2. Adjust the following options:
   - **Page Categories**: Check which types of pages to follow (About, Contact, Other)
   - **Custom Keywords**: Add your own keywords when "Other" is enabled
   - **Max Extra Pages**: Set how many additional pages to crawl per domain (0-10)
   - **Stop After First Email**: Enable to stop crawling once an email is found
3. Settings are automatically saved

## Uninstallation

1. Navigate to `chrome://extensions/`
2. Find "Email Scraper" in the list
3. Click "Remove"
4. Confirm the removal

## Updating the Extension

1. Download the latest version
2. Navigate to `chrome://extensions/`
3. Find "Email Scraper" and click the refresh icon (↻)
4. Alternatively, remove and reinstall the extension

## Troubleshooting

### Extension doesn't appear after loading
- Verify you selected the correct folder (containing manifest.json)
- Check that all required files are present
- Refresh the extensions page

### Extension crashes or doesn't work
- Check the browser console for errors (F12)
- Verify Chrome version is 88 or higher
- Try removing and reinstalling the extension

### Permission errors
- Ensure the extension has the required permissions
- Check that host_permissions are granted in manifest.json

## Support

For issues, bug reports, or feature requests, please refer to:
- README.md for detailed feature documentation
- TESTING.md for comprehensive testing scenarios
- Create an issue in the repository

## Privacy & Data

- All scraping happens locally in your browser
- No data is sent to external servers
- Settings are stored locally using Chrome's storage API
- Extension only accesses pages you explicitly provide

## License

This extension is provided under the MIT License. See repository for full license text.
