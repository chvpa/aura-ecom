import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrderById, reorderProducts } from '@/features/orders/services/orderService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const supabase = await createClient();

    // Verificar usuario autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Obtener orden del usuario
    const order = await getUserOrderById(orderId, user.id);

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Convertir items de orden a CartItem
    const cartItems = reorderProducts(order);

    if (cartItems.length === 0) {
      return NextResponse.json(
        {
          error: 'No hay productos disponibles para re-ordenar',
          message: 'Todos los productos de esta orden están agotados o descontinuados',
        },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar stock de cada producto
    const unavailableItems: string[] = [];
    const availableItems = [];

    for (const item of cartItems) {
      const { data: product } = await (supabase
        .from('products') as any)
        .select('id, name, stock, is_active')
        .eq('id', item.productId)
        .single() as { data: { id: string; name: string; stock: number; is_active: boolean | null } | null; error: any };

      if (!product || !product.is_active) {
        unavailableItems.push(item.name);
        continue;
      }

      if ((product.stock || 0) < item.quantity) {
        unavailableItems.push(
          `${item.name} (disponible: ${product.stock}, solicitado: ${item.quantity})`
        );
        // Agregar con cantidad disponible si hay stock
        if ((product.stock || 0) > 0) {
          availableItems.push({
            ...item,
            quantity: Math.min(item.quantity, product.stock || 0),
          });
        }
      } else {
        availableItems.push(item);
      }
    }

    return NextResponse.json(
      {
        items: availableItems,
        unavailableItems,
        warnings:
          unavailableItems.length > 0
            ? `Algunos productos no están disponibles: ${unavailableItems.join(', ')}`
            : undefined,
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error reordering products:', error);
    return NextResponse.json(
      {
        error: 'Error al re-ordenar productos',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

