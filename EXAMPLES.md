# Usage Examples

This document provides practical examples of using the Email Scraper extension.

## Example 1: Basic Email Scraping

**Scenario**: You want to find contact emails for a single website.

**Steps**:
1. Open the extension popup
2. Enter the URL: `https://example.com`
3. Keep default settings (all page categories enabled, max 3 extra pages)
4. Click "Start Scraping"

**Expected Result**:
```
Domain          Root URL                 Emails Found              Pages Visited
example.com     https://example.com      contact@example.com       3
                                         info@example.com
```

## Example 2: Bing Search Results

**Scenario**: You searched on Bing for "tech startups contact" and want to scrape emails from the top 10 results.

**Sample Bing URLs**:
```
https://www.bing.com/ck/a?url=https%3A%2F%2Fwww.techstartup1.com
https://www.bing.com/ck/a?url=https%3A%2F%2Fwww.techstartup2.com%2Fcontact
https://www.bing.com/ck/a?url=https%3A%2F%2Fwww.techstartup3.com%2Fabout
```

**Steps**:
1. Right-click each Bing search result and select "Copy link address"
2. Paste all URLs into the extension (one per line)
3. Click "Start Scraping"

**Expected Result**:
```
Domain              Root URL                        Emails Found              Pages Visited
techstartup1.com    https://www.techstartup1.com    hello@techstartup1.com    2
techstartup2.com    https://www.techstartup2.com    info@techstartup2.com     1
techstartup3.com    https://www.techstartup3.com    contact@techstartup3.com  3
```

Note: Results are grouped by actual domain, not bing.com!

## Example 3: Contact Pages Only

**Scenario**: You only want to check contact pages, not about or other pages.

**Settings**:
- ☑ About pages: **UNCHECKED**
- ☑ Contact pages: **CHECKED**
- ☐ Other/Custom pages: **UNCHECKED**
- Max extra pages: 2
- Stop after first email: **CHECKED**

**Steps**:
1. Configure settings as above
2. Enter URL: `https://company.com`
3. Click "Start Scraping"

