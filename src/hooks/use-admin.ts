import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ─── Stats ────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [eventsRes, regsRes, revenueRes, aptosRes] = await Promise.all([
        supabase.from('events').select('id, status', { count: 'exact' }),
        supabase.from('registrations').select('id, status', { count: 'exact' }),
        supabase.from('orders').select('total_amount').eq('status', 'paid'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('apto_medico_status', 'pendiente').not('apto_medico_url', 'is', null),
      ])

      const totalEvents     = eventsRes.count ?? 0
      const publishedEvents = eventsRes.data?.filter(e => e.status === 'published').length ?? 0
      const totalRegs       = regsRes.count ?? 0
      const paidRegs        = regsRes.data?.filter(r => r.status === 'paid').length ?? 0
      const totalRevenue    = revenueRes.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0
      const pendingAptos    = aptosRes.count ?? 0

      return { totalEvents, publishedEvents, totalRegs, paidRegs, totalRevenue, pendingAptos }
    },
  })
}

// ─── Events (admin view) ──────────────────────────────────────────────────────

export function useAdminEvents() {
  return useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id, name, slug, type, status, starts_at,
          registration_opens_at, registration_closes_at,
          location,
          event_distances ( id, name, distance_km, capacity, registered_count )
        `)
        .order('starts_at', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

// ─── Registrations per event ──────────────────────────────────────────────────

export function useAdminRegistrations(eventId: string) {
  return useQuery({
    queryKey: ['admin-registrations', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id, bib_number, category, status, custom_field_values, created_at,
          runner:runner_id (
            first_name, last_name, dni, gender, phone,
            blood_type, apto_medico_status, apto_medico_url,
            emergency_contact
          ),
          distance:distance_id ( name, distance_km )
        `)
        .eq('event_id', eventId)
        .order('bib_number', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!eventId,
  })
}

// ─── Medical certificates ─────────────────────────────────────────────────────

export function useAdminAptos() {
  return useQuery({
    queryKey: ['admin-aptos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, first_name, last_name, dni,
          apto_medico_url, apto_medico_status,
          apto_medico_issued_at, apto_medico_rejection_reason
        `)
        .not('apto_medico_url', 'is', null)
        .order('apto_medico_status', { ascending: true })

      if (error) throw error
      return data
    },
  })
}

export function useValidateApto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      profileId, status, rejectionReason,
    }: { profileId: string; status: 'aprobado' | 'rechazado'; rejectionReason?: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          apto_medico_status: status,
          apto_medico_rejection_reason: rejectionReason ?? null,
          apto_medico_validated_at: new Date().toISOString(),
        })
        .eq('id', profileId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-aptos'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

// ─── Toggle event status ──────────────────────────────────────────────────────

export function useToggleEventStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      const { error } = await supabase.from('events').update({ status }).eq('id', eventId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-events'] }),
  })
}
