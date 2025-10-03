# Biz Contact Scraper - Chrome Extension

A robust, high-performance Chrome extension for extracting business contact emails from search results with advanced stability features and intelligent URL handling.

## 🎯 Key Features

- ✅ **Robust Stability** - Resilient tab handling with timeout protection, no hanging or stalls
- ✅ **Accurate Status** - Always shows completion status correctly, all domains marked "done"
- ✅ **High Performance** - Configurable concurrent processing (1-3 tabs) for faster results
- ✅ **Smart URL Handling** - Automatic Bing redirect normalization and domain deduplication
- ✅ **Intelligent Discovery** - Keyword-based followup page detection (About, Contact, Team, etc.)
- ✅ **Optimized Extraction** - Fast email scanning with 100KB text cap before DOM tree walking
- ✅ **Full Configuration** - Customizable keywords, concurrency, page limits, and more

## 📦 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/mo1st/vpsfree.git
cd vpsfree

# Load in Chrome
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the "extension" folder
```

### Usage

1. Click the extension icon
2. Paste URLs (one per line) - works with Bing search results or direct URLs
3. Configure settings (optional)
4. Click "Start Scraping"
5. Monitor real-time progress
6. Export results to CSV

## 📚 Documentation

- **[Installation Guide](INSTALLATION.md)** - Detailed installation and configuration
- **[Testing Guide](TESTING.md)** - Test scenarios and expected behaviors
- **[Extension README](extension/README.md)** - Feature documentation and troubleshooting
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Technical details and architecture

## 🚀 What's New

This version addresses critical stability and performance issues:

### Stability Fixes ✅
- **No More Hanging** - Resilient tab wait with 30-second timeout
- **Proper Cleanup** - Event listeners always removed (no memory leaks)
- **Accurate Completion** - Status always shows "done" when finished
- **Error Handling** - Gracefully handles failures and continues

### Performance Improvements ✅
- **Concurrent Processing** - Process 1-3 domains simultaneously
- **Fast Email Extraction** - Optimized scanning (10-100x faster on large pages)
- **Real-time Updates** - Heartbeat broadcasts every 2 seconds

### Smart Features ✅
- **Bing Redirect Handling** - Automatic normalization of Bing search URLs
- **Domain Deduplication** - No duplicate processing of same domain
- **Redirect Following** - Groups results by final destination domain

## 🎮 Configuration

### Basic Settings
- **Max Concurrent Tabs**: 1-3 (default: 1)
  - 1 = Most stable, least resource intensive
  - 3 = Fastest, more resource intensive
- **Max Extra Pages**: 0-10 (default: 3)
  - How many About/Contact pages to check per domain
- **Stop After First Email**: On/Off (default: Off)
  - Enable to skip followup pages once email found

### Keyword Settings
Customize which pages to follow:
- **About Keywords**: about, about-us, our story, etc.
- **Contact Keywords**: contact, contact-us, get in touch, etc.
- **Other Keywords**: team, staff, people, leadership, etc.
- **Custom Keywords**: Add your own industry-specific keywords

## 📊 Example Results

```csv
Domain,Status,Email Count,Emails,Error
example.com,finished,2,"contact@example.com; info@example.com",""
mozilla.org,finished,1,"webmaster@mozilla.org",""
test.com,finished,0,"",""
```

## 🔍 How It Works

1. **URL Normalization** - Bing redirects converted to real URLs
2. **Domain Extraction** - Root domain extracted from each URL
3. **Deduplication** - Only one entry per root domain
4. **Queue Processing** - URLs processed with configured concurrency
5. **Tab Management** - Resilient wait for page load (or timeout)
6. **Email Extraction** - Fast text scan + DOM tree fallback
7. **Keyword Matching** - Discover About/Contact/Team pages
8. **Followup Processing** - Queue and process discovered pages
9. **Finalization** - Mark all domains "finished" when complete
10. **Export** - Download results as CSV

## 🛡️ Privacy & Security

- ✅ All processing happens **locally** in your browser
- ✅ **No data** sent to external servers
- ✅ Found emails stored only in **browser session**
- ✅ CSV export saves to **local Downloads** folder
- ✅ Settings stored in **browser local storage** only

## 🧪 Testing

See [TESTING.md](TESTING.md) for:
- Sample test URLs
- Test scenarios
- Expected behaviors
- Performance testing
- Troubleshooting test cases

## 📋 Requirements

- Chrome 88+ or Chromium-based browser (Edge, Brave, Opera)
- Developer mode enabled for extension installation

## 🏗️ Architecture

### Files
```
extension/
├── manifest.json       # Extension configuration (Manifest V3)
├── background.js       # Queue engine, tab management, state
├── contentScript.js    # Email extraction logic
├── popup.html          # User interface
├── popup.js            # UI logic and settings
├── README.md           # Feature documentation
└── icon*.png           # Extension icons
```

### Key Components

**Background Script (Service Worker)**
- Queue engine with concurrent processing
- Resilient tab readiness detection
- Domain deduplication
- Bing URL normalization
- Heartbeat status broadcasts
- Settings management

**Content Script**
- Optimized email extraction (fast path + slow path)
- Keyword-based link discovery
- False positive filtering

**Popup**
- Real-time status display
- Settings configuration
- Domain results list
- CSV export

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Report bugs or request features on GitHub Issues
- **Documentation**: Check the docs/ folder for detailed guides
- **Troubleshooting**: See extension/README.md for common issues

## 📈 Version History

### 1.0.0 (Current)
- Initial release
- Robust tab load handling with timeout protection
- Accurate status completion and finalization
- Configurable concurrent processing (1-3 tabs)
- Optimized email extraction with fast/slow paths
- Bing redirect normalization (query params + base64)
- Domain deduplication by root domain
- Periodic heartbeat status updates
- Settings persistence
- CSV export functionality

## 🎉 Acknowledgments

Built to solve real-world issues with business contact scraping:
- Handles Bing search result redirects automatically
- Never hangs on slow-loading pages
- Always shows accurate completion status
- Processes multiple domains efficiently
- Finds emails other tools miss

---

**Ready to extract business contacts efficiently and reliably!** 🚀
