'use client';

import { useEffect, useState, useRef } from 'react';

type ToastProps = {
  type: 'success' | 'error';
  message: string;
};

let showToastHandler: (type: ToastProps['type'], message: string) => void;

export const triggerToast = (type: ToastProps['type'], message: string) => {
  if (showToastHandler) {
    showToastHandler(type, message);
  } else {
    console.warn('Toast handler not initialized yet.');
  }
};

const ToastContainer = () => {
  const [toast, setToast] = useState<ToastProps | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    showToastHandler = (type, message) => {
      setToast({ type, message });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setToast(null);
      }, 3000);
    };

    return () => {
      showToastHandler = () => {};
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!toast) return null;

  return (
    <div className="animate-fade-in-out fixed right-6 bottom-6 z-[999] flex max-w-xs items-start gap-2 rounded-md px-4 py-3 text-sm text-white shadow-lg transition-all duration-300 ease-in-out">
      <div
        className={`flex-1 rounded px-3 py-2 font-medium ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}
      >
        {toast.message}
      </div>
    </div>
  );
};

export default ToastContainer;
