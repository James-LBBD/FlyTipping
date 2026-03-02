import { NextRequest, NextResponse } from 'next/server';
import {
  saveReport,
  saveImage,
  saveEmbedding,
  generateReportId,
  getAllReports
} from '@/lib/storage';
import { findSimilarReports } from '@/lib/similarity';
import type { Report } from '@/types';

const HIGH_SIMILARITY_THRESHOLD = 0.85;

export async function POST(request: NextRequest) {
  try {
    const reportData = await request.json();

    // ── Server-side duplicate enforcement ──────────────────────────
    const hasValidEmbedding =
      Array.isArray(reportData.embedding?.vector) &&
      reportData.embedding.vector.length > 0;
    if (hasValidEmbedding && reportData.location?.coordinates) {
      const allReports = await getAllReports();
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
        (r) => r.similarity >= HIGH_SIMILARITY_THRESHOLD
      );

      // High-confidence duplicates (>=85%) are ALWAYS blocked — the override
      // flag only applies to medium-confidence matches (70-85%)
      if (highConfidenceDuplicate) {
        return NextResponse.json(
          {
            success: false,
            error: 'duplicate_blocked',
            message: `This report is ${Math.round(highConfidenceDuplicate.similarity * 100)}% similar to an existing report (${highConfidenceDuplicate.reportId}). Submission blocked.`,
            similarReport: highConfidenceDuplicate
          },
          { status: 409 }
        );
      }
    }

    // Generate unique report ID
    const reportId = generateReportId();

    // Save image
    const imageBuffer = Buffer.from(reportData.imageData, 'base64');
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
