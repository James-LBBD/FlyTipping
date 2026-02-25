import { NextRequest, NextResponse } from 'next/server';
import { generateImageEmbedding } from '@/lib/azure-openai';

export async function POST(request: NextRequest) {
  try {
    const { image, extractedText } = await request.json();

    if (!image || !extractedText) {
      return NextResponse.json(
        { error: 'Image and extracted text are required' },
        { status: 400 }
      );
    }

    const base64Image = image.includes('base64,')
      ? image.split('base64,')[1]
      : image;

    const embedding = await generateImageEmbedding(base64Image, extractedText);

    return NextResponse.json({
      embedding,
      modelUsed: 'text-embedding-3-large',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Embedding generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate embedding' },
      { status: 500 }
    );
  }
}
