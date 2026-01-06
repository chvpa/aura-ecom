import { Suspense } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGridSkeleton } from '@/components/products/ProductSkeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(4);
  
  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
  
  return (data as Product[]) || [];
}

// Revalidar cada hora
export const revalidate = 3600;

async function FeaturedProductsContent() {
  const products = await getFeaturedProducts();
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay productos destacados disponibles</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function FeaturedProducts() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Productos Destacados</h2>
          <p className="text-muted-foreground">
            Selección especial de nuestras mejores fragancias
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/perfumes">
            Ver todos
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
      
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <FeaturedProductsContent />
      </Suspense>
    </div>
  );
}

