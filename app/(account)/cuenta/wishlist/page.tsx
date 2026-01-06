import { Suspense } from 'react';
import { WishlistGrid } from '@/features/wishlist/components/WishlistGrid';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';

export const dynamic = 'force-dynamic';

export default function WishlistPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mi Wishlist</h1>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        }
      >
        <WishlistGrid />
      </Suspense>
    </div>
  );
}

