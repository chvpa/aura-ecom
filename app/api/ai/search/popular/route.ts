import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Obtener búsquedas más populares agrupadas por query
    const { data, error } = await supabase
      .from('ai_search_history')
      .select('search_query')
      .not('search_query', 'is', null);

    if (error) {
      console.error('Error fetching popular searches:', error);
      return NextResponse.json(
        { error: 'Error al obtener búsquedas populares' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ searches: [] });
    }

    // Contar frecuencia de cada búsqueda
    const searchCounts: Record<string, number> = {};
    data.forEach((item: { search_query: string | null }) => {
      const query = item.search_query?.trim().toLowerCase();
      if (query) {
        searchCounts[query] = (searchCounts[query] || 0) + 1;
      }
    });

    // Ordenar por frecuencia y tomar top 10
    const popularSearches = Object.entries(searchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query]) => query);

    return NextResponse.json({ searches: popularSearches });
  } catch (error) {
    console.error('Error in popular searches:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al obtener búsquedas populares',
      },
      { status: 500 }
    );
  }
}

