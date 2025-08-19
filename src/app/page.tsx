'use client';

import Container from '@/components/Container';
import Greetings from '@/components/Greetings';
import InstallPWAAlert from '@/components/InstallPWAAlert';
import MainSelection from '@/components/MainSelection';
import AnimatedContent from '@/components/react-bits/AnimatedContent';
import BlurText from '@/components/react-bits/BlurText';
import Splash from '@/components/Splash';
import SportFestButton from '@/components/SportFestButton';
import { useAuth } from '@/hooks/useAuth';
import useMediaQuery from '@/hooks/useMediaQuery';
import {
  SPLASH_KEY,
  SPLASH_INTERVAL_MS,
  SPLASH_DURATION_MS,
} from '@/utils/constants';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home() {
  const [showSplash, setShowSplash] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const { isAuthenticated, setIsAuthenticated, loading } = useAuth();

  useEffect(() => {
    const now = Date.now();
    const last = Number(localStorage.getItem(SPLASH_KEY) || 0);

    if (!last || now - last >= SPLASH_INTERVAL_MS) {
      setShowSplash(true);
      localStorage.setItem(SPLASH_KEY, String(now));

      const t = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
      return () => clearTimeout(t);
    } else {
      setShowSplash(false);
    }
  }, []);

  return showSplash ? (
    <Splash />
  ) : (
    <>
      <InstallPWAAlert />
      <Container showFooter>
        <Greetings isAuthenticated={isAuthenticated!} />
        <Image
          src={'122nd_logo.svg'}
          alt="Logo"
          width={isMobile ? 50 : 80}
          height={isMobile ? 50 : 80}
          className="mb-2 inline-block"
        />
        <BlurText
          text="122nd Attendance Checker!"
          delay={50}
          animateBy="words"
          direction="top"
          className="mb-4 text-center text-2xl font-bold text-gray-50 sm:text-3xl"
        />
        <BlurText
          text="This tool helps you generate, scan, and extract attendance — fast and easy. 🚀"
          delay={50}
          animateBy="words"
          direction="top"
          className="mb-2 text-center text-sm text-gray-200 sm:text-base"
        />
        <AnimatedContent
          distance={150}
          direction="vertical"
          reverse={false}
          duration={1.2}
          ease="power3.out"
          initialOpacity={0}
          scale={1.1}
          className="w-full p-4"
        >
          {!loading && (
            <MainSelection
              isAuthenticated={isAuthenticated!}
              setIsAuthenticated={setIsAuthenticated}
            />
          )}
        </AnimatedContent>
        <SportFestButton />
      </Container>
    </>
  );
}
