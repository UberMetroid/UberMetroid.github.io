/**
 * Static Build and Asset Integrity Validator
 * 
 * Verifies:
 * 1. dist/ exists and is a directory.
 * 2. dist/index.html exists and is non-empty.
 * 3. dist/.nojekyll exists (bypasses Jekyll processing on GitHub Pages).
 * 4. All script and stylesheet tags in dist/index.html use relative URLs (./assets/...) and zero absolute root paths (/assets/...).
 * 5. All referenced local assets physically exist on disk in dist/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function validateStaticBuild(distDir = path.resolve(process.cwd(), 'dist')) {
  const errors = [];
  const warnings = [];
  const passes = [];

  console.log('='.repeat(65));
  console.log(' [STATIC VALIDATOR] Running Tier 1 Static Asset Integrity Checks');
  console.log(` Target Directory: ${distDir}`);
  console.log('='.repeat(65));

  // 1. Check dist directory existence
  if (!fs.existsSync(distDir)) {
    errors.push(`Target distribution directory does not exist: ${distDir}`);
    printResults({ success: false, errors, warnings, passes });
    return { success: false, errors, warnings, passes };
  }

  const distStat = fs.statSync(distDir);
  if (!distStat.isDirectory()) {
    errors.push(`Target distribution path is not a directory: ${distDir}`);
    printResults({ success: false, errors, warnings, passes });
    return { success: false, errors, warnings, passes };
  }
  passes.push(`Distribution directory exists: ${distDir}`);

  // 2. Check dist/index.html existence and non-emptiness
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    errors.push(`dist/index.html is missing at ${indexPath}`);
  } else {
    const indexStat = fs.statSync(indexPath);
    if (!indexStat.isFile()) {
      errors.push(`dist/index.html is not a file at ${indexPath}`);
    } else if (indexStat.size === 0) {
      errors.push(`dist/index.html exists but is empty (0 bytes)`);
    } else {
      passes.push(`dist/index.html exists and is non-empty (${indexStat.size} bytes)`);
    }
  }

  // 3. Check dist/.nojekyll existence
  const noJekyllPath = path.join(distDir, '.nojekyll');
  if (!fs.existsSync(noJekyllPath)) {
    errors.push(`dist/.nojekyll is missing (required to prevent GitHub Pages Jekyll processing)`);
  } else {
    passes.push(`dist/.nojekyll exists`);
  }

  // If index.html is missing or empty, cannot proceed with tag analysis
  if (!fs.existsSync(indexPath) || fs.statSync(indexPath).size === 0) {
    printResults({ success: false, errors, warnings, passes });
    return { success: false, errors, warnings, passes };
  }

  const htmlContent = fs.readFileSync(indexPath, 'utf-8');

  // 4 & 5. Check script and stylesheet tags for relative URLs and physical existence
  // Regex to extract tags
  const scriptTagRegex = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  const linkTagRegex = /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  const imgTagRegex = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  const sourceTagRegex = /<source\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;

  const assetReferences = [];

  let match;
  while ((match = scriptTagRegex.exec(htmlContent)) !== null) {
    assetReferences.push({ tag: 'script', url: match[1], fullMatch: match[0] });
  }
  while ((match = linkTagRegex.exec(htmlContent)) !== null) {
    const isStylesheet = /rel=["']stylesheet["']/i.test(match[0]);
    const isIcon = /rel=["'](?:shortcut\s+)?icon["']/i.test(match[0]);
    assetReferences.push({ tag: 'link', isStylesheet, isIcon, url: match[1], fullMatch: match[0] });
  }
  while ((match = imgTagRegex.exec(htmlContent)) !== null) {
    assetReferences.push({ tag: 'img', url: match[1], fullMatch: match[0] });
  }
  while ((match = sourceTagRegex.exec(htmlContent)) !== null) {
    assetReferences.push({ tag: 'source', url: match[1], fullMatch: match[0] });
  }

  let scriptOrCssFound = false;

  for (const ref of assetReferences) {
    const rawUrl = ref.url.trim();

    // Ignore remote URLs, protocol-relative, data URLs, anchors, mailto
    if (
      rawUrl.startsWith('http://') ||
      rawUrl.startsWith('https://') ||
      rawUrl.startsWith('//') ||
      rawUrl.startsWith('data:') ||
      rawUrl.startsWith('#') ||
      rawUrl.startsWith('mailto:') ||
      rawUrl.startsWith('javascript:')
    ) {
      continue;
    }

    if (ref.tag === 'script' || (ref.tag === 'link' && ref.isStylesheet)) {
      scriptOrCssFound = true;
    }

    // Check for absolute root paths (e.g. /assets/index.js)
    if (rawUrl.startsWith('/')) {
      errors.push(
        `Absolute root path forbidden in static build: "${rawUrl}" in <${ref.tag}>. Must use relative URL (e.g. "./assets/...") for GitHub Pages compatibility.`
      );
      continue;
    }

    // Must be relative URL
    // Clean query strings and hashes
    const cleanUrl = rawUrl.split('?')[0].split('#')[0];
    const resolvedPath = path.resolve(distDir, cleanUrl.startsWith('./') ? cleanUrl.slice(2) : cleanUrl);

    // Verify physical file existence in dist/
    if (!fs.existsSync(resolvedPath)) {
      errors.push(
        `Referenced asset not found on disk: "${rawUrl}" (resolved to: ${resolvedPath}) referenced in <${ref.tag}>`
      );
    } else {
      const fileStat = fs.statSync(resolvedPath);
      if (!fileStat.isFile()) {
        errors.push(
          `Referenced asset is not a file: "${rawUrl}" (resolved to: ${resolvedPath})`
        );
      } else {
        passes.push(
          `Verified asset exists (${fileStat.size} bytes): ${rawUrl} -> ${path.relative(distDir, resolvedPath)}`
        );
      }
    }
  }

  if (!scriptOrCssFound) {
    warnings.push('No local script or stylesheet references found in dist/index.html.');
  }

  const success = errors.length === 0;
  printResults({ success, errors, warnings, passes });

  return { success, errors, warnings, passes };
}

function printResults({ success, errors, warnings, passes }) {
  console.log('\n--- Test Results Summary ---');
  passes.forEach(p => console.log(`  [PASS] ${p}`));
  warnings.forEach(w => console.log(`  [WARN] ${w}`));
  errors.forEach(e => console.log(`  [FAIL] ${e}`));

  console.log('\n' + '-'.repeat(65));
  if (success) {
    console.log(' [PASS] All static asset integrity checks passed successfully.');
  } else {
    console.log(` [FAIL] Static validation failed with ${errors.length} error(s).`);
  }
  console.log('-'.repeat(65) + '\n');
}

// Direct CLI invocation
const isDirectExecution =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectExecution) {
  const targetDir = process.argv[2] || path.resolve(process.cwd(), 'dist');
  const result = validateStaticBuild(targetDir);
  process.exit(result.success ? 0 : 1);
}
