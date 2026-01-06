import { Suspense } from 'react';
import { Metadata } from 'next';
import { AISearchResultsClient } from './AISearchResultsClient';
import { ProductGridSkeleton } from '@/components/products/ProductSkeleton';

export const metadata: Metadata = {
  title: 'Búsqueda con IA | Odora Perfumes',
  description:
    'Encuentra tu perfume ideal usando búsqueda semántica con inteligencia artificial.',
};

export default function AISearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Búsqueda con IA</h1>
        <p className="text-muted-foreground">
          Encuentra perfumes usando lenguaje natural
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <AISearchResultsClient />
      </Suspense>
    </div>
  );
}

