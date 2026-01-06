import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database.types';
import type { OrderWithItems } from '@/features/checkout/services/checkoutService';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  averageTicket: number;
  lowStockProducts: number;
  salesData: Array<{ date: string; sales: number }>;
  recentOrders: OrderWithItems[];
  lowStockItems: Array<{ id: string; name: string; stock: number; sku: string }>;
}

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  orderNumber?: string;
}

/**
 * Obtiene estadísticas del dashboard
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Obtener todas las órdenes entregadas para calcular ventas
  const { data: deliveredOrders } = await supabase
    .from('orders')
    .select('total_pyg, created_at')
    .eq('status', 'delivered');

  // Calcular total de ventas
  const totalSales =
    deliveredOrders?.reduce((sum: number, order: Order) => sum + order.total_pyg, 0) || 0;

  // Obtener total de pedidos
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  // Calcular ticket promedio
  const averageTicket =
    deliveredOrders && deliveredOrders.length > 0
      ? Math.round(totalSales / deliveredOrders.length)
      : 0;

  // Obtener productos con stock bajo
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('id, name, stock, sku')
    .lt('stock', 10)
    .eq('is_active', true)
    .limit(10);

  // Obtener datos de ventas últimos 30 días
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentOrdersData } = await supabase
    .from('orders')
    .select('total_pyg, created_at, status')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .eq('status', 'delivered')
    .order('created_at', { ascending: true });

  // Agrupar ventas por día
  const salesByDate: Record<string, number> = {};
  recentOrdersData?.forEach((order: Order) => {
    const date = new Date(order.created_at || '').toISOString().split('T')[0];
    salesByDate[date] = (salesByDate[date] || 0) + order.total_pyg;
  });

  const salesData = Object.entries(salesByDate)
    .map(([date, sales]) => ({ date, sales }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Obtener últimos pedidos
  const { data: recentOrders } = await (supabase
    .from('orders') as any)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10) as { data: Order[] | null; error: any };

  // Obtener items para cada orden reciente
  const recentOrdersWithItems: OrderWithItems[] = [];
  if (recentOrders) {
    for (const order of recentOrders) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*, products(*)')
        .eq('order_id', order.id);

      recentOrdersWithItems.push({
        ...order,
        items: (orderItems || []) as Array<OrderItem & { product: Product }>,
      });
    }
  }

  return {
    totalSales,
    totalOrders: totalOrders || 0,
    averageTicket,
    lowStockProducts: lowStockProducts?.length || 0,
    salesData,
    recentOrders: recentOrdersWithItems,
    lowStockItems:
      lowStockProducts?.map((p: Product) => ({
        id: p.id,
        name: p.name,
        stock: p.stock || 0,
        sku: p.sku,
      })) || [],
  };
}

/**
 * Obtiene todas las órdenes (admin)
 */
export async function getAllOrders(
  filters?: OrderFilters
): Promise<OrderWithItems[]> {
  const supabase = createAdminClient();

  let query = supabase.from('orders').select('*');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  if (filters?.orderNumber) {
    query = query.ilike('order_number', `%${filters.orderNumber}%`);
  }

  query = query.order('created_at', { ascending: false });

  const { data: orders, error } = await query;

  if (error || !orders) {
    return [];
  }

  // Obtener items para cada orden
  const ordersWithItems = await Promise.all(
    orders.map(async (order: Order) => {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*, products(*)')
        .eq('order_id', order.id);

      return {
        ...order,
        items: (orderItems || []) as Array<OrderItem & { product: Product }>,
      };
    })
  );

  return ordersWithItems as OrderWithItems[];
}

/**
 * Actualiza el estado de una orden
 */
export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Error al actualizar estado: ${error.message}`);
  }
}

/**
 * Actualiza el número de tracking de una orden
 */
export async function updateOrderTracking(
  orderId: string,
  trackingNumber: string
): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('orders')
    .update({
      tracking_number: trackingNumber,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Error al actualizar tracking: ${error.message}`);
  }
}

/**
 * Actualiza el estado de pago de una orden
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: string
): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Error al actualizar estado de pago: ${error.message}`);
  }
}

