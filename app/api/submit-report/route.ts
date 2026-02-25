import { NextRequest, NextResponse } from 'next/server';
import {
  saveReport,
  saveImage,
  saveEmbedding,
  generateReportId
} from '@/lib/storage';
import type { Report } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const reportData = await request.json();

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
    await saveReport(report);
    await saveEmbedding(reportId, reportData.embedding);

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
