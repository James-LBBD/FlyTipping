'use client';

import type { ValidationResult } from '@/types';

interface ValidationFeedbackProps {
  result: ValidationResult;
  loading?: boolean;
}

export default function ValidationFeedback({
  result,
  loading
}: ValidationFeedbackProps) {
  if (loading) {
    return (
      <div className='bg-gray-100 border border-gray-300 rounded-lg p-6 text-center'>
        <div className='spinner mx-auto mb-4' />
        <p className='text-gray-900 font-semibold text-sm'>
          Validating image with AI...
        </p>
      </div>
    );
  }

  if (!result.isValid || !result.isSafe) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-5'>
        <div className='flex items-start gap-3'>
          <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
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
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </div>
          <div className='flex-1'>
            <h3 className='font-semibold text-red-900 mb-1 text-sm'>
              Image Not Accepted
            </h3>
            <p className='text-sm text-red-800 mb-2'>{result.reason}</p>

            {!result.isSafe && (
              <p className='text-xs text-red-700'>
                This image contains inappropriate content.
              </p>
            )}

            {result.isSafe && !result.containsFlyTipping && (
              <p className='text-xs text-red-700'>
                This image does not appear to show fly-tipping.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-green-50 border border-green-200 rounded-lg p-5'>
      <div className='flex items-start gap-3'>
        <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
          <svg
            className='w-4 h-4 text-green-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2.5}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
        <div className='flex-1'>
          <h3 className='font-semibold text-green-900 mb-1 text-sm'>
            Photo Validated
          </h3>
          <p className='text-sm text-green-800 mb-2'>{result.reason}</p>
          <div className='flex items-center gap-2 text-xs'>
            <span className='text-green-700'>Confidence:</span>
            <div className='flex-1 bg-green-200 rounded-full h-1.5'>
              <div
                className='bg-green-600 h-1.5 rounded-full transition-all'
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
            <span className='text-green-700 font-semibold'>
              {Math.round(result.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
