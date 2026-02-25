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

/** Distance from a point to the nearest boundary edge, in metres (approximate) */
function distanceToBoundary(
  coords: Coordinates,
  boundary: GeoJSONFeatureCollection
): number {
  const point: [number, number] = [coords.longitude, coords.latitude];
  let minDist = Infinity;

  for (const feature of boundary.features) {
    const rings: number[][][] =
      feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates[0] as number[][]]
        : (feature.geometry.coordinates as number[][][][]).map(
            (p) => p[0] as number[][]
          );

    for (const ring of rings) {
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const dist = pointToSegmentDistance(point, ring[j], ring[i]);
        if (dist < minDist) minDist = dist;
      }
    }
  }
  return minDist;
}

/** Approx distance in metres between two [lon, lat] points using Haversine */
function haversineMetres(a: number[], b: number[]): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Minimum distance (metres) from a point to a line segment */
function pointToSegmentDistance(p: number[], a: number[], b: number[]): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return haversineMetres(p, a);
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  const closest = [a[0] + t * dx, a[1] + t * dy];
  return haversineMetres(p, closest);
}

export interface LocationValidation {
  withinBoundary: boolean;
  nearBoundary: boolean;
  distanceMetres: number;
}

/** Buffer tolerance in metres — accept reports this close to the boundary.
 *  The ONS boundary follows river centrelines, so riverside areas like
 *  Thames Road / Creekmouth (which ARE in LBBD) can appear ~700m outside. */
const BOUNDARY_BUFFER_METRES = 800;

export async function validateLocation(
  coords: Coordinates
): Promise<LocationValidation> {
  const boundary = await loadLBBDBoundary();
  const inside = isPointInBoundary(coords, boundary);

  if (inside) {
    return { withinBoundary: true, nearBoundary: false, distanceMetres: 0 };
  }

  const dist = distanceToBoundary(coords, boundary);
  return {
    withinBoundary: dist <= BOUNDARY_BUFFER_METRES,
    nearBoundary: dist <= BOUNDARY_BUFFER_METRES,
    distanceMetres: Math.round(dist)
  };
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
