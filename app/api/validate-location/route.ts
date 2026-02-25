import { NextRequest, NextResponse } from 'next/server';
import { validateLocation } from '@/lib/geojson';
import type { Coordinates } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { coordinates } = await request.json();

    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      return NextResponse.json(
        { error: 'Valid coordinates are required' },
        { status: 400 }
      );
    }

    const result = await validateLocation(coordinates as Coordinates);

    return NextResponse.json({
      isValid: result.withinBoundary,
      withinBoundary: result.withinBoundary,
      nearBoundary: result.nearBoundary,
      distanceMetres: result.distanceMetres,
      coordinates
    });
  } catch (error) {
    console.error('Location validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate location' },
      { status: 500 }
    );
  }
}
