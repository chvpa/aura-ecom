'use client';

import { createClient } from '@/lib/supabase/client';
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
 * Obtiene todas las direcciones guardadas del usuario (cliente)
 */
export async function getSavedAddressesClient(userId: string): Promise<SavedAddress[]> {
  const supabase = createClient();

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
 * Guarda una nueva dirección (cliente)
 */
export async function saveAddressClient(
  userId: string,
  addressData: CreateAddressData
): Promise<SavedAddress | null> {
  const supabase = createClient();

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

