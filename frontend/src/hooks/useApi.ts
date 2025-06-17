import { useState } from 'react';
import { useLogin } from '@/context/LoginContext';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requireAuth?: boolean;
}

export function useApi<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useLogin();

  const execute = async (url: string, options: ApiOptions = {}): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (options.requireAuth && !user) {
        throw new Error('認証が必要です');
      }

      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : '不明なエラー';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}