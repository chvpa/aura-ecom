'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils/formatters';
import type { OrderWithItems } from '@/features/checkout/services/checkoutService';
import { cn } from '@/lib/utils/cn';

interface OrderItemsListProps {
  order: OrderWithItems;
  className?: string;
}

export function OrderItemsList({ order, className }: OrderItemsListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold text-foreground">Productos</h3>
      <div className="space-y-3">
        {order.items.map((item) => {
          const product = item.product;
          const images = Array.isArray(product?.images) ? product.images : [];
          const imageUrl = (product?.main_image_url || (typeof images[0] === 'string' ? images[0] : null) || '/placeholder-product.jpg') as string;
          const productSlug = product?.slug || '#';
          const productName = product?.name || 'Producto';

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <Link href={`/productos/${productSlug}`} className="flex-shrink-0">
                <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={imageUrl}
                    alt={productName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              </Link>
              
              <div className="flex-1 min-w-0">
                <Link
                  href={`/productos/${productSlug}`}
                  className="font-medium text-foreground hover:text-primary transition-colors"
                >
                  {productName}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  Cantidad: {item.quantity}
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  {formatPrice(item.subtotal_pyg)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(item.unit_price_pyg)} c/u
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Resumen de totales */}
      <div className="mt-6 space-y-2 rounded-lg border bg-muted/50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(order.subtotal_pyg)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span className="font-medium">
            {order.shipping_cost_pyg === 0
              ? 'Gratis'
              : formatPrice(order.shipping_cost_pyg)}
          </span>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-semibold">
          <span>Total</span>
          <span className="text-primary">{formatPrice(order.total_pyg)}</span>
        </div>
      </div>
    </div>
  );
}

