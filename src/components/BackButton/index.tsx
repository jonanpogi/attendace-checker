'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BackButton = () => {
  const router = useRouter();

  const handleBack = (event?: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    event?.stopPropagation();
    router.back();
  };

  return (
    <ArrowLeft
      className="absolute top-4 left-4 z-10 h-8 w-8 scale-95 text-gray-50 hover:scale-105 sm:h-10 sm:w-10"
      onClick={handleBack}
    />
  );
};

export default BackButton;
