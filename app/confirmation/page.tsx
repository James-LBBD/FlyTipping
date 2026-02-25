'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get('reportId');

  return (
    <div className='bg-gray-50 min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12'>
      <div className='max-w-lg w-full'>
        {/* Success card */}
        <div className='lbbd-card text-center'>
          <div className='w-16 h-16 bg-[#4C9F38] rounded-full flex items-center justify-center mx-auto mb-5'>
            <svg
              className='w-8 h-8 text-white'
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

          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Report Submitted
          </h1>
          <p className='text-gray-600 text-sm mb-6'>
            Thank you for helping keep Barking and Dagenham clean. Your report
            has been received and will be reviewed by the council team.
          </p>

          {reportId && (
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6'>
              <div className='text-xs text-gray-500 mb-1'>Reference Number</div>
              <div className='font-mono text-lg font-bold text-[#00473E]'>
                {reportId}
              </div>
              <p className='text-xs text-gray-500 mt-2'>
                Please keep this reference if you need to follow up.
              </p>
            </div>
          )}

          <div className='space-y-3'>
            <Link
              href='/report'
              className='lbbd-btn-primary w-full block text-center'
            >
              Submit Another Report
            </Link>
            <Link
              href='/'
              className='lbbd-btn-secondary w-full block text-center'
            >
              Return Home
            </Link>
          </div>
        </div>

        {/* What happens next */}
        <div className='mt-6 bg-white border border-gray-200 rounded-lg p-5'>
          <h2 className='text-sm font-semibold text-gray-900 mb-3'>
            What happens next?
          </h2>
          <ol className='text-sm text-gray-600 space-y-2 list-decimal list-inside'>
            <li>Your report is logged in the council system.</li>
            <li>A team will be assigned to investigate the fly-tip.</li>
            <li>Waste will be cleared from the location.</li>
            <li>If you provided contact details, you may receive updates.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className='bg-gray-50 min-h-[calc(100vh-12rem)] flex items-center justify-center'>
          <div className='spinner' />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
