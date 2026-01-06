import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBrandBySlug } from '@/lib/services/brands';
import { ProductCatalogClient } from '../../perfumes/ProductCatalogClient';
import { DEFAULT_PAGE_SIZE } from '@/lib/utils/constants';

interface BrandProductsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BrandProductsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    return {
      title: 'Marca no encontrada | Odora Perfumes',
    };
  }

  return {
    title: `${brand.name} | Odora Perfumes`,
    description: brand.description || `Explora los perfumes de ${brand.name}`,
  };
}

export default async function BrandProductsPage({
  params,
}: BrandProductsPageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
        {brand.description && (
          <p className="text-muted-foreground">{brand.description}</p>
        )}
      </div>

      <ProductCatalogClient
        pageSize={DEFAULT_PAGE_SIZE}
        brandSlug={slug}
      />
    </div>
  );
}

