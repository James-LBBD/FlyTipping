/**
 * End-to-end API test for the AI Fly-Tipping POC
 * Uses local test images and runs them through all API endpoints,
 * simulating the full user flow:
 *   1. Upload image → validate-image
 *   2. Pick location → validate-location
 *   3. AI analysis → extract-fields
 *   4. Similarity → generate-embedding + check-duplicates
 *   5. Submit → submit-report
 */

import { readFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';

// Thames Road, Barking coordinates (near River Roding — within 250m buffer of LBBD boundary)
const TEST_LOCATION = { latitude: 51.5195, longitude: 0.0823 };

function loadLocalImages() {
  // Prefer test-fixtures/ subfolder, fall back to images/ root
  const fixturesDir = join(process.cwd(), 'images', 'test-fixtures');
  const imagesDir = join(process.cwd(), 'images');
  const searchDir =
    existsSync(fixturesDir) &&
    readdirSync(fixturesDir).some((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
      ? fixturesDir
      : imagesDir;

  if (!existsSync(searchDir)) {
    console.error(
      '❌ No images/ directory found. Place test images there first.'
    );
    process.exit(1);
  }
  const files = readdirSync(searchDir).filter((f) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
  );
  if (files.length === 0) {
    console.error('❌ No image files found in', searchDir);
    process.exit(1);
  }
  console.log(`  Using images from: ${searchDir}`);
  return files.map((f) => ({
    name: f,
    path: join(searchDir, f)
  }));
}

function imageToDataUrl(filePath) {
  const buffer = readFileSync(filePath);
  const base64 = buffer.toString('base64');
  const ext = filePath.toLowerCase().endsWith('.png')
    ? 'image/png'
    : 'image/jpeg';
  return {
    base64,
    dataUrl: `data:${ext};base64,${base64}`,
    size: buffer.length
  };
}

async function callApi(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000) // 2min timeout per API call
  });
  const data = await res.json();
  return { status: res.status, data };
}

function printResult(label, result) {
  const icon = result.status === 200 ? '✅' : '❌';
  console.log(`\n  ${icon} ${label} (HTTP ${result.status})`);
  console.log(
    '  ' + JSON.stringify(result.data, null, 2).split('\n').join('\n  ')
  );
}

