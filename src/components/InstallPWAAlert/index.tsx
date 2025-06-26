/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Icon from '../Icons';
import useMediaQuery from '@/hooks/useMediaQuery';
import ButtonPrimary from '../ButtonPrimary';

function isIosSafari() {
  const userAgent = window.navigator.userAgent;
  return (
    /iPhone|iPad|iPod/.test(userAgent) &&
    /Safari/.test(userAgent) &&
    !/CriOS|FxiOS|OPiOS/.test(userAgent)
  );
}

export default function InstallPWAAlert() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone = window.matchMedia(
      '(display-mode: standalone)',
    ).matches;
    if (isStandalone) return; // Don't show if already installed

    if (isIosSafari()) {
      setIsIos(true);
      setShowInstallPrompt(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="z-50 flex w-full items-center justify-between border-b border-gray-600 bg-slate-900 px-4 py-3 text-xs text-white shadow-md sm:text-sm">
      {isIos ? (
        <span>
          📱 To install this app, tap <strong>Share</strong> →{' '}
          <strong>“Add to Home Screen”</strong>.
        </span>
      ) : (
        <>
          <span>💬 You can install this app for faster access!</span>
          <ButtonPrimary
            onClick={handleInstallClick}
            className="animate-bounce"
          >
            <Icon name="Download" className="h-4 w-4" />
            {!isMobile ? 'Install App' : ''}
          </ButtonPrimary>
        </>
      )}
    </div>
  );
}
