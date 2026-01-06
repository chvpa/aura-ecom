'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types/cart.types';
import { CART_STORAGE_KEY } from '@/lib/utils/constants';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  addItems: (items: CartItem[]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId
          );

          if (existingItem) {
            // Si ya existe, actualizar cantidad respetando stock máximo
            const newQuantity = Math.min(
              existingItem.quantity + item.quantity,
              item.stock
            );
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: newQuantity }
                  : i
              ),
            };
          }

          // Si no existe, agregar nuevo item
          return {
            items: [...state.items, { ...item, quantity: Math.min(item.quantity, item.stock) }],
          };
        }),

      addItems: (items) =>
        set((state) => {
          const newItems = [...state.items];
          
          items.forEach((item) => {
            const existingIndex = newItems.findIndex(
              (i) => i.productId === item.productId
            );

            if (existingIndex >= 0) {
              // Si ya existe, actualizar cantidad respetando stock máximo
              const existingItem = newItems[existingIndex];
              const newQuantity = Math.min(
                existingItem.quantity + item.quantity,
                item.stock
              );
              newItems[existingIndex] = {
                ...existingItem,
                quantity: newQuantity,
              };
            } else {
              // Si no existe, agregar nuevo item
              newItems.push({
                ...item,
                quantity: Math.min(item.quantity, item.stock),
              });
            }
          });

          return { items: newItems };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const item = state.items.find((i) => i.productId === productId);
          if (!item) return state;

          // Validar que la cantidad no exceda el stock
          const validQuantity = Math.max(1, Math.min(quantity, item.stock));

          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity: validQuantity } : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const items = get().items;
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        const items = get().items;
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        const items = get().items;
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: CART_STORAGE_KEY,
    }
  )
);

