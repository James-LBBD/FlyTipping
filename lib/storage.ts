// Storage utilities for JSON-based report storage
import fs from 'fs/promises';
import path from 'path';
import type { Report, Embedding } from '@/types';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const IMAGES_DIR = path.join(process.cwd(), 'images');
const EMBEDDINGS_DIR = path.join(process.cwd(), 'embeddings');
const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function saveReport(report: Report): Promise<void> {
  await ensureDir(REPORTS_DIR);
  const filePath = path.join(REPORTS_DIR, `${report.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8');
}

export async function getReport(reportId: string): Promise<Report | null> {
  try {
    const filePath = path.join(REPORTS_DIR, `${reportId}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function getAllReports(): Promise<Report[]> {
  try {
    await ensureDir(REPORTS_DIR);
    const files = await fs.readdir(REPORTS_DIR);
    const reports: Report[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await fs.readFile(path.join(REPORTS_DIR, file), 'utf-8');
        reports.push(JSON.parse(data));
      }
    }

    return reports.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function saveImage(
  imageId: string,
  buffer: Buffer
): Promise<string> {
  await ensureDir(IMAGES_DIR);
  const filePath = path.join(IMAGES_DIR, `${imageId}.jpg`);
  await fs.writeFile(filePath, buffer);
  return `/images/${imageId}.jpg`;
}

export async function getImage(imageId: string): Promise<Buffer | null> {
  try {
    const filePath = path.join(IMAGES_DIR, `${imageId}.jpg`);
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

export async function saveEmbedding(
  reportId: string,
  embedding: Embedding
): Promise<void> {
  await ensureDir(EMBEDDINGS_DIR);
  const filePath = path.join(EMBEDDINGS_DIR, `${reportId}.json`);
  await fs.writeFile(filePath, JSON.stringify(embedding, null, 2), 'utf-8');
}

export async function getEmbedding(
  reportId: string
): Promise<Embedding | null> {
  try {
    const filePath = path.join(EMBEDDINGS_DIR, `${reportId}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function getAllEmbeddings(): Promise<Map<string, Embedding>> {
  const embeddings = new Map<string, Embedding>();

  try {
    await ensureDir(EMBEDDINGS_DIR);
    const files = await fs.readdir(EMBEDDINGS_DIR);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const reportId = file.replace('.json', '');
        const data = await fs.readFile(
          path.join(EMBEDDINGS_DIR, file),
          'utf-8'
        );
        embeddings.set(reportId, JSON.parse(data));
      }
    }
  } catch (error) {
    console.error('Failed to load embeddings:', error);
  }

  return embeddings;
}

export function generateReportId(): string {
  return `RPT-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
}
