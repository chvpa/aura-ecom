'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAISearch, type AISearchResponse } from '@/hooks/useAISearch';
import { ProductGrid } from '@/components/products/ProductGrid';
import { SearchContextBadges } from '@/features/ai/components/SearchContextBadges';
import { SearchExplanation } from '@/features/ai/components/SearchExplanation';
import { Button } from '@/components/ui/button';
import { Loader2, Filter } from 'lucide-react';
import { ProductGridSkeleton } from '@/components/products/ProductSkeleton';
import { EmptyState } from '@/components/products/EmptyState';

const CACHE_KEY_PREFIX = 'ai-search-';

export function AISearchResultsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('query') || '';
  const { search, loading, error, results, explanation, context, reset } =
    useAISearch();
  const [cachedResults, setCachedResults] = useState<AISearchResponse | null>(null);
  const [isLoadingCache, setIsLoadingCache] = useState(true);

  // Check cache first, then search if needed
  useEffect(() => {
    if (!query) {
      reset();
      setCachedResults(null);
      setIsLoadingCache(false);
      return;
    }

    // Try to get from sessionStorage first
    try {
      const cached = sessionStorage.getItem(`${CACHE_KEY_PREFIX}${query}`);
      if (cached) {
        const parsedCache = JSON.parse(cached) as AISearchResponse;
        setCachedResults(parsedCache);
        setIsLoadingCache(false);
        return;
      }
    } catch (e) {
      // Ignore cache errors
    }

    // No cache, do the search
    setIsLoadingCache(false);
    search(query);
  }, [query, search, reset]);

  // Cache results when they come in
  useEffect(() => {
    if (results && query && !cachedResults) {
      try {
        sessionStorage.setItem(`${CACHE_KEY_PREFIX}${query}`, JSON.stringify(results));
      } catch (e) {
        // Ignore cache errors (quota exceeded, etc.)
      }
    }
  }, [results, query, cachedResults]);

  // Use cached results if available, otherwise use fresh results
  const displayResults = cachedResults || results;
  const displayExplanation = cachedResults?.explanation || explanation;
  const displayContext = cachedResults?.context || context;

  const handleRefineSearch = () => {
    if (!displayResults?.filters) return;

    const params = new URLSearchParams();

    // Agregar filtros a los params
    if (displayResults.filters.gender) {
      params.set('genero', displayResults.filters.gender);
    }
    if (displayResults.filters.families && displayResults.filters.families.length > 0) {
      params.set('familias', displayResults.filters.families.join(','));
    }
    if (displayResults.filters.priceMin !== undefined) {
      params.set('precioMin', displayResults.filters.priceMin.toString());
    }
    if (displayResults.filters.priceMax !== undefined) {
      params.set('precioMax', displayResults.filters.priceMax.toString());
    }
    if (displayResults.filters.brands && displayResults.filters.brands.length > 0) {
      params.set('marcas', displayResults.filters.brands.join(','));
    }

    router.push(`/perfumes?${params.toString()}`);
  };

  if (!query) {
    return (
      <EmptyState
        title="No hay búsqueda"
        description="Ingresa una búsqueda en la página principal para ver resultados aquí."
        actionLabel="Ir a búsqueda"
        onAction={() => router.push('/')}
      />
    );
  }

  if (loading || isLoadingCache) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Analizando tu búsqueda con IA...</span>
        </div>
        <ProductGridSkeleton />
      </div>
    );
  }

  if (error && !cachedResults) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">Error al buscar</p>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => search(query)}
        >
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  if (!displayResults) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Explicación */}
      {displayExplanation && <SearchExplanation explanation={displayExplanation} />}

      {/* Contexto extraído */}
      {displayContext && <SearchContextBadges context={displayContext} />}

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {displayResults.total > 0
            ? `Encontrados ${displayResults.total} perfume${displayResults.total > 1 ? 's' : ''}`
            : 'No se encontraron productos'}
        </p>
        {displayResults.total > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefineSearch}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Aplicar más filtros
          </Button>
        )}
      </div>

      {displayResults.products.length > 0 ? (
        <ProductGrid products={displayResults.products} />
      ) : (
        <EmptyState
          title="No se encontraron productos"
          description="Intenta con términos diferentes o ajusta tu búsqueda."
          actionLabel="Buscar de nuevo"
          onAction={() => router.push('/')}
        />
      )}
    </div>
  );
}

