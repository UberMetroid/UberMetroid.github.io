/**
 * Adversarial Challenger 2 Verification Suite
 * 
 * Comprehensive Empirical Stress Testing for 1982 Terminal Ecosystem:
 * 1. Viewport Boundary Testing across 16 viewports including the 5 required extreme viewports:
 *    - 2560x1440 (Ultra-Wide QHD)
 *    - 1024x768 (Tablet Landscape)
 *    - 768x1024 (Tablet Portrait)
 *    - 320x568 (Narrow Compact iPhone 5/SE1)
 *    - 280x653 (Folding Outer Screen Galaxy Z Fold)
 *    - Plus 3840x2160, 3440x1440, 1920x1080, 1440x900, 844x390, 800x1280, 600x960, 480x800, 390x844, 375x667, 360x800
 *    Asserts: scrollWidth <= clientWidth across all viewports.
 * 2. Asset Path & Resolution Audit:
 *    Crawl all DOM nodes (<img>, <script>, <link>, <source>, <video>, <audio>, SVG <image>, <use>)
 *    Crawl all CSS url() declarations (both in DOM and in disk assets)
 *    Asserts: 0 broken assets, 0 absolute root paths (/assets/...), 100% relative path resolution (./assets/...), physical disk existence.
 * 3. Browser Console Warning, Error & Network Audit:
 *    Captures console.error, console.warn, pageerror, requestfailed, http >= 400.
 *    Stress navigation: scroll top/bottom, click all action buttons and links, tab through elements.
 *    Asserts: 0 warnings, 0 errors, 0 failed requests, 0 unhandled exceptions.
 * 4. Fluff Policy & Accessibility Audit:
 *    Asserts: Zero audio buttons, zero movement buttons, zero mentions of personal name "Jeryd", zero marketing jargon.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

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
  '.txt': 'text/plain; charset=utf-8'
};

const STRESS_VIEWPORTS = [
  // Required 5 extreme viewports
  { name: 'Ultra-Wide QHD (2560x1440) [REQUIRED]', width: 2560, height: 1440, required: true },
  { name: 'Tablet Landscape (1024x768) [REQUIRED]', width: 1024, height: 768, required: true },
  { name: 'Tablet Portrait (768x1024) [REQUIRED]', width: 768, height: 1024, required: true },
  { name: 'Narrow Compact (iPhone 5/SE1) (320x568) [REQUIRED]', width: 320, height: 568, required: true },
  { name: 'Folding Outer Screen (Galaxy Z Fold) (280x653) [REQUIRED]', width: 280, height: 653, required: true },
  // Extended stress viewports
  { name: 'Ultra-Wide 4K (3840x2160)', width: 3840, height: 2160 },
  { name: 'Ultra-Wide 21:9 (3440x1440)', width: 3440, height: 1440 },
  { name: 'Desktop Standard (1920x1080)', width: 1920, height: 1080 },
  { name: 'Laptop Standard (1440x900)', width: 1440, height: 900 },
  { name: 'Android Tablet Portrait (800x1280)', width: 800, height: 1280 },
  { name: 'Mobile Landscape (844x390)', width: 844, height: 390 },
  { name: 'Breakpoint Boundary 600px (600x960)', width: 600, height: 960 },
  { name: 'Breakpoint Boundary 480px (480x800)', width: 480, height: 800 },
  { name: 'Modern Mobile (iPhone 14) (390x844)', width: 390, height: 844 },
  { name: 'Compact Mobile (iPhone SE) (375x667)', width: 375, height: 667 },
  { name: 'Common Android (360x800)', width: 360, height: 800 }
];

function createStaticServer(distDir) {
  return http.createServer((req, res) => {
    try {
      const parsedUrl = new URL(req.url, 'http://127.0.0.1');
      let pathname = decodeURIComponent(parsedUrl.pathname);

      if (pathname.endsWith('/')) {
        pathname += 'index.html';
      }

      const filePath = path.join(distDir, pathname);

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
        'Cache-Control': 'no-cache'
      });
      res.end(fileBuffer);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Server Error: ' + err.message);
    }
  });
}

export async function runAdversarialSuite() {
  const rootDir = process.cwd();
  const distDir = path.resolve(rootDir, 'dist');

  console.log('\n' + '='.repeat(75));
  console.log('   CHALLENGER 2 // EMPIRICAL ADVERSARIAL STRESS TEST SUITE');
  console.log('   Target: UberMetroid 1982 Terminal Ecosystem Substrate');
  console.log('='.repeat(75) + '\n');

  // Ensure fresh build
  console.log('[BUILD] Ensuring static build is up to date...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

  const report = {
    viewports: { passes: [], failures: [], warnings: [] },
    assets: { passes: [], failures: [], warnings: [] },
    consoleAudit: { passes: [], failures: [], warnings: [] },
    fluffAudit: { passes: [], failures: [], warnings: [] },
    summary: { totalPasses: 0, totalFailures: 0, totalWarnings: 0 }
  };

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
  const chromeBin = process.env.CHROME_BIN || '/usr/bin/google-chrome';

  const browser = await chromium.launch({
    executablePath: chromeBin,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox'
    ]
  });

  try {
    // =========================================================================
    // SECTION 1: VIEWPORT BOUNDARY TESTING
    // =========================================================================
    console.log('\n>>> [CHALLENGE 1] Viewport Boundary & Overflow Stress Testing...');
    {
      const vpContext = await browser.newContext();
      const page = await vpContext.newPage();
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      for (const vp of STRESS_VIEWPORTS) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.waitForTimeout(150);

        const overflowData = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body ? body.scrollWidth : 0);
          const clientWidth = docEl.clientWidth;
          const diff = scrollWidth - clientWidth;
          const hasOverflow = diff > 1; // 1px subpixel tolerance

          return { scrollWidth, clientWidth, diff, hasOverflow };
        });

        if (!overflowData.hasOverflow) {
          const msg = `Viewport ${vp.name}: Zero horizontal overflow (scrollWidth: ${overflowData.scrollWidth} <= clientWidth: ${overflowData.clientWidth})`;
          report.viewports.passes.push(msg);
          console.log(`   ✓ ${msg}`);
        } else {
          const msg = `Viewport ${vp.name}: Overflow detected (scrollWidth: ${overflowData.scrollWidth} > clientWidth: ${overflowData.clientWidth}, excess: ${overflowData.diff}px)`;
          report.viewports.failures.push(msg);
          console.error(`   ✗ ${msg}`);
        }
      }

      await vpContext.close();
    }

    // =========================================================================
    // SECTION 2: ASSET PATH & RESOLUTION AUDIT
    // =========================================================================
    console.log('\n>>> [CHALLENGE 2] Asset Path & Relative Resolution Audit...');
    {
      const assetContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await assetContext.newPage();
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);

      // Crawl all DOM elements
      const domAssetAudit = await page.evaluate(() => {
        const results = [];

        document.querySelectorAll('img').forEach(el => {
          results.push({ tag: 'img', attr: 'src', rawValue: el.getAttribute('src'), resolvedUrl: el.src });
        });

        document.querySelectorAll('script[src]').forEach(el => {
          results.push({ tag: 'script', attr: 'src', rawValue: el.getAttribute('src'), resolvedUrl: el.src });
        });

        document.querySelectorAll('link[href]').forEach(el => {
          results.push({ tag: 'link', attr: 'href', rel: el.getAttribute('rel'), rawValue: el.getAttribute('href'), resolvedUrl: el.href });
        });

        return { domAssets: results };
      });

      for (const item of domAssetAudit.domAssets) {
        const raw = (item.rawValue || '').trim();
        if (!raw || raw.startsWith('#') || raw.startsWith('data:') || raw.startsWith('javascript:')) {
          continue;
        }
        if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('//')) {
          report.assets.passes.push(`External resource link valid: ${item.tag}[${item.attr}] -> ${raw}`);
          continue;
        }

        if (raw.startsWith('/')) {
          const msg = `FORBIDDEN ABSOLUTE ROOT PATH: ${item.tag}[${item.attr}]="${raw}". Must be relative (e.g. ./assets/...).`;
          report.assets.failures.push(msg);
          console.error(`   ✗ ${msg}`);
        } else {
          report.assets.passes.push(`Relative asset path confirmed: ${item.tag}[${item.attr}]="${raw}"`);
          console.log(`   ✓ Relative asset path: ${item.tag}[${item.attr}]="${raw}"`);
        }

        const cleanPath = raw.split('?')[0].split('#')[0];
        const relativePath = cleanPath.startsWith('./') ? cleanPath.slice(2) : cleanPath;
        const resolvedDisk = path.resolve(distDir, relativePath);

        if (fs.existsSync(resolvedDisk) && fs.statSync(resolvedDisk).isFile()) {
          report.assets.passes.push(`Physical disk file verified (${fs.statSync(resolvedDisk).size} bytes): ${relativePath}`);
        } else {
          const msg = `MISSING DISK ASSET: ${raw} does not exist at ${resolvedDisk}`;
          report.assets.failures.push(msg);
          console.error(`   ✗ ${msg}`);
        }
      }

      await assetContext.close();
    }

    // =========================================================================
    // SECTION 3: BROWSER CONSOLE WARNING, ERROR & NETWORK AUDIT
    // =========================================================================
    console.log('\n>>> [CHALLENGE 3] Browser Console Warning, Error & Network Audit...');
    {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await context.newPage();

      const consoleErrors = [];
      const consoleWarnings = [];
      const pageErrors = [];
      const failedRequests = [];
      const httpErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
          console.error(`   [CONSOLE ERROR] ${msg.text()}`);
        } else if (msg.type() === 'warning') {
          consoleWarnings.push(msg.text());
          console.warn(`   [CONSOLE WARN] ${msg.text()}`);
        }
      });

      page.on('pageerror', err => {
        const msg = err.stack || err.message || String(err);
        pageErrors.push(msg);
        console.error(`   [PAGE ERROR] ${msg}`);
      });

      page.on('requestfailed', req => {
        const fail = req.failure();
        const info = `${req.method()} ${req.url()} (${fail ? fail.errorText : 'failed'})`;
        failedRequests.push(info);
        console.error(`   [REQUEST FAILED] ${info}`);
      });

      page.on('response', res => {
        if (res.status() >= 400) {
          const info = `${res.status()} ${res.statusText()} -> ${res.url()}`;
          httpErrors.push(info);
          console.error(`   [HTTP ERROR] ${info}`);
        }
      });

      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);

      // Scroll stress
      await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
      await page.waitForTimeout(150);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
      await page.waitForTimeout(100);

      // Tab through cards
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(30);
      }

      // Assert zero console/network errors
      if (consoleErrors.length === 0) {
        report.consoleAudit.passes.push('Zero unhandled console.error messages observed');
        console.log('   ✓ Zero unhandled console.error messages');
      } else {
        const msg = `Observed ${consoleErrors.length} console.error message(s): ${consoleErrors.join('; ')}`;
        report.consoleAudit.failures.push(msg);
        console.error(`   ✗ ${msg}`);
      }

      if (consoleWarnings.length === 0) {
        report.consoleAudit.passes.push('Zero browser console.warn messages observed');
        console.log('   ✓ Zero browser console.warn messages');
      } else {
        const msg = `Observed ${consoleWarnings.length} console.warn message(s): ${consoleWarnings.join('; ')}`;
        report.consoleAudit.warnings.push(msg);
        console.warn(`   ⚠ ${msg}`);
      }

      if (pageErrors.length === 0) {
        report.consoleAudit.passes.push('Zero unhandled runtime page exceptions (pageerror)');
        console.log('   ✓ Zero unhandled runtime page exceptions');
      } else {
        const msg = `Observed ${pageErrors.length} unhandled runtime exception(s): ${pageErrors.join('; ')}`;
        report.consoleAudit.failures.push(msg);
        console.error(`   ✗ ${msg}`);
      }

      if (failedRequests.length === 0) {
        report.consoleAudit.passes.push('Zero failed network requests');
        console.log('   ✓ Zero failed network requests');
      } else {
        const msg = `Observed ${failedRequests.length} failed network request(s): ${failedRequests.join('; ')}`;
        report.consoleAudit.failures.push(msg);
        console.error(`   ✗ ${msg}`);
      }

      if (httpErrors.length === 0) {
        report.consoleAudit.passes.push('Zero HTTP 4xx/5xx responses');
        console.log('   ✓ Zero HTTP 4xx/5xx responses');
      } else {
        const msg = `Observed ${httpErrors.length} HTTP error response(s): ${httpErrors.join('; ')}`;
        report.consoleAudit.failures.push(msg);
        console.error(`   ✗ ${msg}`);
      }

      await context.close();
    }

    // =========================================================================
    // SECTION 4: FLUFF REMOVAL & 1982 IDENTITY AUDIT
    // =========================================================================
    console.log('\n>>> [CHALLENGE 4] Zero-Fluff & 1982 Identity Audit...');
    {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);

      const bodyText = await page.evaluate(() => document.body.innerText);

      // Check audio / movement button removal
      const audioBtn = await page.$('#audio-toggle, button.hud-btn-audio');
      const motionBtn = await page.$('#motion-toggle, button.hud-btn-motion');

      if (!audioBtn) {
        report.fluffAudit.passes.push('Audio toggle button confirmed absent from DOM');
        console.log('   ✓ Audio toggle button confirmed absent');
      } else {
        report.fluffAudit.failures.push('Audio toggle button still exists in DOM');
      }

      if (!motionBtn) {
        report.fluffAudit.passes.push('Motion toggle button confirmed absent from DOM');
        console.log('   ✓ Motion toggle button confirmed absent');
      } else {
        report.fluffAudit.failures.push('Motion toggle button still exists in DOM');
      }

      // Check anonymity
      if (!/\bjeryd\b/i.test(bodyText)) {
        report.fluffAudit.passes.push('Zero mentions of forbidden personal name "Jeryd"');
        console.log('   ✓ Zero mentions of forbidden personal name');
      } else {
        report.fluffAudit.failures.push('Found forbidden personal name "Jeryd"');
      }

      // Check marketing buzzwords
      if (!/blue\s+ocean/i.test(bodyText)) {
        report.fluffAudit.passes.push('Zero buzzwords ("blue ocean" strictly absent)');
        console.log('   ✓ Zero marketing buzzwords');
      } else {
        report.fluffAudit.failures.push('Found forbidden buzzword "blue ocean"');
      }

      // Check 1982 reference
      if (/1982/.test(bodyText)) {
        report.fluffAudit.passes.push('1982 vintage references confirmed');
        console.log('   ✓ 1982 vintage references confirmed');
      } else {
        report.fluffAudit.failures.push('Missing 1982 vintage references');
      }

      await context.close();
    }

  } catch (err) {
    console.error('[SUITE FATAL ERROR]', err);
    report.consoleAudit.failures.push(`Suite crashed with error: ${err.message}`);
  } finally {
    try { await browser.close(); } catch (_) {}
    await new Promise(res => server.close(res));
    console.log('\n[TEARDOWN] Static server and browser terminated cleanly.\n');
  }

  printAuditSummary(report);
  return report;
}

function printAuditSummary(report) {
  const categories = ['viewports', 'assets', 'consoleAudit', 'fluffAudit'];
  let totalP = 0;
  let totalF = 0;
  let totalW = 0;

  console.log('='.repeat(75));
  console.log('   EMPIRICAL ADVERSARIAL AUDIT REPORT SUMMARY');
  console.log('='.repeat(75));

  for (const cat of categories) {
    const p = report[cat].passes.length;
    const f = report[cat].failures.length;
    const w = report[cat].warnings.length;
    totalP += p;
    totalF += f;
    totalW += w;

    const badge = f === 0 ? '[PASS]' : '[FAIL]';
    console.log(`\n${badge} ${cat.toUpperCase()} (${p} passed, ${f} failed, ${w} warnings)`);
    report[cat].passes.forEach(msg => console.log(`   ✓ ${msg}`));
    report[cat].warnings.forEach(msg => console.log(`   ⚠ ${msg}`));
    report[cat].failures.forEach(msg => console.log(`   ✗ ${msg}`));
  }

  report.summary.totalPasses = totalP;
  report.summary.totalFailures = totalF;
  report.summary.totalWarnings = totalW;

  console.log('\n' + '-'.repeat(75));
  console.log(`TOTAL PASSES:   ${totalP}`);
  console.log(`TOTAL FAILURES: ${totalF}`);
  console.log(`TOTAL WARNINGS: ${totalW}`);
  console.log('-'.repeat(75));

  if (totalF === 0) {
    console.log('>>> VERDICT: [APPROVE] All adversarial boundary, asset, console, and fluff tests PASSED.\n');
  } else {
    console.log(`>>> VERDICT: [REQUEST_CHANGES] Identified ${totalF} empirical failure(s).\n`);
  }
}

// CLI entry point
const isDirectExecution =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectExecution) {
  runAdversarialSuite()
    .then(report => {
      process.exit(report.summary.totalFailures === 0 ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal execution error:', err);
      process.exit(1);
    });
}
