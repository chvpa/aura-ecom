import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMatch } from '@/lib/services/match';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Parsear body
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'productId es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario tenga perfil completado
    const { data: profile } = await (supabase
      .from('user_profiles') as any)
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single() as { data: { onboarding_completed: boolean | null } | null; error: any };

    if (!profile || !profile.onboarding_completed) {
      return NextResponse.json(
        { error: 'Debes completar el onboarding primero' },
        { status: 403 }
      );
    }

    // Calcular match
    const result = await getMatch(user.id, productId);

    return NextResponse.json({
      matchPercentage: result.percentage,
      reasons: result.reasons || null,
    });
  } catch (error) {
    console.error('Error calculating match:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al calcular el match',
      },
      { status: 500 }
    );
  }
}

