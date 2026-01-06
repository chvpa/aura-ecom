'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { brandSchema, type BrandFormData } from '@/lib/validations/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoUpload } from '@/components/admin/LogoUpload';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Database } from '@/types/database.types';

type Brand = Database['public']['Tables']['brands']['Row'];

interface BrandFormProps {
  brand?: Brand;
}

export function BrandForm({ brand }: BrandFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEditing = !!brand;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: brand
      ? {
          name: brand.name,
          slug: brand.slug,
          description: brand.description || '',
          logo_url: brand.logo_url || null,
          is_active: brand.is_active ?? true,
        }
      : {
          name: '',
          slug: '',
          description: '',
          logo_url: null,
          is_active: true,
        },
  });

  const logoUrl = watch('logo_url');
  const name = watch('name');

  // Auto-generar slug desde el nombre si no está editando o si el nombre cambia
  useEffect(() => {
    if (!isEditing && name) {
      const generatedSlug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', generatedSlug);
    }
  }, [name, isEditing, setValue]);

  const onSubmit = async (data: BrandFormData) => {
    setSaving(true);
    try {
      const url = isEditing
        ? `/api/admin/brands/${brand.id}`
        : '/api/admin/brands';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar marca');
      }

      toast.success(
        isEditing ? 'Marca actualizada correctamente' : 'Marca creada correctamente'
      );
      router.push('/admin/marcas');
      router.refresh();
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al guardar la marca'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre de la Marca <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ej: Chanel, Dior, Versace"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="Ej: chanel, dior, versace"
            />
            <p className="text-xs text-muted-foreground">
              URL amigable para la marca. Se genera automáticamente desde el nombre.
            </p>
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción de la marca..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <LogoUpload
            logoUrl={logoUrl}
            onChange={(url) => setValue('logo_url', url)}
          />
          {errors.logo_url && (
            <p className="text-sm text-destructive mt-2">
              {errors.logo_url.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Estado */}
      <Card>
        <CardHeader>
          <CardTitle>Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Marca Activa</Label>
              <p className="text-sm text-muted-foreground">
                Las marcas inactivas no se mostrarán en el sitio público
              </p>
            </div>
            <Switch
              id="is_active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex gap-4">
        <Button type="submit" disabled={saving}>
          {saving
            ? 'Guardando...'
            : isEditing
              ? 'Actualizar Marca'
              : 'Crear Marca'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/marcas')}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

