'use client';

import { useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { ProductFilters } from '@/lib/services/products';

interface UseProductFiltersReturn {
  filters: ProductFilters;
  setFilter: <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const FILTER_KEYS = [
  'brands',
  'families',
  'priceMin',
  'priceMax',
  'gender',
  'search',
] as const;

export function useProductFilters(): UseProductFiltersReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Extraer valores individuales de searchParams para comparación estable
  const marca = searchParams.get('marca') || '';
  const familia = searchParams.get('familia') || '';
  const precioMin = searchParams.get('precio_min') || '';
  const precioMax = searchParams.get('precio_max') || '';
  const genero = searchParams.get('genero') || '';
  const busqueda = searchParams.get('busqueda') || '';

  // Derivar filtros directamente de los searchParams usando useMemo
  // Usar valores individuales como dependencias para evitar recreaciones innecesarias
  const filters = useMemo((): ProductFilters => {
    const result: ProductFilters = {};

    if (marca) {
      result.brands = marca.split(',').filter(Boolean);
    }

    if (familia) {
      result.families = familia.split(',').filter(Boolean);
    }

    if (precioMin) {
      const parsed = parseInt(precioMin, 10);
      if (!isNaN(parsed)) {
        result.priceMin = parsed;
      }
    }

    if (precioMax) {
      const parsed = parseInt(precioMax, 10);
      if (!isNaN(parsed)) {
        result.priceMax = parsed;
      }
    }

    if (genero) {
      result.gender = genero;
    }

    if (busqueda) {
      result.search = busqueda;
    }

    return result;
  }, [marca, familia, precioMin, precioMax, genero, busqueda]);

  // Serializar searchParams para evitar recreaciones del callback
  const searchParamsString = useMemo(() => searchParams.toString(), [searchParams]);

  // Actualizar URL cuando cambian los filtros
  const updateURL = useCallback(
    (newFilters: ProductFilters) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProductFilters.ts:72',message:'updateURL called',data:{newFilters,currentPathname:pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const params = new URLSearchParams(searchParamsString);

      // Actualizar o eliminar cada filtro
      if (newFilters.brands && newFilters.brands.length > 0) {
        params.set('marca', newFilters.brands.join(','));
      } else {
        params.delete('marca');
      }

      if (newFilters.families && newFilters.families.length > 0) {
        params.set('familia', newFilters.families.join(','));
      } else {
        params.delete('familia');
      }

      if (newFilters.priceMin !== undefined) {
        params.set('precio_min', newFilters.priceMin.toString());
      } else {
        params.delete('precio_min');
      }

      if (newFilters.priceMax !== undefined) {
        params.set('precio_max', newFilters.priceMax.toString());
      } else {
        params.delete('precio_max');
      }

      if (newFilters.gender) {
        params.set('genero', newFilters.gender);
      } else {
        params.delete('genero');
      }

      if (newFilters.search) {
        params.set('busqueda', newFilters.search);
      } else {
        params.delete('busqueda');
      }

      // Resetear página cuando cambian los filtros
      params.delete('page');

      const queryString = params.toString();
      const newUrl = `${pathname}${queryString ? `?${queryString}` : ''}`;
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProductFilters.ts:116',message:'Router replace',data:{newUrl,queryString},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      router.replace(newUrl, { scroll: false });
    },
    [router, pathname, searchParamsString]
  );

  const setFilter = useCallback(
    <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/21d69845-ff9f-4db4-a05b-4a741d94d01e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProductFilters.ts:125',message:'setFilter called',data:{key,value,currentFilters:filters},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const newFilters = { ...filters, [key]: value };
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const clearFilters = useCallback(() => {
    const emptyFilters: ProductFilters = {};
    updateURL(emptyFilters);
  }, [updateURL]);

  const hasActiveFilters = FILTER_KEYS.some((key) => {
    const value = filters[key];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  });

  return {
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
  };
}

