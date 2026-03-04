// Test script for three-layer duplicate detection
// Run: node test-duplicates.mjs

import { readFileSync } from 'fs';
import { createHash } from 'crypto';

const BASE = 'http://localhost:3456';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return { status: res.status, data };
}

function makeReport(imageBase64, coords, overrides = {}) {
  return {
    imageData: imageBase64,
    image: {
      id: `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      filename: 'test.jpg',
      path: '',
      size: Buffer.from(imageBase64, 'base64').length,
      mimeType: 'image/jpeg',
      uploadedAt: new Date().toISOString()
    },
    aiMetadata: {
      modelUsed: 'GPT-4o',
      timestamp: new Date().toISOString(),
      validationPassed: true,
      safetyCheck: { isSafe: true, containsFlyTipping: true },
      extractedFields: {
        wasteType: 'furniture_general',
        wasteSize: 'small_van_load',
        hazardous: false,
        description: 'Dumped furniture including mattress on pavement',
        summary: 'Illegal dumping of household furniture'
      },
      confidence: {
        wasteType: 0.9,
        wasteSize: 0.8,
        hazardous: 0.95,
        description: 0.9,
        overall: 0.89
      }
    },
    location: {
      coordinates: coords,
      withinBoundary: true,
      source: 'manual'
    },
    wasteType: 'furniture_general',
    wasteSize: 'small_van_load',
    hazardous: false,
    description: 'Dumped furniture including mattress on pavement',
    aiSummary: 'Illegal dumping of household furniture',
    landOwnership: 'public',
    knowsWhoTipped: 'no',
    submittedVia: 'web',
    ...overrides
  };
}

// Load two different images
const img1Bytes = readFileSync('images/1772197460245.jpg');
const img1Base64 = img1Bytes.toString('base64');
const img1Hash = createHash('sha256').update(img1Bytes).digest('hex');

const img2Bytes = readFileSync('images/1772535602241.jpg');
const img2Base64 = img2Bytes.toString('base64');
const img2Hash = createHash('sha256').update(img2Bytes).digest('hex');

console.log(`Image 1 hash: ${img1Hash.slice(0, 16)}...`);
console.log(`Image 2 hash: ${img2Hash.slice(0, 16)}...`);
console.log(`Hashes match: ${img1Hash === img2Hash}\n`);

const LOCATION_A = { latitude: 51.5403, longitude: 0.0812 };
const LOCATION_B = { latitude: 51.6, longitude: 0.12 }; // ~7km away

// ── Clean up any test reports from previous runs ─────────────────
import { readdirSync, unlinkSync } from 'fs';
const reportFiles = readdirSync('reports').filter((f) => f.endsWith('.json'));
for (const f of reportFiles) {
  const report = JSON.parse(readFileSync(`reports/${f}`, 'utf-8'));
  // Only delete test reports (not the original)
  if (
    report.description?.includes('Dumped furniture') ||
    report.id?.includes('test')
  ) {
    unlinkSync(`reports/${f}`);
    console.log(`Cleaned up test report: ${report.id}`);
    // Also clean up embedding if exists
    try {
      unlinkSync(`embeddings/${report.id}.json`);
    } catch {}
  }
}
console.log('');

// ── TEST 0: Submit baseline report (image 1 at location A) ──────
console.log('=== TEST 0: Submit baseline (image 1 at location A) ===');
const t0 = await post('/api/submit-report', makeReport(img1Base64, LOCATION_A));
console.log(
  `  Status: ${t0.status} | ${t0.data.success ? `Created ${t0.data.reportId}` : t0.data.message}`
);
if (!t0.data.success) {
  console.log('  FAIL: Could not create baseline report!');
  process.exit(1);
}
const baselineId = t0.data.reportId;
console.log('');

// ── TEST 1: Same image at DIFFERENT location → BLOCKED (image hash) ──
console.log(
  '=== TEST 1: Same image, different location → should BLOCK (image_hash) ==='
);
const t1 = await post('/api/submit-report', makeReport(img1Base64, LOCATION_B));
console.log(
  `  Status: ${t1.status} | matchType: ${t1.data.similarReport?.matchType || 'n/a'}`
);
console.log(`  Message: ${t1.data.message || 'allowed'}`);
console.log(
  `  ${t1.status === 409 && t1.data.similarReport?.matchType === 'image_hash' ? '✅ PASS' : '❌ FAIL'}`
);
console.log('');

// ── TEST 2: Different image at DIFFERENT location, same waste type → ALLOWED ──
console.log(
  '=== TEST 2: Different image, different location → should ALLOW ==='
);
const t2 = await post('/api/submit-report', makeReport(img2Base64, LOCATION_B));
console.log(
  `  Status: ${t2.status} | ${t2.data.success ? `Created ${t2.data.reportId}` : t2.data.message}`
);
console.log(`  ${t2.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
const report2Id = t2.data.reportId;
console.log('');

// ── TEST 3: Same image at SAME location → BLOCKED (image hash) ──
console.log(
  '=== TEST 3: Same image, same location → should BLOCK (image_hash) ==='
);
const t3 = await post('/api/submit-report', makeReport(img1Base64, LOCATION_A));
console.log(
  `  Status: ${t3.status} | matchType: ${t3.data.similarReport?.matchType || 'n/a'}`
);
console.log(`  Message: ${t3.data.message || 'allowed'}`);
console.log(
  `  ${t3.status === 409 && t3.data.similarReport?.matchType === 'image_hash' ? '✅ PASS' : '❌ FAIL'}`
);
console.log('');

// ── TEST 4: check-duplicates with image hash → finds match ──
console.log(
  '=== TEST 4: check-duplicates with imageHash → finds image_hash match ==='
);
const t4 = await post('/api/check-duplicates', {
  coordinates: LOCATION_B,
  imageHash: img1Hash
});
console.log(`  Status: ${t4.status} | hasDuplicates: ${t4.data.hasDuplicates}`);
const hashMatch = t4.data.similarReports?.find(
  (r) => r.matchType === 'image_hash'
);
console.log(
  `  Image hash match: ${hashMatch ? `${hashMatch.reportId} (matchType=${hashMatch.matchType})` : 'none'}`
);
console.log(`  ${hashMatch ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

// ── TEST 5: check-duplicates with different hash → no image match ──
console.log(
  '=== TEST 5: check-duplicates with different hash → no image_hash match ==='
);
const t5 = await post('/api/check-duplicates', {
  coordinates: LOCATION_B,
  imageHash: 'aaaa' + img1Hash.slice(4) // modified hash
});
console.log(`  Status: ${t5.status}`);
const falseHashMatch = t5.data.similarReports?.find(
  (r) => r.matchType === 'image_hash'
);
console.log(
  `  Image hash match: ${falseHashMatch ? 'FOUND (unexpected)' : 'none (correct)'}`
);
console.log(`  ${!falseHashMatch ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

// ── Clean up test reports ──────────────────────────────────────
console.log('=== Cleaning up test reports ===');
const cleanFiles = readdirSync('reports').filter((f) => f.endsWith('.json'));
for (const f of cleanFiles) {
  const report = JSON.parse(readFileSync(`reports/${f}`, 'utf-8'));
  if (report.id === baselineId || report.id === report2Id) {
    unlinkSync(`reports/${f}`);
    try {
      unlinkSync(`embeddings/${report.id}.json`);
    } catch {}
    console.log(`  Removed: ${report.id}`);
  }
}

console.log('\n=== All tests complete ===');
