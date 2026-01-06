'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '../store/cartStore';
import { toast } from 'sonner';

export function useCart() {
  const store = useCartStore();
  const router = useRouter();

  const addItem = (item: Parameters<typeof store.addItem>[0]) => {
    if (item.stock === 0) {
      toast.error('Este producto está agotado');
      return;
    }

    if (item.quantity > item.stock) {
      toast.error(`Solo hay ${item.stock} unidades disponibles`);
      return;
    }

    store.addItem(item);
    
    // Toast mejorado con imagen y opciones
    toast.success(`${item.name} agregado al carrito`, {
      description: `${item.quantity} unidad${item.quantity > 1 ? 'es' : ''}`,
      action: {
        label: 'Ver carrito',
        onClick: () => router.push('/carrito'),
      },
      duration: 4000,
    });
  };

  const removeItem = (productId: string) => {
    const item = store.items.find((i) => i.productId === productId);
    store.removeItem(productId);
    if (item) {
      toast.success(`${item.name} eliminado del carrito`);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = store.items.find((i) => i.productId === productId);
    if (!item) return;

    if (quantity > item.stock) {
      toast.error(`Solo hay ${item.stock} unidades disponibles`);
      return;
    }

    store.updateQuantity(productId, quantity);
  };

  const addItems = (items: Parameters<typeof store.addItems>[0]) => {
    // Validar cada item antes de agregar
    const validItems = items.filter((item) => {
      if (item.stock === 0) {
        toast.error(`${item.name} está agotado`);
        return false;
      }
      if (item.quantity > item.stock) {
        toast.error(`Solo hay ${item.stock} unidades disponibles de ${item.name}`);
        return false;
      }
      return true;
    });

    if (validItems.length > 0) {
      store.addItems(validItems);
      toast.success(
        `${validItems.length} producto(s) agregado(s) al carrito`
      );
    }
  };

  return {
    items: store.items,
    addItem,
    addItems,
    removeItem,
    updateQuantity,
    clearCart: store.clearCart,
    total: store.getTotal(),
    itemCount: store.getItemCount(),
    subtotal: store.getSubtotal(),
  };
}

