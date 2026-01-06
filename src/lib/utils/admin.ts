import { createClient } from '@/lib/supabase/server';

/**
 * Verifica si un usuario es administrador
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: profile, error } = await (supabase
    .from('user_profiles') as any)
    .select('role')
    .eq('user_id', userId)
    .single() as { data: { role: string | null } | null; error: any };

  if (error || !profile) {
    return false;
  }

  return profile.role === 'admin';
}

/**
 * Obtiene el role del usuario
 */
export async function getUserRole(userId: string): Promise<'user' | 'admin' | null> {
  const supabase = await createClient();

  const { data: profile, error } = await (supabase
    .from('user_profiles') as any)
    .select('role')
    .eq('user_id', userId)
    .single() as { data: { role: string | null } | null; error: any };

  if (error || !profile) {
    return null;
  }

  return (profile.role as 'user' | 'admin') || 'user';
}

