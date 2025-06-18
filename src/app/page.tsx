'use client';

import Container from '@/components/Container';
import MainSelection from '@/components/MainSelection';
import AnimatedContent from '@/components/react-bits/AnimatedContent';
import BlurText from '@/components/react-bits/BlurText';
import Image from 'next/image';

export default function Home() {
  return (
    <Container>
      <Image
        src={'122nd_logo.svg'}
        alt="Logo"
        width={50}
        height={50}
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
        className="mb-8 text-center text-sm text-gray-200 sm:text-base"
      />
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
        className="h-auto w-full p-4"
      >
        <MainSelection />
      </AnimatedContent>
    </Container>
  );
}
