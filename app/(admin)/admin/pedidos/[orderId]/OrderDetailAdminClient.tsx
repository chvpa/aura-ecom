'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { OrderTimeline } from '@/features/orders/components/OrderTimeline';
import type { OrderStatus } from '@/features/orders/types/order.types';
import { OrderItemsList } from '@/features/orders/components/OrderItemsList';
import { OrderStatusUpdate } from '@/features/admin/components/OrderStatusUpdate';
import { formatPrice, formatDate } from '@/lib/utils/formatters';
import type { OrderWithItems } from '@/features/checkout/services/checkoutService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderDetailAdminClientProps {
  orderId: string;
}

export function OrderDetailAdminClient({ orderId }: OrderDetailAdminClientProps) {
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await response.json();
      if (response.ok) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return <div>Orden no encontrada</div>;
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/pedidos">
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Número de Orden</p>
              <p className="text-2xl font-bold text-foreground">
                {order.order_number}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <OrderStatusBadge status={order.status as OrderStatus} />
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  order.payment_status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : order.payment_status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : order.payment_status === 'refunded'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {order.payment_status === 'paid'
                  ? 'Pagado'
                  : order.payment_status === 'failed'
                  ? 'Fallido'
                  : order.payment_status === 'refunded'
                  ? 'Reembolsado'
                  : 'Pago Pendiente'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actualizar estado (Admin) */}
      <OrderStatusUpdate
        orderId={order.id}
        currentStatus={order.status as OrderStatus}
        currentPaymentStatus={order.payment_status || 'pending'}
        currentTracking={order.tracking_number}
        onUpdate={loadOrder}
      />

      {/* Timeline */}
      {order.status !== 'cancelled' && (
        <Card>
          <CardContent className="pt-6">
            <OrderTimeline currentStatus={order.status as OrderStatus} />
          </CardContent>
        </Card>
      )}

      {/* Grid de información */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Productos */}
        <Card>
          <CardContent className="pt-6">
            <OrderItemsList order={order} />
          </CardContent>
        </Card>

        {/* Información de envío y pago */}
        <div className="space-y-6">
          {/* Dirección de envío */}
          <Card>
            <CardHeader>
              <CardTitle>Dirección de Envío</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Información de pago */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método de Pago</span>
                  <span className="font-medium">
                    {paymentMethodLabels[order.payment_method] ||
                      order.payment_method}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estado de Pago</span>
                  <span
                    className={`font-medium capitalize px-2 py-1 rounded text-xs ${
                      order.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : order.payment_status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : order.payment_status === 'refunded'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.payment_status === 'paid'
                      ? 'Pagado'
                      : order.payment_status === 'failed'
                      ? 'Fallido'
                      : order.payment_status === 'refunded'
                      ? 'Reembolsado'
                      : 'Pendiente'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking */}
          {order.tracking_number && (
            <Card>
              <CardHeader>
                <CardTitle>Número de Seguimiento</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

