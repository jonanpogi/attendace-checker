'use client';

import BackButton from '@/components/BackButton';
import Container from '@/components/Container';
import QRScanner from '@/components/QRScanner';

const ScannQr = () => {
  return (
    <Container>
      <BackButton />
      <h1 className="hidden text-2xl sm:block">
        🛠️ This page is only available on mobile devices.
      </h1>
      <p className="hidden text-gray-500 sm:block">
        Please use your mobile device to scan the QR code.
      </p>
      <div className="block sm:hidden">
        <QRScanner />
      </div>
    </Container>
  );
};

export default ScannQr;
