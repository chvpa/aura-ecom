'use client';

import { useState, useCallback } from 'react';
import type { Database } from '@/types/database.types';
import type { ParsedContext } from '@/lib/services/aiSearch';
import type { ProductFilters } from '@/lib/services/products';

type Product = Database['public']['Tables']['products']['Row'];

export interface AISearchResponse {
  products: Product[];
  filters: ProductFilters;
  explanation: string;
  context: ParsedContext;
  total: number;
}

export interface UseAISearchReturn {
  search: (query: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
  results: AISearchResponse | null;
  explanation: string | null;
  context: ParsedContext | null;
  reset: () => void;
}

export function useAISearch(): UseAISearchReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<AISearchResponse | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.trim().length === 0) {
      setError(new Error('La consulta no puede estar vacía'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al realizar la búsqueda');
      }

      const data: AISearchResponse = await response.json();
      setResults(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err : new Error('Error desconocido');
      setError(errorMessage);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    search,
    loading,
    error,
    results,
    explanation: results?.explanation || null,
    context: results?.context || null,
    reset,
  };
}

