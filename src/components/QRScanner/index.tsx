'use client';

import { useRef, useState } from 'react';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import Icon from '../Icons';
import AnimatedContent from '../react-bits/AnimatedContent';
// import ButtonPrimary from '../ButtonPrimary';
import FaceCapture, { FaceCaptureHandle } from '../FaceCapture';

export default function QRScanner() {
  const eventId = window.location.pathname.split('/').pop() || '';
  const [errorText, setErrorText] = useState('');
  const [warningText, setWarningText] = useState('');
  const [scannedText, setScannedText] = useState('');
  const [paused, setPaused] = useState(false);
  const [scannedResult, setScannedResult] = useState<{
    [key: string]: string;
  }>();
  const [
    widget,
    // setWidget
  ] = useState<'scanner' | 'face_scanner'>('scanner');
  const faceCaptureRef = useRef<FaceCaptureHandle>(null);

  const handleScan = async (result: IDetectedBarcode[]) => {
    if (result.length === 0) {
      setWarningText('No QR code detected. Please try again.');
      setScannedText('');
      return;
    }

    const encrypted = result[0].rawValue;

    if (!encrypted) {
      setWarningText('No valid QR code found. Please try again.');
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

    const user = await res.json();
    setScannedResult(user.data);
    setScannedText('Scanned Successfully!');
    setErrorText('');
    setPaused(true);
  };

  const handleError = () => {
    setErrorText('Failed to scan QR code. Please try again.');
    setScannedText('');
  };

  const handleFaceScan = async (face_map: number[]) => {
    const res = await fetch('/api/users/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ face_map, eventId }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      setErrorText(`Error: ${errorData || 'Failed to scan face.'}`);
      setScannedText('');
      return;
    }

    const user = await res.json();

    if (!user.data) {
      setWarningText('User not found');
      setScannedText('');
      return;
    }

    setScannedResult(user.data);
    setScannedText('Scanned Successfully!');
    setErrorText('');
    setPaused(true);

    if (faceCaptureRef.current) {
      await faceCaptureRef.current.stop();
    }
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
            name={widget === 'scanner' ? 'ScanQrCode' : 'ScanFace'}
            className="h-8 w-8 text-gray-50 sm:h-10 sm:w-10"
          />
          <h1 className="text-2xl font-bold">
            {widget === 'scanner' ? 'QR Code Scanner' : 'Face Scanner'}
          </h1>
        </div>
        {!paused ? (
          widget === 'scanner' ? (
            <Scanner
              key={Date.now()}
              paused={paused}
              constraints={{ facingMode: 'user' }}
              onScan={handleScan}
              onError={(error) => {
                console.error('Error: ', error);
                handleError();
              }}
              allowMultiple={false}
              styles={{ video: { transform: 'scaleX(-1)' } }}
            />
          ) : (
            <FaceCapture
              key={Date.now()}
              ref={faceCaptureRef}
              onCaptured={(face_map) => handleFaceScan(face_map)}
            />
          )
        ) : null}
        {!scannedResult ? (
          <>
            <p className="mt-4 text-center text-sm text-gray-400">
              {widget === 'scanner'
                ? 'Point your camera at a QR code to scan it.'
                : ''}
            </p>
            {/* <div className="my-4 flex items-center">
              <hr className="flex-grow border-gray-600" />
              <span className="mx-3 text-sm text-gray-400">or</span>
              <hr className="flex-grow border-gray-600" />
            </div>
            <ButtonPrimary
              onClick={async () => {
                if (faceCaptureRef.current) {
                  await faceCaptureRef.current?.stop();
                }

                setWidget(widget === 'scanner' ? 'face_scanner' : 'scanner');
                setPaused(false);
                setScannedResult(undefined);
                setScannedText('');
              }}
              className="relative w-full"
            >
              {widget === 'scanner' && (
                <div
                  className="absolute -top-2 -right-2 flex animate-bounce items-center justify-center rounded-full px-2 py-[1px] text-xs font-semibold text-gray-50 shadow"
                  style={{
                    background:
                      'linear-gradient(90deg, #4ade80 0%, #22c55e 5%, #16a34a 100%)',
                  }}
                >
                  Must try! ✨
                </div>
              )}
              <Icon
                name={widget === 'scanner' ? 'ScanFace' : 'ScanQrCode'}
                className="h-5 w-5"
              />
              {widget === 'scanner'
                ? 'Switch to Facial Recognition?'
                : 'Switch to QR Scanner?'}
            </ButtonPrimary> */}
          </>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-yellow-900/90 backdrop-blur-sm"
        >
          <div className="mt-4 rounded bg-yellow-800 p-4 text-yellow-200">
            <p>⚠️ Something Went Wrong:</p>
            <pre className="break-all whitespace-pre-wrap">{errorText}</pre>
          </div>
        </div>
      )}
      {warningText && (
        <div
          onClick={() => setWarningText('')}
          className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/90 backdrop-blur-sm"
        >
          <div className="mt-4 rounded bg-blue-800 p-4 text-blue-200">
            <p>ℹ️ Please check the following:</p>
            <pre className="break-all whitespace-pre-wrap">{warningText}</pre>
          </div>
        </div>
      )}
    </>
  );
}
