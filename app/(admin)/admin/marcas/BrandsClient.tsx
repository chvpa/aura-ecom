'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Database } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Edit, Power } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Brand = Database['public']['Tables']['brands']['Row'];

export function BrandsClient() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadBrands = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) {
        params.set('search', search);
      }
      if (statusFilter !== 'all') {
        params.set('isActive', statusFilter === 'active' ? 'true' : 'false');
      }

      const response = await fetch(`/api/admin/brands?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setBrands(data.brands || []);
      }
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const handleSearch = () => {
    loadBrands();
  };

  const handleToggleStatus = async (brandId: string) => {
    try {
      const response = await fetch(`/api/admin/brands/${brandId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleStatus: true }),
      });

      if (!response.ok) {
        throw new Error('Error al cambiar estado');
      }

      toast.success('Estado actualizado');
      loadBrands();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  if (loading && brands.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Marcas</h1>
          <p className="text-muted-foreground">
            Administra las marcas de tu catálogo
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/marcas/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Marca
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="inactive">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de marcas */}
      <Card>
        <CardHeader>
          <CardTitle>Marcas ({brands.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {brands.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium">Logo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">
                        {brand.logo_url ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                            <Image
                              src={brand.logo_url}
                              alt={brand.name}
                              fill
                              className="object-contain p-1"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                            <span className="text-lg font-bold text-muted-foreground">
                              {brand.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{brand.name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {brand.slug}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={brand.is_active ? 'default' : 'secondary'}
                        >
                          {brand.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(brand.id)}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/marcas/${brand.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No hay marcas que coincidan con los filtros
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

