'use client';

import { useCart } from '@/features/cart/hooks/useCart';
import { FREE_SHIPPING_MIN_ITEMS } from '@/lib/constants/paraguay';
import { CheckCircle2, Truck } from 'lucide-react';

export function FreeShippingProgress() {
  const { itemCount } = useCart();
  const itemsNeeded = Math.max(0, FREE_SHIPPING_MIN_ITEMS - itemCount);
  const progress = Math.min(100, (itemCount / FREE_SHIPPING_MIN_ITEMS) * 100);
  const hasFreeShipping = itemCount >= FREE_SHIPPING_MIN_ITEMS;

  if (hasFreeShipping) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800">
            🎉 ¡Envío gratis activado!
          </p>
          <p className="text-xs text-green-700">
            Has alcanzado el mínimo de {FREE_SHIPPING_MIN_ITEMS} unidades
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 bg-muted/50 border rounded-md">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Agrega {itemsNeeded} más para envío gratis
          </span>
        </div>
        <span className="font-medium text-primary">
          {itemCount}/{FREE_SHIPPING_MIN_ITEMS}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

