'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getWishlist,
  addToWishlist as addToWishlistDB,
  removeFromWishlist as removeFromWishlistDB,
  getLocalWishlist,
  saveLocalWishlist,
  addToLocalWishlist,
  removeFromLocalWishlist,
} from '../services/wishlistService';
import { toast } from 'sonner';
import type { UseWishlistReturn } from '../types/wishlist.types';

export function useWishlist(): UseWishlistReturn {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar wishlist inicial
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      try {
        if (isAuthenticated && user) {
          // Cargar desde BD
          const dbItems = await getWishlist(user.id);
          setItems(dbItems);
          // Sincronizar localStorage con BD
          saveLocalWishlist(dbItems);
        } else {
          // Cargar desde localStorage
          const localItems = getLocalWishlist();
          setItems(localItems);
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
        // Fallback a localStorage
        const localItems = getLocalWishlist();
        setItems(localItems);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [isAuthenticated, user]);

  const addToWishlist = useCallback(
    async (productId: string) => {
      if (isAuthenticated && user) {
        const success = await addToWishlistDB(user.id, productId);
        if (success) {
          setItems((prev) => {
            const updated = prev.includes(productId) ? prev : [...prev, productId];
            saveLocalWishlist(updated);
            return updated;
          });
          toast.success('Agregado a tu wishlist');
        } else {
          toast.error('Error al agregar a wishlist');
        }
      } else {
        addToLocalWishlist(productId);
        setItems((prev) => {
          const updated = prev.includes(productId) ? prev : [...prev, productId];
          return updated;
        });
        toast.success('Agregado a tu wishlist');
      }
    },
    [isAuthenticated, user]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (isAuthenticated && user) {
        const success = await removeFromWishlistDB(user.id, productId);
        if (success) {
          setItems((prev) => {
            const updated = prev.filter((id) => id !== productId);
            saveLocalWishlist(updated);
            return updated;
          });
          toast.success('Eliminado de tu wishlist');
        } else {
          toast.error('Error al eliminar de wishlist');
        }
      } else {
        removeFromLocalWishlist(productId);
        setItems((prev) => prev.filter((id) => id !== productId));
        toast.success('Eliminado de tu wishlist');
      }
    },
    [isAuthenticated, user]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (items.includes(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    },
    [items, addToWishlist, removeFromWishlist]
  );

  const isInWishlist = useCallback(
    (productId: string) => items.includes(productId),
    [items]
  );

  return {
    items,
    isInWishlist,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    loading,
    count: items.length,
  };
}

