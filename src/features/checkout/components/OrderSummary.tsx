'use client';

import Image from 'next/image';
import { useCart } from '@/features/cart/hooks/useCart';
import { formatPrice } from '@/lib/utils/formatters';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/features/cart/components/CartItem';
import { useMemo } from 'react';
import type { ParaguayDepartment } from '@/lib/constants/paraguay';
import { calculateShippingCost } from '@/features/checkout/utils/shipping';

interface OrderSummaryProps {
  shippingDepartment?: ParaguayDepartment;
  orderNumber?: string;
}

export function OrderSummary({ shippingDepartment, orderNumber }: OrderSummaryProps) {
  const { items, subtotal } = useCart();

  const shippingCost = useMemo(() => {
    if (!shippingDepartment) return 0;
    return calculateShippingCost(items, shippingDepartment);
  }, [items, shippingDepartment]);

  const total = subtotal + shippingCost;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {orderNumber ? `Orden ${orderNumber}` : 'Resumen de compra'}
        </h3>
        {orderNumber && (
          <p className="text-sm text-muted-foreground mb-4">
            Tu orden ha sido confirmada exitosamente
          </p>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="flex items-start gap-3 text-sm">
            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-muted-foreground">
                Cantidad: {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
            <div className="font-medium">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span className="font-medium">
            {shippingCost === 0 ? (
              <span className="text-green-600">Gratis</span>
            ) : (
              formatPrice(shippingCost)
            )}
          </span>
        </div>
        {totalItems >= 3 && shippingCost > 0 && (
          <p className="text-xs text-green-600">
            🎉 ¡Envío gratis por comprar 3 o más unidades!
          </p>
        )}
      </div>

      <Separator />

      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span className="text-primary">{formatPrice(total)}</span>
      </div>
    </div>
  );
}

