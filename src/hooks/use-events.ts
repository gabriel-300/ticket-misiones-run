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
          event_distances(
            id, name, distance_km, capacity, registered_count, sort_order, active,
            pricing_tiers(id, name, price_ars, starts_at, ends_at, active)
          )
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

export function useFeaturedEvent() {
  return useQuery({
    queryKey: ['events', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id, slug, name, starts_at, location,
          event_distances(capacity, registered_count, pricing_tiers(price_ars, active, starts_at, ends_at))
        `)
        .eq('status', 'published')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(1)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data ?? null
    },
  })
}

export function useStats() {
  return useQuery({
    queryKey: ['stats', 'home'],
    queryFn: async () => {
      const [{ count: eventsCount }, { count: runnersCount }, { data: eventsData }] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
        supabase.from('events').select('location').eq('status', 'published'),
      ])
      const cityCount = new Set((eventsData ?? []).map((e: any) => e.location?.city)).size
      return { events: eventsCount ?? 0, runners: runnersCount ?? 0, cities: cityCount }
    },
  })
}

export function useEvent(value: string, by: 'slug' | 'id' = 'slug') {
  return useQuery({
    queryKey: ['event', by, value],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_distances(*, pricing_tiers(*)),
          complementary_services(*)
        `)
        .eq(by, value)
        .eq('status', 'published')
        .single()

      if (error) throw error
      return data
    },
    enabled: !!value,
  })
}
