'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ImageUpload from '@/components/ImageUpload';
import ValidationFeedback from '@/components/ValidationFeedback';
import SmartForm from '@/components/SmartForm';
import DuplicateWarning from '@/components/DuplicateWarning';
import OfflineIndicator from '@/components/OfflineIndicator';
import { useRouter } from 'next/navigation';
import type {
  ValidationResult,
  FieldExtractionResult,
  SimilarReport,
  Coordinates
} from '@/types';

// Dynamic import to avoid SSR issues with leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className='h-[300px] sm:h-[350px] rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500'>
      Loading map...
    </div>
  )
});

type Step =
  | 'upload'
  | 'validating'
  | 'location'
  | 'extracting'
  | 'duplicate-check'
  | 'form'
  | 'submitting';

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: 'upload', label: 'Photo' },
  { key: 'validating', label: 'Validate' },
  { key: 'location', label: 'Location' },
  { key: 'extracting', label: 'Analyse' },
  { key: 'form', label: 'Details' }
];

// Default fallback location — centre of LBBD (Thames Road, Barking)
const DEFAULT_LOCATION: Coordinates = { latitude: 51.5195, longitude: 0.0823 };

// Try to extract EXIF GPS from the original File object (preserves all metadata)
async function extractExifCoords(file: File): Promise<Coordinates | null> {
  try {
    const exifrModule = await import('exifr');
    // Handle both default and named exports from dynamic import
    const exifr = exifrModule.default || exifrModule;

    // First try the full parse with GPS tags enabled — more reliable than .gps()
    const buffer = await file.arrayBuffer();
    const parsed = await exifr.parse(buffer, {
      gps: true,
      tiff: true,
      exif: true,
      pick: [
        'GPSLatitude',
        'GPSLongitude',
        'GPSLatitudeRef',
        'GPSLongitudeRef',
        'latitude',
        'longitude'
      ]
    } as Parameters<typeof exifr.parse>[1]);

    if (parsed?.latitude && parsed?.longitude) {
      return { latitude: parsed.latitude, longitude: parsed.longitude };
    }

    // Fallback: try .gps() shorthand
    const gps = await exifr.gps(buffer);
    if (gps?.latitude && gps?.longitude) {
      return { latitude: gps.latitude, longitude: gps.longitude };
    }
  } catch (err) {
    console.warn('[EXIF] GPS extraction failed:', err);
  }
  return null;
}

