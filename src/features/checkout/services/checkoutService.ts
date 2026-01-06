import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';
import type { CartItem } from '@/features/cart/types/cart.types';
import type { CheckoutFormData } from '@/lib/validations/checkout';
import type { ParaguayDepartment } from '@/lib/constants/paraguay';
import { calculateShippingCost } from '../utils/shipping';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

/**
 * Genera un número de orden único
 * Formato: AU-{YYYY}{MM}{DD}-{4 dígitos aleatorios}
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000); // 4 dígitos entre 1000-9999
  return `AU-${year}${month}${day}-${random}`;
}

/**
 * Valida que haya stock disponible para todos los items
 */
export async function validateStock(items: CartItem[]): Promise<{
  valid: boolean;
  errors: Array<{ productId: string; productName: string; available: number; requested: number }>;
}> {
  const supabase = await createClient();
  const errors: Array<{ productId: string; productName: string; available: number; requested: number }> = [];

  for (const item of items) {
    const { data: product, error } = await (supabase
      .from('products') as any)
      .select('id, name, stock')
      .eq('id', item.productId)
      .single() as { data: { id: string; name: string; stock: number } | null; error: any };

    if (error || !product) {
      errors.push({
        productId: item.productId,
        productName: item.name,
        available: 0,
        requested: item.quantity,
      });
      continue;
    }

    if (product.stock < item.quantity) {
      errors.push({
        productId: item.productId,
        productName: item.name,
        available: product.stock,
        requested: item.quantity,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Crea una orden en la base de datos
 */
export async function createOrder(
  userId: string,
  formData: CheckoutFormData,
  cartItems: CartItem[]
): Promise<Order> {
  const supabase = await createClient();

  // Validar stock antes de crear orden
  const stockValidation = await validateStock(cartItems);
  if (!stockValidation.valid) {
    const errorMessages = stockValidation.errors.map(
      (e) => `${e.productName}: Stock disponible ${e.available}, solicitado ${e.requested}`
    );
    throw new Error(`Stock insuficiente: ${errorMessages.join('; ')}`);
  }

  // Calcular totales
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = calculateShippingCost(cartItems, formData.shipping.department as ParaguayDepartment);
  const total = subtotal + shippingCost;

  // Generar número de orden único
  let orderNumber = generateOrderNumber();
  let attempts = 0;
  const maxAttempts = 10;

  // Verificar unicidad del número de orden
  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .single();

    if (!existing) {
      break; // Número único encontrado
    }

    orderNumber = generateOrderNumber();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Error al generar número de orden único');
  }

  // Crear orden
  const orderData: OrderInsert = {
    order_number: orderNumber,
    user_id: userId,
    status: 'pending',
    subtotal_pyg: subtotal,
    shipping_cost_pyg: shippingCost,
    total_pyg: total,
    payment_method: formData.payment_method,
    payment_status: 'pending',
    shipping_address: formData.shipping, // JSONB field accepts JSON-serializable object
    notes: formData.notes || null,
  };

  const { data: order, error: orderError } = await (supabase
    .from('orders') as any)
    .insert(orderData)
    .select()
    .single();

  if (orderError || !order) {
    throw new Error(`Error al crear orden: ${orderError?.message || 'Unknown error'}`);
  }

  // Crear order items y reducir stock
  const orderItems: OrderItemInsert[] = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price_pyg: item.price,
    subtotal_pyg: item.price * item.quantity,
  }));

  const { error: itemsError } = await (supabase.from('order_items') as any).insert(orderItems);

  if (itemsError) {
    // Rollback: eliminar orden si falla crear items
    await supabase.from('orders').delete().eq('id', order.id);
    throw new Error(`Error al crear items de orden: ${itemsError.message}`);
  }

  // Reducir stock de productos (método directo sin RPC)
  for (const item of cartItems) {
    try {
      // Obtener stock actual
      const { data: product, error: fetchError } = await (supabase
        .from('products') as any)
        .select('stock')
        .eq('id', item.productId)
        .single() as { data: { stock: number } | null; error: any };

      if (fetchError) {
        console.error(`Error al obtener stock de producto ${item.productId}:`, fetchError);
        continue;
      }

      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
          const { error: updateError } = await (supabase
            .from('products') as any)
            .update({ stock: newStock })
            .eq('id', item.productId);

        if (updateError) {
          console.error(`Error al actualizar stock de producto ${item.productId}:`, updateError);
        }
      }
    } catch (err) {
      console.error(`Error inesperado al reducir stock de producto ${item.productId}:`, err);
      // No fallar la orden si solo falla el stock update
    }
  }

  // El email se envía desde la API route después de crear la orden
  return order;
}

/**
 * Obtiene una orden con sus items y productos
 */
export async function getOrderWithItems(
  orderId: string,
  userId: string
): Promise<OrderWithItems | null> {
  const supabase = await createClient();

  // Obtener orden
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

type OrderItem = Database['public']['Tables']['order_items']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

export interface OrderWithItems extends Order {
  items: Array<OrderItem & { product: Product }>;
}

