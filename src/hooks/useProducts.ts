'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { ProductFilters, PaginationParams } from '@/lib/services/products';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface UseProductsOptions {
  filters?: ProductFilters;
  pagination?: PaginationParams;
  enabled?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: Error | null;
  total: number;
  page: number;
  totalPages: number;
  refetch: () => Promise<void>;
}

// Función para serializar filtros de forma estable
function serializeFilters(filters: ProductFilters): string {
  const brands = filters.brands?.slice().sort().join(',') || '';
  const families = filters.families?.slice().sort().join(',') || '';
  const priceMin = filters.priceMin?.toString() || '';
  const priceMax = filters.priceMax?.toString() || '';
  const gender = filters.gender || '';
  const search = filters.search || '';
  const productIds = filters.productIds?.slice().sort().join(',') || '';
  
  return `${brands}|${families}|${priceMin}|${priceMax}|${gender}|${search}|${productIds}`;
}

export function useProducts({
  filters = {},
  pagination = { page: 1, pageSize: 20 },
  enabled = true,
}: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(pagination.page);
  const [totalPages, setTotalPages] = useState(0);

  // Serializar filtros para comparación estable
  const filtersKey = useMemo(() => serializeFilters(filters), [filters]);
  const prevFiltersKey = useRef<string>('');
  const prevPage = useRef<number>(pagination.page);
  const prevPageSize = useRef<number>(pagination.pageSize);
  const isInitialMount = useRef<boolean>(true);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:56',message:'useEffect triggered',data:{enabled,filtersKey,page:pagination.page,pageSize:pagination.pageSize,prevFiltersKey:prevFiltersKey.current,prevPage:prevPage.current,prevPageSize:prevPageSize.current,isInitialMount:isInitialMount.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Verificar si realmente cambiaron los filtros o paginación
    const filtersChanged = prevFiltersKey.current !== filtersKey;
    const pageChanged = prevPage.current !== pagination.page;
    const pageSizeChanged = prevPageSize.current !== pagination.pageSize;

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:65',message:'Change detection',data:{filtersChanged,pageChanged,pageSizeChanged},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // En el primer mount, siempre hacer fetch
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      // Si nada cambió, no hacer fetch
      if (!filtersChanged && !pageChanged && !pageSizeChanged) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:73',message:'Skipping fetch - no changes',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return;
      }
    }

    // Actualizar referencias ANTES de hacer fetch para evitar múltiples ejecuciones
    prevFiltersKey.current = filtersKey;
    prevPage.current = pagination.page;
    prevPageSize.current = pagination.pageSize;

    // Capturar valores actuales de filters para usar en el fetch
    const currentFilters = filters;

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:85',message:'Starting fetch',data:{filtersKey,page:pagination.page,pageSize:pagination.pageSize,currentFilters},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set('page', pagination.page.toString());
    params.set('pageSize', pagination.pageSize.toString());

    if (currentFilters.brands && currentFilters.brands.length > 0) {
      params.set('brands', currentFilters.brands.join(','));
    }
    if (currentFilters.families && currentFilters.families.length > 0) {
      params.set('families', currentFilters.families.join(','));
    }
    if (currentFilters.priceMin !== undefined) {
      params.set('priceMin', currentFilters.priceMin.toString());
    }
    if (currentFilters.priceMax !== undefined) {
      params.set('priceMax', currentFilters.priceMax.toString());
    }
    if (currentFilters.gender) {
      params.set('gender', currentFilters.gender);
    }
    if (currentFilters.search) {
      params.set('search', currentFilters.search);
    }
    if (currentFilters.productIds && currentFilters.productIds.length > 0) {
      params.set('productIds', currentFilters.productIds.join(','));
    }

    const url = `/api/products?${params.toString()}`;
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:111',message:'Fetching products',data:{url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    fetch(url)
      .then((response) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:115',message:'Fetch response received',data:{ok:response.ok,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        if (!response.ok) {
          throw new Error('Error al obtener productos');
        }
        return response.json();
      })
      .then((data) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:122',message:'Products data received',data:{productsCount:data.products?.length,total:data.total,page:data.page,totalPages:data.totalPages},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        setProducts(data.products);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      })
      .catch((err) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:130',message:'Fetch error',data:{error:err.message,errorType:err.constructor.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        setProducts([]);
      })
      .finally(() => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:135',message:'Fetch completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, filtersKey, pagination.page, pagination.pageSize]);

  const refetch = async () => {
    // Forzar actualización limpiando la referencia
    prevFiltersKey.current = '';
    prevPage.current = -1;
    prevPageSize.current = -1;
    // El useEffect se ejecutará automáticamente
  };

  return {
    products,
    loading,
    error,
    total,
    page,
    totalPages,
    refetch,
  };
}

