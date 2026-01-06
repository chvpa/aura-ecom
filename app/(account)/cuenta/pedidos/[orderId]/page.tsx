import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserOrderById } from '@/features/orders/services/orderService';
import { OrderDetailClient } from './OrderDetailClient';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener orden
  const order = await getUserOrderById(orderId, user.id);

  if (!order) {
    redirect('/cuenta/pedidos');
  }

  return <OrderDetailClient order={order} />;
}

