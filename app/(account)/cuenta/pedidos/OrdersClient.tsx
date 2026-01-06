'use client';

import { useEffect, useState } from 'react';
import { OrderCard } from '@/features/orders/components/OrderCard';
import { OrderFilters } from '@/features/orders/components/OrderFilters';
import type { OrderWithItems } from '@/features/checkout/services/checkoutService';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface OrdersClientProps {
  initialOrders: OrderWithItems[];
  initialStatus?: string;
}

export function OrdersClient({ initialOrders, initialStatus }: OrdersClientProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(initialStatus || 'all');

  useEffect(() => {
    // Sincronizar con query params
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get('status') || 'all';
    setStatus(statusParam);

    // Si el status cambió, recargar órdenes
    if (statusParam !== initialStatus) {
      loadOrders(statusParam === 'all' ? undefined : statusParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async (filterStatus?: string) => {
    setLoading(true);
    try {
      const url = filterStatus
        ? `/api/orders?status=${filterStatus}`
        : '/api/orders';
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No hay pedidos</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          {status === 'all'
            ? 'Aún no has realizado ningún pedido.'
            : 'No hay pedidos con este estado.'}
        </p>
        <Button asChild>
          <Link href="/productos">Explorar Productos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Pedidos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
          </p>
        </div>
        <OrderFilters />
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

