import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserOrders } from '@/features/orders/services/orderService';
import { OrdersClient } from './OrdersClient';

export const dynamic = 'force-dynamic';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener filtro de estado
  const params = await searchParams;
  const status = params.status || undefined;

  // Obtener órdenes iniciales
  const initialOrders = await getUserOrders(user.id, status);

  return <OrdersClient initialOrders={initialOrders} initialStatus={status} />;
}
