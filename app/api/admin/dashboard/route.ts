import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/utils/admin';
import { getDashboardStats } from '@/features/admin/services/adminService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
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

    const stats = await getDashboardStats();

    return NextResponse.json(
      { stats },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener estadísticas',
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

