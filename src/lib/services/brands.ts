import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type Brand = Database['public']['Tables']['brands']['Row'];

/**
 * Obtiene todas las marcas activas
 */
export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching brands:', error);
    throw new Error('Error al obtener marcas');
  }

  return (data as Brand[]) || [];
}

/**
 * Obtiene una marca por su slug
 */
export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching brand by slug:', error);
    throw new Error('Error al obtener la marca');
  }

  return data as Brand;
}

/**
 * Obtiene una marca por su ID
 */
export async function getBrandById(id: string): Promise<Brand | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching brand by id:', error);
    throw new Error('Error al obtener la marca');
  }

  return data as Brand;
}

/**
 * Obtiene el conteo de productos por marca
 */
export async function getProductCountByBrand(brandId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brandId)
    .eq('is_active', true);

  if (error) {
    console.error('Error counting products by brand:', error);
    return 0;
  }

  return count || 0;
}

