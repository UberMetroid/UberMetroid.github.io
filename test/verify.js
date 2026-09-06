/**
 * UberMetroid Automated E2E Verification Harness
 * 
 * Executes full 4-tier verification suite against static production build:
 * Tier 1: Static Build & Asset Integrity (delegated to static-validator.js)
 * Tier 2: DOM Structure, 1982 Identity & Tenet Coverage (Title, [EST. 1982], 4 Tenets, openOODA & idlescreen cards)
 * Tier 3: Fluff Removal Policy Enforcement & Ecosystem Substrate Architecture:
 *         - Audio toggle & Motion toggle completely removed (zero fluff policy)
 *         - All 5 ecosystem nodes rendered (openOODA, IdleScreen, ImpSync, easyLDAP, studio2201)
 *         - Strict exclusion of forbidden personal name ("Jeryd") and marketing fluff ("blue ocean")
 * Tier 4: Viewports, Responsiveness & Accessibility (Zero horizontal overflow across 1920x1080, 1440x900, 390x844, 375x667, 320x568, 280x653)
 * 
 * Browser: Headless Google Chrome (/usr/bin/google-chrome via Playwright)
 * Server: Ephemeral local static HTTP server for dist/
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { validateStaticBuild } from './static-validator.js';

// MIME type map for static server
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8'
};

// Target Viewport Matrix (including extreme edge cases)
const TARGET_VIEWPORTS = [
  { name: 'Desktop Wide (Full HD)', width: 1920, height: 1080 },
  { name: 'Laptop Standard', width: 1440, height: 900 },
  { name: 'Tablet Portrait (iPad)', width: 768, height: 1024 },
  { name: 'Mobile Modern (iPhone 14)', width: 390, height: 844 },
  { name: 'Mobile Compact (iPhone SE)', width: 375, height: 667 },
  { name: 'Narrow Compact (iPhone 5)', width: 320, height: 568 },
  { name: 'Folding Outer Screen (Galaxy Z Fold)', width: 280, height: 653 }
];

/**
 * Creates an ephemeral static HTTP server serving files from distDir.
 */
function createStaticServer(distDir) {
  return http.createServer((req, res) => {
    try {
      const parsedUrl = new URL(req.url, 'http://127.0.0.1');
      let pathname = decodeURIComponent(parsedUrl.pathname);

      if (pathname.endsWith('/')) {
        pathname += 'index.html';
      }

      const filePath = path.join(distDir, pathname);

      // Prevent directory traversal
      if (!filePath.startsWith(distDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
      }

      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found: ' + pathname);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const fileBuffer = fs.readFileSync(filePath);

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache'
      });
      res.end(fileBuffer);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Server Error: ' + err.message);
    }
  });
}

/**
 * Main verification runner.
 */
