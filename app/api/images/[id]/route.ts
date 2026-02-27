import { NextRequest, NextResponse } from 'next/server';
import { getImage } from '@/lib/storage';

// GET /api/images/:id — serve an uploaded image by its ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Strip any extension from the ID
    const imageId = id.replace(/\.\w+$/, '');
    const buffer = await getImage(imageId);

    if (!buffer) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Image GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}
