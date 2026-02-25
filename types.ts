// Core data types for the fly-tipping reporting system
// Aligned with LBBD eforms.lbbd.gov.uk/report-fly-tipping

export type WasteType =
  | 'furniture_general'
  | 'business_construction'
  | 'hazardous'
  | 'household'
  | 'garden'
  | 'electrical'
  | 'tyres'
  | 'other';

export type WasteSize =
  | 'single_black_bag'
  | 'other_single_item'
  | 'car_boot_load'
  | 'small_van_load'
  | 'transit_van_load'
  | 'tipper_lorry_load'
  | 'significant_multiple_loads';

export type LandOwnership = 'public' | 'private' | 'council_estate' | 'unknown';

export type KnowsWhoTipped = 'yes' | 'no';

export type ReportStatus =
  | 'draft'
  | 'submitted'
  | 'validated'
  | 'duplicate'
  | 'rejected';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  coordinates: Coordinates;
  address?: string;
  withinBoundary: boolean;
  source: 'exif' | 'browser' | 'manual';
}

export interface Confidence {
  wasteType: number; // 0-1
  wasteSize: number; // 0-1
  hazardous: number; // 0-1
  description: number; // 0-1
  overall: number; // 0-1
}

export interface AIMetadata {
  modelUsed: string;
  timestamp: string;
  validationPassed: boolean;
  safetyCheck: {
    isSafe: boolean;
    containsFlyTipping: boolean;
    reason?: string;
  };
  extractedFields: {
    wasteType: WasteType;
    wasteSize: WasteSize;
    hazardous: boolean;
    description: string;
    severityRating?: number; // 1-10
    summary?: string;
  };
  confidence: Confidence;
}

export interface ImageData {
  id: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  exifData?: {
    coordinates?: Coordinates;
    dateTime?: string;
    deviceInfo?: string;
  };
}

export interface Embedding {
  vector: number[];
  modelUsed: string;
  generatedAt: string;
}

export interface SimilarReport {
  reportId: string;
  similarity: number; // 0-1
  distance: number; // meters
  timestamp: string;
  imageUrl: string;
}

export interface Report {
  id: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;

  // Image and AI analysis
  image: ImageData;
  aiMetadata: AIMetadata;
  embedding: Embedding;

  // Location
  location: Location;
  locationDetails?: string;

  // Form data (AI-prefilled, user-editable)
  wasteType: WasteType;
  wasteSize: WasteSize;
  hazardous: boolean;
  description: string;
  aiSummary?: string;
  severityRating?: number;

  // LBBD-specific fields
  landOwnership: LandOwnership;
  knowsWhoTipped: KnowsWhoTipped;
  tipperDetails?: string;

  // Contact info
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Duplicate detection
  possibleDuplicates: SimilarReport[];
  isDuplicateOverridden?: boolean;

  // Metadata
  submittedVia: 'web' | 'pwa-online' | 'pwa-offline';
  userAgent?: string;
}

export interface ValidationResult {
  isValid: boolean;
  isSafe: boolean;
  containsFlyTipping: boolean;
  confidence: number;
  reason?: string;
  suggestedAction?: 'accept' | 'reject' | 'manual-review';
}

export interface FieldExtractionResult {
  wasteType: WasteType;
  wasteSize: WasteSize;
  hazardous: boolean;
  description: string;
  severityRating: number;
  summary: string;
  confidence: Confidence;
}

export interface DuplicateCheckRequest {
  reportId: string;
  embedding: number[];
  coordinates: Coordinates;
  searchRadius: number; // meters
}

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  similarReports: SimilarReport[];
  highestSimilarity: number;
}
