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

        setIsAuthenticated(res.status === 200);
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, loading: isAuthenticated === null };
}
