'use client';

import { useWishlist } from '../hooks/useWishlist';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';
import { EmptyState } from '@/components/products/EmptyState';
import { useProducts } from '@/hooks/useProducts';

export function WishlistGrid() {
  const { items, loading: wishlistLoading } = useWishlist();
  const { products, loading: productsLoading, error } = useProducts({
    filters: { productIds: items },
    enabled: items.length > 0,
  });

  if (wishlistLoading || productsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Tu wishlist está vacía"
        description="Agrega productos que te gusten para guardarlos aquí"
        actionLabel="Explorar Perfumes"
        onAction={() => (window.location.href = '/perfumes')}
      />
    );
  }

  if (error || !products || products.length === 0) {
    return (
      <EmptyState
        title="No se encontraron productos"
        description="Algunos productos pueden haber sido eliminados"
        actionLabel="Explorar Perfumes"
        onAction={() => (window.location.href = '/perfumes')}
      />
    );
  }

  return <ProductGrid products={products} showWishlist />;
}

