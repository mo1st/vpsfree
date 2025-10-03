# Email Scraper Chrome Extension

A Chrome extension for scraping email addresses from websites with advanced features including Bing search result support, customizable crawl settings, and intelligent domain grouping.

## Features

### Core Functionality
- **Email Extraction**: Automatically finds and extracts email addresses from web pages
- **Multi-URL Support**: Process multiple URLs simultaneously
- **Domain Grouping**: Results are organized by domain for easy analysis
- **Export Options**: Export results as CSV or JSON

### NEW: Bing Search Result Support
The extension now intelligently handles Bing search result URLs. When you paste Bing SERP (Search Engine Results Page) URLs, the extension:
- Automatically detects Bing redirect patterns
- Extracts the real destination URLs from Bing links
- Groups results by the actual destination domain (not bing.com)

**Supported Bing URL patterns:**
- Direct links: `https://www.example.com/page`
- Redirect URLs with `/ck/a` or `/link` paths containing `url` or `u` parameters
- Query parameters: URLs with `?url=...` or `?u=...` containing the target destination

### NEW: Customizable Crawl Settings

#### Page Categories
Control which types of pages to crawl:
- **About Pages**: Pages containing keywords like "about", "about-us", "who-we-are", "our-story", etc.
- **Contact Pages**: Pages containing keywords like "contact", "contact-us", "impressum", "imprint", etc.
- **Other/Custom Pages**: Define your own keywords (e.g., "team", "company", "careers")

#### Crawl Limits
- **Max Extra Pages**: Set maximum additional pages to crawl per domain (0-10)
  - 0 = Only crawl the root page
  - 3 = Crawl root page + up to 3 additional pages
  - Default: 3
  
- **Stop After First Email**: When enabled (default), stops crawling a domain after finding the first email
  - Saves time when you only need one contact per domain
  - Disable to find all available emails up to the page limit

#### Custom Keywords
When "Other/Custom pages" is enabled, you can specify your own keywords:
- Comma or newline separated
- Case-insensitive matching
- Examples: "team", "company", "impressum", "imprint", "careers"

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the directory containing this extension

## Usage

### Basic Usage
1. Click the extension icon to open the popup
2. Enter URLs in the text area (one per line)
3. Click "Start Scraping"
4. View results in the table below
5. Export results as CSV or JSON if needed

### Using with Bing Search Results
1. Perform a search on Bing.com
2. Copy the URLs from search results (right-click → "Copy link address")
3. Paste the URLs into the extension
4. The extension will automatically:
   - Normalize the Bing redirect URLs
   - Extract the real destination domains
   - Group results by actual domain

### Configuring Crawl Settings
1. Open the extension popup
2. Expand the "Crawl Settings" section
3. Configure your preferences:
   - Check/uncheck page categories to follow
   - Set max extra pages (0-10)
   - Enable/disable "Stop after first email"
   - Add custom keywords if using "Other" category
4. Settings are automatically saved and will persist

### Example Workflow
**Scenario**: Find contact emails for companies in Bing search results, checking only contact pages

1. Search on Bing: `site:.com contact email`
2. Copy several result URLs
3. In extension settings:
   - Uncheck "About pages"
   - Check "Contact pages"
   - Uncheck "Other pages"
   - Set "Max extra pages" to 2
   - Enable "Stop after first email"
4. Paste URLs and click "Start Scraping"
5. Extension will:
   - Visit each domain's main page
   - Look for contact page links
   - Follow up to 2 contact pages per domain
   - Stop each domain after finding first email
   - Group results by actual domain (not bing.com)

## Settings Reference

| Setting | Default | Description |
|---------|---------|-------------|
| Follow About Pages | ✓ Enabled | Crawl pages with about-related keywords |
| Follow Contact Pages | ✓ Enabled | Crawl pages with contact-related keywords |
| Follow Other Pages | ✗ Disabled | Crawl pages matching custom keywords |
| Custom Keywords | "team,company,impressum,imprint" | Keywords for custom page detection |
| Max Extra Pages | 3 | Additional pages to crawl per domain (0-10) |
| Stop After First Email | ✓ Enabled | Stop domain crawl after finding first email |

## Technical Details

### URL Normalization Algorithm
The extension implements intelligent URL normalization for Bing search results:

```javascript
// Detects Bing redirect patterns
if (hostname is bing.com AND path contains redirect patterns) {
  extract url parameter
  decode and validate
  return real destination URL
}
```

### Categorization Keywords

**About Keywords**: about, about-us, aboutus, who-we-are, our-story, our-team

**Contact Keywords**: contact, contact-us, contactus, impressum, imprint, get-in-touch

**Custom Keywords**: User-defined (excluding duplicates from About/Contact)

### Storage
Settings are persisted using `chrome.storage.local` with the key `scraperSettings`.

### Data Structure
```json
{
  "domain.com": {
    "rootUrl": "https://domain.com",
    "emails": ["contact@domain.com", "info@domain.com"],
    "pagesVisited": 3,
    "settingsSnapshot": { /* settings used for this crawl */ }
  }
}
```

## Privacy & Security

- All scraping happens locally in your browser
- No data is sent to external servers
- Extension only accesses pages you explicitly provide
- Settings and results are stored locally using Chrome's storage API

## Limitations

- Maximum of 10 extra pages per domain (plus root page)
- Requires valid URLs (http:// or https://)
- Some websites may block automated access
- JavaScript-heavy sites may not load completely before scraping

## Troubleshooting

**No emails found**
- Try increasing max pages setting
- Verify the URL is correct and accessible
- Some sites may not list emails publicly

**Bing URLs not working**
- Ensure you're copying the actual link (right-click → Copy link address)
- Try pasting the direct URL instead of the Bing result page URL

**Extension not loading**
- Check Chrome's developer mode is enabled
- Verify all files are present in the extension directory
- Check browser console for error messages

## Development

### File Structure
```
/
├── manifest.json          # Extension manifest
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic and settings management
├── background.js         # Main scraping logic and URL normalization
├── content.js            # Content script for page analysis
├── icon16.png            # 16x16 icon
├── icon48.png            # 48x48 icon
├── icon128.png           # 128x128 icon
└── README.md             # This file
```

### Key Functions

**background.js**
- `normalizeInputURL(url)`: Normalizes Bing redirect URLs
- `categorizeLink(url, settings)`: Categorizes links by keyword matching
- `handleScraping(urls, settings)`: Main scraping orchestrator
- `processDomain(domain, data)`: Processes individual domains with settings

**popup.js**
- `loadSettings()`: Loads settings from chrome.storage.local
- `saveSettings()`: Saves settings to chrome.storage.local
- `validateMaxPages()`: Validates and clamps max pages input

## License

MIT License - Feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Changelog

### Version 1.0.0 (Current)
- Initial release with Bing URL normalization
- Configurable crawl settings (page categories, limits, keywords)
- Stop-after-first-email feature
- Domain grouping for accurate attribution
- Settings persistence
- CSV and JSON export
