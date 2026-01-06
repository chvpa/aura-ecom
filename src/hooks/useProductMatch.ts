'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface MatchResponse {
  matchPercentage: number;
  reasons?: Record<string, unknown> | null;
}

interface UseProductMatchReturn {
  matchPercentage: number | undefined;
  loading: boolean;
  error: Error | null;
  reasons?: Record<string, unknown> | null;
}

/**
 * Hook para obtener el match percentage de un producto individual
 */
export function useProductMatch(productId: string): UseProductMatchReturn {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [matchPercentage, setMatchPercentage] = useState<number | undefined>(
    undefined
  );
  const [reasons, setReasons] = useState<Record<string, unknown> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Match AI deshabilitado temporalmente
    const rafId = requestAnimationFrame(() => {
      setMatchPercentage(undefined);
      setLoading(false);
      setError(null);
    });
    return () => {
      cancelAnimationFrame(rafId);
    };
    
    // Código original comentado:
    // // Solo calcular si el usuario está autenticado y tiene perfil
    // if (authLoading) {
    //   return;
    // }

    // if (!isAuthenticated || !user || !productId) {
    //   setMatchPercentage(undefined);
    //   setLoading(false);
    //   return;
    // }

    // // Verificar si tiene perfil completado antes de hacer la llamada
    // const fetchMatch = async () => {
    //   setLoading(true);
    //   setError(null);

    //   try {
    //     const response = await fetch('/api/ai/match', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({ productId }),
    //     });

    //     if (!response.ok) {
    //       const errorData = await response.json();
    //       // Si el error es 403 (onboarding no completado), no mostrar error
    //       if (response.status === 403) {
    //         setMatchPercentage(undefined);
    //         setLoading(false);
    //         return;
    //       }
    //       throw new Error(errorData.error || 'Error al obtener el match');
    //     }

    //     const data: MatchResponse = await response.json();
    //     setMatchPercentage(data.matchPercentage);
    //     setReasons(data.reasons || null);
    //   } catch (err) {
    //     console.error('Error fetching match:', err);
    //     setError(err instanceof Error ? err : new Error('Error desconocido'));
    //     // No bloquear la UI si falla el match
    //     setMatchPercentage(undefined);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchMatch();
  }, [user, isAuthenticated, productId, authLoading]);

  return {
    matchPercentage,
    loading,
    error,
    reasons,
  };
}

/**
 * Hook para obtener matches de múltiples productos en batch
 */
export function useProductMatches(
  productIds: string[]
): {
  matchPercentages: Record<string, number>;
  loading: boolean;
  error: Error | null;
} {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [matchPercentages, setMatchPercentages] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Match AI deshabilitado temporalmente
    const rafId = requestAnimationFrame(() => {
      setMatchPercentages({});
      setLoading(false);
      setError(null);
    });
    return () => {
      cancelAnimationFrame(rafId);
    };
    
    // Código original comentado:
    // // Solo calcular si el usuario está autenticado y tiene perfil
    // if (authLoading) {
    //   return;
    // }

    // if (!isAuthenticated || !user || productIds.length === 0) {
    //   setMatchPercentages({});
    //   setLoading(false);
    //   return;
    // }

    // const fetchMatches = async () => {
    //   setLoading(true);
    //   setError(null);

    //   try {
    //     // Hacer requests paralelos para todos los productos
    //     const promises = productIds.map(async (productId) => {
    //       try {
    //         const response = await fetch('/api/ai/match', {
    //           method: 'POST',
    //           headers: {
    //             'Content-Type': 'application/json',
    //           },
    //           body: JSON.stringify({ productId }),
    //         });

    //         if (!response.ok) {
    //           // Si es 403, simplemente no incluir este producto
    //           if (response.status === 403) {
    //             return { productId, matchPercentage: undefined };
    //           }
    //           return { productId, matchPercentage: undefined };
    //         }

    //         const data: MatchResponse = await response.json();
    //         return {
    //           productId,
    //           matchPercentage: data.matchPercentage,
    //         };
    //       } catch (err) {
    //         console.error(`Error fetching match for product ${productId}:`, err);
    //         return { productId, matchPercentage: undefined };
    //       }
    //     });

    //     const results = await Promise.all(promises);

    //     // Construir el objeto de matches
    //     const matches: Record<string, number> = {};
    //     results.forEach((result) => {
    //       if (result.matchPercentage !== undefined) {
    //         matches[result.productId] = result.matchPercentage;
    //       }
    //     });

    //     setMatchPercentages(matches);
    //   } catch (err) {
    //     console.error('Error fetching matches:', err);
    //     setError(err instanceof Error ? err : new Error('Error desconocido'));
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated, productIds, authLoading]);

  return {
    matchPercentages,
    loading,
    error,
  };
}

