import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { RegistrationFormData } from '@/lib/validators/registration'

interface CreateRegistrationParams {
  eventId: string
  distanceId: string
  formData: RegistrationFormData
  medicalCertUrl?: string
}

export function useCreateRegistration() {
  return useMutation({
    mutationFn: async ({ eventId, distanceId, formData, medicalCertUrl }: CreateRegistrationParams) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const category = calculateCategory(formData.birth_date, formData.gender)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .rpc('create_registration_with_order', {
          p_event_id: eventId,
          p_distance_id: distanceId,
          p_user_id: user.id,
          p_first_name: formData.first_name,
          p_last_name: formData.last_name,
          p_phone: formData.phone,
          p_birth_date: formData.birth_date,
          p_gender: formData.gender,
          p_dni_type: formData.dni_type,
          p_dni: formData.dni,
          p_nationality: formData.nationality,
          p_shirt_size: formData.shirt_size ?? null,
          p_is_first_race: formData.is_first_race ?? false,
          p_club: formData.club ?? null,
          p_emergency_contact_name: formData.emergency_contact_name ?? '',
          p_emergency_contact_phone: formData.emergency_contact_phone ?? '',
          p_blood_type: formData.blood_type ?? null,
          p_medical_conditions: formData.medical_conditions ?? null,
          p_allergies: formData.allergies ?? null,
          p_medical_certificate_url: medicalCertUrl ?? null,
          p_accepts_image_rights: formData.accepts_image_rights,
          p_category: category,
        })

      if (error) throw error
      return data as unknown as { registration_id: string; order_id: string }
    },
  })
}

function calculateCategory(birthDate: string, gender: string): string {
  const birth = new Date(birthDate)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()

  const genderPrefix = gender === 'M' ? 'H' : gender === 'F' ? 'D' : 'X'

  if (age < 20) return `${genderPrefix}-18`
  if (age < 25) return `${genderPrefix}20-24`
  if (age < 30) return `${genderPrefix}25-29`
  if (age < 35) return `${genderPrefix}30-34`
  if (age < 40) return `${genderPrefix}35-39`
  if (age < 45) return `${genderPrefix}40-44`
  if (age < 50) return `${genderPrefix}45-49`
  if (age < 55) return `${genderPrefix}50-54`
  if (age < 60) return `${genderPrefix}55-59`
  return `${genderPrefix}60+`
}
