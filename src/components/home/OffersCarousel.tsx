import { Suspense } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGridSkeleton } from '@/components/products/ProductSkeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flame } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

async function getOffersProducts(): Promise<Product[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .not('original_price_pyg', 'is', null)
    .order('created_at', { ascending: false })
    .limit(6);
  
  if (error) {
    console.error('Error fetching offers products:', error);
    return [];
  }
  
  // Filtrar solo los que realmente tienen descuento
  const products = (data as Product[]) || [];
  return products.filter(
    (p) => p.original_price_pyg && p.original_price_pyg > p.price_pyg
  );
}

async function OffersContent() {
  const products = await getOffersProducts();
  
  if (products.length === 0) {
    return null; // No mostrar sección si no hay ofertas
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Flame className="h-6 w-6 text-orange-500" />
        <h2 className="text-3xl font-bold">Ofertas Especiales</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <div className="text-center">
        <Button variant="outline" asChild>
          <Link href="/perfumes">
            Ver todas las ofertas
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function OffersCarousel() {
  return (
    <div className="container mx-auto px-4 py-12 bg-muted/30">
      <Suspense fallback={<ProductGridSkeleton count={6} />}>
        <OffersContent />
      </Suspense>
    </div>
  );
}

