import { NextRequest, NextResponse } from 'next/server';
import { validateImage } from '@/lib/azure-openai';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Extract base64 data from data URL if needed
    const base64Image = image.includes('base64,')
      ? image.split('base64,')[1]
      : image;

    const result = await validateImage(base64Image);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Image validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate image' },
      { status: 500 }
    );
  }
}
