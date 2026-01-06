'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { useProducts } from '@/hooks/useProducts';
import { useProductFilters } from '@/hooks/useProductFilters';
import { useProductMatches } from '@/hooks/useProductMatch';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_PAGE_SIZE } from '@/lib/utils/constants';

interface ProductCatalogClientProps {
  pageSize?: number;
  brandSlug?: string;
}

export function ProductCatalogClient({
  pageSize = DEFAULT_PAGE_SIZE,
  brandSlug,
}: ProductCatalogClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const { filters } = useProductFilters();
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  // Si hay brandSlug, agregarlo a los filtros usando useMemo para evitar recreaciones
  const effectiveFilters = useMemo(() => {
    if (brandSlug) {
      return { ...filters, brands: [brandSlug] };
    }
    return filters;
  }, [filters, brandSlug]);

  // Memoizar pagination para evitar recreaciones
  const pagination = useMemo(
    () => ({ page: currentPage, pageSize }),
    [currentPage, pageSize]
  );

  const { products, loading, error, total, totalPages } = useProducts({
    filters: effectiveFilters,
    pagination,
  });

  // Obtener IDs de productos para calcular matches
  const productIds = useMemo(
    () => products.map((p) => p.id),
    [products]
  );

  // Obtener matches para todos los productos
  const { matchPercentages } = useProductMatches(productIds);

  useEffect(() => {
    fetch('/api/products/max-price')
      .then((res) => res.json())
      .then((data) => setMaxPrice(data.maxPrice))
      .catch(console.error);
  }, []);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }
    const queryString = params.toString();
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ''}`;
    router.replace(newUrl, { scroll: false });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error al cargar productos</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar de filtros */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="lg:sticky lg:top-4">
          <ProductFilters maxPrice={maxPrice} />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1">
        {/* Header con contador */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? (
              'Cargando...'
            ) : (
              <>
                Mostrando {products.length} de {total} productos
              </>
            )}
          </p>
        </div>

        {/* Grid de productos */}
        <ProductGrid
          products={products}
          loading={loading}
          matchPercentages={matchPercentages}
          emptyStateTitle="No se encontraron productos"
          emptyStateDescription="Intenta ajustar tus filtros para ver más resultados"
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

