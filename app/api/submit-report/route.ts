import { NextRequest, NextResponse } from 'next/server';
import {
  saveReport,
  saveImage,
  saveEmbedding,
  generateReportId,
  getAllReports
} from '@/lib/storage';
import { findSimilarReports, cosineSimilarity } from '@/lib/similarity';
import { computeImageHash } from '@/lib/image-hash';
import type { Report } from '@/types';

const HIGH_SIMILARITY_THRESHOLD = 0.85;
const CONTENT_FINGERPRINT_THRESHOLD = 0.97;

export async function POST(request: NextRequest) {
  try {
    const reportData = await request.json();

    // ── Compute image hash server-side (authoritative) ────────────
    const imageBuffer = Buffer.from(reportData.imageData, 'base64');
    const imageHash = computeImageHash(imageBuffer);

    // ── Server-side duplicate enforcement — three layers ──────────
    const allReports = await getAllReports();

    // Layer 1: Image hash — exact same photo at any location
    for (const report of allReports) {
      if (report.imageHash && report.imageHash === imageHash) {
        return NextResponse.json(
          {
            success: false,
            error: 'duplicate_blocked',
            message: `This is the same image as an existing report (${report.id}). The same photo cannot be reported twice.`,
            similarReport: {
              reportId: report.id,
              similarity: 1.0,
              distance: Infinity,
              timestamp: report.createdAt,
              imageUrl: `/images/${report.image.id}.jpg`,
              matchType: 'image_hash'
            }
          },
          { status: 409 }
        );
      }
    }

    // Layer 2: Content fingerprint — same AI output at any location
    const hasValidEmbedding =
      Array.isArray(reportData.embedding?.vector) &&
      reportData.embedding.vector.length > 0;

    if (hasValidEmbedding && reportData.wasteType && reportData.wasteSize) {
      for (const report of allReports) {
        if (
          !Array.isArray(report.embedding?.vector) ||
          report.embedding.vector.length === 0
        ) {
          continue;
        }

        const sim = cosineSimilarity(
          reportData.embedding.vector,
          report.embedding.vector
        );
        if (
          sim >= CONTENT_FINGERPRINT_THRESHOLD &&
          report.wasteType === reportData.wasteType &&
          report.wasteSize === reportData.wasteSize
        ) {
          return NextResponse.json(
            {
              success: false,
              error: 'duplicate_blocked',
              message: `This appears to be the same incident as report ${report.id} — identical waste analysis (${Math.round(sim * 100)}% match). Submission blocked.`,
              similarReport: {
                reportId: report.id,
                similarity: sim,
                distance: Infinity,
                timestamp: report.createdAt,
                imageUrl: `/images/${report.image.id}.jpg`,
                matchType: 'content'
              }
            },
            { status: 409 }
          );
        }
      }
    }

    // Layer 3: Proximity — similar waste nearby
    if (hasValidEmbedding && reportData.location?.coordinates) {
      const reportsMap = new Map();
      for (const report of allReports) {
        if (report.embedding && report.location.coordinates) {
          reportsMap.set(report.id, {
            embedding: report.embedding,
            coords: report.location.coordinates,
            imageUrl: `/images/${report.image.id}.jpg`,
            timestamp: report.createdAt
          });
        }
      }

      const similarReports = findSimilarReports(
        reportData.embedding.vector,
        reportData.location.coordinates,
        reportsMap,
        100, // search radius metres
        0.7 // similarity threshold
      );

      const highConfidenceDuplicate = similarReports.find(
        (r) => r.similarity >= HIGH_SIMILARITY_THRESHOLD && r.distance <= 100
      );

      // Block only when BOTH high text similarity AND nearby — same waste type
      // at a different location is a separate incident, not a duplicate
      if (highConfidenceDuplicate) {
        return NextResponse.json(
          {
            success: false,
            error: 'duplicate_blocked',
            message: `This report is ${Math.round(highConfidenceDuplicate.similarity * 100)}% similar to an existing report (${highConfidenceDuplicate.reportId}) ${Math.round(highConfidenceDuplicate.distance)}m away. Submission blocked.`,
            similarReport: {
              ...highConfidenceDuplicate,
              matchType: 'proximity'
            }
          },
          { status: 409 }
        );
      }
    }

    // Generate unique report ID
    const reportId = generateReportId();

    // Save image
    const imagePath = await saveImage(reportData.image.id, imageBuffer);

    // Build complete report object
    const report: Report = {
      id: reportId,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      image: {
        ...reportData.image,
        path: imagePath
      },
      aiMetadata: reportData.aiMetadata,
      embedding: reportData.embedding,
      imageHash,
      location: reportData.location,
      locationDetails: reportData.locationDetails,
      wasteType: reportData.wasteType,
      wasteSize: reportData.wasteSize,
      hazardous: reportData.hazardous,
      description: reportData.description,
      aiSummary: reportData.aiSummary,
      severityRating: reportData.severityRating,
      landOwnership: reportData.landOwnership || 'unknown',
      knowsWhoTipped: reportData.knowsWhoTipped || 'no',
      tipperDetails: reportData.tipperDetails,
      contactFirstName: reportData.contactFirstName,
      contactLastName: reportData.contactLastName,
      contactEmail: reportData.contactEmail,
      contactPhone: reportData.contactPhone,
      possibleDuplicates: reportData.possibleDuplicates || [],
      isDuplicateOverridden: reportData.isDuplicateOverridden,
      submittedVia: reportData.submittedVia || 'web',
      userAgent: request.headers.get('user-agent') || undefined
    };

    // Save report and embedding
    // If embedding vector is invalid (e.g. AI was unavailable), omit it from the saved report
    if (!hasValidEmbedding) {
      report.embedding = undefined as unknown as Report['embedding'];
    }
    await saveReport(report);
    if (hasValidEmbedding) {
      await saveEmbedding(reportId, reportData.embedding);
    }

    return NextResponse.json({
      success: true,
      reportId,
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Report submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
