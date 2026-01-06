'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { KPICard } from '@/components/admin/KPICard';
import { formatPrice, formatDate } from '@/lib/utils/formatters';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import type { OrderStatus } from '@/features/orders/types/order.types';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardStats } from '@/features/admin/services/adminService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/admin/dashboard');
        const data = await response.json();
        if (response.ok) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de ventas y pedidos
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Ventas"
          value={stats.totalSales}
          icon={DollarSign}
        />
        <KPICard
          title="Total Pedidos"
          value={stats.totalOrders}
          icon={ShoppingBag}
        />
        <KPICard
          title="Ticket Promedio"
          value={stats.averageTicket}
          icon={TrendingUp}
        />
        <KPICard
          title="Stock Bajo"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
        />
      </div>

      {/* Gráfico de Ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Últimos 30 Días</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `₲${(value / 1000000).toFixed(1)}M`;
                    }
                    if (value >= 1000) {
                      return `₲${(value / 1000).toFixed(0)}K`;
                    }
                    return `₲${value}`;
                  }}
                />
                <Tooltip
                  formatter={(value) => formatPrice(value as number)}
                  labelFormatter={(label) => formatDate(label as string, 'dd/MM/yyyy')}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              No hay datos de ventas disponibles
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Últimos Pedidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Últimos Pedidos</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/pedidos">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/pedidos/${order.id}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at || '')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <OrderStatusBadge status={order.status as OrderStatus} />
                        <p className="font-semibold">
                          {formatPrice(order.total_pyg)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  No hay pedidos recientes
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Productos con Stock Bajo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Stock Bajo</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/productos?filter=low_stock">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.lowStockItems.length > 0 ? (
                stats.lowStockItems.map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/productos/${product.id}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            product.stock < 5 ? 'text-red-600' : 'text-yellow-600'
                          }`}
                        >
                          {product.stock} unidades
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Todos los productos tienen stock suficiente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

