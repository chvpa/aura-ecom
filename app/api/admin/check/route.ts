import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/utils/admin';

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
        { isAdmin: false },
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const adminStatus = await isAdmin(user.id);

    return NextResponse.json(
      { isAdmin: adminStatus },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { isAdmin: false },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

