'use client';

import { useState } from 'react';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import Icon from '../Icons';
import AnimatedContent from '../react-bits/AnimatedContent';

export default function QRScanner() {
  const eventId = window.location.pathname.split('/').pop() || '';
  const [errorText, setErrorText] = useState('');
  const [scannedText, setScannedText] = useState('');
  const [paused, setPaused] = useState(false);
  const [scannedResult, setScannedResult] = useState<{
    [key: string]: string;
  }>();

  const handleScan = async (result: IDetectedBarcode[]) => {
    if (result.length === 0) {
      setErrorText('No QR code detected. Please try again.');
      setScannedText('');
      return;
    }

    const encrypted = result[0].rawValue;

    if (!encrypted) {
      setErrorText('No valid QR code found. Please try again.');
      setScannedText('');
      return;
    }

    const res = await fetch('/api/decrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ encrypted, eventId }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      setErrorText(`Error: ${errorData || 'Failed to scan QR code.'}`);
      setScannedText('');
      return;
    }

    const data = await res.json();
    setScannedResult(data.data.context);
    setScannedText('Scanned Successfully!');
    setErrorText('');
    setPaused(true);
  };

  const handleError = () => {
    setErrorText('Failed to scan QR code. Please try again.');
    setScannedText('');
  };

  return (
    <>
      <AnimatedContent
        distance={150}
        direction="vertical"
        reverse={false}
        duration={1.2}
        ease="power3.out"
        initialOpacity={0}
        animateOpacity
        scale={1.1}
        threshold={0.2}
        delay={0.3}
        className="p-6 text-gray-50"
      >
        <div className="mb-8 flex items-center justify-center gap-2">
          <Icon
            name={'ScanQrCode'}
            className="h-8 w-8 text-gray-50 sm:h-10 sm:w-10"
          />
          <h1 className="text-2xl font-bold">QR Code Scanner</h1>
        </div>
        {!paused && (
          <Scanner
            key={Date.now()}
            onScan={handleScan}
            onError={handleError}
            allowMultiple={false}
          />
        )}
        {!scannedResult ? (
          <p className="mt-4 text-center text-sm text-gray-400">
            Point your camera at a QR code to scan it.
          </p>
        ) : (
          <div className="mt-6 flex w-full max-w-md flex-col items-center justify-center rounded-lg bg-green-800 bg-gradient-to-br from-green-900 via-green-700 to-green-800 p-6 text-green-100 shadow-lg">
            <p className="mb-3 text-2xl font-semibold tracking-wide drop-shadow-sm">
              ✅ Scanned Result:
            </p>
            <span className="mb-1 text-xl font-bold text-white drop-shadow-md">
              {scannedResult?.full_name}
            </span>
            <span className="mb-4 text-sm font-medium tracking-wide text-green-200">
              {scannedResult?.afpsn}
            </span>
            <button
              onClick={() => {
                setScannedResult(undefined);
                setPaused(false);
                setScannedText('');
              }}
              className="w-full animate-bounce rounded-full bg-green-600 py-3 text-center text-sm font-semibold text-white shadow-md transition-colors duration-300 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
            >
              ↺ Continue Scanning?
            </button>
          </div>
        )}
      </AnimatedContent>
      {scannedText && (
        <div
          onClick={() => setScannedText('')}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <div className="mt-4 rounded bg-green-900 p-4 text-green-200">
            <p>✅ Scanned:</p>
            <pre className="break-all whitespace-pre-wrap">{scannedText}</pre>
          </div>
        </div>
      )}
      {errorText && (
        <div
          onClick={() => setErrorText('')}
          className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/90 backdrop-blur-sm"
        >
          <div className="mt-4 rounded bg-red-800 p-4 text-red-200">
            <p>❌ Error:</p>
            <pre className="break-all whitespace-pre-wrap">{errorText}</pre>
          </div>
        </div>
      )}
    </>
  );
}
