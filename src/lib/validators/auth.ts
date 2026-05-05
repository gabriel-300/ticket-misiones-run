import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  confirm_password: z.string(),
  first_name: z.string().min(2, 'Nombre requerido').max(50),
  last_name: z.string().min(2, 'Apellido requerido').max(50),
  dni_type: z.enum(['DNI', 'PASAPORTE', 'CI']),
  dni: z
    .string()
    .min(6, 'DNI inválido')
    .max(20)
    .regex(/^[a-zA-Z0-9]+$/, 'Solo letras y números'),
  birth_date: z
    .string()
    .refine((val) => {
      const d = new Date(val)
      const age = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      return age >= 16 && age <= 100
    }, 'Edad inválida (mínimo 16 años)'),
  gender: z.enum(['M', 'F', 'X']),
  phone: z
    .string()
    .min(8, 'Teléfono inválido')
    .regex(/^\+?[\d\s\-()]+$/, 'Teléfono inválido'),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>
