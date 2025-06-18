'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BackButton = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <ArrowLeft
      className="absolute top-4 left-4 h-8 w-8 scale-95 text-gray-50 hover:scale-105 sm:h-10 sm:w-10"
      onClick={handleBack}
    />
  );
};

export default BackButton;
