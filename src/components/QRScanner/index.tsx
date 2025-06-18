'use client';

import { useState } from 'react';
import {
  IDetectedBarcode,
  IScannerClassNames,
  Scanner,
} from '@yudiel/react-qr-scanner';
import Icon from '../Icons';
import AnimatedContent from '../react-bits/AnimatedContent';

export default function QRScanner() {
  const [errorText, setErrorText] = useState('');
  const [scannedText, setScannedText] = useState('');

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
      body: JSON.stringify({ encrypted }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      setErrorText(`Error: ${errorData.message || 'Failed to scan QR code.'}`);
      setScannedText('');
      return;
    }

    setScannedText('Scanned Successfully!');
    setErrorText('');
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
          <h1 className="mb-4 text-2xl font-bold">QR Code Generator</h1>
        </div>
        <Scanner
          classNames={{ container: 'h-[200px]' } as IScannerClassNames}
          onScan={handleScan}
          onError={handleError}
          allowMultiple
          scanDelay={1000}
        />
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
