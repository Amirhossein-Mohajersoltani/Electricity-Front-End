import { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '@/lib/api';

interface CsrfTokenResponse {
  csrf_token: string;
}

export const useCsrfToken = () => {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCsrfToken = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest(API_ENDPOINTS.CSRF_TOKEN, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.statusText}`);
      }

      const data: CsrfTokenResponse = await response.json();
      setCsrfToken(data.csrf_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CSRF token');
      setCsrfToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  return {
    csrfToken,
    loading,
    error,
    refetchToken: fetchCsrfToken,
  };
}; 