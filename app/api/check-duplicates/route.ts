import { NextRequest, NextResponse } from 'next/server';
import { getAllReports } from '@/lib/storage';
import { findSimilarReports } from '@/lib/similarity';
import type { Coordinates } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { embedding, coordinates, searchRadius = 100 } = await request.json();

    if (!Array.isArray(embedding) || embedding.length === 0 || !coordinates) {
      return NextResponse.json(
        { error: 'Valid embedding array and coordinates are required' },
        { status: 400 }
      );
    }

    // Get all existing reports
    const allReports = await getAllReports();

    // Build map of reports with embeddings
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

    // Find similar reports
    const similarReports = findSimilarReports(
      embedding,
      coordinates as Coordinates,
      reportsMap,
      searchRadius,
      0.7 // similarity threshold
    );

    const hasDuplicates = similarReports.some(
      (report) => report.similarity >= 0.85
    );

    return NextResponse.json({
      hasDuplicates,
      similarReports,
      highestSimilarity: similarReports[0]?.similarity || 0
    });
  } catch (error) {
    console.error('Duplicate check error:', error);
    return NextResponse.json(
      { error: 'Failed to check for duplicates' },
      { status: 500 }
    );
  }
}
