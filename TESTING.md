# Testing Documentation

## Automated Tests Completed

### 1. URL Normalization Tests
**Status**: ✓ All 6 tests PASSED

Test cases:
1. Direct URL (no Bing) - ✓
2. Bing redirect with /ck/a and url param - ✓
3. Bing redirect with u param - ✓
4. Bing search result page (should stay as is) - ✓
5. Invalid URL - ✓
6. HTTP URL (not HTTPS) - ✓

**Conclusion**: Bing URL normalization is working correctly for all expected patterns.

### 2. Link Categorization Tests
**Status**: ✓ All 12 tests PASSED

Test cases:
1. About page detection - ✓
2. About-us page detection - ✓
3. Contact page detection - ✓
4. Contact-us page detection - ✓
5. Impressum page detection - ✓
6. Custom keyword "team" detection - ✓
7. Custom keyword "careers" detection - ✓
8. Non-matching page returns null - ✓
9. Disabled About category - ✓
10. Disabled Contact category - ✓
11. Disabled Other category ignores keywords - ✓
12. Case-insensitive matching - ✓

**Conclusion**: Keyword-based categorization is working correctly with proper respect for settings.

## Manual Testing Guide

### Test Scenario 1: Basic URL Input
**Purpose**: Verify basic email scraping functionality

Steps:
1. Install extension in Chrome
2. Open extension popup
3. Enter: `https://example.com`
4. Click "Start Scraping"
5. Verify results appear in table

Expected: Extension should scrape the page and display any found emails.

### Test Scenario 2: Bing Search Results
**Purpose**: Verify Bing URL normalization

Steps:
1. Go to Bing.com
2. Search for: `company contact email`
3. Right-click on 2-3 search results
4. Select "Copy link address"
5. Paste URLs into extension
6. Click "Start Scraping"

Expected:
- URLs should be normalized to actual destination sites
- Results table should show actual domain names (not bing.com)
- Root URL column should show real destination URLs

### Test Scenario 3: Settings - Max Pages
**Purpose**: Verify page limit enforcement

Steps:
1. Open extension popup
2. Set "Max extra pages per domain" to 0
3. Enter a valid URL
4. Click "Start Scraping"
5. Check "Pages Visited" column in results

Expected: Should show "1" (only root page visited)

Steps:
1. Set "Max extra pages per domain" to 3
2. Re-scrape the same URL
3. Check "Pages Visited" column

Expected: Should show up to 4 pages visited (1 root + 3 extra)

### Test Scenario 4: Settings - Page Categories
**Purpose**: Verify category filtering

Steps:
1. Uncheck "About pages"
2. Uncheck "Contact pages"
3. Check "Other/Custom pages"
4. Enter keywords: `team`
5. Enter URL of a site with team page
6. Click "Start Scraping"

Expected:
- Only pages containing "team" should be crawled
- About and Contact pages should be ignored

### Test Scenario 5: Stop After First Email
**Purpose**: Verify early termination feature

Steps:
1. Enable "Stop crawling domain after first email found"
2. Set "Max extra pages" to 5
3. Enter URL of a site with multiple pages containing emails
4. Click "Start Scraping"
5. Check "Pages Visited"

Expected: Crawling should stop after first email is found (could be 1-2 pages)

Steps:
1. Disable "Stop crawling domain after first email found"
2. Re-scrape same URL
3. Check "Pages Visited"

Expected: More pages should be visited (up to max limit)

### Test Scenario 6: Settings Persistence
**Purpose**: Verify settings are saved and restored

Steps:
1. Change several settings in the popup
2. Close the popup
3. Reopen the popup

Expected: All settings should be restored to their previous values

### Test Scenario 7: Export Functionality
**Purpose**: Verify CSV and JSON export

Steps:
1. Complete a scraping session with results
2. Click "Export as CSV"
3. Open the downloaded CSV file

Expected: CSV should contain Domain, Root URL, Emails, Pages Visited columns

Steps:
1. Click "Export as JSON"
2. Open the downloaded JSON file

Expected: JSON should contain structured data with domain keys and email arrays

### Test Scenario 8: Validation
**Purpose**: Verify input validation

Steps:
1. Set "Max extra pages" to 15
2. Tab away from the input

Expected: Value should be clamped to 10 with warning message

Steps:
1. Set "Max extra pages" to -5
2. Tab away from the input

Expected: Value should be clamped to 0 with warning message

## Known Limitations

1. **JavaScript-Heavy Sites**: Sites that load content dynamically may not be fully scraped
2. **Rate Limiting**: Some websites may block rapid successive requests
3. **Browser Popup Blocker**: Extension opens tabs in background which may be blocked
4. **CORS Restrictions**: Some sites may have strict CORS policies
5. **Cloudflare Protection**: Sites with bot protection may not be accessible

## Browser Compatibility

- **Minimum Chrome Version**: 88+ (Manifest V3 support)
- **Tested On**: Chrome 120+
- **Not Supported**: Firefox, Edge (requires separate manifest adaptations)

## Performance Notes

- **Average Scrape Time**: 2-5 seconds per page
- **Delay Between Requests**: 500ms to avoid overwhelming servers
- **Memory Usage**: Minimal, results stored in-memory during scraping
- **Storage Usage**: Settings only, < 1KB

## Security Considerations

- All data processing happens locally in the browser
- No external API calls or data transmission
- Extension requests user permission for each page access
- Settings stored using Chrome's secure storage API

## Troubleshooting

### Issue: Extension not loading
- Verify Chrome version is 88+
- Check Developer Mode is enabled in chrome://extensions
- Verify all files are present in extension directory

### Issue: No emails found
- Verify URL is accessible and correct
- Try increasing max pages setting
- Check if site requires login or has bot protection
- View browser console for error messages

### Issue: Bing URLs not normalizing
- Verify you're copying the actual link (right-click → Copy link address)
- Check the URL contains expected Bing redirect patterns
- Try using the direct destination URL instead

### Issue: Settings not saving
- Check chrome.storage permission in manifest
- Verify no browser errors in console
- Try clearing extension data and reloading
