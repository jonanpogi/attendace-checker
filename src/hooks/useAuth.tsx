'use client';

import { useEffect, useState } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/status', {
          credentials: 'include',
        });

        if (!res.ok) {
          console.log('Auth check failed:', res.statusText);
        }

        const data = await res.json();

        setIsAuthenticated(data.data.status === 'authenticated');
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return {
    isAuthenticated,
    loading: isAuthenticated === null,
    setIsAuthenticated,
  };
}
