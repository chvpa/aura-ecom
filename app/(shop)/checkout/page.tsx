import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CheckoutClient } from './CheckoutClient';

export default async function CheckoutPage() {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/checkout');
  }

  return <CheckoutClient />;
}

