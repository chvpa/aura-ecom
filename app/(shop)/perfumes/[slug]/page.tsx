import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductBySlug } from '@/lib/services/products';
import { getBrandById } from '@/lib/services/brands';
import { ProductMatchWrapper } from './ProductMatchWrapper';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Producto no encontrado | Odora Perfumes',
    };
  }

  return {
    title: `${product.name} | Odora Perfumes`,
    description: product.description_short || product.meta_description || '',
    openGraph: {
      images: [product.main_image_url],
    },
  };
}

// Revalidar cada hora para productos
export const revalidate = 3600;

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Obtener marca del producto
  const brand = product.brand_id
    ? await getBrandById(product.brand_id).catch(() => null)
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductMatchWrapper product={product} brand={brand || undefined} />
    </div>
  );
}