**What Happens**:
- Extension visits the root page (https://company.com)
- Looks for links containing "contact", "contact-us", etc.
- Visits up to 2 contact pages
- Stops after finding the first email
- Ignores all about pages and other pages

## Example 4: Custom Keywords for Team Pages

**Scenario**: You want to find emails specifically from team or careers pages.

**Settings**:
- ☐ About pages: **UNCHECKED**
- ☐ Contact pages: **UNCHECKED**
- ☑ Other/Custom pages: **CHECKED**
- Custom keywords: `team, careers, jobs, our-team, meet-the-team`
- Max extra pages: 5
- Stop after first email: **UNCHECKED**

**Steps**:
1. Configure settings as above
2. Enter URL: `https://startup.com`
3. Click "Start Scraping"

**What Happens**:
- Extension visits the root page
- Looks for links containing "team", "careers", "jobs", etc.
- Visits up to 5 matching pages
- Collects all emails found across all visited pages
- Ignores contact and about pages

## Example 5: Maximum Data Collection

**Scenario**: You want to collect as many emails as possible from a domain.

**Settings**:
- ☑ About pages: **CHECKED**
- ☑ Contact pages: **CHECKED**
- ☑ Other/Custom pages: **CHECKED**
- Custom keywords: `team, careers, press, media, support, help`
- Max extra pages: 10
- Stop after first email: **UNCHECKED**

**Steps**:
1. Configure settings as above
2. Enter URL: `https://bigcompany.com`
3. Click "Start Scraping"

**Expected Result**:
- Up to 11 pages visited (1 root + 10 extra)
- Emails collected from all matching page types
- Comprehensive email list

## Example 6: Quick Contact Check

**Scenario**: You have a list of 50 companies and just need one contact email from each.

**Settings**:
- ☑ About pages: **CHECKED**
- ☑ Contact pages: **CHECKED**
- ☐ Other/Custom pages: **UNCHECKED**
- Max extra pages: 2
- Stop after first email: **CHECKED**

**Steps**:
1. Configure settings as above
2. Paste all 50 company URLs (one per line)
3. Click "Start Scraping"
4. Wait for completion
5. Export results as CSV

**What Happens**:
- Each domain is scraped independently
- Scraping stops for each domain after first email is found
- Fast completion (usually 1-2 pages per domain)
- CSV export contains one row per domain

**CSV Output**:
```csv
Domain,Root URL,Emails,Pages Visited
company1.com,https://company1.com,info@company1.com,1
company2.com,https://company2.com,contact@company2.com,2
company3.com,https://company3.com,hello@company3.com,1
...
```

## Example 7: German/European Sites with Impressum

**Scenario**: Scraping European websites that use "Impressum" or "Imprint" pages.

**Settings**:
- ☐ About pages: **UNCHECKED**
- ☑ Contact pages: **CHECKED** (includes impressum/imprint)
- ☐ Other/Custom pages: **UNCHECKED**
- Max extra pages: 2
- Stop after first email: **CHECKED**

**Steps**:
1. Configure settings as above
2. Enter URLs of German/European sites
3. Click "Start Scraping"

**What Happens**:
- Extension recognizes "impressum" and "imprint" as contact keywords
- Visits impressum pages along with standard contact pages
- Collects legally required contact information

## Example 8: Handling Mixed Results

**Input URLs**:
```
https://www.example.com
https://www.bing.com/ck/a?url=https%3A%2F%2Fwww.anothersite.com
https://directsite.com/contact
https://www.bing.com/ck/a?url=https%3A%2F%2Fwww.example.com%2Fabout
```

**What Happens**:
1. First URL: Direct scrape of example.com
2. Second URL: Bing URL normalized to anothersite.com
3. Third URL: Direct scrape of directsite.com
4. Fourth URL: Also normalized to example.com (same domain as #1)

**Expected Result**:
```
Domain           Root URL                     Emails Found
example.com      https://www.example.com      contact@example.com
anothersite.com  https://www.anothersite.com  info@anothersite.com
directsite.com   https://directsite.com       hello@directsite.com
```

Note: URLs #1 and #4 are grouped together under example.com!

## Example 9: Export and Analysis

**After scraping**:

**CSV Export** (best for spreadsheets):
```csv
Domain,Root URL,Emails,Pages Visited
startup1.com,https://startup1.com,"info@startup1.com; hello@startup1.com",3
startup2.com,https://startup2.com,contact@startup2.com,2
```

**JSON Export** (best for programming):
```json
{
  "startup1.com": {
    "rootUrl": "https://startup1.com",
    "emails": ["info@startup1.com", "hello@startup1.com"],
    "pagesVisited": 3
  },
  "startup2.com": {
    "rootUrl": "https://startup2.com",
    "emails": ["contact@startup2.com"],
    "pagesVisited": 2
  }
}
```

## Tips and Best Practices

1. **Start Conservative**: Begin with "Stop after first email" enabled and low max pages to test
2. **Use Custom Keywords**: For specific niches, define relevant keywords (e.g., "investor-relations" for public companies)
3. **Respect Rate Limits**: Don't scrape hundreds of sites at once; browsers may throttle or block
4. **Export Regularly**: Export results after each batch to avoid losing data
5. **Verify Results**: Some email addresses may be fake or outdated; verify important contacts
6. **Legal Compliance**: Ensure your use complies with GDPR, CAN-SPAM, and other regulations

## Common Patterns

### Pattern 1: Lead Generation
- Settings: Contact pages only, stop after first email
- Goal: Quick contact information for sales leads

### Pattern 2: Comprehensive Research
- Settings: All page types, custom keywords, max pages
- Goal: Complete email database for analysis

### Pattern 3: Specific Department
- Settings: Other/Custom with relevant keywords (e.g., "hr", "recruitment", "careers")
- Goal: Find specific department contacts

### Pattern 4: Bing-First Workflow
1. Search on Bing with specific queries
2. Copy all result URLs
3. Batch scrape with appropriate settings
4. Export and analyze

## Troubleshooting Examples

### No Emails Found
**Problem**: Scraped 10 sites, no emails found

**Solutions**:
- Increase "Max extra pages" to 5 or more
- Enable all page categories
- Manually visit one site to verify emails are publicly visible
- Check if sites require login or have bot protection

### Too Many Pages Visited
**Problem**: Each domain is visiting 10+ pages

**Solution**:
- Enable "Stop after first email" to reduce page visits
- Reduce "Max extra pages" to 2-3
- Be more selective with page categories

### Wrong Domain in Results
**Problem**: Seeing bing.com or google.com in Domain column

**Solution**:
- Ensure you're copying the actual link (right-click → "Copy link address")
- Not the search result page URL
- The extension should auto-normalize, but verify URL format
