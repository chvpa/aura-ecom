import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/utils/admin';
import { getUserOrderById } from '@/features/orders/services/orderService';
import {
  updateOrderStatus,
  updateOrderTracking,
  updateOrderPaymentStatus,
} from '@/features/admin/services/adminService';
import type { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const supabase = await createClient();

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

    const userIsAdmin = await isAdmin(user.id);

    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Para admin, obtener orden sin verificar user_id
    const { data: order, error: orderError } = await (supabase
      .from('orders') as any)
      .select('*')
      .eq('id', orderId)
      .single() as { data: Database['public']['Tables']['orders']['Row'] | null; error: any };

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Obtener items
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', orderId);

    const orderWithItems = {
      ...order,
      items: orderItems || [],
    };

    return NextResponse.json(
      { order: orderWithItems },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener pedido',
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const supabase = await createClient();

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

    const userIsAdmin = await isAdmin(user.id);

    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    const { status, trackingNumber, paymentStatus } = body;

    if (status) {
      await updateOrderStatus(orderId, status);
    }

    if (trackingNumber !== undefined) {
      await updateOrderTracking(orderId, trackingNumber);
    }

    if (paymentStatus) {
      await updateOrderPaymentStatus(orderId, paymentStatus);
    }

    // Devolver la orden actualizada usando cliente admin para evitar RLS
    const adminSupabase = createAdminClient();
    const { data: updatedOrder } = await adminSupabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    return NextResponse.json(
      { success: true, order: updatedOrder },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      {
        error: 'Error al actualizar pedido',
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

