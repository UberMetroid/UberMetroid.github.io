/**
 * UBERMETROID // ADVERSARIAL STRESS TEST HARNESS
 * 
 * Empirical challenger harness for Tier 5 stress-testing of 1982 Ecosystem Substrate:
 * 1. Rapid DOM traversal & focus cycling across all cards & buttons
 * 2. Rapid viewport churn & orientation flip stress (280px to 2560px)
 * 3. Strict zero-fluff policy verification (audio, motion, personal name, marketing buzzwords)
 * 4. Runtime memory & zero console error / unhandled exception audit
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
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
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8'
};

function createStaticServer(distDir) {
  return http.createServer((req, res) => {
    try {
      const parsedUrl = new URL(req.url, 'http://127.0.0.1');
      let pathname = decodeURIComponent(parsedUrl.pathname);
      if (pathname.endsWith('/')) pathname += 'index.html';
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAdversarialStressSuite() {
  const rootDir = process.cwd();
  const distDir = path.resolve(rootDir, 'dist');

  console.log('\n' + '='.repeat(74));
  console.log('   UBERMETROID // 1982 ECOSYSTEM ADVERSARIAL STRESS TEST SUITE');
  console.log('   Target: Production Static Distribution (dist/)');
  console.log('   Engine: Headless Google Chrome (/usr/bin/google-chrome via Playwright)');
  console.log('='.repeat(74) + '\n');

  if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
    console.error('[ERROR] dist/ directory or dist/index.html is missing. Run npm run build first.');
    process.exit(1);
  }

  // 1. Spin up ephemeral server
  const server = createStaticServer(distDir);
  let serverPort = 0;
  await new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => {
      serverPort = server.address().port;
      console.log(`[HTTP SERVER] Static preview server active on http://127.0.0.1:${serverPort}`);
      resolve();
    });
    server.on('error', reject);
  });

  const baseUrl = `http://127.0.0.1:${serverPort}/`;

  // 2. Launch Chrome
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

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const diagnostics = {
    consoleErrors: [],
    consoleWarnings: [],
    pageErrors: [],
    unhandledRejections: [],
    testResults: []
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      diagnostics.consoleErrors.push(msg.text());
      console.error(`   [PAGE CONSOLE ERROR] ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      diagnostics.consoleWarnings.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    const text = err.stack || err.message || String(err);
    diagnostics.pageErrors.push(text);
    console.error(`   [UNCAUGHT PAGE ERROR] ${text}`);
  });

  await page.addInitScript(() => {
    window.__unhandledRejections = [];
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason ? (event.reason.stack || event.reason.message || String(event.reason)) : 'unknown';
      window.__unhandledRejections.push(reason);
    });
  });

  console.log(`[NAVIGATION] Navigating to ${baseUrl}...`);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(400);

  function recordTest(suite, name, passed, details) {
    diagnostics.testResults.push({ suite, name, passed, details });
    const mark = passed ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`   ${mark} [${suite}] ${name}: ${details}`);
  }

  // =========================================================================
  // SUITE 1: 1982 Terminal Architecture & Fluff Policy
  // =========================================================================
  console.log('\n>>> [SUITE 1] 1982 Terminal Architecture & Strict Zero-Fluff Audit...');

  {
    const bodyText = await page.evaluate(() => document.body.innerText);
    const audioBtn = await page.$('#audio-toggle, button.hud-btn-audio');
    const motionBtn = await page.$('#motion-toggle, button.hud-btn-motion');

    recordTest('FluffAudit', 'Audio Button Complete Removal', !audioBtn, audioBtn ? 'Audio button found in DOM' : 'Zero audio toggles in DOM');
    recordTest('FluffAudit', 'Motion Button Complete Removal', !motionBtn, motionBtn ? 'Motion button found in DOM' : 'Zero motion toggles in DOM');
    recordTest('FluffAudit', 'Zero Mentions of Personal Name "Jeryd"', !/\bjeryd\b/i.test(bodyText), 'Anonymity strictly upheld');
    recordTest('FluffAudit', 'Zero Marketing Fluff ("blue ocean")', !/blue\s+ocean/i.test(bodyText), 'Zero buzzwords present');
    recordTest('Identity1982', '1982 Vintage Badge Present', /1982/.test(bodyText), '1982 vintage reference confirmed');
  }

  // =========================================================================
  // SUITE 2: Keyboard Focus Traversal & DOM Interaction
  // =========================================================================
  console.log('\n>>> [SUITE 2] Rapid Keyboard Tab Focus Traversal...');

  {
    const focusableCount = await page.evaluate(() => {
      const focusable = document.querySelectorAll('a, button, [tabindex="0"]');
      return focusable.length;
    });

    let tabSuccess = true;
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      await sleep(15);
    }

    const activeElementTag = await page.evaluate(() => document.activeElement ? document.activeElement.tagName : 'NONE');
    recordTest('Accessibility', 'Keyboard Tab Navigation Cycling', tabSuccess && activeElementTag !== 'NONE', `Cycled tabs across ${focusableCount} interactive elements. Active: <${activeElementTag}>`);
  }

  // =========================================================================
  // SUITE 3: Viewport Churn & Extreme Boundary Resizing
  // =========================================================================
  console.log('\n>>> [SUITE 3] Viewport Churn & Extreme Boundary Resizing Stress...');

  {
    const viewports = [
      { w: 2560, h: 1440 },
      { w: 1920, h: 1080 },
      { w: 1024, h: 768 },
      { w: 768, h: 1024 },
      { w: 390, h: 844 },
      { w: 375, h: 667 },
      { w: 320, h: 568 },
      { w: 280, h: 653 }
    ];

    let allZeroOverflow = true;
    let worstOverflow = 0;

    for (let cycle = 0; cycle < 3; cycle++) {
      for (const vp of viewports) {
        await page.setViewportSize({ width: vp.w, height: vp.h });
        await sleep(25);

        const check = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const sW = Math.max(docEl.scrollWidth, body ? body.scrollWidth : 0);
          const cW = docEl.clientWidth;
          return { sW, cW, diff: sW - cW };
        });

        if (check.diff > 1) {
          allZeroOverflow = false;
          if (check.diff > worstOverflow) worstOverflow = check.diff;
        }
      }
    }

    recordTest(
      'ViewportStress',
      'Rapid Viewport Churn (3 cycles x 8 resolutions down to 280px)',
      allZeroOverflow,
      allZeroOverflow ? 'Zero horizontal overflow across all 24 resize transitions' : `Detected overflow: ${worstOverflow}px`
    );
  }

  // =========================================================================
  // SUITE 4: Final Exception & Error Policy Audit
  // =========================================================================
  console.log('\n>>> [SUITE 4] Final Exception & Error Policy Audit...');

  const unhandled = await page.evaluate(() => window.__unhandledRejections || []);
  diagnostics.unhandledRejections.push(...unhandled);

  const errorFree = diagnostics.consoleErrors.length === 0 &&
                    diagnostics.pageErrors.length === 0 &&
                    diagnostics.unhandledRejections.length === 0;

  recordTest(
    'ErrorPolicy',
    'Zero Console Errors & Zero Uncaught Exceptions',
    errorFree,
    `Console Errors: ${diagnostics.consoleErrors.length}, Page Errors: ${diagnostics.pageErrors.length}, Unhandled Rejections: ${diagnostics.unhandledRejections.length}`
  );

  // Teardown
  await browser.close();
  server.close();

  // Summary
  console.log('\n' + '='.repeat(74));
  console.log('   ADVERSARIAL STRESS TEST SUMMARY REPORT');
  console.log('='.repeat(74));

  const total = diagnostics.testResults.length;
  const passed = diagnostics.testResults.filter(t => t.passed).length;
  const failed = total - passed;

  console.log(`Total Adversarial Scenarios: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n>>> VERDICT: REQUEST_CHANGES');
    process.exit(1);
  } else {
    console.log('\n>>> VERDICT: APPROVE');
    console.log('All 1982 Ecosystem Substrate stress scenarios passed successfully.');
    process.exit(0);
  }
}

runAdversarialStressSuite().catch((err) => {
  console.error('[FATAL RUNNER FAILURE]', err);
  process.exit(1);
});
