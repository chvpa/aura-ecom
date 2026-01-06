import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database.types';

type Brand = Database['public']['Tables']['brands']['Row'];
type BrandInsert = Database['public']['Tables']['brands']['Insert'];
type BrandUpdate = Database['public']['Tables']['brands']['Update'];

/**
 * Obtiene todas las marcas (admin - incluye inactivas)
 */
export async function getAllBrandsAdmin(): Promise<Brand[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener marcas: ${error.message}`);
  }

  return (data as Brand[]) || [];
}

/**
 * Obtiene una marca por ID (admin)
 */
export async function getBrandByIdAdmin(id: string): Promise<Brand | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Error al obtener marca: ${error.message}`);
  }

  return data as Brand;
}

/**
 * Crea una nueva marca
 */
export async function createBrand(data: Omit<BrandInsert, 'id' | 'created_at'>): Promise<Brand> {
  const supabase = createAdminClient();

  // Generar slug si no se proporciona
  const slug = data.slug || generateSlug(data.name);

  const { data: brand, error } = await supabase
    .from('brands')
    .insert({
      ...data,
      slug,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear marca: ${error.message}`);
  }

  return brand as Brand;
}

/**
 * Actualiza una marca existente
 */
export async function updateBrand(
  id: string,
  data: Partial<Omit<BrandUpdate, 'id' | 'created_at'>>
): Promise<Brand> {
  const supabase = createAdminClient();

  // Si se actualiza el nombre y no hay slug nuevo, regenerar slug
  if (data.name && !data.slug) {
    data.slug = generateSlug(data.name);
  }

  const { data: brand, error } = await supabase
    .from('brands')
    .update({
      ...data,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar marca: ${error.message}`);
  }

  return brand as Brand;
}

/**
 * Elimina una marca (soft delete)
 */
export async function deleteBrand(id: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('brands')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar marca: ${error.message}`);
  }
}

/**
 * Activa/desactiva una marca
 */
export async function toggleBrandStatus(id: string): Promise<Brand> {
  const supabase = createAdminClient();

  // Obtener estado actual
  const { data: currentBrand } = await supabase
    .from('brands')
    .select('is_active')
    .eq('id', id)
    .single();

  const newStatus = !currentBrand?.is_active;

  const { data: brand, error } = await supabase
    .from('brands')
    .update({ is_active: newStatus })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al cambiar estado de marca: ${error.message}`);
  }

  return brand as Brand;
}

/**
 * Sube un logo de marca a Supabase Storage y retorna la URL
 */
export async function uploadBrandLogo(file: File): Promise<string> {
  const supabase = createAdminClient();

  // Validar tipo de archivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    throw new Error(`Tipo de archivo no válido: ${file.type}`);
  }

  // Validar tamaño (2MB máximo para logos)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    throw new Error(`Archivo demasiado grande: ${file.name}. Máximo 2MB`);
  }

  // Generar nombre único
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `brands/${fileName}`;

  // Convertir File a ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from('brand-logos')
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Error al subir logo: ${error.message}`);
  }

  // Obtener URL pública
  const {
    data: { publicUrl },
  } = supabase.storage.from('brand-logos').getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Genera un slug a partir de un nombre
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
}

