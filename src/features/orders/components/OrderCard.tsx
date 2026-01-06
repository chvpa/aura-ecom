'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils/formatters';
import { formatDate } from '@/lib/utils/formatters';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { OrderWithItems } from '@/features/checkout/services/checkoutService';
import type { OrderStatus } from '../types/order.types';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface OrderCardProps {
  order: OrderWithItems;
  className?: string;
}

export function OrderCard({ order, className }: OrderCardProps) {
  const firstItem = order.items?.[0];
  const product = firstItem?.product;
  const images = Array.isArray(product?.images) ? product.images : [];
  const imageUrl = (product?.main_image_url || (typeof images[0] === 'string' ? images[0] : null) || '/placeholder-product.jpg') as string;
  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Imagen del primer producto */}
        <div className="flex-shrink-0">
          <div className="relative h-20 w-20 overflow-hidden rounded-md bg-muted">
            <Image
              src={imageUrl}
              alt={product?.name || 'Producto'}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        </div>

        {/* Información principal */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-foreground">
                  {order.order_number}
                </h3>
                <OrderStatusBadge status={order.status as OrderStatus} />
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.created_at || '')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <p className="text-lg font-semibold text-foreground">
                {formatPrice(order.total_pyg)}
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Link href={`/cuenta/pedidos/${order.id}`}>
                  Ver Detalle
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

