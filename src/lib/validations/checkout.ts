import { z } from 'zod';
import { PARAGUAY_DEPARTMENTS, isValidParaguayPhone } from '@/lib/constants/paraguay';

export const shippingAddressSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z
    .string()
    .min(10, 'El teléfono debe tener 10 dígitos')
    .refine((phone) => isValidParaguayPhone(phone), {
      message: 'El teléfono debe ser paraguayo (formato: 0981234567)',
    }),
  department: z.enum([...PARAGUAY_DEPARTMENTS] as [string, ...string[]], {
    message: 'Selecciona un departamento válido',
  }),
  city: z.string().min(1, 'Selecciona una ciudad'),
  street: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  reference: z.string().optional(),
});

export const checkoutSchema = z.object({
  shipping: shippingAddressSchema,
  payment_method: z.enum(['transferencia', 'giro', 'tarjeta'], {
    message: 'Selecciona un método de pago',
  }),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

