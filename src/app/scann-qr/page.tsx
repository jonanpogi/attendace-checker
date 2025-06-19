'use client';

import BackButton from '@/components/BackButton';
import Container from '@/components/Container';
import ProtectedRoute from '@/components/ProtectedRoute';
import QRScanner from '@/components/QRScanner';
import BlurText from '@/components/react-bits/BlurText';

const ScannQr = () => {
  return (
    <ProtectedRoute>
      <Container>
        <BackButton />
        <div className="hidden sm:block">
          <BlurText
            text="🛠️ This page is only available on mobile devices."
            delay={50}
            animateBy="words"
            direction="top"
            className="mb-4 text-center text-2xl font-bold text-gray-50 sm:text-3xl"
          />
          <BlurText
            text=" Please use your mobile device to scan the QR code."
            delay={50}
            animateBy="words"
            direction="top"
            className="mb-8 text-center text-sm text-gray-200 sm:text-base"
          />
        </div>

        <div className="block sm:hidden">
          <QRScanner />
        </div>
      </Container>
    </ProtectedRoute>
  );
};

export default ScannQr;
