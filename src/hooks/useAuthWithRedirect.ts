import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@consalud/core';

interface UseAuthWithRedirectOptions {
  defaultRedirectPath?: string;
  protectedPaths?: string[];
  publicPaths?: string[];
}

export const useAuthWithRedirect = (options: UseAuthWithRedirectOptions = {}) => {
  const {
    defaultRedirectPath = '/home',
    protectedPaths = ['/mnherederos', '/home'],
    publicPaths = ['/login']
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn: coreIsAuthenticated, loading: coreIsLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the check to prevent unnecessary re-renders
  const checkAuthAndRedirect = useCallback(async () => {
    try {
      const currentPath = location.pathname;
      const isProtectedRoute = protectedPaths.some(path => currentPath.startsWith(path));
      const isPublicRoute = publicPaths.some(path => currentPath.startsWith(path));

      if (isProtectedRoute && !coreIsAuthenticated) {
        // Save the attempted URL for post-login redirect
        const returnUrl = encodeURIComponent(currentPath + location.search);
        navigate(`/login?returnUrl=${returnUrl}`, { replace: true });
      } else if (isPublicRoute && coreIsAuthenticated) {
        navigate(defaultRedirectPath, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  }, [location, coreIsAuthenticated, navigate, protectedPaths, publicPaths, defaultRedirectPath]);

  useEffect(() => {
    if (!coreIsLoading) {
      checkAuthAndRedirect();
    }
  }, [coreIsLoading, checkAuthAndRedirect]);

  const handleLoginSuccess = useCallback(async () => {
    const params = new URLSearchParams(location.search);
    const returnUrl = params.get('returnUrl');
    
    if (returnUrl) {
      navigate(decodeURIComponent(returnUrl), { replace: true });
    } else {
      navigate(defaultRedirectPath, { replace: true });
    }
  }, [location.search, navigate, defaultRedirectPath]);

  return {
    isAuthenticated: coreIsAuthenticated,
    isLoading: isLoading || coreIsLoading,
    handleLoginSuccess
  };
};
