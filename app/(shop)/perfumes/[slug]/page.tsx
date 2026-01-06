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

  const description = product.description_short || product.meta_description || `Compra ${product.name} en Odora Perfumes. ${product.gender} - ${product.concentration}. Envío gratis en Paraguay.`;
  const price = product.price_pyg;
  const brand = product.brand_id ? await getBrandById(product.brand_id).catch(() => null) : null;
  const brandName = brand?.name || 'Odora Perfumes';

  return {
    title: `${product.name} | ${brandName} | Odora Perfumes`,
    description,
    keywords: [
      product.name,
      brandName,
      product.gender,
      product.concentration,
      'perfume',
      'fragancia',
      'Paraguay',
      'comprar perfume online',
    ],
    openGraph: {
      title: `${product.name} | ${brandName}`,
      description,
      images: [
        {
          url: product.main_image_url,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'product',
      siteName: 'Odora Perfumes',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${brandName}`,
      description,
      images: [product.main_image_url],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/perfumes/${slug}`,
    },
    other: {
      'product:price:amount': price.toString(),
      'product:price:currency': 'PYG',
      'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
      'product:condition': 'new',
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

