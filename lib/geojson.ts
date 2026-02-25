// GeoJSON utilities for LBBD boundary validation
import { promises as fs } from 'fs';
import path from 'path';
import type { Coordinates } from '@/types';

export interface PolygonFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: Record<string, any>;
}

export interface MultiPolygonFeature {
  type: 'Feature';
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
  properties: Record<string, any>;
}

export type GeoJSONFeature = PolygonFeature | MultiPolygonFeature;

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

let cachedBoundary: GeoJSONFeatureCollection | null = null;

export async function loadLBBDBoundary(): Promise<GeoJSONFeatureCollection> {
  if (cachedBoundary) {
    return cachedBoundary;
  }

  try {
    const filePath = path.join(
      process.cwd(),
      'public',
      'geojson',
      'lbbd-boundary.json'
    );
    const data = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);

    // Handle both Feature and FeatureCollection formats
    if (parsed.type === 'FeatureCollection') {
      cachedBoundary = parsed;
    } else if (parsed.type === 'Feature') {
      cachedBoundary = { type: 'FeatureCollection', features: [parsed] };
    } else {
      throw new Error('Invalid GeoJSON format');
    }

    return cachedBoundary!;
  } catch (error) {
    console.error('Failed to load LBBD boundary:', error);
    throw new Error('Failed to load boundary data');
  }
}

// Ray casting algorithm to check if point is inside polygon
function pointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

export function isPointInBoundary(
  coords: Coordinates,
  boundary: GeoJSONFeatureCollection
): boolean {
  const point: [number, number] = [coords.longitude, coords.latitude];

  for (const feature of boundary.features) {
    if (feature.geometry.type === 'Polygon') {
      // Polygon coordinates: [[[lon, lat], ...]]
      const polygon = feature.geometry.coordinates[0].map(([lon, lat]) => [
        lon,
        lat
      ]);
      if (pointInPolygon(point, polygon)) {
        return true;
      }
    } else if (feature.geometry.type === 'MultiPolygon') {
      // MultiPolygon coordinates: [[[[lon, lat], ...]], ...]
      for (const polygonCoords of feature.geometry.coordinates) {
        const polygon = polygonCoords[0].map(([lon, lat]) => [lon, lat]);
        if (pointInPolygon(point, polygon)) {
          return true;
        }
      }
    }
  }

  return false;
}

export async function validateLocation(coords: Coordinates): Promise<boolean> {
  const boundary = await loadLBBDBoundary();
  return isPointInBoundary(coords, boundary);
}

// Get center point of LBBD for map initialization
export function getBoundaryCenter(
  boundary: GeoJSONFeatureCollection
): Coordinates {
  // Calculate centroid of first feature
  const feature = boundary.features[0];
  if (!feature) {
    // Default center (approximate LBBD location)
    return { latitude: 51.5464, longitude: 0.1293 };
  }

  const coords =
    feature.geometry.type === 'Polygon'
      ? (feature.geometry.coordinates[0] as number[][])
      : (feature.geometry.coordinates[0][0] as number[][]);

  let latSum = 0;
  let lonSum = 0;
  let count = 0;

  for (const [lon, lat] of coords) {
    lonSum += lon;
    latSum += lat;
    count++;
  }

  return {
    latitude: latSum / count,
    longitude: lonSum / count
  };
}
