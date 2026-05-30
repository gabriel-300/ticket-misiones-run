import { z } from 'zod'

function calcAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  const hasBirthdayPassed =
    today >= new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  return hasBirthdayPassed ? age : age - 1
}

// Step 1: personal data (pre-filled from profile) + guardian when minor
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
  // Guardian fields — required only when minor
  guardian_full_name: z.string().optional(),
  guardian_dni: z.string().optional(),
  guardian_phone: z.string().optional(),
  guardian_relationship: z.enum(['padre', 'madre', 'tutor_legal', 'otro']).optional(),
  accepts_guardian_authorization: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (!data.birth_date) return
  const age = calcAge(data.birth_date)
  if (age >= 18) return

  if (!data.guardian_full_name || data.guardian_full_name.length < 2) {
    ctx.addIssue({ code: 'custom', path: ['guardian_full_name'], message: 'Nombre del responsable requerido' })
  }
  if (!data.guardian_dni || data.guardian_dni.length < 6) {
    ctx.addIssue({ code: 'custom', path: ['guardian_dni'], message: 'DNI del responsable requerido' })
  }
  if (!data.guardian_phone || data.guardian_phone.length < 8) {
    ctx.addIssue({ code: 'custom', path: ['guardian_phone'], message: 'Teléfono del responsable requerido' })
  }
  if (!data.guardian_relationship) {
    ctx.addIssue({ code: 'custom', path: ['guardian_relationship'], message: 'Relación requerida' })
  }
  if (!data.accepts_guardian_authorization) {
    ctx.addIssue({ code: 'custom', path: ['accepts_guardian_authorization'], message: 'La autorización del responsable es requerida' })
  }
})

// Step 2: ticket / sports data
export const step2Schema = z.object({
  distance_id: z.string().min(1, 'Seleccioná una entrada'),
  shirt_size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']).optional(),
  is_first_race: z.boolean(),
  club: z.string().optional(),
})

// Step 3: emergency / safety data (kept for future use)
export const step3Schema = z.object({
  emergency_contact_name: z.string().min(2, 'Nombre requerido'),
  emergency_contact_phone: z.string().min(8, 'Teléfono inválido'),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-', 'No sé']).refine(v => !!v, { message: 'Grupo sanguíneo requerido' }),
  medical_conditions: z.string().optional(),
  allergies: z.string().optional(),
})

// Step 4: medical certificate (kept for future use)
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

export type RegistrationFormData = Step1Data & Step2Data & Partial<Step3Data> & Step4Data & Step5Data
