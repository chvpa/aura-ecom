import { z } from 'zod';

export const brandSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  is_active: z.boolean(),
});

export type BrandFormData = z.infer<typeof brandSchema>;

