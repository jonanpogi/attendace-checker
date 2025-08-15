'use client';

import { useState, useEffect } from 'react';

const DEFAULT_SCREEN_WIDTH = 320;
const DEFAULT_SCREEN_HEIGHT = 568;

const useScreenDimension = () => {
  const [width, setWidth] = useState<number>(DEFAULT_SCREEN_WIDTH);
  const [height, setHeight] = useState<number>(DEFAULT_SCREEN_HEIGHT);

  useEffect(() => {
    const updateWidth = () => setWidth(window.innerWidth);
    const updateHeight = () => setHeight(window.innerHeight);

    updateWidth(); // set on mount
    updateHeight(); // set on mount
    window.addEventListener('resize', updateWidth);
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateWidth);
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return { width, height };
};

export default useScreenDimension;
