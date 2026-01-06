import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type Brand = Database['public']['Tables']['brands']['Row'];

export interface ProductFilters {
  brands?: string[];
  families?: string[];
  priceMin?: number;
  priceMax?: number;
  gender?: string;
  search?: string;
  productIds?: string[];
  timeOfDay?: 'day' | 'night';
  sortByPrice?: 'asc' | 'desc';
  limit?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Obtiene productos con filtros y paginación
 */
export async function getProducts(
  filters: ProductFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 20 }
): Promise<ProductsResponse> {
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Aplicar filtros
  if (filters.brands && filters.brands.length > 0) {
    const { data: brands } = await supabase
      .from('brands')
      .select('id')
      .in('slug', filters.brands);

    if (brands && brands.length > 0) {
      const brandIds = brands.map((b: { id: string }) => b.id);
      query = query.in('brand_id', brandIds);
    }
  }

  if (filters.families && filters.families.length > 0) {
    const { data: families } = await supabase
      .from('olfactory_families')
      .select('id')
      .in('slug', filters.families);

    if (families && families.length > 0) {
      const familyIds = families.map((f: { id: string }) => f.id);
      const { data: productFamilies } = await supabase
        .from('product_families')
        .select('product_id')
        .in('family_id', familyIds);

      if (productFamilies && productFamilies.length > 0) {
        const productIds = productFamilies.map((pf: { product_id: string }) => pf.product_id);
        query = query.in('id', productIds);
      } else {
        // Si no hay productos con estas familias, retornar vacío
        return {
          products: [],
          total: 0,
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalPages: 0,
        };
      }
    }
  }

  if (filters.priceMin !== undefined) {
    query = query.gte('price_pyg', filters.priceMin);
  }

  if (filters.priceMax !== undefined) {
    query = query.lte('price_pyg', filters.priceMax);
  }

  if (filters.gender) {
    query = query.eq('gender', filters.gender);
  }

  if (filters.search) {
    // Búsqueda por nombre o SKU
    query = query.or(
      `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
    );
  }

  if (filters.productIds && filters.productIds.length > 0) {
    query = query.in('id', filters.productIds);
  }

  // Nota: El filtro de time_of_day se aplicará después de obtener los datos
  // debido a limitaciones de PostgREST con JSONB numérico

  // Ordenar por precio si se especifica
  if (filters.sortByPrice === 'desc') {
    query = query.order('price_pyg', { ascending: false });
  } else if (filters.sortByPrice === 'asc') {
    query = query.order('price_pyg', { ascending: true });
  } else {
    // Orden por defecto
    query = query.order('created_at', { ascending: false });
  }

  // Si hay un límite específico (para casos como "el más caro"), aplicarlo
  if (filters.limit && filters.limit > 0) {
    // Para límites, necesitamos obtener más datos primero para aplicar filtros de time_of_day
    // Luego limitamos después
    const { data, error, count } = await query.limit(filters.limit * 2); // Obtener más para filtrar
    
    if (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error al obtener productos');
    }

    let products = (data as Product[]) || [];

    // Aplicar filtro de time_of_day si existe
    if (filters.timeOfDay === 'night') {
      products = products.filter((product) => {
        const timeOfDay = product.time_of_day as { night?: number } | null;
        return timeOfDay?.night !== undefined && timeOfDay.night >= 70;
      });
    } else if (filters.timeOfDay === 'day') {
      products = products.filter((product) => {
        const timeOfDay = product.time_of_day as { day?: number } | null;
        return timeOfDay?.day !== undefined && timeOfDay.day >= 70;
      });
    }

    // Aplicar el límite después de filtrar
    products = products.slice(0, filters.limit);

    const total = products.length;
    const totalPages = Math.ceil(total / pagination.pageSize);

    return {
      products,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages,
    };
  }

  // Si no hay filtros de familias aplicados y hay filtros de familias en el objeto,
  // pero no hay productos, retornar vacío
  if (filters.families && filters.families.length > 0) {
    // Ya se aplicó el filtro arriba, pero si no hay resultados, el query ya retornará vacío
  }

  // Aplicar paginación
  const from = (pagination.page - 1) * pagination.pageSize;
  const to = from + pagination.pageSize - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Error al obtener productos');
  }

  let products = (data as Product[]) || [];

  // Filtrar por time_of_day después de obtener los datos (debido a limitaciones JSONB en PostgREST)
  if (filters.timeOfDay === 'night') {
    products = products.filter((product) => {
      const timeOfDay = product.time_of_day as { night?: number } | null;
      return timeOfDay?.night !== undefined && timeOfDay.night >= 70;
    });
  } else if (filters.timeOfDay === 'day') {
    products = products.filter((product) => {
      const timeOfDay = product.time_of_day as { day?: number } | null;
      return timeOfDay?.day !== undefined && timeOfDay.day >= 70;
    });
  }

  // Recalcular total después del filtro
  const total = filters.timeOfDay ? products.length : (count || 0);
  const totalPages = Math.ceil(total / pagination.pageSize);

  return {
    products,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages,
  };
}

/**
 * Obtiene un producto por su slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No encontrado
      return null;
    }
    console.error('Error fetching product by slug:', error);
    throw new Error('Error al obtener el producto');
  }

  return data as Product;
}

/**
 * Obtiene productos por marca
 */
export async function getProductsByBrand(
  brandSlug: string,
  filters: Omit<ProductFilters, 'brands'> = {},
  pagination: PaginationParams = { page: 1, pageSize: 20 }
): Promise<ProductsResponse> {
  const supabase = await createClient();

  // Obtener ID de la marca
  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('slug', brandSlug)
    .eq('is_active', true)
    .single();

  if (!brand) {
    return {
      products: [],
      total: 0,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: 0,
    };
  }

  // Crear filtros con la marca específica
  return getProducts(
    {
      ...filters,
      brands: [brandSlug],
    },
    pagination
  );
}

/**
 * Obtiene productos por familia olfativa
 */
export async function getProductsByFamily(
  familySlug: string,
  filters: Omit<ProductFilters, 'families'> = {},
  pagination: PaginationParams = { page: 1, pageSize: 20 }
): Promise<ProductsResponse> {
  // Aplicar filtros con la familia específica
  return getProducts(
    {
      ...filters,
      families: [familySlug],
    },
    pagination
  );
}

/**
 * Búsqueda de productos por texto
 */
export async function searchProducts(
  query: string,
  pagination: PaginationParams = { page: 1, pageSize: 20 }
): Promise<ProductsResponse> {
  return getProducts(
    {
      search: query,
    },
    pagination
  );
}

/**
 * Obtiene el precio máximo de todos los productos activos
 */
export async function getMaxPrice(): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await (supabase
    .from('products') as any)
    .select('price_pyg')
    .eq('is_active', true)
    .order('price_pyg', { ascending: false })
    .limit(1)
    .single() as { data: { price_pyg: number } | null; error: any };

  if (error || !data) {
    return 1000000; // Precio máximo por defecto
  }

  return data.price_pyg;
}

