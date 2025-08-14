'use client';

import { useCallback, useEffect, useState } from 'react';

type UseAuthReturn = {
  isAuthenticated: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  setIsAuthenticated: (v: boolean) => void; // for manual UI updates after login/logout
};

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const ctrl = new AbortController();
    try {
      const res = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        signal: ctrl.signal,
      });
      setIsAuthenticated(res.ok); // 200 => true, 401/403 => false
    } catch {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
    return; // resolve
  }, []);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (!alive) return;
      await refresh();
    };
    run();

    // Refresh when tab regains focus
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener('focus', onFocus);

    // Optional: listen for manual auth state changes
    const onAuthChanged = () => {
      void refresh();
    };
    window.addEventListener('auth:changed', onAuthChanged as EventListener);

    return () => {
      alive = false;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener(
        'auth:changed',
        onAuthChanged as EventListener,
      );
    };
  }, [refresh]);

  return { isAuthenticated, loading, refresh, setIsAuthenticated };
}
