import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils/constants';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  
  // Obtener productos activos
  const { data: products } = await (supabase
    .from('products') as any)
    .select('slug, updated_at')
    .eq('is_active', true)
    .limit(1000) as { data: Array<{ slug: string; updated_at: string | null }> | null; error: any };

  // Obtener marcas activas
  const { data: brands } = await (supabase
    .from('brands') as any)
    .select('slug, updated_at')
    .eq('is_active', true)
    .limit(100) as { data: Array<{ slug: string; updated_at: string | null }> | null; error: any };

  const now = new Date().toISOString();

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/perfumes`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/marcas`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/busqueda-ia`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/carrito`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Páginas de productos
  const productPages: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${SITE_URL}/perfumes/${product.slug}`,
    lastModified: product.updated_at || now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Páginas de marcas
  const brandPages: MetadataRoute.Sitemap = (brands || []).map((brand) => ({
    url: `${SITE_URL}/marcas/${brand.slug}`,
    lastModified: brand.updated_at || now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...brandPages];
}

