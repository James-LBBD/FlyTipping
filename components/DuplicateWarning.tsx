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

export default function DuplicateWarning({
  similarReports,
  onContinue,
  onCancel
}: DuplicateWarningProps) {
  const [confirmed, setConfirmed] = useState(false);
  const highestSimilarity = similarReports[0]?.similarity || 0;
  const isBlocked = highestSimilarity >= HIGH_SIMILARITY_THRESHOLD;

  return (
    <div
      className={`border rounded-lg p-5 ${isBlocked ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}
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
            {isBlocked
              ? 'Duplicate Report Blocked'
              : 'Possible Duplicate Detected'}
          </h3>
          <p
            className={`text-sm ${isBlocked ? 'text-red-800' : 'text-amber-800'}`}
          >
            {isBlocked
              ? `This appears to be the same incident as an existing report (${Math.round(highestSimilarity * 100)}% match). Submission is not permitted.`
              : `We found ${similarReports.length} similar report${similarReports.length > 1 ? 's' : ''} nearby (${Math.round(highestSimilarity * 100)}% match).`}
          </p>
        </div>
      </div>

      {/* Show top 3 similar reports */}
      <div className='space-y-3 mb-6'>
        {similarReports.slice(0, 3).map((report) => (
          <div
            key={report.reportId}
            className={`bg-white rounded-lg p-4 border ${isBlocked ? 'border-red-200' : 'border-orange-200'}`}
          >
            <div className='flex items-center gap-4'>
              <div className='relative w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-gray-100'>
                <Image
                  src={report.imageUrl}
                  alt='Similar report'
                  fill
                  className='object-cover'
                  sizes='80px'
                />
              </div>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='font-semibold text-gray-900'>
                    {Math.round(report.similarity * 100)}% similar
                  </span>
                  <span className='text-sm text-gray-600'>
                    • {Math.round(report.distance)}m away
                  </span>
                </div>
                <p className='text-sm text-gray-600'>
                  Reported {new Date(report.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isBlocked ? (
        <>
          <div className='bg-red-100/60 border border-red-200 rounded-lg p-3 mb-4'>
            <p className='text-xs text-red-900'>
              This report has been blocked because it matches an existing report
              with high confidence. If you believe this is a mistake, please
              contact the council directly.
            </p>
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

          <div className='flex items-center gap-3 mb-4'>
            <input
              type='checkbox'
              id='confirm-not-duplicate'
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className='w-4 h-4'
            />
            <label
              htmlFor='confirm-not-duplicate'
              className='text-sm text-gray-700'
            >
              I confirm this is a different incident and not a duplicate
            </label>
          </div>

          <div className='flex gap-3'>
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
