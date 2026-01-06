import { Metadata } from 'next';
import { getBrands, getProductCountByBrand } from '@/lib/services/brands';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Marcas | Odora Perfumes',
  description: 'Explora nuestras marcas de perfumes exclusivas',
};

export default async function BrandsPage() {
  const brands = await getBrands();

  // Obtener conteo de productos para cada marca
  const brandsWithCounts = await Promise.all(
    brands.map(async (brand) => {
      const count = await getProductCountByBrand(brand.id);
      return { ...brand, productCount: count };
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nuestras Marcas</h1>
        <p className="text-muted-foreground">
          Descubre las mejores marcas de perfumes disponibles
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {brandsWithCounts.map((brand) => (
          <Link key={brand.id} href={`/marcas/${brand.slug}`}>
            <Card className="h-full hover:shadow-card-hover transition-shadow cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                {brand.logo_url && (
                  <div className="relative w-24 h-24">
                    <Image
                      src={brand.logo_url}
                      alt={brand.name}
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg mb-1">{brand.name}</h3>
                  {brand.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {brand.description}
                    </p>
                  )}
                </div>
                <Badge variant="secondary">
                  {brand.productCount} producto{brand.productCount !== 1 ? 's' : ''}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

