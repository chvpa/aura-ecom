import { createClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/deepseek/client';
import { MATCH_PROMPT } from '@/lib/deepseek/prompts';
import type { Database } from '@/types/database.types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type ProductMatch = Database['public']['Tables']['product_matches']['Row'];

interface UserPreferences {
  familias_favoritas?: string[];
  intensidad_preferida?: 'Baja' | 'Moderada' | 'Alta';
  ocasiones?: string[];
  clima_preferido?: string[];
}

const CACHE_DURATION_DAYS = 7;

/**
 * Obtiene el match cacheado si existe y es válido
 */
export async function getCachedMatch(
  userId: string,
  productId: string
): Promise<number | null> {
  const supabase = await createClient();

  const { data, error } = await (supabase
    .from('product_matches') as any)
    .select('match_percentage, expires_at')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single() as { data: { match_percentage: number; expires_at: string } | null; error: any };

  if (error) {
    if (error.code === 'PGRST116') {
      // No encontrado
      return null;
    }
    console.error('Error fetching cached match:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  // Verificar si el caché expiró
  const expiresAt = new Date(data.expires_at);
  const now = new Date();

  if (expiresAt <= now) {
    // Caché expirado
    return null;
  }

  return data.match_percentage;
}

/**
 * Guarda el match calculado en la base de datos
 */
export async function saveMatch(
  userId: string,
  productId: string,
  percentage: number,
  reasons?: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();

  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CACHE_DURATION_DAYS);

  const { error } = await (supabase.from('product_matches') as any).upsert({
    user_id: userId,
    product_id: productId,
    match_percentage: percentage,
    match_reasons: reasons || null,
    calculated_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error('Error saving match:', error);
    throw new Error('Error al guardar el match');
  }
}

/**
 * Obtiene el perfil del usuario con sus preferencias
 */
async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('onboarding_completed', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Obtiene información completa del producto incluyendo familias olfativas y marca
 */
async function getProductWithFamilies(
  productId: string
): Promise<Product & { families: string[]; brandName?: string } | null> {
  const supabase = await createClient();

  // Obtener producto
  const { data: product, error: productError } = await (supabase
    .from('products') as any)
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single() as { data: Database['public']['Tables']['products']['Row'] | null; error: any };

  if (productError || !product) {
    console.error('Error fetching product:', productError);
    return null;
  }

  // Obtener nombre de la marca
  let brandName: string | undefined;
  if (product.brand_id) {
    const { data: brand } = await (supabase
      .from('brands') as any)
      .select('name')
      .eq('id', product.brand_id)
      .single() as { data: { name: string } | null; error: any };
    if (brand) {
      brandName = brand.name;
    }
  }

  // Obtener familias olfativas del producto
  const { data: productFamilies, error: familiesError } = await supabase
    .from('product_families')
    .select('family:olfactory_families(name)')
    .eq('product_id', productId);

  const families: string[] = [];
  if (!familiesError && productFamilies) {
    productFamilies.forEach((pf: { family: { name: string } | null } | null) => {
      if (pf?.family?.name) {
        families.push(pf.family.name);
      }
    });
  }

  return {
    ...product,
    families,
    brandName,
  } as Product & { families: string[]; brandName?: string };
}

/**
 * Formatea el perfil del usuario para el prompt
 */
function formatUserProfile(profile: UserProfile): string {
  const preferences = (profile.preferences as UserPreferences) || {};

  const parts: string[] = [];

  if (preferences.familias_favoritas && preferences.familias_favoritas.length > 0) {
    parts.push(`Familias olfativas favoritas: ${preferences.familias_favoritas.join(', ')}`);
  }

  if (preferences.intensidad_preferida) {
    parts.push(`Intensidad preferida: ${preferences.intensidad_preferida}`);
  }

  if (preferences.ocasiones && preferences.ocasiones.length > 0) {
    parts.push(`Ocasiones de uso preferidas: ${preferences.ocasiones.join(', ')}`);
  }

  if (preferences.clima_preferido && preferences.clima_preferido.length > 0) {
    parts.push(`Clima preferido: ${preferences.clima_preferido.join(', ')}`);
  }

  return parts.length > 0 ? parts.join('\n') : 'Sin preferencias definidas';
}

/**
 * Formatea la información del producto para el prompt
 */
function formatProductInfo(
  product: Product & { families: string[]; brandName?: string }
): string {
  const parts: string[] = [];

  parts.push(`Nombre: ${product.name}`);
  if (product.brandName) {
    parts.push(`Marca: ${product.brandName}`);
  }

  if (product.families && product.families.length > 0) {
    parts.push(`Familias olfativas: ${product.families.join(', ')}`);
  }

  if (product.gender) {
    parts.push(`Género: ${product.gender}`);
  }

  if (product.concentration) {
    parts.push(`Concentración: ${product.concentration}`);
  }

  // Notas olfativas
  const notes = product.notes as
    | { top?: string[]; heart?: string[]; base?: string[] }
    | null;
  if (notes) {
    if (notes.top && notes.top.length > 0) {
      parts.push(`Notas de salida: ${notes.top.join(', ')}`);
    }
    if (notes.heart && notes.heart.length > 0) {
      parts.push(`Notas de corazón: ${notes.heart.join(', ')}`);
    }
    if (notes.base && notes.base.length > 0) {
      parts.push(`Notas de fondo: ${notes.base.join(', ')}`);
    }
  }

  // Características
  const characteristics = product.characteristics as
    | {
        duracion?: string;
        estela?: string;
        intensidad?: string;
        temporada?: string[];
        ocasion?: string[];
      }
    | null;

  if (characteristics) {
    if (characteristics.intensidad) {
      parts.push(`Intensidad: ${characteristics.intensidad}`);
    }
    if (characteristics.estela) {
      parts.push(`Estela/Proyección: ${characteristics.estela}`);
    }
    if (characteristics.temporada && characteristics.temporada.length > 0) {
      parts.push(`Temporadas recomendadas: ${characteristics.temporada.join(', ')}`);
    }
    if (characteristics.ocasion && characteristics.ocasion.length > 0) {
      parts.push(`Ocasiones recomendadas: ${characteristics.ocasion.join(', ')}`);
    }
  }

  // Longevidad y estela si están disponibles
  if (product.longevity_hours) {
    parts.push(`Longevidad: ${product.longevity_hours} horas`);
  }

  if (product.sillage_category) {
    parts.push(`Categoría de estela: ${product.sillage_category}`);
  }

  // Temporadas desde season_recommendations
  const seasons = product.season_recommendations as
    | Record<string, number>
    | null;
  if (seasons) {
    const topSeasons = Object.entries(seasons)
      .filter(([, value]) => value > 50)
      .map(([key]) => key)
      .sort((a, b) => (seasons[b] || 0) - (seasons[a] || 0));
    if (topSeasons.length > 0) {
      parts.push(`Temporadas ideales: ${topSeasons.join(', ')}`);
    }
  }

  // Tiempo del día desde time_of_day
  const timeOfDay = product.time_of_day as { day?: number; night?: number } | null;
  if (timeOfDay) {
    if (timeOfDay.day && timeOfDay.night) {
      if (timeOfDay.day > timeOfDay.night) {
        parts.push(`Tiempo del día: Diurno (${timeOfDay.day}% diurno, ${timeOfDay.night}% nocturno)`);
      } else {
        parts.push(`Tiempo del día: Nocturno (${timeOfDay.day}% diurno, ${timeOfDay.night}% nocturno)`);
      }
    }
  }

  return parts.join('\n');
}

/**
 * Calcula el match usando IA
 */
export async function calculateMatch(
  userId: string,
  productId: string
): Promise<{ percentage: number; reasons?: Record<string, unknown> }> {
  // Obtener perfil del usuario
  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('Usuario no tiene perfil completado');
  }

  // Obtener información del producto
  const product = await getProductWithFamilies(productId);
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  // Formatear datos para el prompt
  const userProfileText = formatUserProfile(profile);
  const productInfoText = formatProductInfo(product);

  // Reemplazar placeholders en el prompt
  const prompt = MATCH_PROMPT.replace('{userProfile}', userProfileText).replace(
    '{productInfo}',
    productInfoText
  );

  try {
    // Llamar a DeepSeek API
    const responseText = await generateContent(prompt, {
      model: 'deepseek-chat',
      maxTokens: 50,
      temperature: 0.3,
    });

    // Parsear respuesta
    const matchPercentage = parseInt(responseText.trim(), 10);

    // Validar resultado
    if (isNaN(matchPercentage) || matchPercentage < 0 || matchPercentage > 100) {
      console.error('Invalid match percentage from AI:', responseText);
      // Fallback a 50% si la respuesta no es válida
      return { percentage: 50 };
    }

    return { percentage: matchPercentage };
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw new Error('Error al calcular el match con IA');
  }
}

/**
 * Obtiene el match (verifica caché primero, luego calcula si es necesario)
 */
export async function getMatch(
  userId: string,
  productId: string
): Promise<{ percentage: number; reasons?: Record<string, unknown> }> {
  // Verificar caché primero
  const cachedMatch = await getCachedMatch(userId, productId);
  if (cachedMatch !== null) {
    return { percentage: cachedMatch };
  }

  // Calcular nuevo match
  const result = await calculateMatch(userId, productId);

  // Guardar en caché
  await saveMatch(userId, productId, result.percentage, result.reasons);

  return result;
}

