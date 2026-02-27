import { NextRequest, NextResponse } from 'next/server';
import { getReport } from '@/lib/storage';

// GET /api/reports/:id — fetch a single report by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const report = await getReport(id);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Strip embedding vector from response to keep payload small
    const { embedding, ...reportWithoutEmbedding } = report;

    return NextResponse.json({ report: reportWithoutEmbedding });
  } catch (error) {
    console.error('Report GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
