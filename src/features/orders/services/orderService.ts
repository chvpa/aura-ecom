import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';
import type { OrderWithItems } from '@/features/checkout/services/checkoutService';
import type { CartItem } from '@/features/cart/types/cart.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

/**
 * Obtiene todas las órdenes del usuario
 */
export async function getUserOrders(
  userId: string,
  status?: string
): Promise<OrderWithItems[]> {
  const supabase = await createClient();

  let query = supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

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
 * Obtiene una orden específica del usuario
 */
export async function getUserOrderById(
  orderId: string,
  userId: string
): Promise<OrderWithItems | null> {
  const supabase = await createClient();

  const { data: order, error: orderError } = await (supabase
    .from('orders') as any)
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single() as { data: Order | null; error: any };

  if (orderError || !order) {
    return null;
  }

  // Obtener items con productos
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*, products(*)')
    .eq('order_id', orderId);

  return {
    ...order,
    items: (orderItems || []) as Array<OrderItem & { product: Product }>,
  };
}

/**
 * Convierte items de orden a formato CartItem para re-ordenar
 */
export function reorderProducts(order: OrderWithItems): CartItem[] {
  return order.items
    .filter((item) => {
      const product = item.product as Product;
      // Solo incluir productos que existen, están activos y tienen stock
      return product && product.is_active && (product.stock || 0) > 0;
    })
    .map((item) => {
      const product = item.product as Product;
      const images = Array.isArray(product.images) ? product.images as string[] : [];
      return {
        productId: product.id,
        quantity: item.quantity,
        price: item.unit_price_pyg,
        name: product.name,
        image: images[0] || '',
        slug: product.slug,
        stock: product.stock || 0,
      };
    });
}

