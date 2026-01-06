'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { OrderTimeline } from '@/features/orders/components/OrderTimeline';
import { OrderItemsList } from '@/features/orders/components/OrderItemsList';
import type { OrderStatus } from '@/features/orders/types/order.types';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils/formatters';
import type { OrderWithItems } from '@/features/checkout/services/checkoutService';
import { useCart } from '@/features/cart/hooks/useCart';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingBag, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface OrderDetailClientProps {
  order: OrderWithItems;
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();
  const { addItems } = useCart();
  const [reordering, setReordering] = useState(false);

  const shippingAddress = order.shipping_address as {
    full_name: string;
    phone: string;
    department: string;
    city: string;
    street: string;
    reference?: string;
  };

  const paymentMethodLabels: Record<string, string> = {
    transferencia: 'Transferencia Bancaria',
    giro: 'Giro',
    tarjeta: 'Tarjeta de Crédito/Débito',
  };

  const handleReorder = async () => {
    setReordering(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/reorder`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Error al re-ordenar');
        return;
      }

      if (data.unavailableItems && data.unavailableItems.length > 0) {
        toast.warning(
          `Algunos productos no están disponibles: ${data.unavailableItems.join(', ')}`
        );
      }

      // Agregar items al carrito
      if (data.items && data.items.length > 0) {
        addItems(data.items);
        // El método addItems ya muestra el toast de éxito
        router.push('/carrito');
      } else {
        toast.error('No hay productos disponibles para re-ordenar');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Error al re-ordenar productos');
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cuenta/pedidos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Detalle del Pedido</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(order.created_at || '')}
          </p>
        </div>
      </div>

      {/* Número de orden y estado */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Número de Orden</p>
            <p className="text-2xl font-bold text-foreground">
              {order.order_number}
            </p>
          </div>
          <OrderStatusBadge status={order.status as OrderStatus} />
        </div>
      </div>

      {/* Timeline */}
      {order.status !== 'cancelled' && (
        <div className="rounded-lg border bg-card p-6">
            <OrderTimeline currentStatus={order.status as OrderStatus} />
        </div>
      )}

      {/* Grid de información */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Productos */}
        <div className="rounded-lg border bg-card p-6">
          <OrderItemsList order={order} />
        </div>

        {/* Información de envío y pago */}
        <div className="space-y-6">
          {/* Dirección de envío */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Dirección de Envío
            </h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{shippingAddress.full_name}</p>
              <p className="text-muted-foreground">{shippingAddress.phone}</p>
              <p className="text-muted-foreground">{shippingAddress.street}</p>
              <p className="text-muted-foreground">
                {shippingAddress.city}, {shippingAddress.department}
              </p>
              {shippingAddress.reference && (
                <p className="mt-2 text-muted-foreground">
                  <span className="font-medium">Referencia:</span>{' '}
                  {shippingAddress.reference}
                </p>
              )}
            </div>
          </div>

          {/* Información de pago */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Información de Pago
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método de Pago</span>
                <span className="font-medium">
                  {paymentMethodLabels[order.payment_method] ||
                    order.payment_method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado de Pago</span>
                <span className="font-medium capitalize">
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>

          {/* Tracking */}
          {order.tracking_number && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Número de Seguimiento
              </h3>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                {order.tracking_number.startsWith('http') ? (
                  <a
                    href={order.tracking_number}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {order.tracking_number}
                  </a>
                ) : (
                  <p className="text-sm font-mono">{order.tracking_number}</p>
                )}
              </div>
            </div>
          )}

          {/* Notas */}
          {order.notes && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Notas
              </h3>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handleReorder}
          disabled={reordering || order.status === 'cancelled'}
          className="flex-1"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {reordering ? 'Agregando...' : 'Re-ordenar'}
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/perfumes">Seguir Comprando</Link>
        </Button>
      </div>
    </div>
  );
}

