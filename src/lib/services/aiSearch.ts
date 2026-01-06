import { generateContent } from '@/lib/deepseek/client';
import { getSearchPrompt } from '@/lib/deepseek/prompts';
import { getProducts, type ProductFilters } from './products';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

export interface ParsedContext {
  gender: 'Hombre' | 'Mujer' | 'Unisex' | null;
  occasion: 'Diurno' | 'Nocturno' | 'Formal' | 'Casual' | 'Romántico' | 'Deportivo' | null;
  intensity: 'Baja' | 'Moderada' | 'Alta' | null;
  climate: 'Calor' | 'Frío' | 'Templado' | null;
  event: 'Tereré' | 'Asado' | 'Fiesta' | 'Cita' | 'Trabajo' | null;
  priceRange: {
    min: number | null;
    max: number | null;
  };
  families: string[] | null;
  timeOfDay: 'day' | 'night' | null;
  sortByPrice: 'asc' | 'desc' | null;
  limit: number | null;
}

export interface ParsedSearchResult {
  context: ParsedContext;
  explanation: string;
}

export interface AISearchResult {
  products: Product[];
  filters: ProductFilters;
  explanation: string;
  context: ParsedContext;
  total: number;
}

/**
 * Parsea una búsqueda usando IA para extraer contexto estructurado
 */
export async function parseSearchQuery(query: string): Promise<ParsedSearchResult> {
  const prompt = getSearchPrompt(query);

  try {
    const responseText = await generateContent(prompt, {
      model: 'deepseek-chat',
      maxTokens: 1000,
      temperature: 0.7,
    });

    // Parsear JSON de la respuesta
    let parsed: ParsedSearchResult;
    try {
      // Limpiar el texto si tiene markdown code blocks
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Response text:', responseText);
      // Fallback a contexto vacío
      return {
        context: {
          gender: null,
          occasion: null,
          intensity: null,
          climate: null,
          event: null,
          priceRange: { min: null, max: null },
          families: null,
          timeOfDay: null,
          sortByPrice: null,
          limit: null,
        },
        explanation: 'Uy, no pude entender bien tu búsqueda 😅. Te muestro todos los productos disponibles.',
      };
    }

    return parsed;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw new Error('Error al analizar la búsqueda con IA');
  }
}

/**
 * Convierte contexto parseado a filtros de productos
 */
export async function contextToFilters(
  context: ParsedContext
): Promise<ProductFilters> {
  const filters: ProductFilters = {};

  if (context.gender) {
    filters.gender = context.gender;
  }

  if (context.priceRange.min !== null) {
    filters.priceMin = context.priceRange.min;
  }

  if (context.priceRange.max !== null) {
    filters.priceMax = context.priceRange.max;
  }

  if (context.families && context.families.length > 0) {
    // Buscar familias por nombre en la BD para obtener slugs correctos
    const supabase = await createClient();
    const { data: familiesData } = await supabase
      .from('olfactory_families')
      .select('slug, name')
      .in('name', context.families);

    if (familiesData && familiesData.length > 0) {
      filters.families = familiesData.map((f: { slug: string }) => f.slug);
    } else {
      // Fallback: intentar convertir nombres a slugs
      filters.families = context.families.map((family) =>
        family
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remover acentos
          .replace(/\s+/g, '-')
      );
    }
  }

  // Aplicar filtro de time_of_day
  if (context.timeOfDay) {
    filters.timeOfDay = context.timeOfDay;
  }

  // Aplicar ordenamiento por precio
  if (context.sortByPrice) {
    filters.sortByPrice = context.sortByPrice;
  }

  // Aplicar límite (para casos como "el más caro")
  if (context.limit !== null && context.limit !== undefined) {
    filters.limit = context.limit;
  }

  return filters;
}

/**
 * Busca productos usando filtros derivados del contexto
 */
export async function searchProductsWithFilters(
  filters: ProductFilters
): Promise<{ products: Product[]; total: number }> {
  try {
    const result = await getProducts(filters, { page: 1, pageSize: 50 });
    return {
      products: result.products,
      total: result.total,
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return {
      products: [],
      total: 0,
    };
  }
}

/**
 * Genera explicación adicional basada en productos encontrados
 * Nota: La explicación principal viene del prompt de IA, esta es solo un fallback
 */
export async function generateExplanation(
  products: Product[],
  query: string,
  context: ParsedContext
): Promise<string> {
  if (products.length === 0) {
    return 'Uy, no encontré nada que coincida con lo que buscás 😅. Probá con otros términos o ajustá los filtros.';
  }

  // Si ya tenemos una explicación del contexto parseado, la usamos
  // Esta función es solo un fallback si no hay explicación del prompt
  return `Encontré ${products.length} perfume${products.length > 1 ? 's' : ''} que te van a encantar 💫`;
}

/**
 * Guarda búsqueda en historial
 */
export async function saveSearchHistory(
  userId: string | null,
  query: string,
  context: ParsedContext,
  productIds: string[]
): Promise<void> {
  if (!userId) {
    // No guardar si no hay usuario autenticado
    return;
  }

  const supabase = await createClient();

  const insertPayload = {
    user_id: userId,
    search_query: query,
    context: context as unknown as Record<string, unknown>,
    results: productIds,
  };
  await (supabase.from('ai_search_history') as any).insert(insertPayload);
}

/**
 * Función principal de búsqueda con IA
 */
export async function performAISearch(
  query: string,
  userId?: string | null
): Promise<AISearchResult> {
  // 1. Parsear la búsqueda con IA
  const parsed = await parseSearchQuery(query);

  // 2. Convertir contexto a filtros
  const filters = await contextToFilters(parsed.context);

  // 3. Buscar productos con los filtros
  const { products, total } = await searchProductsWithFilters(filters);

  // 4. Generar explicación (usar la del contexto parseado o generar una nueva)
  const explanation =
    parsed.explanation ||
    (await generateExplanation(products, query, parsed.context));

  // 5. Guardar en historial (si hay usuario)
  if (userId) {
    const productIds = products.map((p) => p.id);
    await saveSearchHistory(userId, query, parsed.context, productIds).catch(
      (error) => {
        // No fallar si no se puede guardar el historial
        console.error('Error saving search history:', error);
      }
    );
  }

  return {
    products,
    filters,
    explanation,
    context: parsed.context,
    total,
  };
}

