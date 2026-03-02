// Similarity calculation utilities for duplicate detection
import type { Coordinates, SimilarReport, Embedding } from '@/types';

// Calculate cosine similarity between two vectors
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (
    !Array.isArray(vectorA) ||
    !Array.isArray(vectorB) ||
    vectorA.length === 0 ||
    vectorB.length === 0
  ) {
    return 0;
  }
  if (vectorA.length !== vectorB.length) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// Calculate distance between two coordinates in meters (Haversine formula)
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371000; // Earth's radius in meters
  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Threshold above which two images are treated as the same photo
// regardless of where the user placed the map pin.
const IMAGE_DUPLICATE_THRESHOLD = 0.9;

// Find similar reports based on embedding similarity and proximity.
// Two matching strategies:
//   1. Proximity match  – within searchRadius AND similarity ≥ threshold
//   2. Image-only match – similarity ≥ IMAGE_DUPLICATE_THRESHOLD at ANY distance
//      (catches the same photo uploaded with a different map pin)
export function findSimilarReports(
  targetEmbedding: number[],
  targetCoords: Coordinates,
  allReports: Map<
    string,
    {
      embedding: Embedding;
      coords: Coordinates;
      imageUrl: string;
      timestamp: string;
    }
  >,
  searchRadius: number = 100, // meters
  similarityThreshold: number = 0.7
): SimilarReport[] {
  const similarReports: SimilarReport[] = [];

  for (const [reportId, report] of allReports.entries()) {
    // Skip reports with missing or invalid embedding vectors
    if (
      !Array.isArray(report.embedding?.vector) ||
      report.embedding.vector.length === 0
    ) {
      continue;
    }

    const distance = calculateDistance(targetCoords, report.coords);
    const similarity = cosineSimilarity(
      targetEmbedding,
      report.embedding.vector
    );

    // Strategy 1: nearby + moderately similar
    const isProximityMatch =
      distance <= searchRadius && similarity >= similarityThreshold;

    // Strategy 2: extremely similar image regardless of distance
    const isImageDuplicate = similarity >= IMAGE_DUPLICATE_THRESHOLD;

    if (isProximityMatch || isImageDuplicate) {
      similarReports.push({
        reportId,
        similarity,
        distance,
        timestamp: report.timestamp,
        imageUrl: report.imageUrl
      });
    }
  }

  // Sort by similarity (highest first)
  return similarReports.sort((a, b) => b.similarity - a.similarity);
}

// Get confidence level based on similarity score
export function getConfidenceLevel(
  similarity: number
): 'high' | 'medium' | 'low' {
  if (similarity >= 0.9) return 'high';
  if (similarity >= 0.75) return 'medium';
  return 'low';
}

// Determine if reports are likely duplicates
export function areLikelyDuplicates(
  similarity: number,
  distance: number,
  maxDistance: number = 50
): boolean {
  return similarity >= 0.85 && distance <= maxDistance;
}
