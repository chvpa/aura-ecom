import { createClient } from '@/lib/supabase/server';
import type { ShippingAddress } from '@/lib/validations/checkout';

export interface SavedAddress {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  department: string;
  city: string;
  street: string;
  reference?: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  label: string;
  full_name: string;
  phone: string;
  department: string;
  city: string;
  street: string;
  reference?: string;
  is_default?: boolean;
}

/**
 * Obtiene todas las direcciones guardadas del usuario
 */
export async function getSavedAddresses(userId: string): Promise<SavedAddress[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('saved_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved addresses:', error);
    return [];
  }

  return (data || []) as SavedAddress[];
}

/**
 * Obtiene la dirección por defecto del usuario
 */
export async function getDefaultAddress(userId: string): Promise<SavedAddress | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('saved_addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No se encontró dirección por defecto
      return null;
    }
    console.error('Error fetching default address:', error);
    return null;
  }

  return data as SavedAddress;
}

/**
 * Guarda una nueva dirección
 */
export async function saveAddress(
  userId: string,
  addressData: CreateAddressData
): Promise<SavedAddress | null> {
  const supabase = await createClient();

  // Si se marca como default, asegurar que solo haya una
  if (addressData.is_default) {
    await (supabase
      .from('saved_addresses') as any)
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);
  }

  const insertPayload = {
    user_id: userId,
    ...addressData,
  };
  const { data, error } = await (supabase
    .from('saved_addresses') as any)
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error('Error saving address:', error);
    return null;
  }

  return data as SavedAddress;
}

/**
 * Actualiza una dirección existente
 */
export async function updateAddress(
  addressId: string,
  userId: string,
  addressData: Partial<CreateAddressData>
): Promise<SavedAddress | null> {
  const supabase = await createClient();

  // Si se marca como default, asegurar que solo haya una
  if (addressData.is_default) {
    await (supabase
      .from('saved_addresses') as any)
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true)
      .neq('id', addressId);
  }

  const { data, error } = await (supabase
    .from('saved_addresses') as any)
    .update(addressData)
    .eq('id', addressId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating address:', error);
    return null;
  }

  return data as SavedAddress;
}

/**
 * Elimina una dirección guardada
 */
export async function deleteAddress(addressId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('saved_addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting address:', error);
    return false;
  }

  return true;
}

/**
 * Establece una dirección como por defecto
 */
export async function setDefaultAddress(addressId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();

  // Primero desmarcar todas las direcciones por defecto
  await (supabase
    .from('saved_addresses') as any)
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('is_default', true);

  // Luego marcar la nueva como default
  const { error } = await (supabase
    .from('saved_addresses') as any)
    .update({ is_default: true })
    .eq('id', addressId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error setting default address:', error);
    return false;
  }

  return true;
}

/**
 * Convierte una SavedAddress a ShippingAddress
 */
export function savedAddressToShippingAddress(address: SavedAddress): ShippingAddress {
  return {
    full_name: address.full_name,
    phone: address.phone,
    department: address.department,
    city: address.city,
    street: address.street,
    reference: address.reference || undefined,
  };
}

