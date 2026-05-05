import { z } from 'zod'

// Step 1: personal data (pre-filled from profile)
export const step1Schema = z.object({
  first_name: z.string().min(2, 'Mínimo 2 caracteres'),
  last_name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Teléfono inválido'),
  birth_date: z.string().min(1, 'Fecha requerida'),
  gender: z.enum(['M', 'F', 'X']).refine(v => !!v, { message: 'Género requerido' }),
  dni_type: z.enum(['DNI', 'PASAPORTE', 'CI']),
  dni: z.string().min(6, 'Documento inválido'),
  nationality: z.string().min(2, 'Nacionalidad requerida'),
})

// Step 2: sports data
export const step2Schema = z.object({
  distance_id: z.string().min(1, 'Seleccioná una distancia'),
  shirt_size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']).refine(v => !!v, { message: 'Talle requerido' }),
  is_first_race: z.boolean(),
  club: z.string().optional(),
})

// Step 3: emergency / safety data
export const step3Schema = z.object({
  emergency_contact_name: z.string().min(2, 'Nombre requerido'),
  emergency_contact_phone: z.string().min(8, 'Teléfono inválido'),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-', 'No sé']).refine(v => !!v, { message: 'Grupo sanguíneo requerido' }),
  medical_conditions: z.string().optional(),
  allergies: z.string().optional(),
})

// Step 4: medical certificate (optional if not required by event)
export const step4Schema = z.object({
  medical_certificate_url: z.string().optional(),
  medical_certificate_file: z.instanceof(File).optional(),
})

// Step 5: acceptances
export const step5Schema = z.object({
  accepts_terms: z.literal(true, { message: 'Debés aceptar los términos' }),
  accepts_waiver: z.literal(true, { message: 'Debés aceptar el deslinde' }),
  accepts_image_rights: z.boolean(),
})

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type Step4Data = z.infer<typeof step4Schema>
export type Step5Data = z.infer<typeof step5Schema>

export type RegistrationFormData = Step1Data & Step2Data & Step3Data & Step4Data & Step5Data
