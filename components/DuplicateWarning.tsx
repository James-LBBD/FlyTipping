'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { SimilarReport } from '@/types';

interface DuplicateWarningProps {
  similarReports: SimilarReport[];
  onContinue: () => void;
  onCancel: () => void;
}

const HIGH_SIMILARITY_THRESHOLD = 0.85;

function getBlockReason(report: SimilarReport): string {
  switch (report.matchType) {
    case 'image_hash':
      return 'This is the exact same photo as an existing report. The same image cannot be reported twice, even at a different location.';
    case 'content':
      return `This appears to be the same incident — the AI analysis is ${Math.round(report.similarity * 100)}% identical to an existing report. If you took a different photo of a genuinely new incident, please try again with that image.`;
    default:
      return `This appears to be the same incident as an existing report (${Math.round(report.similarity * 100)}% match). Submission is not permitted.`;
  }
}

function getWarnMessage(reports: SimilarReport[]): string {
  const highest = reports[0];
  if (highest?.matchType === 'image_hash') {
    return 'This photo has already been used in a report.';
  }
  if (highest?.matchType === 'content') {
    return `The AI analysis closely matches ${reports.length} existing report${reports.length > 1 ? 's' : ''} — this may be the same incident photographed again.`;
  }
  return `We found ${reports.length} similar report${reports.length > 1 ? 's' : ''} nearby (${Math.round(highest.similarity * 100)}% match).`;
}

function getMatchBadge(report: SimilarReport): {
  label: string;
  color: string;
} {
  switch (report.matchType) {
    case 'image_hash':
      return { label: 'Same image', color: 'bg-red-100 text-red-800' };
    case 'content':
      return { label: 'Same analysis', color: 'bg-orange-100 text-orange-800' };
    default:
      return {
        label: `${Math.round(report.distance)}m away`,
        color: 'bg-gray-100 text-gray-700'
      };
  }
}

function getWarningTitle(
  hasImageHashMatch: boolean,
  hasContentMatch: boolean,
  isBlocked: boolean
): string {
  if (hasImageHashMatch) {
    return 'Same Image Already Reported';
  }
  if (hasContentMatch) {
    return 'Likely Duplicate Report';
  }
  if (isBlocked) {
    return 'Duplicate Report Blocked';
  }
  return 'Possible Duplicate Detected';
}

export default function DuplicateWarning({
  similarReports,
  onContinue,
  onCancel
}: Readonly<DuplicateWarningProps>) {
  const [confirmed, setConfirmed] = useState(false);
  const highestSimilarity = similarReports[0]?.similarity || 0;
  const hasImageHashMatch = similarReports.some(
    (r) => r.matchType === 'image_hash'
  );
  const hasContentMatch = similarReports.some((r) => r.matchType === 'content');
  const isBlocked =
    hasImageHashMatch ||
    hasContentMatch ||
    highestSimilarity >= HIGH_SIMILARITY_THRESHOLD;

  const getBlockMessage = (): string => {
    if (hasImageHashMatch) {
      return 'This report has been blocked because the same photo was already submitted. If this is a different incident, please take a new photo.';
    }
    if (hasContentMatch) {
      return 'This report has been blocked because the AI analysis is nearly identical to an existing report. If this is genuinely a new incident, try uploading a different photo.';
    }
    return 'This report has been blocked because it matches an existing report with high confidence. If you believe this is a mistake, please contact the council directly.';
  };

  const blockMessage = getBlockMessage();

  return (
    <div
      className={`border rounded-lg p-4 sm:p-5 ${isBlocked ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}
    >
      <div className='flex items-start gap-3 mb-4'>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isBlocked ? 'bg-red-100' : 'bg-amber-100'}`}
        >
          {isBlocked ? (
            <svg
              className='w-4 h-4 text-red-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728'
              />
            </svg>
          ) : (
            <svg
              className='w-4 h-4 text-amber-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          )}
        </div>
        <div className='flex-1'>
          <h3
            className={`font-semibold mb-1 text-sm ${isBlocked ? 'text-red-900' : 'text-amber-900'}`}
          >
            {getWarningTitle(hasImageHashMatch, hasContentMatch, isBlocked)}
          </h3>
          <p
            className={`text-sm ${isBlocked ? 'text-red-800' : 'text-amber-800'}`}
          >
            {isBlocked
              ? getBlockReason(similarReports[0])
              : getWarnMessage(similarReports)}
          </p>
        </div>
      </div>

      {/* Show top 3 similar reports */}
      <div className='space-y-2 sm:space-y-3 mb-4 sm:mb-6'>
        {similarReports.slice(0, 3).map((report) => (
          <div
            key={report.reportId}
            className={`bg-white rounded-lg p-3 sm:p-4 border ${isBlocked ? 'border-red-200' : 'border-orange-200'}`}
          >
            <div className='flex items-center gap-3 sm:gap-4'>
              <div className='relative w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden flex-shrink-0 bg-gray-100'>
                <Image
                  src={report.imageUrl}
                  alt='Similar report'
                  fill
                  className='object-cover'
                  sizes='80px'
                />
              </div>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-1 flex-wrap'>
                  <span className='font-semibold text-gray-900'>
                    {report.matchType === 'image_hash'
                      ? '100% match'
                      : `${Math.round(report.similarity * 100)}% similar`}
                  </span>
                  {(() => {
                    const badge = getMatchBadge(report);
                    return (
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
                <p className='text-sm text-gray-600'>
                  Reported{' '}
                  {new Date(report.timestamp).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isBlocked ? (
        <>
          <div className='bg-red-100/60 border border-red-200 rounded-lg p-3 mb-4'>
            <p className='text-xs text-red-900'>{blockMessage}</p>
          </div>
          <button onClick={onCancel} className='lbbd-btn-primary w-full'>
            Go Back to Home
          </button>
        </>
      ) : (
        <>
          <div className='bg-amber-100/60 border border-amber-200 rounded-lg p-3 mb-4'>
            <p className='text-xs text-amber-900'>
              If this is the same incident, submitting a duplicate wastes
              council resources. Only continue if you&apos;re certain this is a
              different incident.
            </p>
          </div>

          <div className='flex items-center gap-3 mb-3 sm:mb-4'>
            <input
              type='checkbox'
              id='confirm-not-duplicate'
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className='w-5 h-5 shrink-0'
            />
            <label
              htmlFor='confirm-not-duplicate'
              className='text-sm text-gray-700'
            >
              I confirm this is a different incident and not a duplicate
            </label>
          </div>

          <div className='flex flex-col-reverse sm:flex-row gap-2 sm:gap-3'>
            <button onClick={onCancel} className='lbbd-btn-secondary flex-1'>
              Cancel Report
            </button>
            <button
              onClick={onContinue}
              disabled={!confirmed}
              className='lbbd-btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed'
            >
              Continue Anyway
            </button>
          </div>
        </>
      )}
    </div>
  );
}
