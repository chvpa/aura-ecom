import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Password mínimo 8 caracteres'),
    confirmPassword: z.string(),
    fullName: z.string().min(2, 'Nombre requerido'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords no coinciden',
    path: ['confirmPassword'],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const onboardingSchema = z.object({
  familias_favoritas: z.array(z.string()).min(1, 'Selecciona al menos una familia').max(5, 'Máximo 5 familias'),
  intensidad_preferida: z.enum(['Baja', 'Moderada', 'Alta'], {
    message: 'Selecciona una intensidad',
  }),
  ocasiones: z.array(z.string()).min(1, 'Selecciona al menos una ocasión'),
  clima_preferido: z.array(z.string()).min(1, 'Selecciona al menos un clima'),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Nombre requerido').optional(),
  phone: z.string().optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

