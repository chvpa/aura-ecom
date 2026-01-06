import { OrderDetailAdminClient } from './OrderDetailAdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <OrderDetailAdminClient orderId={orderId} />;
}

