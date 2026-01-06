import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type OlfactoryFamily = Database['public']['Tables']['olfactory_families']['Row'];

/**
 * Obtiene todas las familias olfativas
 */
export async function getOlfactoryFamilies(): Promise<OlfactoryFamily[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('olfactory_families')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching olfactory families:', error);
    throw new Error('Error al obtener familias olfativas');
  }

  return (data as OlfactoryFamily[]) || [];
}

/**
 * Obtiene una familia olfativa por su slug
 */
export async function getOlfactoryFamilyBySlug(
  slug: string
): Promise<OlfactoryFamily | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('olfactory_families')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching olfactory family by slug:', error);
    throw new Error('Error al obtener la familia olfativa');
  }

  return data as OlfactoryFamily;
}