export async function runVerification(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const distDir = path.resolve(rootDir, 'dist');

  const testReport = {
    tier1: { passes: [], failures: [] },
    tier2: { passes: [], failures: [] },
    tier3: { passes: [], failures: [] },
    tier4: { passes: [], failures: [] },
    browserErrors: {
      consoleErrors: [],
      consoleWarnings: [],
      pageErrors: [],
      failedRequests: [],
      httpErrors: []
    }
  };

  const startTime = Date.now();

  console.log('\n' + '='.repeat(70));
  console.log('   UBERMETROID // 1982 TERMINAL ECOSYSTEM VERIFICATION HARNESS');
  console.log('   Integrity Mode: Strict | Zero Fluff | Target: Headless Chrome');
  console.log('='.repeat(70) + '\n');

  // -------------------------------------------------------------
  // Step 0: Ensure Build Directory Exists
  // -------------------------------------------------------------
  if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html')) || options.forceBuild) {
    console.log('[BUILD] Executing npm run build...');
    try {
      execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
      console.log('[BUILD] Build completed successfully.\n');
    } catch (err) {
      console.error('[BUILD ERROR] npm run build failed:', err.message);
      testReport.tier1.failures.push('Build execution failed');
      printFinalReport(testReport, startTime);
      return false;
    }
  }

  // -------------------------------------------------------------
  // Tier 1: Static Build & Asset Integrity
  // -------------------------------------------------------------
  console.log('>>> [TIER 1] Validating Static Bundle & Relative Asset Integrity...');
  const staticResult = validateStaticBuild(distDir);
  if (staticResult.success) {
    testReport.tier1.passes.push('Static distribution bundle and asset paths valid (100% relative, zero 404s)');
  } else {
    testReport.tier1.failures.push(...staticResult.errors);
  }

  // -------------------------------------------------------------
  // Spin Up Ephemeral HTTP Server
  // -------------------------------------------------------------
  const server = createStaticServer(distDir);
  let serverPort = 0;
  await new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => {
      serverPort = server.address().port;
      console.log(`[HTTP SERVER] Ephemeral static server listening on http://127.0.0.1:${serverPort}`);
      resolve();
    });
    server.on('error', reject);
  });

  const baseUrl = `http://127.0.0.1:${serverPort}/`;

  // -------------------------------------------------------------
  // Launch Headless Google Chrome via Playwright
  // -------------------------------------------------------------
  const chromeBin = process.env.CHROME_BIN || '/usr/bin/google-chrome';
  console.log(`[BROWSER] Launching headless Google Chrome binary: ${chromeBin}`);

  let browser = null;
  let page = null;

  try {
    browser = await chromium.launch({
      executablePath: chromeBin,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    page = await context.newPage();

    // Attach runtime diagnostic listeners
    page.on('console', msg => {
      if (msg.type() === 'error') {
        testReport.browserErrors.consoleErrors.push(msg.text());
        console.error(`   [FATAL CONSOLE ERROR] ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        testReport.browserErrors.consoleWarnings.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      const msg = err.stack || err.message || String(err);
      testReport.browserErrors.pageErrors.push(msg);
      console.error(`   [FATAL PAGE EXCEPTION] ${msg}`);
    });

    page.on('requestfailed', req => {
      const failure = req.failure();
      const failInfo = `${req.method()} ${req.url()} (${failure ? failure.errorText : 'failed'})`;
      testReport.browserErrors.failedRequests.push(failInfo);
      console.error(`   [FATAL REQUEST FAILED] ${failInfo}`);
    });

    page.on('response', res => {
      if (res.status() >= 400) {
        const errorInfo = `${res.status()} ${res.statusText()} -> ${res.url()}`;
        testReport.browserErrors.httpErrors.push(errorInfo);
        console.error(`   [FATAL HTTP ERROR] ${errorInfo}`);
      }
    });

    // Navigate to local static server
    console.log(`[NAVIGATION] Navigating to ${baseUrl}...`);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // Tier 2: DOM Structure, 1982 Identity & Content Coverage
    // -------------------------------------------------------------
    console.log('\n>>> [TIER 2] Verifying 1982 Identity & Tenet Coverage...');

    // 2.1 Document Title & Metadata
    const docTitle = await page.title();
    if (docTitle && /ubermetroid/i.test(docTitle) && /1982/i.test(docTitle)) {
      testReport.tier2.passes.push(`Page title contains UberMetroid & 1982 reference: "${docTitle}"`);
    } else {
      testReport.tier2.failures.push(`Invalid page title: "${docTitle}" (expected UberMetroid and 1982)`);
    }

    const hasViewportMeta = await page.$('meta[name="viewport"]');
    if (hasViewportMeta) {
      testReport.tier2.passes.push('Viewport meta tag present and configured');
    } else {
      testReport.tier2.failures.push('Missing viewport meta tag');
    }

    const hasFaviconLink = await page.$('link[rel*="icon"]');
    if (hasFaviconLink) {
      testReport.tier2.passes.push('Favicon link tag present');
    } else {
      testReport.tier2.failures.push('Missing favicon link tag in <head>');
    }

    // 2.2 Terminal Masthead & 1982 Vintage Badge
    const masthead = await page.$('.terminal-masthead');
    if (masthead) {
      const mastheadText = await masthead.innerText();
      if (/ubermetroid/i.test(mastheadText) && /1982/i.test(mastheadText)) {
        testReport.tier2.passes.push('Terminal masthead contains UBERMETROID brand & [EST. 1982] badge');
      } else {
        testReport.tier2.failures.push('Terminal masthead missing UBERMETROID or 1982 badge');
      }
    } else {
      testReport.tier2.failures.push('.terminal-masthead not found');
    }

    // 2.3 Terminal Window & Title Bar
    const terminalWindow = await page.$('.terminal-window');
    if (terminalWindow) {
      const windowTitle = await page.$eval('.window-title', el => el.innerText);
      if (/ubermetroid/i.test(windowTitle) && /1982/i.test(windowTitle)) {
        testReport.tier2.passes.push(`Terminal window command prompt verified: "${windowTitle.trim()}"`);
      } else {
        testReport.tier2.failures.push(`Window title missing expected prompt: "${windowTitle}"`);
      }
    } else {
      testReport.tier2.failures.push('.terminal-window not found');
    }

    // 2.4 The 4 Core Engineering Tenets
    const pageBodyText = await page.evaluate(() => document.body.innerText);
    const tenets = [
      { name: 'Autonomous Cognitive Loops', pattern: /autonomous\s+cognitive\s+loops|boydian\s+cybernetics/i },
      { name: 'Dormant Resource Reclamation', pattern: /dormant\s+resource\s+reclamation|zero-waste\s+compute/i },
      { name: 'Deterministic Systems Artistry', pattern: /deterministic\s+systems\s+artistry/i },
      { name: 'Extensible Modular Substrates', pattern: /extensible\s+modular\s+substrates/i }
    ];

    let missingTenets = [];
    for (const tenet of tenets) {
      if (tenet.pattern.test(pageBodyText)) {
        testReport.tier2.passes.push(`Found Tenet: ${tenet.name}`);
      } else {
        missingTenets.push(tenet.name);
      }
    }

    if (missingTenets.length === 0) {
      testReport.tier2.passes.push('All 4 architectural engineering tenets present in 1982 workstation layout');
    } else {
      testReport.tier2.failures.push(`Missing Core Engineering Tenet(s): ${missingTenets.join('; ')}`);
    }

    // -------------------------------------------------------------
    // Tier 3: Fluff Removal Policy Enforcement & Ecosystem Substrate Architecture
    // -------------------------------------------------------------
    console.log('\n>>> [TIER 3] Verifying Fluff Removal & Ecosystem Substrate Architecture...');

    // 3.1 Strict Anti-Fluff Policy: Audio & Movement Buttons Completely Removed
    const audioBtn = await page.$('#audio-toggle, .hud-btn-audio, [data-action="toggle-audio"]');
    if (!audioBtn) {
      testReport.tier3.passes.push('Audio toggle button confirmed completely removed (zero fluff policy)');
    } else {
      testReport.tier3.failures.push('Audio toggle button still exists in DOM (violates removal requirement)');
    }

    const motionBtn = await page.$('#motion-toggle, .hud-btn-motion, [data-action="toggle-motion"]');
    if (!motionBtn) {
      testReport.tier3.passes.push('Movement toggle button confirmed completely removed (zero fluff policy)');
    } else {
      testReport.tier3.failures.push('Movement toggle button still exists in DOM (violates removal requirement)');
    }

    // 3.2 Strict Privacy & Fluff Text Policy: No "Jeryd" and No "Blue Ocean"
    if (/\bjeryd\b/i.test(pageBodyText)) {
      testReport.tier3.failures.push('Found forbidden personal name "Jeryd" in page text (violates anonymity constraint)');
    } else {
      testReport.tier3.passes.push('Zero mentions of forbidden personal name "Jeryd" (strict anonymity maintained)');
    }

    if (/blue\s+ocean/i.test(pageBodyText)) {
      testReport.tier3.failures.push('Found forbidden phrase "blue ocean" in page text (violates zero fluff policy)');
    } else {
      testReport.tier3.passes.push('Zero fluff marketing jargon ("blue ocean" strictly absent)');
    }

    // 3.3 Ecosystem Substrate Nodes Verification
    const expectedNodes = [
      { id: 'openooda', name: 'openOODA', canonical: 'https://openooda.org' },
      { id: 'idlescreen', name: 'IdleScreen', canonical: 'https://idlescreen.github.io' },
      { id: 'impsync', name: 'ImpSync', canonical: 'https://ImpSync.github.io' },
      { id: 'easyldap', name: 'easyLDAP', canonical: 'https://easyLDAP.github.io' },
      { id: 'studio2201', name: 'studio2201', canonical: 'https://studio2201.github.io' }
    ];

    const mountedNodes = await page.$$eval('.term-card', cards => cards.map(c => ({
      id: c.getAttribute('data-ecosystem-id') || c.id,
      title: c.querySelector('.card-title')?.innerText || '',
      links: Array.from(c.querySelectorAll('a')).map(a => a.href)
    })));

    if (mountedNodes.length >= 5) {
      testReport.tier3.passes.push(`Ecosystem Substrate contains all ${mountedNodes.length} registered nodes`);
    } else {
      testReport.tier3.failures.push(`Ecosystem Substrate mounted only ${mountedNodes.length}/5 nodes`);
    }

    for (const expected of expectedNodes) {
      const match = mountedNodes.find(n => n.id === expected.id);
      if (match) {
        testReport.tier3.passes.push(`Node [${expected.id}] mounted with title "${match.title}"`);
        // Check canonical or github pages link
        const hasLink = match.links.some(l => l.includes(expected.id) || l.includes(expected.name.toLowerCase()));
        if (hasLink) {
          testReport.tier3.passes.push(`Node [${expected.id}] contains verified external navigation link`);
        } else {
          testReport.tier3.failures.push(`Node [${expected.id}] missing external navigation link`);
        }
      } else {
        testReport.tier3.failures.push(`Node [${expected.id}] not found in mounted cards`);
      }
    }

    // Check openOODA link to openooda.github.io
    const openoodaCard = await page.$('#openooda, [data-showcase="openooda"]');
    if (openoodaCard) {
      const ghPagesLink = await openoodaCard.$('a[href="https://openooda.github.io"]');
      if (ghPagesLink) {
        testReport.tier3.passes.push('openOODA link to https://openooda.github.io verified in card actions');
      } else {
        testReport.tier3.failures.push('openOODA card missing direct link to https://openooda.github.io');
      }
    }

    // Check IdleScreen link to idlescreen.github.io
    const idlescreenCard = await page.$('#idlescreen, [data-showcase="idlescreen"]');
    if (idlescreenCard) {
      const idleLink = await idlescreenCard.$('a[href="https://idlescreen.github.io"]');
      if (idleLink) {
        testReport.tier3.passes.push('IdleScreen link to https://idlescreen.github.io verified in card actions');
      } else {
        testReport.tier3.failures.push('IdleScreen card missing direct link to https://idlescreen.github.io');
      }
    }

    // -------------------------------------------------------------
    // Tier 4: Viewports, Responsiveness & Accessibility
    // -------------------------------------------------------------
    console.log('\n>>> [TIER 4] Verifying Responsive Viewports & Accessibility...');

    // 4.1 Responsive Viewport Matrix (Zero Horizontal Overflow across 7 viewports)
    for (const vp of TARGET_VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(200);

      const overflowResult = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(docEl.scrollWidth, body ? body.scrollWidth : 0);
        const clientWidth = docEl.clientWidth;
        const diff = scrollWidth - clientWidth;
        const hasOverflow = diff > 1; // 1px threshold for sub-pixel antialiasing

        return { scrollWidth, clientWidth, diff, hasOverflow };
      });

      if (!overflowResult.hasOverflow) {
        testReport.tier4.passes.push(`Viewport ${vp.name} (${vp.width}x${vp.height}): Zero horizontal overflow (${overflowResult.scrollWidth}px <= ${overflowResult.clientWidth}px)`);
      } else {
        testReport.tier4.failures.push(`Horizontal overflow at ${vp.name} (${vp.width}x${vp.height}): scrollWidth ${overflowResult.scrollWidth} > clientWidth ${overflowResult.clientWidth} (excess: ${overflowResult.diff}px)`);
      }
    }

    // Reset to desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(100);

    // 4.2 Skip Link Keyboard Accessibility
    const skipLink = await page.$('.skip-link');
    if (skipLink) {
      const href = await skipLink.getAttribute('href');
      if (href === '#main-content') {
        testReport.tier4.passes.push('Accessible skip-link present targeting #main-content');
      } else {
        testReport.tier4.failures.push(`Skip link has invalid href: ${href}`);
      }
    } else {
      testReport.tier4.failures.push('Skip link missing in DOM');
    }

    // 4.3 Safe External Links (rel="noopener noreferrer" and target="_blank")
    const unsafeLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[target="_blank"]'));
      return links.filter(a => {
        const rel = a.getAttribute('rel') || '';
        return !rel.includes('noopener') || !rel.includes('noreferrer');
      }).map(a => a.href);
    });

    if (unsafeLinks.length === 0) {
      testReport.tier4.passes.push('All external links configured with secure rel="noopener noreferrer"');
    } else {
      testReport.tier4.failures.push(`Found ${unsafeLinks.length} unsafe external link(s): ${unsafeLinks.join(', ')}`);
    }

    // -------------------------------------------------------------
    // Runtime Integrity: Zero Console Errors, PageErrors & 404s
    // -------------------------------------------------------------
    if (testReport.browserErrors.consoleErrors.length > 0) {
      testReport.tier2.failures.push(`Encountered ${testReport.browserErrors.consoleErrors.length} browser console.error message(s)`);
    } else {
      testReport.tier2.passes.push('Zero unhandled browser console.error logs');
    }

    if (testReport.browserErrors.pageErrors.length > 0) {
      testReport.tier2.failures.push(`Encountered ${testReport.browserErrors.pageErrors.length} unhandled runtime page exception(s)`);
    } else {
      testReport.tier2.passes.push('Zero uncaught JavaScript runtime exceptions');
    }

    if (testReport.browserErrors.failedRequests.length > 0) {
      testReport.tier2.failures.push(`Encountered ${testReport.browserErrors.failedRequests.length} failed network request(s)`);
    } else {
      testReport.tier2.passes.push('Zero failed network requests (100% asset reachability)');
    }

    if (testReport.browserErrors.httpErrors.length > 0) {
      testReport.tier2.failures.push(`Encountered ${testReport.browserErrors.httpErrors.length} HTTP 4xx/5xx response(s)`);
    } else {
      testReport.tier2.passes.push('Zero HTTP 404/500 asset responses');
    }

  } catch (err) {
    console.error('[TEST HARNESS EXCEPTION]', err);
    testReport.tier2.failures.push(`Test harness crashed with exception: ${err.message}`);
  } finally {
    // Teardown
    if (page) {
      try { await page.close(); } catch (_) {}
    }
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
    await new Promise(resolve => server.close(resolve));
    console.log('[TEARDOWN] Static server and browser context closed cleanly.\n');
  }

  return printFinalReport(testReport, startTime);
}

function printFinalReport(testReport, startTime) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const tiers = ['tier1', 'tier2', 'tier3', 'tier4'];

  console.log('='.repeat(70));
  console.log(`   FINAL VERIFICATION AUDIT REPORT (Elapsed: ${elapsed}s)`);
  console.log('='.repeat(70));

  let totalPasses = 0;
  let totalFailures = 0;

  const tierNames = {
    tier1: 'Tier 1: Static Build & Asset Integrity',
    tier2: 'Tier 2: DOM Structure, 1982 Identity & Tenet Coverage',
    tier3: 'Tier 3: Fluff Removal Policy Enforcement & Ecosystem Architecture',
    tier4: 'Tier 4: Viewports, Responsiveness & Accessibility'
  };

  for (const t of tiers) {
    const pCount = testReport[t].passes.length;
    const fCount = testReport[t].failures.length;
    totalPasses += pCount;
    totalFailures += fCount;

    const statusBadge = fCount === 0 ? '[PASS]' : '[FAIL]';
    console.log(`\n${statusBadge} ${tierNames[t]} (${pCount} passed, ${fCount} failed)`);
    testReport[t].passes.forEach(p => console.log(`   ✓ ${p}`));
    testReport[t].failures.forEach(f => console.log(`   ✗ ${f}`));
  }

  console.log('\n' + '-'.repeat(70));
  console.log(`Total Assertions Passed: ${totalPasses}`);
  console.log(`Total Assertions Failed: ${totalFailures}`);
  console.log('-'.repeat(70));

  const allPassed = totalFailures === 0;
  if (allPassed) {
    console.log('>>> [OVERALL STATUS: PASS] All automated verification tiers passed without defects.\n');
  } else {
    console.log(`>>> [OVERALL STATUS: FAIL] Verification failed with ${totalFailures} outstanding defect(s).\n`);
  }

  return allPassed;
}

// CLI entry point
const isDirectExecution =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectExecution) {
  runVerification()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal execution error in test runner:', err);
      process.exit(1);
    });
}
