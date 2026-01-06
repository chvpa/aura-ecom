import { z } from 'zod';

// Esquema para las notas olfativas
const notesSchema = z.object({
  top: z.array(z.string()).optional().default([]),
  heart: z.array(z.string()).optional().default([]),
  base: z.array(z.string()).optional().default([]),
});

// Esquema para los acordes principales
const mainAccordsSchema = z.record(z.string(), z.number().min(0).max(100));

// Esquema para las características
const characteristicsSchema = z.object({
  intensity: z.enum(['Baja', 'Media', 'Alta']).optional(),
  occasion: z.array(z.string()).optional(),
});

export const productSchema = z.object({
  // Información básica
  name: z.string().min(1, 'El nombre es requerido'),
  sku: z.string().min(1, 'El SKU es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  brand_id: z.string().min(1, 'La marca es requerida'),
  description_short: z.string().optional(),
  description_long: z.string().optional(),
  
  // Precio y stock
  price_pyg: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  original_price_pyg: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0, 'El stock debe ser mayor o igual a 0'),
  
  // Características del perfume
  gender: z.enum(['Hombre', 'Mujer', 'Unisex']),
  concentration: z.string().min(1, 'La concentración es requerida'),
  size_ml: z.number().int().min(1, 'El tamaño es requerido'),
  
  // Duración y estela
  longevity_hours: z.number().min(0).max(24).optional().nullable(),
  sillage_category: z.enum(['Suave', 'Moderada', 'Fuerte']).optional().nullable(),
  
  // Notas olfativas
  notes: notesSchema.optional().nullable(),
  
  // Acordes principales (ej: { "Amaderado": 85, "Especiado": 70 })
  main_accords: mainAccordsSchema.optional().nullable(),
  
  // Características adicionales
  characteristics: characteristicsSchema.optional().nullable(),
  
  // Temporadas recomendadas
  season_recommendations: z.array(z.enum(['Primavera', 'Verano', 'Otoño', 'Invierno'])).nullable().optional(),
  
  // Momento del día
  time_of_day: z.array(z.enum(['Día', 'Noche', 'Versátil'])).nullable().optional(),
  
  // Imágenes
  images: z.array(z.string()).min(1, 'Al menos una imagen es requerida'),
  main_image_url: z.string().min(1, 'La imagen principal es requerida'),
  
  // Estado
  is_active: z.boolean().optional().default(true),
  is_featured: z.boolean().optional().default(false),
  
  // SEO
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type NotesData = z.infer<typeof notesSchema>;
export type MainAccordsData = z.infer<typeof mainAccordsSchema>;
export type CharacteristicsData = z.infer<typeof characteristicsSchema>;
