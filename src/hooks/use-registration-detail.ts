import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useRegistrationDetail(registrationId: string) {
  return useQuery({
    queryKey: ['registration-detail', registrationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id, bib_number, category, status, created_at,
          distance:distance_id ( name, distance_km, start_time ),
          event:event_id ( id, name, slug, starts_at, location, cover_image_url )
        `)
        .eq('id', registrationId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!registrationId,
  })
}