// Browser geolocation
function getBrowserLocation(): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('upload');
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [extractedFields, setExtractedFields] =
    useState<FieldExtractionResult | null>(null);
  const [similarReports, setSimilarReports] = useState<SimilarReport[]>([]);
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationSource, setLocationSource] = useState<
    'exif' | 'browser' | 'manual'
  >('manual');
  const [locationDetails, setLocationDetails] = useState('');
  const [locationValid, setLocationValid] = useState<boolean | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // ── Step 1: Image selected ──────────────────────────────────────────
  const handleImageSelected = async (data: string, file: File) => {
    setImageData(data);
    setImageFile(file);
    setStep('validating');
    setProcessingError(null);

    try {
      // Validate image
      const validateRes = await fetch('/api/validate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: data })
      });
      const validation: ValidationResult = await validateRes.json();
      setValidationResult(validation);

      if (!validation.isValid || !validation.isSafe) {
        // Stay on validating step to show the failure feedback
        return;
      }

      // Brief pause so user sees the validation success
      await new Promise((r) => setTimeout(r, 1000));

      // Try to get location from EXIF — pass original File to preserve metadata
      const exifCoords = await extractExifCoords(file);
      if (exifCoords) {
        setLocation(exifCoords);
        setLocationSource('exif');
      } else {
        // Fall back to browser geolocation
        const browserCoords = await getBrowserLocation();
        if (browserCoords) {
          setLocation(browserCoords);
          setLocationSource('browser');
        } else {
          // Default to LBBD area so map always has a pin
          setLocation(DEFAULT_LOCATION);
          setLocationSource('manual');
        }
      }

      setStep('location');
    } catch (error) {
      console.error('Validation error:', error);
      setProcessingError('Image validation failed. Please try again.');
      setStep('upload');
    }
  };

  // ── Step 2: Location confirmed ──────────────────────────────────────
  const handleLocationConfirmed = async () => {
    if (!location) return;

    setStep('extracting');
    setProcessingError(null);

    try {
      // Validate location is within LBBD boundary
      const locRes = await fetch('/api/validate-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinates: location })
      });
      const locData = await locRes.json();
      setLocationValid(locData.withinBoundary);

      // Extract fields from image
      const extractRes = await fetch('/api/extract-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });
      const fields: FieldExtractionResult = await extractRes.json();
      setExtractedFields(fields);

      // Generate embedding + check duplicates
      setStep('duplicate-check');
      const embeddingRes = await fetch('/api/generate-embedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          extractedText: fields.description
        })
      });
      const embeddingData = await embeddingRes.json();
      setEmbedding(embeddingData.embedding);

      const duplicateRes = await fetch('/api/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embedding: embeddingData.embedding,
          coordinates: location,
          searchRadius: 100
        })
      });
      const duplicateCheck = await duplicateRes.json();

      if (
        duplicateCheck.hasDuplicates &&
        duplicateCheck.similarReports.length > 0
      ) {
        setSimilarReports(duplicateCheck.similarReports);
      } else {
        setStep('form');
      }
    } catch (error) {
      console.error('Processing error:', error);
      setProcessingError(
        'An error occurred while processing. Please try again.'
      );
      setStep('location');
    }
  };

  // ── Step 3: Form submitted ──────────────────────────────────────────
  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    setStep('submitting');

    try {
      const submitData = {
        ...formData,
        image: {
          id: Date.now().toString(),
          filename: imageFile?.name || 'image.jpg',
          path: '',
          size: imageFile?.size || 0,
          mimeType: imageFile?.type || 'image/jpeg',
          uploadedAt: new Date().toISOString()
        },
        imageData: imageData!.split('base64,')[1],
        aiMetadata: {
          modelUsed: 'GPT-4o',
          timestamp: new Date().toISOString(),
          validationPassed: true,
          safetyCheck: {
            isSafe: true,
            containsFlyTipping: true
          },
          extractedFields: {
            wasteType: formData.wasteType,
            wasteSize: formData.wasteSize,
            hazardous: formData.hazardous,
            description: formData.description,
            severityRating: formData.severityRating,
            summary: formData.aiSummary
          },
          confidence: extractedFields!.confidence
        },
        embedding: {
          vector: embedding!,
          modelUsed: 'text-embedding-3-large',
          generatedAt: new Date().toISOString()
        },
        location: {
          coordinates: location!,
          withinBoundary: locationValid ?? true,
          source: locationSource
        },
        locationDetails,
        possibleDuplicates: similarReports,
        isDuplicateOverridden:
          similarReports.length > 0 &&
          similarReports.every((r) => r.similarity < 0.85),
        submittedVia: 'web' as const
      };

      const response = await fetch('/api/submit-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/confirmation?reportId=${result.reportId}`);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setProcessingError('Failed to submit. Please try again.');
      setStep('form');
    }
  };

  // ── Map location picked ─────────────────────────────────────────────
  const handleMapLocationSelect = useCallback((coords: Coordinates) => {
    setLocation(coords);
    setLocationSource('manual');
  }, []);

  // ── Progress bar step index ─────────────────────────────────────────
  const stepIndex = (() => {
    const map: Record<Step, number> = {
      upload: 0,
      validating: 1,
      location: 2,
      extracting: 3,
      'duplicate-check': 3,
      form: 4,
      submitting: 4
    };
    return map[step] ?? 0;
  })();

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-8rem)]'>
      <OfflineIndicator />

      <div className='max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8'>
        {/* Header */}
        <div className='mb-4 sm:mb-6'>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-900'>
            Report Fly-Tipping
          </h1>
          <p className='text-sm text-gray-600 mt-1'>
            Upload a photo and our AI will help complete the report.
          </p>
        </div>

        {/* Progress Steps */}
        <nav className='mb-5 sm:mb-8' aria-label='Progress'>
          <div className='flex items-center justify-between'>
            {STEP_LABELS.map((s, idx) => {
              const isActive = idx <= stepIndex;
              const isCurrent = idx === stepIndex;
              return (
                <div key={s.key} className='flex items-center flex-1'>
                  <div className='flex flex-col items-center'>
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-colors
                        ${isActive ? 'bg-[#0b0c0c] text-white' : 'bg-gray-200 text-gray-500'}
                        ${isCurrent ? 'ring-2 ring-[#0b0c0c]/30 ring-offset-1 sm:ring-offset-2' : ''}`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] mt-1 ${isActive ? 'text-[#0b0c0c] font-medium' : 'text-gray-400'}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < STEP_LABELS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 sm:mx-2 mt-[-14px] ${isActive && idx < stepIndex ? 'bg-[#0b0c0c]' : 'bg-gray-200'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Error banner */}
        {processingError && (
          <div className='mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm'>
            {processingError}
          </div>
        )}

        {/* Content Card */}
        <div className='lbbd-card p-4 sm:p-6'>
          {/* ─── Upload ─────────────────────────────────────────── */}
          {step === 'upload' && (
            <ImageUpload onImageSelected={handleImageSelected} />
          )}

          {/* ─── Validating ─────────────────────────────────────── */}
          {step === 'validating' && !validationResult && (
            <div className='text-center py-8 sm:py-12'>
              <div className='spinner mx-auto mb-4' />
              <p className='font-semibold text-gray-900'>
                Validating your photo...
              </p>
              <p className='text-sm text-gray-500 mt-1'>
                AI is checking for fly-tipping content
              </p>
            </div>
          )}

          {step === 'validating' && validationResult && (
            <div className='space-y-6'>
              <ValidationFeedback result={validationResult} loading={false} />
              {!validationResult.isValid || !validationResult.isSafe ? (
                <button
                  onClick={() => {
                    setStep('upload');
                    setValidationResult(null);
                    setImageData(null);
                  }}
                  className='lbbd-btn-secondary w-full'
                >
                  Try a different photo
                </button>
              ) : null}
            </div>
          )}

          {/* ─── Location ───────────────────────────────────────── */}
          {step === 'location' && (
            <div className='space-y-5'>
              <div>
                <h2 className='text-lg font-semibold text-gray-900 mb-1'>
                  Where is the fly-tip?
                </h2>
                <p className='text-sm text-gray-600'>
                  {locationSource === 'exif'
                    ? 'Location detected from your photo. Adjust the pin if needed.'
                    : locationSource === 'browser'
                      ? 'Using your current location. Drag the pin to the exact spot.'
                      : 'Drag the pin or click the map to mark the fly-tip location.'}
                </p>
              </div>

              <MapComponent
                location={location}
                onLocationSelect={handleMapLocationSelect}
                interactive
                className='h-[280px] sm:h-[350px]'
              />

              {location && (
                <div className='text-xs text-gray-500'>
                  {location.latitude.toFixed(5)},{' '}
                  {location.longitude.toFixed(5)}
                  <span className='ml-2 inline-flex items-center gap-1 text-[#00703c]'>
                    <span className='w-1.5 h-1.5 bg-[#00703c] rounded-full' />
                    {locationSource === 'exif'
                      ? 'From photo EXIF'
                      : locationSource === 'browser'
                        ? 'Browser GPS'
                        : 'Placed manually'}
                  </span>
                </div>
              )}

              <div>
                <label htmlFor='locationDetails' className='lbbd-label'>
                  Location details (optional)
                </label>
                <input
                  id='locationDetails'
                  type='text'
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder='e.g. Behind the garages on River Road'
                  className='lbbd-input'
                />
              </div>

              <button
                onClick={handleLocationConfirmed}
                disabled={!location}
                className='lbbd-btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed'
              >
                Confirm Location &amp; Continue
              </button>
            </div>
          )}

          {/* ─── Extracting ─────────────────────────────────────── */}
          {step === 'extracting' && (
            <div className='text-center py-8 sm:py-12'>
              <div className='spinner mx-auto mb-4' />
              <p className='font-semibold text-gray-900'>
                Analysing your photo...
              </p>
              <p className='text-sm text-gray-500 mt-1'>
                AI is identifying waste type, size, and generating a description
              </p>
            </div>
          )}

          {/* ─── Duplicate Check ────────────────────────────────── */}
          {step === 'duplicate-check' && similarReports.length > 0 && (
            <DuplicateWarning
              similarReports={similarReports}
              onContinue={() => setStep('form')}
              onCancel={() => router.push('/')}
            />
          )}

          {step === 'duplicate-check' && similarReports.length === 0 && (
            <div className='text-center py-8 sm:py-12'>
              <div className='spinner mx-auto mb-4' />
              <p className='font-semibold text-gray-900'>
                Checking for existing reports nearby...
              </p>
            </div>
          )}

          {/* ─── Form ───────────────────────────────────────────── */}
          {step === 'form' && extractedFields && (
            <SmartForm
              extractedFields={extractedFields}
              onSubmit={handleFormSubmit}
              loading={false}
            />
          )}

          {/* ─── Submitting ─────────────────────────────────────── */}
          {step === 'submitting' && (
            <div className='text-center py-8 sm:py-12'>
              <div
                className='spinner mx-auto mb-4'
                style={{ borderTopColor: '#00703c' }}
              />
              <p className='font-semibold text-gray-900'>
                Submitting your report...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
