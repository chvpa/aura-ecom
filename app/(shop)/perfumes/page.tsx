import { Suspense } from 'react';
import { Metadata } from 'next';
import { ProductCatalogClient } from './ProductCatalogClient';
import { ProductGridSkeleton } from '@/components/products/ProductSkeleton';
import { DEFAULT_PAGE_SIZE } from '@/lib/utils/constants';

export const metadata: Metadata = {
  title: 'Catálogo de Perfumes | Odora Perfumes',
  description:
    'Explora nuestra amplia colección de perfumes. Encuentra tu fragancia perfecta con nuestros filtros avanzados.',
};

export default function PerfumesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Catálogo de Perfumes</h1>
        <p className="text-muted-foreground">
          Descubre nuestra selección de fragancias exclusivas
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductCatalogClient pageSize={DEFAULT_PAGE_SIZE} />
      </Suspense>
    </div>
  );
}

