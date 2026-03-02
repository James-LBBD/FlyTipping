import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const FIXTURES_DIR = join(process.cwd(), 'images', 'test-fixtures');

export async function POST(request: NextRequest) {
  try {
    const { filename, dataUrl } = await request.json();

    if (!filename || !dataUrl) {
      return NextResponse.json(
        { error: 'filename and dataUrl are required' },
        { status: 400 }
      );
    }

    // Ensure directory exists
    if (!existsSync(FIXTURES_DIR)) {
      mkdirSync(FIXTURES_DIR, { recursive: true });
    }

    // Extract base64 data
    const base64Data = dataUrl.includes('base64,')
      ? dataUrl.split('base64,')[1]
      : dataUrl;

    // Sanitize filename
    const safeName = filename.replaceAll(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
    const savePath = join(FIXTURES_DIR, safeName);

    // Save to disk
    const buffer = Buffer.from(base64Data, 'base64');
    writeFileSync(savePath, buffer);

    return NextResponse.json({
      success: true,
      savedAs: `images/test-fixtures/${safeName}`,
      size: buffer.length
    });
  } catch (error) {
    console.error('Save test image error:', error);
    return NextResponse.json(
      { error: 'Failed to save image' },
      { status: 500 }
    );
  }
}
