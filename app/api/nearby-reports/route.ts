import { NextRequest, NextResponse } from 'next/server';
import { getAllReports } from '@/lib/storage';
import { calculateDistance } from '@/lib/similarity';
import type { Coordinates } from '@/types';

// GET /api/nearby-reports?latitude=...&longitude=...&radius=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = Number.parseFloat(searchParams.get('latitude') || '');
    const lng = Number.parseFloat(searchParams.get('longitude') || '');
    const radius = Number.parseFloat(searchParams.get('radius') || '500');

    const allReports = await getAllReports();

    // If no coords provided, return all reports (for admin)
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json({
        reports: allReports,
        count: allReports.length
      });
    }

    const coordinates: Coordinates = { latitude: lat, longitude: lng };

    const nearbyReports = allReports
      .filter((report) => {
        const distance = calculateDistance(
          coordinates,
          report.location.coordinates
        );
        return distance <= radius;
      })
      .map((report) => ({
        id: report.id,
        coordinates: report.location.coordinates,
        imageUrl: `/images/${report.image.id}.jpg`,
        wasteType: report.wasteType,
        wasteSize: report.wasteSize,
        createdAt: report.createdAt,
        status: report.status
      }));

    return NextResponse.json({
      reports: nearbyReports,
      count: nearbyReports.length
    });
  } catch (error) {
    console.error('Nearby reports GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { coordinates, radius = 100 } = await request.json();

    if (!coordinates) {
      return NextResponse.json(
        { error: 'Coordinates are required' },
        { status: 400 }
      );
    }

    const allReports = await getAllReports();

    // Filter reports within radius
    const nearbyReports = allReports
      .filter((report) => {
        const distance = calculateDistance(
          coordinates as Coordinates,
          report.location.coordinates
        );
        return distance <= radius;
      })
      .map((report) => ({
        id: report.id,
        coordinates: report.location.coordinates,
        imageUrl: `/images/${report.image.id}.jpg`,
        wasteType: report.wasteType,
        wasteSize: report.wasteSize,
        createdAt: report.createdAt,
        status: report.status
      }));

    return NextResponse.json({
      reports: nearbyReports,
      count: nearbyReports.length
    });
  } catch (error) {
    console.error('Nearby reports error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby reports' },
      { status: 500 }
    );
  }
}
