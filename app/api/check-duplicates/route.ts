import { NextRequest, NextResponse } from 'next/server';
import { getAllReports } from '@/lib/storage';
import { findSimilarReports, cosineSimilarity } from '@/lib/similarity';
import type { Coordinates, SimilarReport } from '@/types';

const HIGH_SIMILARITY_THRESHOLD = 0.85;
const CONTENT_FINGERPRINT_THRESHOLD = 0.97;

export async function POST(request: NextRequest) {
  try {
    const {
      embedding,
      coordinates,
      searchRadius = 100,
      imageHash,
      wasteType,
      wasteSize
    } = await request.json();

    if (!coordinates) {
      return NextResponse.json(
        { error: 'Coordinates are required' },
        { status: 400 }
      );
    }

    // Get all existing reports
    const allReports = await getAllReports();
    const allDuplicates: SimilarReport[] = [];

    // ── Layer 1: Image hash — exact same photo at any location ─────
    if (imageHash) {
      for (const report of allReports) {
        if (report.imageHash && report.imageHash === imageHash) {
          const distance = Infinity; // image hash match is location-independent
          allDuplicates.push({
            reportId: report.id,
            similarity: 1.0, // exact match
            distance,
            timestamp: report.createdAt,
            imageUrl: `/images/${report.image.id}.jpg`,
            matchType: 'image_hash'
          });
        }
      }
    }

    // ── Layer 2: Content fingerprint — same AI output at any location
    // If embedding is extremely similar AND wasteType + wasteSize match,
    // it's very likely the same image (or a near-identical one) producing
    // identical AI analysis. Flag regardless of distance.
    if (
      Array.isArray(embedding) &&
      embedding.length > 0 &&
      wasteType &&
      wasteSize
    ) {
      for (const report of allReports) {
        // Skip reports already caught by image hash
        if (allDuplicates.some((d) => d.reportId === report.id)) continue;

        if (
          !Array.isArray(report.embedding?.vector) ||
          report.embedding.vector.length === 0
        ) {
          continue;
        }

        const sim = cosineSimilarity(embedding, report.embedding.vector);
        if (
          sim >= CONTENT_FINGERPRINT_THRESHOLD &&
          report.wasteType === wasteType &&
          report.wasteSize === wasteSize
        ) {
          allDuplicates.push({
            reportId: report.id,
            similarity: sim,
            distance: Infinity,
            timestamp: report.createdAt,
            imageUrl: `/images/${report.image.id}.jpg`,
            matchType: 'content'
          });
        }
      }
    }

    // ── Layer 3: Proximity — similar waste nearby ──────────────────
    if (Array.isArray(embedding) && embedding.length > 0) {
      const reportsMap = new Map();
      for (const report of allReports) {
        // Skip reports already found by layer 1 or 2
        if (allDuplicates.some((d) => d.reportId === report.id)) continue;

        if (report.embedding && report.location.coordinates) {
          reportsMap.set(report.id, {
            embedding: report.embedding,
            coords: report.location.coordinates,
            imageUrl: `/images/${report.image.id}.jpg`,
            timestamp: report.createdAt
          });
        }
      }

      const proximityMatches = findSimilarReports(
        embedding,
        coordinates as Coordinates,
        reportsMap,
        searchRadius,
        0.7
      );

      for (const match of proximityMatches) {
        allDuplicates.push({ ...match, matchType: 'proximity' });
      }
    }

    // Sort: image_hash first, then content, then proximity (by similarity)
    const sortOrder = { image_hash: 0, content: 1, proximity: 2 };
    allDuplicates.sort((a, b) => {
      const orderDiff =
        (sortOrder[a.matchType || 'proximity'] ?? 2) -
        (sortOrder[b.matchType || 'proximity'] ?? 2);
      return orderDiff !== 0 ? orderDiff : b.similarity - a.similarity;
    });

    const hasDuplicates =
      allDuplicates.some((r) => r.matchType === 'image_hash') ||
      allDuplicates.some((r) => r.matchType === 'content') ||
      allDuplicates.some((r) => r.similarity >= HIGH_SIMILARITY_THRESHOLD);

    return NextResponse.json({
      hasDuplicates,
      similarReports: allDuplicates,
      highestSimilarity: allDuplicates[0]?.similarity || 0
    });
  } catch (error) {
    console.error('Duplicate check error:', error);
    return NextResponse.json(
      { error: 'Failed to check for duplicates' },
      { status: 500 }
    );
  }
}
