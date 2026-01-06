'use client';

import { createClient } from '@/lib/supabase/client';

export async function getWishlist(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }

  return data.map((item: { product_id: string }) => item.product_id);
}

export async function addToWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('wishlists')
    .insert({
      user_id: userId,
      product_id: productId,
    } as never);

  if (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }

  return true;
}

export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }

  return true;
}

import { WISHLIST_STORAGE_KEY } from '@/lib/utils/constants';

export function getLocalWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveLocalWishlist(productIds: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(productIds));
}

export function addToLocalWishlist(productId: string): void {
  const current = getLocalWishlist();
  if (!current.includes(productId)) {
    saveLocalWishlist([...current, productId]);
  }
}

export function removeFromLocalWishlist(productId: string): void {
  const current = getLocalWishlist();
  saveLocalWishlist(current.filter((id) => id !== productId));
}

