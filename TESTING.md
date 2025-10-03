# Sample Test URLs for Biz Contact Scraper

## Direct Website URLs

These URLs can be used to test the extension with direct website links:

```
https://www.example.com
https://www.mozilla.org
https://www.wikipedia.org
```

## Simulated Bing Search Results

To test Bing redirect handling, you would typically:

1. Go to Bing.com
2. Search for business-related queries like:
   - "plumbing services near me"
   - "marketing agency"
   - "law firm contact"
3. Copy the URL from search results (these will be Bing redirect URLs)
4. Paste them into the extension

Example format of Bing redirect URLs:
```
https://www.bing.com/ck/a?!&&p=abc123...&u=a1aHR0cHM6Ly93d3cuZXhhbXBsZS5jb20v
```

## Testing Scenarios

### Scenario 1: Basic Email Extraction
Use a simple website with visible email addresses:
```
https://www.w3.org/Consortium/contact
```

### Scenario 2: Contact Page Discovery
Use websites where emails are on separate contact/about pages:
```
https://www.mozilla.org
```
(The extension should discover and follow the "Contact" link)

### Scenario 3: Domain Deduplication
Paste multiple URLs from the same domain:
```
https://www.example.com
https://www.example.com/about
https://www.example.com/contact
```
(The extension should only process example.com once)

### Scenario 4: Concurrency Testing
With concurrency set to 2 or 3, test multiple different domains:
```
https://www.mozilla.org
https://www.w3.org
https://www.apache.org
https://www.python.org
```

## Expected Behavior

### Status Updates
- **Active**: True while processing, False when complete
- **Queue**: Decreases as domains are processed
- **Active tabs**: Shows current concurrent processing count (1-3)

### Domain Results
Each domain should show:
- **Status**: pending → processing → finished
- **Emails**: List of found emails (if any)
- **Error**: Any errors encountered (e.g., tab closed, navigation failed)

### Completion Criteria
- All domains should be marked "finished" when done
- Status should show "Idle" (not active)
- No memory leaks - subsequent runs should work normally

## Performance Testing

### Single Tab (Concurrency = 1)
- Processes domains one at a time
- Most stable and resource-efficient
- Expected time: ~30-60 seconds per domain (depending on page load time)

### Two Tabs (Concurrency = 2)
- Processes two domains simultaneously
- Should complete ~2x faster than single tab
- Moderate resource usage

### Three Tabs (Concurrency = 3)
- Processes three domains simultaneously
- Should complete ~3x faster than single tab
- Higher resource usage (CPU, memory, network)

## Troubleshooting Test Cases

### Test 1: Timeout Handling
Use a slow-loading website or one that times out:
```
https://httpstat.us/200?sleep=35000
```
Expected: Should timeout after 30 seconds and continue to next domain

### Test 2: Invalid URLs
Mix valid and invalid URLs:
```
https://www.example.com
not-a-valid-url
https://www.mozilla.org
```
Expected: Should skip invalid URLs and process valid ones

### Test 3: Stop Functionality
1. Start scraping with 5+ domains
2. Click "Stop" button after 2-3 domains
Expected: Should stop processing and mark remaining domains appropriately

### Test 4: Export Results
After scraping completes:
1. Click "Export Results"
Expected: Should download a CSV file with domain, status, email count, and emails

## Notes

- Real Bing URLs are dynamic and contain unique identifiers
- Some test URLs may not have public emails (this is normal)
- The extension follows robots.txt and respects website policies
- Always test responsibly and don't overload servers

## Advanced Testing

### Custom Keywords
Add industry-specific keywords:
- "leadership" for corporate sites
- "staff" for educational institutions
- "directory" for professional organizations

### Stop After First Email
Enable this setting and test with sites that have emails on multiple pages - should only collect from first page found.

### Max Extra Pages
Set to 0, 1, or 5 and observe how many followup pages are checked.
