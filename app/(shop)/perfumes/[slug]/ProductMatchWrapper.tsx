'use client';

import { useProductMatch } from '@/hooks/useProductMatch';
import { ProductDetails } from '@/components/products/ProductDetails';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type Brand = Database['public']['Tables']['brands']['Row'];

interface ProductMatchWrapperProps {
  product: Product;
  brand?: Brand;
}

/**
 * Componente cliente que obtiene el match percentage y lo pasa a ProductDetails
 */
export function ProductMatchWrapper({ product, brand }: ProductMatchWrapperProps) {
  const { matchPercentage } = useProductMatch(product.id);

  return (
    <ProductDetails
      product={product}
      brand={brand}
      matchPercentage={matchPercentage}
    />
  );
}

