import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useEvents(type?: string) {
  return useQuery({
    queryKey: ['events', type],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          id, slug, name, short_description, type,
          starts_at, registration_opens_at, registration_closes_at,
          location, cover_image_url, status,
          event_distances(id, name, distance_km, capacity, registered_count, sort_order, active)
        `)
        .eq('status', 'published')
        .order('starts_at', { ascending: true })

      if (type) query = query.eq('type', type)

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_distances(*, pricing_tiers(*)),
          complementary_services(*)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error) throw error
      return data
    },
    enabled: !!slug,
  })
}
