import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type Brand = Database['public']['Tables']['brands']['Row'];

async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })
    .limit(12);
  
  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
  
  return (data as Brand[]) || [];
}

export async function BrandsCarousel() {
  const brands = await getBrands();
  
  if (brands.length === 0) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Nuestras Marcas</h2>
        <p className="text-muted-foreground">
          Las mejores fragancias de las marcas más reconocidas
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/marcas/${brand.slug}`}
            className="group flex flex-col items-center justify-center p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all"
          >
            {brand.logo_url ? (
              <div className="relative w-24 h-24 mb-2">
                <Image
                  src={brand.logo_url}
                  alt={brand.name}
                  fill
                  className="object-contain group-hover:scale-110 transition-transform"
                  sizes="96px"
                />
              </div>
            ) : (
              <div className="w-24 h-24 mb-2 flex items-center justify-center bg-muted rounded-lg">
                <span className="text-lg font-bold text-muted-foreground">
                  {brand.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-center group-hover:text-primary transition-colors">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

