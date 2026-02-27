'use client';

export default function OfflinePage() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8'>
      <div className='max-w-md text-center'>
        <div className='text-5xl sm:text-6xl mb-3 sm:mb-4'>📡</div>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4'>
          You&apos;re Offline
        </h1>
        <p className='text-gray-600 mb-4 sm:mb-6'>
          No internet connection detected. Some features may be limited.
        </p>
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900'>
          <p className='mb-2'>Don&apos;t worry! You can still:</p>
          <ul className='text-left space-y-1'>
            <li>• View cached content</li>
            <li>• Draft new reports</li>
            <li>• Take photos</li>
          </ul>
          <p className='mt-3'>
            Your report will be automatically submitted when you&apos;re back
            online.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className='mt-5 sm:mt-6 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 
                     text-white font-semibold rounded-lg transition-colors min-h-[48px] w-full sm:w-auto'
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
