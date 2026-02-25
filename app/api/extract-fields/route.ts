import { NextRequest, NextResponse } from 'next/server';
import { extractFields } from '@/lib/azure-openai';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const base64Image = image.includes('base64,')
      ? image.split('base64,')[1]
      : image;

    const result = await extractFields(base64Image);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Field extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract fields from image' },
      { status: 500 }
    );
  }
}
