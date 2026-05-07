import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ProfileUpdateData {
  first_name: string
  last_name: string
  phone: string
  nationality: string
  shirt_size?: string
  blood_type?: string
  emergency_contact_name: string
  emergency_contact_phone: string
  medical_conditions?: string
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const { error } = await supabase.from('profiles').update({
        first_name:          data.first_name,
        last_name:           data.last_name,
        phone:               data.phone,
        nationality:         data.nationality,
        shirt_size:          data.shirt_size || null,
        blood_type:          data.blood_type || null,
        medical_conditions:  data.medical_conditions || null,
        emergency_contact:   {
          name:  data.emergency_contact_name,
          phone: data.emergency_contact_phone,
        },
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)

      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}

export function useMyRegistrations() {
  return useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id, bib_number, category, status, created_at,
          ticket_type:ticket_type_id ( name, distance_km ),
          event:event_id ( name, slug, starts_at, cover_image_url ),
          orders ( id, status )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

export function useMyEventRegistration(eventId: string) {
  return useQuery({
    queryKey: ['my-event-registration', eventId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await supabase
        .from('registrations')
        .select('id, status')
        .eq('buyer_id', user.id)
        .eq('event_id', eventId)
        .in('status', ['pending_payment', 'paid'])
        .maybeSingle()

      return data ?? null
    },
    enabled: !!eventId,
  })
}

export function useUploadApto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const ext  = file.name.split('.').pop()
      const path = `medical-certs/${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)

      const { error: updateError } = await supabase.from('profiles').update({
        apto_medico_url:    publicUrl,
        apto_medico_status: 'pendiente',
        apto_medico_rejection_reason: null,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)

      if (updateError) throw updateError
      return publicUrl
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}
