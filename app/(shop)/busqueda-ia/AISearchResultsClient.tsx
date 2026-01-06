'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAISearch } from '@/hooks/useAISearch';
import { ProductGrid } from '@/components/products/ProductGrid';
import { SearchContextBadges } from '@/features/ai/components/SearchContextBadges';
import { SearchExplanation } from '@/features/ai/components/SearchExplanation';
import { Button } from '@/components/ui/button';
import { Loader2, Filter } from 'lucide-react';
import { ProductGridSkeleton } from '@/components/products/ProductSkeleton';
import { EmptyState } from '@/components/products/EmptyState';

export function AISearchResultsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('query') || '';
  const { search, loading, error, results, explanation, context, reset } =
    useAISearch();

  useEffect(() => {
    if (query) {
      search(query);
    } else {
      reset();
    }
  }, [query, search, reset]);

  const handleRefineSearch = () => {
    if (!results?.filters) return;

    const params = new URLSearchParams();

    // Agregar filtros a los params
    if (results.filters.gender) {
      params.set('genero', results.filters.gender);
    }
    if (results.filters.families && results.filters.families.length > 0) {
      params.set('familias', results.filters.families.join(','));
    }
    if (results.filters.priceMin !== undefined) {
      params.set('precioMin', results.filters.priceMin.toString());
    }
    if (results.filters.priceMax !== undefined) {
      params.set('precioMax', results.filters.priceMax.toString());
    }
    if (results.filters.brands && results.filters.brands.length > 0) {
      params.set('marcas', results.filters.brands.join(','));
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

  if (loading) {
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

  if (error) {
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

  if (!results) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Explicación */}
      {explanation && <SearchExplanation explanation={explanation} />}

      {/* Contexto extraído */}
      {context && <SearchContextBadges context={context} />}

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {results.total > 0
            ? `Encontrados ${results.total} perfume${results.total > 1 ? 's' : ''}`
            : 'No se encontraron productos'}
        </p>
        {results.total > 0 && (
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

      {results.products.length > 0 ? (
        <ProductGrid products={results.products} />
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

