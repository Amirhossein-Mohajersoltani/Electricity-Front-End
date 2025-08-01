import { useState, useEffect } from 'react';
import { apiService, loadApiConfig } from '@/lib/api';

export const useCSRF = () => {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCsrfToken = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First load API configuration
      await loadApiConfig();
      
      // Then fetch CSRF token
      const token = await apiService.getCsrfToken();
      setCsrfToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CSRF token');
      console.error('Error fetching CSRF token:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  const refreshToken = () => {
    fetchCsrfToken();
  };

  return {
    csrfToken,
    isLoading,
    error,
    refreshToken,
  };
}; 