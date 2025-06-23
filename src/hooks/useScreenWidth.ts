'use client';

import { useState, useEffect } from 'react';

const useScreenWidth = () => {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const updateWidth = () => setWidth(window.innerWidth);

    updateWidth(); // set on mount
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return width;
};

export default useScreenWidth;