async function testImage(imageInfo) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`TEST: ${imageInfo.name}`);
  console.log('═'.repeat(60));

  const { base64, dataUrl, size } = imageToDataUrl(imageInfo.path);
  console.log(`  📁 Loaded ${imageInfo.name} (${Math.round(size / 1024)} KB)`);

  // ── 1. Validate Image ───────────────────────────────────────────
  console.log('\n── Step 1: Validate Image (/api/validate-image) ──');
  const validation = await callApi('/api/validate-image', { image: dataUrl });
  printResult('Image Validation', validation);

  if (validation.status !== 200 || !validation.data.isValid) {
    console.log('  ⚠️  Image not valid, skipping remaining steps');
    return validation.data;
  }

  // ── 2. Validate Location ────────────────────────────────────────
  console.log('\n── Step 2: Validate Location (/api/validate-location) ──');
  console.log(
    `  Location: Thames Road, Barking (${TEST_LOCATION.latitude}, ${TEST_LOCATION.longitude})`
  );
  const locationValidation = await callApi('/api/validate-location', {
    coordinates: TEST_LOCATION
  });
  printResult('Location Validation', locationValidation);

  // ── 3. Extract Fields ───────────────────────────────────────────
  console.log('\n── Step 3: Extract Fields (/api/extract-fields) ──');
  const extraction = await callApi('/api/extract-fields', { image: dataUrl });
  printResult('Field Extraction', extraction);

  // ── 4. Generate Embedding ───────────────────────────────────────
  console.log('\n── Step 4: Generate Embedding (/api/generate-embedding) ──');
  const embeddingResult = await callApi('/api/generate-embedding', {
    image: dataUrl,
    extractedText: extraction.data?.description || 'fly-tipping waste'
  });
  const embeddingSummary = {
    status: embeddingResult.status,
    data: embeddingResult.data?.embedding
      ? {
          dimensions: embeddingResult.data.embedding.length,
          sample: embeddingResult.data.embedding.slice(0, 5)
        }
      : embeddingResult.data
  };
  printResult('Embedding Generation', embeddingSummary);

  // ── 5. Check Duplicates ─────────────────────────────────────────
  console.log('\n── Step 5: Check Duplicates (/api/check-duplicates) ──');
  const duplicates = await callApi('/api/check-duplicates', {
    embedding: embeddingResult.data?.embedding || [],
    coordinates: TEST_LOCATION,
    searchRadius: 100
  });
  printResult('Duplicate Check', duplicates);

  // ── 6. Submit Report ────────────────────────────────────────────
  console.log('\n── Step 6: Submit Report (/api/submit-report) ──');
  const submitPayload = {
    wasteType: extraction.data?.wasteType || 'household',
    wasteSize: extraction.data?.wasteSize || 'large',
    hazardous: extraction.data?.hazardous ?? false,
    description:
      extraction.data?.description ||
      'Fly-tipped waste found at Thames Road, Barking',
    aiSummary: extraction.data?.summary || 'AI-detected fly-tipping incident',
    severityRating: extraction.data?.severityRating || 7,
    landOwnership: 'public',
    knowsWhoTipped: 'no',
    contactFirstName: 'Test',
    contactLastName: 'User',
    contactEmail: 'test@lbbd.gov.uk',
    contactPhone: '',
    image: {
      id: Date.now().toString(),
      filename: 'test-flytip.jpg',
      path: '',
      size: base64.length,
      mimeType: 'image/jpeg',
      uploadedAt: new Date().toISOString()
    },
    imageData: base64,
    aiMetadata: {
      modelUsed: 'GPT-4o',
      timestamp: new Date().toISOString(),
      validationPassed: true,
      safetyCheck: {
        isSafe: validation.data.isSafe,
        containsFlyTipping: validation.data.containsFlyTipping
      },
      extractedFields: {
        wasteType: extraction.data?.wasteType,
        wasteSize: extraction.data?.wasteSize,
        hazardous: extraction.data?.hazardous,
        description: extraction.data?.description,
        severityRating: extraction.data?.severityRating,
        summary: extraction.data?.summary
      },
      confidence: extraction.data?.confidence || 0.8
    },
    embedding: {
      vector: embeddingResult.data?.embedding || [],
      modelUsed: 'text-embedding-3-large',
      generatedAt: new Date().toISOString()
    },
    location: {
      coordinates: TEST_LOCATION,
      withinBoundary: locationValidation.data?.withinBoundary ?? true,
      source: 'manual'
    },
    locationDetails: 'Thames Road, Barking - test submission',
    possibleDuplicates: duplicates.data?.similarReports || [],
    isDuplicateOverridden: false,
    submittedVia: 'api-test'
  };

  // ── Block submission if high-confidence duplicate detected ──────
  const hasDuplicates = duplicates.data?.hasDuplicates;
  const highestSim = duplicates.data?.highestSimilarity || 0;
  if (hasDuplicates && highestSim >= 0.85) {
    console.log(
      `  🚫 BLOCKED — duplicate detected (${Math.round(highestSim * 100)}% match). Skipping submission.`
    );
    return {
      validation: validation.data,
      location: locationValidation.data,
      extraction: extraction.data,
      embeddingDimensions: embeddingResult.data?.embedding?.length,
      duplicates: duplicates.data,
      submission: { success: false, blocked: true, reason: 'duplicate' }
    };
  }

  const submission = await callApi('/api/submit-report', submitPayload);
  printResult('Report Submission', submission);

  return {
    validation: validation.data,
    location: locationValidation.data,
    extraction: extraction.data,
    embeddingDimensions: embeddingResult.data?.embedding?.length,
    duplicates: duplicates.data,
    submission: submission.data
  };
}

async function main() {
  console.log('🗑️  AI Fly-Tipping POC — End-to-End API Test');
  console.log(`📍 Location: Thames Road, Barking`);
  console.log(`🌐 Server: ${BASE_URL}`);
  console.log(`📅 ${new Date().toLocaleString()}`);

  // Load local test images
  const TEST_IMAGES = loadLocalImages();
  console.log(`📸 Found ${TEST_IMAGES.length} test image(s) in images/\n`);

  // Check server is running
  try {
    const health = await fetch(BASE_URL);
    if (!health.ok) throw new Error(`HTTP ${health.status}`);
    console.log('✅ Dev server is reachable\n');
  } catch (err) {
    console.error('❌ Dev server not reachable at', BASE_URL);
    console.error('   Run: npm run dev');
    process.exit(1);
  }

  const results = [];
  for (const img of TEST_IMAGES) {
    try {
      const result = await testImage(img);
      results.push({ name: img.name, result });
    } catch (err) {
      console.error(`\n❌ Error testing "${img.name}": ${err.message}`);
      results.push({ name: img.name, error: err.message });
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  for (const r of results) {
    if (r.error) {
      console.log(`❌ ${r.name}: ERROR - ${r.error}`);
    } else if (r.result?.validation) {
      const v = r.result.validation;
      console.log(`${v.isValid ? '✅' : '❌'} ${r.name}`);
      console.log(
        `   Fly-tipping: ${v.containsFlyTipping ? 'Yes' : 'No'} | Safe: ${v.isSafe ? 'Yes' : 'No'} | Confidence: ${v.confidence}`
      );
      if (r.result.extraction) {
        const e = r.result.extraction;
        console.log(
          `   Waste type: ${e.wasteType} | Size: ${e.wasteSize} | Severity: ${e.severityRating}/10`
        );
      }
      if (r.result.submission?.success) {
        console.log(`   📝 Report submitted: ${r.result.submission.reportId}`);
      } else if (r.result.submission?.blocked) {
        console.log(`   🚫 Submission blocked: ${r.result.submission.reason}`);
      }
    }
  }
  console.log();
}

main().catch(console.error);
