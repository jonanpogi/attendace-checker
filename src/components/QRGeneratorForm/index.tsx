'use client';

import { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import Icon from '../Icons';
import AnimatedContent from '../react-bits/AnimatedContent';
import LoadingSpinner from '../LoadingSpinner';
import TiltedCard from '../react-bits/TiltedCard';
import ButtonPrimary from '../ButtonPrimary';
// import Stepper from '../Stepper';
// import {
// FaceCapture,
// FaceCaptureHandle,
// } from '../FaceCapture';
import { triggerToast } from '../ToastContainer';
import Dialog from '../Dialog';
import useMediaQuery from '@/hooks/useMediaQuery';
import * as htmlToImage from 'html-to-image';

type FormData = {
  rank: string;
  full_name: string;
  afpsn: string;
  bos: string;
  [key: string]: string | undefined;
};

const fields = [
  { name: 'rank', label: 'Rank', placeHolder: 'e.g. PO3' },
  { name: 'full_name', label: 'Full Name', placeHolder: 'e.g. Juan Dela Cruz' },
  { name: 'afpsn', label: 'AFPSN', placeHolder: 'e.g. BE-***-******' },
  { name: 'bos', label: 'BOS', placeHolder: 'e.g. PN Res' },
];

const initialFormData: FormData = {
  rank: '',
  full_name: '',
  afpsn: '',
  bos: '',
};

const QRGeneratorForm = () => {
  const [
    step,
    // setStep
  ] = useState(1);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [logoDataUri, setLogoDataUri] = useState<string | null>(null);
  // const [faceMap, setFaceMap] = useState<number[] | null>(null);
  // const faceCaptureRef = useRef<FaceCaptureHandle>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [blockUI, setBlockUI] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const qrCanvasContainerRef = useRef<HTMLDivElement | null>(null);
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  const swapCanvasWithImg = (root: HTMLElement) => {
    const canvas = root.querySelector('#qr-canvas') as HTMLCanvasElement | null;

    if (!canvas) return () => {};

    // snapshot the canvas into an <img>
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png'); // will fail only if canvas is tainted
    // keep same size/position
    img.style.width = getComputedStyle(canvas).width;
    img.style.height = getComputedStyle(canvas).height;

    canvas.style.display = 'none';
    canvas.parentElement!.insertBefore(img, canvas);

    // return a restore function
    return () => {
      img.remove();
      canvas.style.display = '';
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateQR = async (id: string) => {
    try {
      setLoading(true);

      const res = await fetch('/api/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        triggerToast('error', 'Failed to generate QR code');
        return;
      }

      const { encrypted } = await res.json();
      setQrValue(encrypted);

      return encrypted;
    } catch (error) {
      console.error('Error generating QR code:', error);
      triggerToast('error', 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = async () => {
    const node = qrCanvasContainerRef.current;
    if (!node) return;

    // 1) ensure fonts ready
    await document.fonts?.ready?.catch(() => {});

    // 2) iOS: swap canvas → img for the snapshot
    const restore = isIOS ? swapCanvasWithImg(node) : () => {};
    await new Promise((r) => requestAnimationFrame(r)); // let DOM update

    try {
      const blob = await htmlToImage.toBlob(node, {
        pixelRatio: isIOS ? 2 : 3, // iOS memory-friendlier
        backgroundColor: '#ffffff',
        cacheBust: true,
        filter: (n) =>
          !(n instanceof Element && n.classList?.contains('no-export')),
      });
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(formData.full_name || 'qr-card').replace(/\s+/g, '_')}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      restore();
      // if (faceCaptureRef.current) faceCaptureRef.current.stop();
      setQrValue(null);
      setFormData(initialFormData);
      // setFaceMap(null);
      // setStep(1);
    }
  };

  const handleSubmitAll = async () => {
    // if (!faceMap) return;

    try {
      setLoading(true);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // face_map: faceMap
        }),
      });

      if (!res.ok) {
        triggerToast('error', 'Failed to save user');
        return;
      }

      const user = await res.json();

      await handleGenerateQR(user.data.id);
      // if (user.data.qr_val) {
      //   setOpenDialog(true);
      //   setBlockUI(true);
      //   setQrValue(user.data.qr_val);
      // } else {
      //   // Generate QR after saving basic info
      //   const qrValue = await handleGenerateQR(user.data.id);

      //   // Update user with QR code in background
      //   fetch('/api/users', {
      //     method: 'PATCH',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ id: user.data.id, qr_val: qrValue }),
      //   }).catch((error) => {
      //     console.error('Error updating user QR code:', error);
      //     triggerToast('error', 'Failed to update user QR code');
      //   });
      // }
    } catch (e) {
      console.error(e);
      triggerToast('error', 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const showQR = (qrValue: string | string[]) => {
    return (
      <div
        ref={qrCanvasContainerRef}
        className="flex flex-col items-center rounded-lg bg-white p-6 shadow-xl"
      >
        <div
          className="rounded-md p-4"
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
          }}
        >
          {/* fixed-size box to layer canvas + logo */}
          <div
            className="relative inline-block"
            style={{ width: 256, height: 256 }}
          >
            <QRCode
              value={qrValue}
              size={256}
              bgColor="#ffffff"
              fgColor="#000000"
              marginSize={2}
              id="qr-canvas"
            />
            {logoDataUri && (
              <>
                {/* white disk to preserve scan contrast (like excavate) */}
                <div
                  className="pointer-events-none absolute"
                  style={{
                    top: '50%',
                    left: '50%',
                    width: 42,
                    height: 42,
                    transform: 'translate(-50%,-50%)',
                    background: '#fff',
                    borderRadius: '50%',
                  }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoDataUri}
                  alt="logo"
                  crossOrigin="anonymous"
                  className="pointer-events-none absolute"
                  style={{
                    top: '50%',
                    left: '50%',
                    width: 32,
                    height: 32,
                    transform: 'translate(-50%,-50%)',
                  }}
                />
              </>
            )}
          </div>
        </div>

        <p className="text-center text-lg font-bold text-gray-800">{`${formData.rank} ${formData.full_name}`}</p>
        <p className="text-sm text-gray-600">{formData.afpsn}</p>
      </div>
    );
  };

  useEffect(() => {
    const isValid = Object.values(formData).every(
      (value) => value?.trim() !== '',
    );
    setValidated(!isValid);
  }, [formData, qrValue]);

  useEffect(() => {
    const fetchLogo = async () => {
      const response = await fetch('/122nd_logo.svg');
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoDataUri(reader.result as string);
      };
      reader.readAsDataURL(blob);
    };

    fetchLogo();
  }, []);

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
        className="hide-scrollbar mx-auto max-w-xl overflow-y-auto p-6 text-gray-50"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <Icon
            name="QrCode"
            className="h-8 w-8 text-gray-50 sm:h-10 sm:w-10"
          />
          <h1 className="text-2xl font-bold">QR Code Generator</h1>
        </div>

        {/* Stepper Header */}
        {/* <div className="w-full">
          <Stepper
            step={step}
            steps={[
              { label: 'User Info', value: 1 },
              { label: 'Face Capture', value: 2 },
            ]}
          />
        </div> */}

        {/* STEP 1: USER INFO */}
        {step === 1 && (
          <>
            <p className="mb-8 text-center text-sm text-gray-400 italic">
              {/* Step 1 of 2 —  */}
              Fill in user details. All fields are required.
            </p>

            {fields.map((field, index) => (
              <div className="mb-3" key={index}>
                <label className="mb-1 block text-sm capitalize">
                  {field.label}
                </label>
                <input
                  placeholder={field.placeHolder}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 p-2"
                />
              </div>
            ))}

            <div className="mb-10" />
            <ButtonPrimary
              disabled={validated || loading}
              // onClick={() => setStep(2)}
              onClick={handleSubmitAll}
              className="mb-4 inline-flex w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {/* Next: Capture Face <Icon name="Camera" className="h-5 w-5" />
               */}
              {loading ? <LoadingSpinner color="text-gray-50" /> : 'Submit'}
            </ButtonPrimary>
          </>
        )}

        {/* STEP 2: FACE CAPTURE */}
        {step === 2 && (
          <>
            {/* <FaceCapture
              ref={faceCaptureRef}
              onCaptured={(arr) => setFaceMap(arr)}
            /> */}

            {/* <div className="flex gap-6">
              <ButtonPrimary
                disabled={loading}
                onClick={() => setStep(1)}
                className="w-[32px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </ButtonPrimary>
              <ButtonPrimary
                disabled={!faceMap || loading}
                onClick={handleSubmitAll}
                className="inline-flex w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <LoadingSpinner color="text-gray-50" /> : 'Submit'}
              </ButtonPrimary>
            </div> */}
          </>
        )}
      </AnimatedContent>

      {qrValue && !blockUI && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          {!isMobile ? (
            <TiltedCard
              showMobileWarning={false}
              showTooltip={false}
              rotateAmplitude={20}
              scaleOnHover={1.5}
              imageComponent={showQR(qrValue)}
            />
          ) : (
            showQR(qrValue)
          )}

          <ButtonPrimary
            onClick={handleDownloadQR}
            className="absolute bottom-10 mx-4 mt-4 w-full max-w-xs"
          >
            <Icon name="QrCode" className="mr-2 inline-block h-5 w-5" />
            Download QR Code and exit!
          </ButtonPrimary>
        </div>
      )}

      <Dialog
        isOpen={openDialog}
        onClose={() => setOpenDialog(false)}
        title="You already have a QR code"
        description="Please take a screenshot of your QR code."
        confirmText="Got it!"
        onConfirm={() => {
          setBlockUI(false);
          setOpenDialog(false);
        }}
      />
    </>
  );
};

export default QRGeneratorForm;
