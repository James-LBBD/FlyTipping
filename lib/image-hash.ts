// Image hashing utility for exact-match duplicate detection.
// Uses SHA-256 to fingerprint the raw image bytes — same file produces the
// same hash regardless of where or when it is uploaded.
import { createHash } from 'node:crypto';

export function computeImageHash(imageBuffer: Buffer): string {
  return createHash('sha256').update(imageBuffer).digest('hex');
}
