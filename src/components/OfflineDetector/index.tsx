'use client';

import { useEffect, useState } from 'react';

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="z-50 w-full bg-red-900 py-2 text-center text-white">
      ⚠️ You need to connect to the internet before using the app.
    </div>
  );
}
