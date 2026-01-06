'use client';

import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from './ProductSkeleton';
import { EmptyState } from './EmptyState';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  matchPercentages?: Record<string, number>;
  showWishlist?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

export function ProductGrid({
  products,
  loading = false,
  matchPercentages,
  showWishlist = true,
  emptyStateTitle,
  emptyStateDescription,
}: ProductGridProps) {
  if (loading) {
    return <ProductGridSkeleton />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyStateTitle}
        description={emptyStateDescription}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          matchPercentage={matchPercentages?.[product.id]}
          showWishlist={showWishlist}
        />
      ))}
    </div>
  );
}

