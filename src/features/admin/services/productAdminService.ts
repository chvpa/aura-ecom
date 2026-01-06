import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

/**
 * Crea un nuevo producto
 * Usa el cliente admin para bypasear RLS
 */
export async function createProduct(
  data: ProductInsert
): Promise<Product> {
  const supabase = createAdminClient();

  const { data: product, error } = await supabase
    .from('products')
    .insert(data)
    .select()
    .single();

  if (error || !product) {
    console.error('Supabase insert error:', error);
    throw new Error(`Error al crear producto: ${error?.message || 'Unknown error'}`);
  }

  return product;
}

/**
 * Actualiza un producto existente
 * Usa el cliente admin para bypasear RLS
 */
export async function updateProduct(
  id: string,
  data: ProductUpdate
): Promise<Product> {
  const supabase = createAdminClient();

  console.log('updateProduct called with:', { id, data: JSON.stringify(data, null, 2) });

  // Limpiar datos: remover campos undefined y convertir objetos vacíos a null
  const cleanedData: Record<string, unknown> = { ...data };
  
  // Remover campos undefined
  Object.keys(cleanedData).forEach(key => {
    if (cleanedData[key] === undefined) {
      delete cleanedData[key];
    }
  });

  // Convertir objetos vacíos a null para campos JSONB
  if (cleanedData.main_accords && typeof cleanedData.main_accords === 'object' && Object.keys(cleanedData.main_accords as object).length === 0) {
    cleanedData.main_accords = null;
  }
  
  const notes = cleanedData.notes as { top?: string[]; heart?: string[]; base?: string[] } | null;
  if (notes && typeof notes === 'object' && 
      (!notes.top?.length && !notes.heart?.length && !notes.base?.length)) {
    cleanedData.notes = null;
  }
  
  const characteristics = cleanedData.characteristics as { intensity?: string; occasion?: string[] } | null;
  if (characteristics && typeof characteristics === 'object' && 
      !characteristics.intensity && !characteristics.occasion?.length) {
    cleanedData.characteristics = null;
  }

  cleanedData.updated_at = new Date().toISOString();

  console.log('Cleaned data for update:', JSON.stringify(cleanedData, null, 2));

  const { data: product, error } = await supabase
    .from('products')
    .update(cleanedData as ProductUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase update error:', error);
    throw new Error(`Error al actualizar producto: ${error.message || 'Unknown error'}`);
  }

  if (!product) {
    throw new Error('Producto no encontrado después de la actualización');
  }

  return product;
}

/**
 * Cambia el estado activo/inactivo de un producto
 * Usa el cliente admin para bypasear RLS
 */
export async function toggleProductStatus(id: string): Promise<void> {
  const supabase = createAdminClient();

  // Obtener estado actual
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('is_active')
    .eq('id', id)
    .single();

  if (fetchError || !product) {
    throw new Error('Producto no encontrado');
  }

  const { error } = await supabase
    .from('products')
    .update({
      is_active: !product.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Error al cambiar estado: ${error.message}`);
  }
}

/**
 * Sube imágenes a Supabase Storage y retorna las URLs
 * Usa el cliente admin para bypasear RLS en Storage
 */
export async function uploadProductImages(
  files: File[]
): Promise<string[]> {
  const supabase = createAdminClient();

  const uploadedUrls: string[] = [];

  for (const file of files) {
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error(`Tipo de archivo no válido: ${file.type}`);
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(`Archivo demasiado grande: ${file.name}`);
    }

    // Generar nombre único
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Convertir File a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(`Error al subir imagen: ${error.message}`);
    }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(filePath);

    uploadedUrls.push(publicUrl);
  }

  return uploadedUrls;
}

/**
 * Obtiene todos los productos (admin - incluye inactivos)
 * Usa el cliente regular ya que SELECT generalmente está permitido
 */
export async function getAllProductsAdmin(filters?: {
  search?: string;
  brandId?: string;
  isActive?: boolean;
  lowStock?: boolean;
}): Promise<Product[]> {
  // Usamos el cliente admin para asegurar acceso a todos los productos
  const supabase = createAdminClient();

  let query = supabase.from('products').select('*');

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
  }

  if (filters?.brandId) {
    query = query.eq('brand_id', filters.brandId);
  }

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  if (filters?.lowStock) {
    query = query.lt('stock', 10);
  }

  query = query.order('created_at', { ascending: false });

  const { data: products, error } = await query;

  if (error) {
    throw new Error(`Error al obtener productos: ${error.message}`);
  }

  return products || [];
}
