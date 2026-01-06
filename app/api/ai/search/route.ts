import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { performAISearch } from '@/lib/services/aiSearch';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Obtener usuario (opcional, puede ser null)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Parsear body
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'La consulta de búsqueda es requerida' },
        { status: 400 }
      );
    }

    // Realizar búsqueda con IA
    const result = await performAISearch(query.trim(), user?.id || null);

    return NextResponse.json({
      products: result.products,
      filters: result.filters,
      explanation: result.explanation,
      context: result.context,
      total: result.total,
    });
  } catch (error) {
    console.error('Error in AI search:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al realizar la búsqueda con IA',
      },
      { status: 500 }
    );
  }
}

