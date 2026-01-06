'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '@/lib/validations/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SelectWithCreate } from '@/components/ui/select-with-create';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Plus, X, Clock, Wind, Sparkles, Sun, Thermometer } from 'lucide-react';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type Brand = Database['public']['Tables']['brands']['Row'];

interface ProductFormProps {
  product?: Product;
  brands: Brand[];
}

const CONCENTRATIONS = [
  'Eau de Cologne',
  'Eau de Toilette',
  'Eau de Parfum',
  'Parfum',
  'Extrait de Parfum',
];

const COMMON_ACCORDS = [
  'Amaderado',
  'Especiado',
  'Aromático',
  'Oriental',
  'Cítrico',
  'Floral',
  'Fresco',
  'Dulce',
  'Ámbar',
  'Almizcle',
  'Cuero',
  'Afrutado',
  'Verde',
  'Acuático',
  'Terroso',
  'Gourmand',
];

const COMMON_NOTES = [
  'Bergamota',
  'Limón',
  'Naranja',
  'Pomelo',
  'Lavanda',
  'Menta',
  'Pimienta negra',
  'Cardamomo',
  'Jengibre',
  'Canela',
  'Rosa',
  'Jazmín',
  'Lirio',
  'Iris',
  'Violeta',
  'Cedro',
  'Sándalo',
  'Vetiver',
  'Pachulí',
  'Oud',
  'Ámbar',
  'Musk',
  'Vainilla',
  'Tonka',
  'Cacao',
];

// Estado para notas personalizadas creadas durante la sesión
const customNotes: string[] = [];

