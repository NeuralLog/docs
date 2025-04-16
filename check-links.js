const puppeteer = require('puppeteer');
const fs = require('fs');
const url = require('url');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

// Base URL for the site
const BASE_URL = 'http://localhost:3000';

// Additional starting points to check
const ADDITIONAL_PATHS = [
  '/docs',
  '/docs/code-walkthrough/master-secret-generation',
  '/docs/code-walkthrough/kek-version-creation',
  '/docs/code-walkthrough/admin-setup',
  '/docs/code-walkthrough/log-creation',
  '/docs/code-walkthrough/user-provisioning',
  '/docs/code-walkthrough/log-reading',
  '/docs/code-walkthrough/key-rotation',
  '/docs/code-snippets/typescript-client-sdk/src/crypto/KeyDerivation',
  '/docs/code-snippets/typescript-client-sdk/src/auth/AuthManager',
];

// Configuration
const CONFIG = {
  maxDepth: 5,           // Maximum depth to crawl
  maxPages: 100,         // Maximum number of pages to check
  includeExternal: false, // Whether to check external links
  timeout: 30000,        // Timeout for page navigation in ms
  concurrency: 3,        // Number of concurrent page checks
};

// Main function to check links
async function checkLinks() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();

  // Initialize the page pool for concurrent checks
  const pagePool = [];
  for (let i = 0; i < CONFIG.concurrency; i++) {
    const page = await browser.newPage();
    // Set a longer timeout
    page.setDefaultNavigationTimeout(CONFIG.timeout);
    pagePool.push(page);
  }

  // Stack of pages to check with their depth
  const pagesToCheck = [
    { url: BASE_URL, depth: 0 }
  ];

  // Add additional starting points
  for (const additionalPath of ADDITIONAL_PATHS) {
    pagesToCheck.push({ url: `${BASE_URL}${additionalPath}`, depth: 0 });
  }

  // Map of checked pages and their status
  const checkedPages = new Map();

  // Map of broken links
  const brokenLinks = new Map();

  // Map to track page depths
  const pageDepths = new Map();

  try {
    // Process pages until we've checked all or reached the maximum
    while (pagesToCheck.length > 0 && checkedPages.size < CONFIG.maxPages) {
      // Get the next page to check
      const pageInfo = pagesToCheck.pop();
      const { url: currentUrl, depth } = pageInfo;

      // Skip if already checked
      if (checkedPages.has(currentUrl)) {
        continue;
      }

      // Skip if we've reached the maximum depth
      if (depth > CONFIG.maxDepth) {
        console.log(`\nSkipping (max depth): ${currentUrl}`);
        continue;
      }

      console.log(`\nChecking: ${currentUrl} (depth: ${depth})`);

      // Get a page from the pool
      const page = pagePool.shift();

      try {
        // Navigate to the page
        const response = await page.goto(currentUrl, { waitUntil: 'networkidle0' });
        const status = response.status();

        // Mark as checked
        checkedPages.set(currentUrl, status);
        pageDepths.set(currentUrl, depth);

        if (status >= 400) {
          console.log(`  ❌ Status: ${status}`);
          brokenLinks.set(currentUrl, `HTTP status: ${status}`);
          continue;
        }

        console.log(`  ✅ Status: ${status}`);

        // Check for "Page not found" or similar error messages
        const pageData = await page.evaluate(() => {
          return {
            bodyText: document.body.innerText,
            title: document.title
          };
        });

        const errorPatterns = [
          'Page not found',
          'Error 404',
          'Cannot find',
          'Not Found',
          'The page you were looking for doesn\'t exist'
        ];

        const titleErrorPatterns = [
          '404',
          'Not Found',
          'Error',
          'Page not found'
        ];

        const hasErrorInBody = errorPatterns.some(pattern =>
          pageData.bodyText.includes(pattern)
        );

        const hasErrorInTitle = titleErrorPatterns.some(pattern =>
          pageData.title.includes(pattern)
        );

        if (hasErrorInBody || hasErrorInTitle) {
          console.log(`  ⚠️ Warning: Page may contain error messages`);
          if (hasErrorInTitle) {
            console.log(`  ⚠️ Page title: "${pageData.title}"`);
            brokenLinks.set(currentUrl, `Page has error in title: "${pageData.title}"`);
          } else {
            brokenLinks.set(currentUrl, 'Page contains error messages despite 200 status');
          }
        }

        // Extract all links from the page
        const links = await page.evaluate(() => {
          const allLinks = Array.from(document.querySelectorAll('a'));
          return allLinks.map(link => {
            return {
              text: link.textContent.trim(),
              href: link.href
            };
          });
        });

        console.log(`  Found ${links.length} links`);

        // Process each link
        for (const link of links) {
          if (!link.href) continue;

          // Parse the URL
          const parsedUrl = new URL(link.href);

          // Check if we should include external links
          const isExternal = parsedUrl.hostname !== 'localhost';
          if (isExternal && !CONFIG.includeExternal) {
            continue;
          }

          // Remove hash fragments (anchors) from URLs
          // This treats links to the same page with different anchors as the same URL
          let normalizedUrl = link.href;
          if (normalizedUrl.includes('#')) {
            normalizedUrl = normalizedUrl.split('#')[0];
          }

          // Skip empty URLs
          if (!normalizedUrl) continue;

          // Add to stack if not checked yet and not already in the queue
          const alreadyQueued = pagesToCheck.some(item => item.url === normalizedUrl);
          if (!checkedPages.has(normalizedUrl) && !alreadyQueued) {
            pagesToCheck.push({
              url: normalizedUrl,
              depth: depth + 1
            });
          }
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        brokenLinks.set(currentUrl, error.message);
      } finally {
        // Return the page to the pool
        pagePool.push(page);
      }
    }

    // Report results
    console.log('\n=== SUMMARY ===');
    console.log(`Total pages checked: ${checkedPages.size}`);
    console.log(`Broken links: ${brokenLinks.size}`);

    // Categorize broken links
    const connectionErrors = Array.from(brokenLinks.entries())
      .filter(([_, error]) => error.includes('ERR_CONNECTION_REFUSED'));

    const errorMessagePages = Array.from(brokenLinks.entries())
      .filter(([_, error]) => error.includes('error messages'));

    const otherErrors = Array.from(brokenLinks.entries())
      .filter(([_, error]) => !error.includes('ERR_CONNECTION_REFUSED') && !error.includes('error messages'));

    if (connectionErrors.length > 0) {
      console.log('\n=== CONNECTION ERRORS ===');
      connectionErrors.forEach(([url, error]) => {
        console.log(`${url}: ${error}`);
      });
    }

    if (errorMessagePages.length > 0) {
      console.log('\n=== PAGES WITH ERROR MESSAGES ===');
      errorMessagePages.forEach(([url, error]) => {
        console.log(`${url}: ${error}`);
      });
    }

    if (otherErrors.length > 0) {
      console.log('\n=== OTHER ERRORS ===');
      otherErrors.forEach(([url, error]) => {
        console.log(`${url}: ${error}`);
      });
    }

    // Check for pages with 4xx or 5xx status
    const badStatusPages = Array.from(checkedPages.entries())
      .filter(([_, status]) => status >= 400);

    if (badStatusPages.length > 0) {
      console.log('\n=== PAGES WITH BAD STATUS ===');
      badStatusPages.forEach(([url, status]) => {
        console.log(`${url}: ${status}`);
      });
    }

    // Save the results to a file
    const results = {
      checkedPages: Object.fromEntries(checkedPages),
      brokenLinks: Object.fromEntries(brokenLinks),
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync('link-check-results.json', JSON.stringify(results, null, 2));
    console.log('\nResults saved to link-check-results.json');

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    // Close all pages in the pool
    for (const page of pagePool) {
      await page.close();
    }
    await browser.close();
    console.log('\nBrowser closed');
  }
}

/**
 * Check for broken Markdown links in content files
 */
async function checkMarkdownLinks() {
  console.log('\nChecking Markdown links in content files...');

  const contentDir = path.join(process.cwd(), 'content');
  const brokenMarkdownLinks = [];

  // Function to recursively get all Markdown files
  async function getMarkdownFiles(dir) {
    const files = [];
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...await getMarkdownFiles(fullPath));
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  // Function to extract Markdown links from content
  function extractMarkdownLinks(content) {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      links.push({
        text: match[1],
        url: match[2],
        position: match.index
      });
    }

    return links;
  }

  // Function to check if a relative link is valid
  async function isValidRelativeLink(baseDir, link) {
    // Handle anchor links
    if (link.startsWith('#')) {
      return true; // Assume all anchor links are valid
    }

    // Remove anchor part
    const linkWithoutAnchor = link.split('#')[0];

    // Handle empty links
    if (!linkWithoutAnchor) {
      return true;
    }

    try {
      // Resolve the path relative to the base directory
      const resolvedPath = path.resolve(baseDir, linkWithoutAnchor);

      // Check if the file exists
      await stat(resolvedPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  try {
    // Get all Markdown files
    const markdownFiles = await getMarkdownFiles(contentDir);
    console.log(`Found ${markdownFiles.length} Markdown files`);

    // Check each file for broken links
    for (const filePath of markdownFiles) {
      const content = await readFile(filePath, 'utf-8');
      const links = extractMarkdownLinks(content);

      if (links.length === 0) {
        continue;
      }

      const baseDir = path.dirname(filePath);
      const relativeFilePath = path.relative(process.cwd(), filePath);

      for (const link of links) {
        try {
          // Skip external links
          if (link.url.startsWith('http://') || link.url.startsWith('https://')) {
            continue;
          }

          // Check if the link is valid
          const isValid = await isValidRelativeLink(baseDir, link.url);

          if (!isValid) {
            brokenMarkdownLinks.push({
              file: relativeFilePath,
              link: link.url,
              text: link.text
            });
          }
        } catch (error) {
          console.error(`Error checking link ${link.url} in ${relativeFilePath}:`, error);
        }
      }
    }

    // Report results
    if (brokenMarkdownLinks.length > 0) {
      console.log('\n=== BROKEN MARKDOWN LINKS ===');
      for (const brokenLink of brokenMarkdownLinks) {
        console.log(`${brokenLink.file}: [${brokenLink.text}](${brokenLink.link})`);
      }
    } else {
      console.log('\nNo broken Markdown links found!');
    }

    return brokenMarkdownLinks;
  } catch (error) {
    console.error('Error checking Markdown links:', error);
    return [];
  }
}

// Run both checks
async function runAllChecks() {
  await checkLinks();
  await checkMarkdownLinks();
}

runAllChecks();
