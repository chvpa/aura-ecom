'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useProductFilters } from '@/hooks/useProductFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Filter, X } from 'lucide-react';
import { PERFUME_GENDERS } from '@/lib/utils/constants';
import { formatPrice } from '@/lib/utils/formatters';
import type { Database } from '@/types/database.types';

type Brand = Database['public']['Tables']['brands']['Row'];
type OlfactoryFamily = Database['public']['Tables']['olfactory_families']['Row'];

interface ProductFiltersProps {
  maxPrice?: number;
  className?: string;
}

export function ProductFilters({ maxPrice, className }: ProductFiltersProps) {
  const { filters, setFilter, clearFilters, hasActiveFilters } =
    useProductFilters();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [families, setFamilies] = useState<OlfactoryFamily[]>([]);
  const [maxPriceValue, setMaxPriceValue] = useState(maxPrice || 1000000);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Debounce para búsqueda
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilter('search', debouncedSearch || undefined);
    }
  }, [debouncedSearch, filters.search, setFilter]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [brandsResponse, familiesResponse, maxPriceResponse] =
          await Promise.all([
            fetch('/api/brands').then((res) => res.json()),
            fetch('/api/families').then((res) => res.json()),
            maxPrice
              ? Promise.resolve({ maxPrice })
              : fetch('/api/products/max-price').then((res) => res.json()),
          ]);

        setBrands(brandsResponse);
        setFamilies(familiesResponse);
        setMaxPriceValue(maxPrice || maxPriceResponse.maxPrice || 1000000);
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [maxPrice]);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Manejar cambios en filtros de marca
  const handleBrandChange = (brandSlug: string, checked: boolean) => {
    const currentBrands = filters.brands || [];
    const newBrands = checked
      ? [...currentBrands, brandSlug]
      : currentBrands.filter((b) => b !== brandSlug);
    setFilter('brands', newBrands.length > 0 ? newBrands : undefined);
  };

  // Manejar cambios en filtros de familia
  const handleFamilyChange = (familySlug: string, checked: boolean) => {
    const currentFamilies = filters.families || [];
    const newFamilies = checked
      ? [...currentFamilies, familySlug]
      : currentFamilies.filter((f) => f !== familySlug);
    setFilter('families', newFamilies.length > 0 ? newFamilies : undefined);
  };

  // Manejar cambios en precio
  const handlePriceChange = (values: number[]) => {
    setFilter('priceMin', values[0] > 0 ? values[0] : undefined);
    setFilter('priceMax', values[1] < maxPriceValue ? values[1] : undefined);
  };

  const priceRange = useMemo(
    () => [
      filters.priceMin || 0,
      filters.priceMax || maxPriceValue,
    ],
    [filters.priceMin, filters.priceMax, maxPriceValue]
  );

  const filtersContent = (
    <div className="space-y-6">
      {/* Búsqueda */}
      <div className="space-y-2">
        <Label htmlFor="search">Buscar</Label>
        <Input
          id="search"
          placeholder="Nombre del perfume..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <Separator />

      {/* Género */}
      <div className="space-y-3">
        <Label>Género</Label>
        <RadioGroup
          value={filters.gender || ''}
          onValueChange={(value) =>
            setFilter('gender', value || undefined)
          }
        >
          {PERFUME_GENDERS.map((gender) => (
            <div key={gender} className="flex items-center space-x-2">
              <RadioGroupItem value={gender} id={`gender-${gender}`} />
              <Label
                htmlFor={`gender-${gender}`}
                className="font-normal cursor-pointer"
              >
                {gender}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Precio */}
      <div className="space-y-3">
        <Label>
          Precio: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
        </Label>
        <Slider
          value={priceRange}
          onValueChange={handlePriceChange}
          min={0}
          max={maxPriceValue}
          step={10000}
          className="w-full"
        />
      </div>

      <Separator />

      {/* Marcas */}
      <div className="space-y-3">
        <Label>Marcas</Label>
        {loading ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand.slug}`}
                  checked={filters.brands?.includes(brand.slug) || false}
                  onCheckedChange={(checked) =>
                    handleBrandChange(brand.slug, checked === true)
                  }
                />
                <Label
                  htmlFor={`brand-${brand.slug}`}
                  className="font-normal cursor-pointer text-sm"
                >
                  {brand.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Familias Olfativas */}
      <div className="space-y-3">
        <Label>Familias Olfativas</Label>
        {loading ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {families.map((family) => (
              <div key={family.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`family-${family.slug}`}
                  checked={filters.families?.includes(family.slug) || false}
                  onCheckedChange={(checked) =>
                    handleFamilyChange(family.slug, checked === true)
                  }
                />
                <Label
                  htmlFor={`family-${family.slug}`}
                  className="font-normal cursor-pointer text-sm"
                >
                  {family.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <>
          <Separator />
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </Button>
        </>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className={className}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5">
                {[
                  filters.brands?.length || 0,
                  filters.families?.length || 0,
                  filters.gender ? 1 : 0,
                  filters.priceMin || filters.priceMax ? 1 : 0,
                  filters.search ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>
              Refina tu búsqueda de perfumes
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">{filtersContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className={`w-64 space-y-6 ${className}`}>{filtersContent}</aside>
  );
}

