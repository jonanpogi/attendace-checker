'use client';

import BackButton from '@/components/BackButton';
import Container from '@/components/Container';
import ProtectedRoute from '@/components/ProtectedRoute';
import QRScanner from '@/components/QRScanner';
import BlurText from '@/components/react-bits/BlurText';
import { triggerToast } from '@/components/ToastContainer';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ScannQr = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const fetchEvent = async () => {
    const pathParams = window.location.pathname.split('/');
    const eventId = pathParams[pathParams.length - 1];

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch event data');
        triggerToast(
          'error',
          'Failed to fetch event data. Please try again later.',
        );
        return;
      }

      const data = await response.json();

      if (data.data === null) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
      triggerToast(
        'error',
        'An error occurred while fetching event data. Please try again later.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return null;
  } else {
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
  }
};

export default ScannQr;
