import { useRef, useCallback } from 'react';

const useDebounce = (
  callback: (() => void) | ((...args: unknown[]) => void),
  delay: number,
) => {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: unknown[]) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );

  return debouncedCallback;
};

export default useDebounce;
