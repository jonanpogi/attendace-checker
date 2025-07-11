'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import Icon from '../Icons';
import AnimatedContent from '../react-bits/AnimatedContent';
import LoadingSpinner from '../LoadingSpinner';
import TiltedCard from '../react-bits/TiltedCard';
import ButtonPrimary from '../ButtonPrimary';
// import { saveSvgAsPng } from 'save-svg-as-png';

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

export default function QRGeneratorForm() {
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [logoDataUri, setLogoDataUri] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateQR = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to generate QR code');
      }

      const { encrypted } = await res.json();
      setQrValue(encrypted);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    // const svg = document.querySelector(
    //   '#qr-canvas-container svg',
    // ) as SVGElement;

    // if (!svg) {
    //   alert('SVG QR not ready');
    //   return;
    // }

    // saveSvgAsPng(
    //   svg,
    //   `${formData.full_name.toUpperCase() || 'UNKNOWN'}_QR.png`,
    //   {
    //     backgroundColor: '#ffffff',
    //     scale: 8,
    //   },
    // );

    setQrValue(null);
    setFormData(initialFormData);
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
        <div className="mb-4 flex items-center justify-center gap-2">
          <Icon
            name={'QrCode'}
            className="h-8 w-8 text-gray-50 sm:h-10 sm:w-10"
          />
          <h1 className="text-2xl font-bold">QR Code Generator</h1>
        </div>

        <p className="mb-8 text-center text-sm text-gray-400 italic">
          Complete the form below to generate your QR code.
          <br />
          <strong>Note:</strong> All fields must be filled in correctly.
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
          disabled={loading || validated}
          onClick={handleGenerateQR}
          className="mb-4 inline-flex w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <LoadingSpinner color="text-gray-50" />
          ) : (
            'Generate QR Code'
          )}
        </ButtonPrimary>
      </AnimatedContent>

      {qrValue && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <TiltedCard
            showMobileWarning={false}
            showTooltip={false}
            rotateAmplitude={20}
            scaleOnHover={1.5}
            imageComponent={
              <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-xl">
                <div
                  id="qr-canvas-container"
                  className="rounded-md p-4"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                  }}
                >
                  <QRCode
                    value={qrValue}
                    size={256}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    marginSize={2}
                    imageSettings={{
                      src: logoDataUri || '',
                      height: 32,
                      width: 32,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="text-center text-lg font-bold text-gray-800">{`${formData.rank} ${formData.full_name}`}</p>
                <p className="text-sm text-gray-600">{formData.afpsn}</p>
              </div>
            }
          />

          <ButtonPrimary
            onClick={handleDownloadQR}
            className="absolute bottom-10 mx-4 mt-4 w-full max-w-xs"
          >
            <Icon name="Camera" className="mr-2 inline-block h-5 w-5" />
            Take a screenshot and exit!
          </ButtonPrimary>
        </div>
      )}
    </>
  );
}
