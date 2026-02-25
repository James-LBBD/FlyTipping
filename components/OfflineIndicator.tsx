'use client';

import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className='fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 text-center text-xs z-50 shadow-sm'>
      <span className='font-semibold'>Offline</span>
      {' — '}
      <span>Your report will be submitted when connection is restored</span>
    </div>
  );
}