export function ProductForm({ product, brands }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEditing = !!product;

  // State for dynamic accord management
  const [accords, setAccords] = useState<{ name: string; percentage: number }[]>([]);
  const [newAccordName, setNewAccordName] = useState('');

  // State for notes management
  const [topNotes, setTopNotes] = useState<string[]>([]);
  const [heartNotes, setHeartNotes] = useState<string[]>([]);
  const [baseNotes, setBaseNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [availableNotes, setAvailableNotes] = useState<string[]>([...COMMON_NOTES, ...customNotes]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku,
          slug: product.slug,
          brand_id: product.brand_id,
          description_short: product.description_short || '',
          description_long: product.description_long || '',
          price_pyg: product.price_pyg,
          original_price_pyg: product.original_price_pyg || null,
          stock: product.stock || 0,
          gender: product.gender as 'Hombre' | 'Mujer' | 'Unisex',
          concentration: product.concentration,
          size_ml: product.size_ml,
          longevity_hours: product.longevity_hours || null,
          sillage_category: product.sillage_category as 'Suave' | 'Moderada' | 'Fuerte' | null,
          notes: product.notes as ProductFormData['notes'],
          main_accords: (product.main_accords && typeof product.main_accords === 'object' && Object.keys(product.main_accords).length > 0)
            ? (product.main_accords as ProductFormData['main_accords'])
            : null,
          characteristics: product.characteristics as ProductFormData['characteristics'],
          season_recommendations: Array.isArray(product.season_recommendations) 
            ? (product.season_recommendations as unknown[]).filter((s): s is 'Primavera' | 'Verano' | 'Otoño' | 'Invierno' => 
                typeof s === 'string' && ['Primavera', 'Verano', 'Otoño', 'Invierno'].includes(s)
              )
            : null,
          time_of_day: Array.isArray(product.time_of_day) 
            ? (product.time_of_day as unknown[]).filter((t): t is 'Día' | 'Noche' | 'Versátil' => 
                typeof t === 'string' && ['Día', 'Noche', 'Versátil'].includes(t)
              )
            : null,
          images: (product.images as string[]) || [],
          main_image_url: product.main_image_url,
          is_active: product.is_active ?? true,
          is_featured: product.is_featured ?? false,
          meta_title: product.meta_title || null,
          meta_description: product.meta_description || null,
        }
      : {
          images: [],
          main_image_url: '',
          is_active: true,
          is_featured: false,
          stock: 0,
          notes: { top: [], heart: [], base: [] },
          main_accords: {},
          season_recommendations: [],
          time_of_day: [],
        },
  });

  const images = watch('images');
  const mainImageUrl = watch('main_image_url');

  // Helper functions to safely get array values
  const getSeasonRecommendations = (): string[] => {
    const value = watch('season_recommendations');
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [];
  };

  const getTimeOfDay = (): string[] => {
    const value = watch('time_of_day');
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [];
  };

  // Initialize accords and notes from product data
  useEffect(() => {
    if (product) {
      // Initialize accords
      if (product.main_accords) {
        const accordsData = product.main_accords as Record<string, number>;
        setAccords(Object.entries(accordsData).map(([name, percentage]) => ({ name, percentage })));
      }
      // Initialize notes
      if (product.notes) {
        const notesData = product.notes as { top?: string[]; heart?: string[]; base?: string[] };
        setTopNotes(notesData.top || []);
        setHeartNotes(notesData.heart || []);
        setBaseNotes(notesData.base || []);
      }
      // Initialize seasons and time_of_day - ensure they are arrays
      if (product.season_recommendations) {
        const seasons = Array.isArray(product.season_recommendations) 
          ? (product.season_recommendations as unknown[]).filter((s): s is 'Primavera' | 'Verano' | 'Otoño' | 'Invierno' => 
              typeof s === 'string' && ['Primavera', 'Verano', 'Otoño', 'Invierno'].includes(s)
            )
          : [];
        setValue('season_recommendations', seasons.length > 0 ? seasons : null);
      }
      if (product.time_of_day) {
        const times = Array.isArray(product.time_of_day) 
          ? (product.time_of_day as unknown[]).filter((t): t is 'Día' | 'Noche' | 'Versátil' => 
              typeof t === 'string' && ['Día', 'Noche', 'Versátil'].includes(t)
            )
          : [];
        setValue('time_of_day', times.length > 0 ? times : null);
      }
    }
  }, [product, setValue]);

  // Update form values when accords change
  useEffect(() => {
    const accordsObj = accords.reduce((acc, { name, percentage }) => {
      acc[name] = percentage;
      return acc;
    }, {} as Record<string, number>);
    setValue('main_accords', Object.keys(accordsObj).length > 0 ? accordsObj : null);
  }, [accords, setValue]);

  // Update form values when notes change
  useEffect(() => {
    setValue('notes', {
      top: topNotes,
      heart: heartNotes,
      base: baseNotes,
    });
  }, [topNotes, heartNotes, baseNotes, setValue]);

  useEffect(() => {
    if (images.length > 0 && !mainImageUrl) {
      setValue('main_image_url', images[0]);
    }
  }, [images, mainImageUrl, setValue]);

  const addAccord = () => {
    if (newAccordName && !accords.find(a => a.name === newAccordName)) {
      setAccords([...accords, { name: newAccordName, percentage: 50 }]);
      setNewAccordName('');
    }
  };

  const updateAccordPercentage = (name: string, percentage: number) => {
    setAccords(accords.map(a => a.name === name ? { ...a, percentage } : a));
  };

  const removeAccord = (name: string) => {
    setAccords(accords.filter(a => a.name !== name));
  };

  const handleCreateNote = (newNoteValue: string) => {
    // Agregar a la lista de notas disponibles si no existe
    if (!availableNotes.includes(newNoteValue)) {
      customNotes.push(newNoteValue);
      setAvailableNotes([...COMMON_NOTES, ...customNotes]);
    }
    // Establecer como nota seleccionada
    setNewNote(newNoteValue);
  };

  const addNote = (type: 'top' | 'heart' | 'base') => {
    if (!newNote) return;
    
    switch (type) {
      case 'top':
        if (!topNotes.includes(newNote)) setTopNotes([...topNotes, newNote]);
        break;
      case 'heart':
        if (!heartNotes.includes(newNote)) setHeartNotes([...heartNotes, newNote]);
        break;
      case 'base':
        if (!baseNotes.includes(newNote)) setBaseNotes([...baseNotes, newNote]);
        break;
    }
    setNewNote('');
  };

  const removeNote = (type: 'top' | 'heart' | 'base', note: string) => {
    switch (type) {
      case 'top':
        setTopNotes(topNotes.filter(n => n !== note));
        break;
      case 'heart':
        setHeartNotes(heartNotes.filter(n => n !== note));
        break;
      case 'base':
        setBaseNotes(baseNotes.filter(n => n !== note));
        break;
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      // Limpiar datos antes de enviar: convertir objetos vacíos a null, arrays vacíos a null si son opcionales
      const cleanedData: Partial<ProductFormData> = {
        ...data,
        // Si main_accords está vacío, enviarlo como null
        main_accords: data.main_accords && Object.keys(data.main_accords).length > 0 
          ? data.main_accords 
          : null,
        // Si notes está vacío, enviarlo como null
        notes: data.notes && (
          (data.notes.top && data.notes.top.length > 0) ||
          (data.notes.heart && data.notes.heart.length > 0) ||
          (data.notes.base && data.notes.base.length > 0)
        ) ? data.notes : null,
        // Si season_recommendations está vacío, enviarlo como null
        season_recommendations: data.season_recommendations && data.season_recommendations.length > 0
          ? data.season_recommendations
          : null,
        // Si time_of_day está vacío, enviarlo como null
        time_of_day: data.time_of_day && data.time_of_day.length > 0
          ? data.time_of_day
          : null,
        // Si characteristics está vacío o sin intensidad, enviarlo como null
        characteristics: data.characteristics && data.characteristics.intensity
          ? data.characteristics
          : null,
      };

      const url = isEditing
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products';
      const method = isEditing ? 'PATCH' : 'POST';

      console.log('Submitting product data:', { url, method, cleanedData });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      let responseData;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Error al procesar la respuesta del servidor');
      }

      if (!response.ok) {
        console.error('Error response:', { 
          status: response.status, 
          statusText: response.statusText,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Construir mensaje de error más detallado
        let errorMessage = 'Error al guardar producto';
        if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (responseData?.details) {
          errorMessage = `Error: ${responseData.details}`;
        } else if (response.status === 500) {
          errorMessage = 'Error interno del servidor. Por favor revisa la consola del servidor para más detalles.';
        } else if (response.status === 400) {
          errorMessage = 'Datos inválidos. Por favor verifica que todos los campos estén correctos.';
        } else if (response.status === 401) {
          errorMessage = 'No autenticado. Por favor inicia sesión nuevamente.';
        } else if (response.status === 403) {
          errorMessage = 'No autorizado. No tienes permisos para realizar esta acción.';
        }
        
        throw new Error(errorMessage);
      }

      console.log('Product saved successfully:', responseData);
      toast.success(
        isEditing ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente'
      );
      router.push('/admin/productos');
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al guardar producto. Por favor verifica los datos e intenta de nuevo.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const onError = (errors: FieldErrors<ProductFormData>) => {
    console.error('Form validation errors:', errors);
    console.error('Form values:', watch());
    console.error('Form errors object keys:', Object.keys(errors));
    
    // Si el objeto de errores está vacío, puede ser un problema de tipos o valores undefined
    if (!errors || Object.keys(errors).length === 0) {
      const formValues = watch();
      console.error('Empty errors object. Checking form values:', formValues);
      
      // Verificar campos requeridos manualmente
      const requiredFields = ['name', 'sku', 'slug', 'brand_id', 'price_pyg', 'gender', 'concentration', 'size_ml', 'images', 'main_image_url'];
      const missingFields = requiredFields.filter(field => {
        const value = formValues[field as keyof typeof formValues];
        return value === undefined || value === null || value === '';
      });
      
      if (missingFields.length > 0) {
        toast.error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
      } else {
        toast.error('Error de validación desconocido. Por favor revisa la consola para más detalles.');
      }
      return;
    }
    
    // Buscar el primer error en el objeto de errores (puede estar anidado)
    const findFirstError = (errs: FieldErrors<ProductFormData> | unknown, path = ''): string | null => {
      if (!errs || typeof errs !== 'object') return null;
      
      for (const [key, value] of Object.entries(errs)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (value && typeof value === 'object') {
          if ('message' in value && value.message) {
            return `${currentPath}: ${value.message}`;
          }
          const nested = findFirstError(value, currentPath);
          if (nested) return nested;
        }
      }
      return null;
    };

    const firstError = findFirstError(errors);
    if (firstError) {
      toast.error(`Error de validación: ${firstError}`);
    } else {
      toast.error('Error de validación. Por favor verifica que todos los campos estén completos correctamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Columna Izquierda */}
        <div className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input id="sku" {...register('sku')} />
                  {errors.sku && (
                    <p className="text-sm text-destructive">{errors.sku.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input id="slug" {...register('slug')} />
                  {errors.slug && (
                    <p className="text-sm text-destructive">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand_id">Marca *</Label>
                <Select
                  value={watch('brand_id')}
                  onValueChange={(value) => setValue('brand_id', value)}
                >
                  <SelectTrigger id="brand_id">
                    <SelectValue placeholder="Seleccionar marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.brand_id && (
                  <p className="text-sm text-destructive">{errors.brand_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_short">Descripción Corta</Label>
                <Textarea
                  id="description_short"
                  {...register('description_short')}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_long">Descripción Larga</Label>
                <Textarea
                  id="description_long"
                  {...register('description_long')}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Precio y Stock */}
          <Card>
            <CardHeader>
              <CardTitle>Precio y Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_pyg">Precio (Gs) *</Label>
                  <Input
                    id="price_pyg"
                    type="number"
                    {...register('price_pyg', { valueAsNumber: true })}
                  />
                  {errors.price_pyg && (
                    <p className="text-sm text-destructive">{errors.price_pyg.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price_pyg">Precio Original (Gs)</Label>
                  <Input
                    id="original_price_pyg"
                    type="number"
                    {...register('original_price_pyg', {
                      valueAsNumber: true,
                      setValueAs: (v) => (v === '' ? null : Number(v)),
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  {...register('stock', { valueAsNumber: true })}
                />
                {errors.stock && (
                  <p className="text-sm text-destructive">{errors.stock.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Características del Perfume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Características del Perfume
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Género *</Label>
                  <Select
                    value={watch('gender')}
                    onValueChange={(value) =>
                      setValue('gender', value as 'Hombre' | 'Mujer' | 'Unisex')
                    }
                  >
                    <SelectTrigger id="gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hombre">Hombre</SelectItem>
                      <SelectItem value="Mujer">Mujer</SelectItem>
                      <SelectItem value="Unisex">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size_ml">Tamaño (ml) *</Label>
                  <Input
                    id="size_ml"
                    type="number"
                    {...register('size_ml', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="concentration">Concentración *</Label>
                <Select
                  value={watch('concentration')}
                  onValueChange={(value) => setValue('concentration', value)}
                >
                  <SelectTrigger id="concentration">
                    <SelectValue placeholder="Seleccionar concentración" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONCENTRATIONS.map((conc) => (
                      <SelectItem key={conc} value={conc}>
                        {conc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="longevity_hours" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duración (horas)
                  </Label>
                  <Input
                    id="longevity_hours"
                    type="number"
                    min="0"
                    max="24"
                    {...register('longevity_hours', {
                      valueAsNumber: true,
                      setValueAs: (v) => (v === '' ? null : Number(v)),
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sillage_category" className="flex items-center gap-2">
                    <Wind className="h-4 w-4" />
                    Estela (Sillage)
                  </Label>
                  <Select
                    value={watch('sillage_category') || ''}
                    onValueChange={(value) =>
                      setValue('sillage_category', value as 'Suave' | 'Moderada' | 'Fuerte' || null)
                    }
                  >
                    <SelectTrigger id="sillage_category">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Suave">Suave</SelectItem>
                      <SelectItem value="Moderada">Moderada</SelectItem>
                      <SelectItem value="Fuerte">Fuerte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Intensidad
                </Label>
                <Select
                  value={(watch('characteristics')?.intensity) || ''}
                  onValueChange={(value) =>
                    setValue('characteristics', {
                      ...watch('characteristics'),
                      intensity: value as 'Baja' | 'Media' | 'Alta',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar intensidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baja">Baja</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Temporadas y Momento del Día */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Temporadas y Momento del Día
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Temporadas Recomendadas</Label>
                <div className="flex flex-wrap gap-3">
                  {(['Primavera', 'Verano', 'Otoño', 'Invierno'] as const).map((season) => {
                    const seasons = getSeasonRecommendations();
                    return (
                      <label key={season} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={seasons.includes(season)}
                          onCheckedChange={(checked) => {
                            const current = getSeasonRecommendations() as ('Primavera' | 'Verano' | 'Otoño' | 'Invierno')[];
                            if (checked) {
                              setValue('season_recommendations', [...current, season as 'Primavera' | 'Verano' | 'Otoño' | 'Invierno']);
                            } else {
                              const filtered = current.filter(s => s !== season) as ('Primavera' | 'Verano' | 'Otoño' | 'Invierno')[];
                              setValue('season_recommendations', filtered.length > 0 ? filtered : null);
                            }
                          }}
                        />
                        <span className="text-sm">{season}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Momento del Día</Label>
                <div className="flex flex-wrap gap-3">
                  {(['Día', 'Noche', 'Versátil'] as const).map((time) => {
                    const times = getTimeOfDay();
                    return (
                      <label key={time} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={times.includes(time)}
                          onCheckedChange={(checked) => {
                            const current = getTimeOfDay() as ('Día' | 'Noche' | 'Versátil')[];
                            if (checked) {
                              setValue('time_of_day', [...current, time as 'Día' | 'Noche' | 'Versátil']);
                            } else {
                              const filtered = current.filter(t => t !== time) as ('Día' | 'Noche' | 'Versátil')[];
                              setValue('time_of_day', filtered.length > 0 ? filtered : null);
                            }
                          }}
                        />
                        <span className="text-sm">{time}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha */}
        <div className="space-y-6">
          {/* Acordes Principales */}
          <Card>
            <CardHeader>
              <CardTitle>Acordes Principales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select
                  value={newAccordName}
                  onValueChange={setNewAccordName}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccionar acorde" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_ACCORDS.filter(a => !accords.find(ac => ac.name === a)).map((accord) => (
                      <SelectItem key={accord} value={accord}>
                        {accord}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addAccord} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {accords.map(({ name, percentage }) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="w-24 text-sm font-medium">{name}</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={percentage}
                      onChange={(e) => updateAccordPercentage(name, Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAccord(name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {accords.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay acordes agregados
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notas Olfativas */}
          <Card>
            <CardHeader>
              <CardTitle>Notas Olfativas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selector de notas comunes */}
              <div className="flex gap-2">
                <SelectWithCreate
                  value={newNote}
                  onValueChange={setNewNote}
                  options={availableNotes}
                  onCreateOption={handleCreateNote}
                  placeholder="Seleccionar nota"
                  className="flex-1"
                />
              </div>

              {/* Notas de Salida */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-amber-600">Notas de Salida (Top)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addNote('top')}
                    disabled={!newNote}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topNotes.map((note) => (
                    <span
                      key={note}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                    >
                      {note}
                      <button
                        type="button"
                        onClick={() => removeNote('top', note)}
                        className="hover:text-amber-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {topNotes.length === 0 && (
                    <span className="text-sm text-muted-foreground">Sin notas de salida</span>
                  )}
                </div>
              </div>

              {/* Notas de Corazón */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-rose-600">Notas de Corazón (Heart)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addNote('heart')}
                    disabled={!newNote}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {heartNotes.map((note) => (
                    <span
                      key={note}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm"
                    >
                      {note}
                      <button
                        type="button"
                        onClick={() => removeNote('heart', note)}
                        className="hover:text-rose-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {heartNotes.length === 0 && (
                    <span className="text-sm text-muted-foreground">Sin notas de corazón</span>
                  )}
                </div>
              </div>

              {/* Notas de Fondo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-stone-600">Notas de Fondo (Base)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addNote('base')}
                    disabled={!newNote}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {baseNotes.map((note) => (
                    <span
                      key={note}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-800 rounded-full text-sm"
                    >
                      {note}
                      <button
                        type="button"
                        onClick={() => removeNote('base', note)}
                        className="hover:text-stone-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {baseNotes.length === 0 && (
                    <span className="text-sm text-muted-foreground">Sin notas de fondo</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imágenes */}
          <Card>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                images={images}
                onChange={(newImages) => {
                  setValue('images', newImages);
                  if (newImages.length > 0 && !mainImageUrl) {
                    setValue('main_image_url', newImages[0]);
                  }
                }}
              />
              {errors.images && (
                <p className="text-sm text-destructive mt-2">{errors.images.message}</p>
              )}
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Título</Label>
                <Input
                  id="meta_title"
                  {...register('meta_title')}
                  placeholder="Título para motores de búsqueda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Descripción</Label>
                <Textarea
                  id="meta_description"
                  {...register('meta_description')}
                  placeholder="Descripción para motores de búsqueda"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">Producto Activo</Label>
                  <p className="text-sm text-muted-foreground">
                    Los productos activos son visibles en la tienda
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={watch('is_active')}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_featured">Producto Destacado</Label>
                  <p className="text-sm text-muted-foreground">
                    Aparecerá en la página principal
                  </p>
                </div>
                <Switch
                  id="is_featured"
                  checked={watch('is_featured')}
                  onCheckedChange={(checked) => setValue('is_featured', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4 sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-lg border shadow-lg">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'} Producto
        </Button>
      </div>
    </form>
  );
}
