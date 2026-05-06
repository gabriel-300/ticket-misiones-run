import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

// ─── Own organization ─────────────────────────────────────────────────────────

export function useMyOrganization() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['my-organization', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user!.id)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data ?? null
    },
    enabled: !!user,
  })
}

// ─── Organizer stats ──────────────────────────────────────────────────────────

export function useOrgStats(orgId: string) {
  return useQuery({
    queryKey: ['org-stats', orgId],
    queryFn: async () => {
      const [eventsRes, regsRes, revenueRes] = await Promise.all([
        supabase.from('events').select('id, status', { count: 'exact' }).eq('organization_id', orgId),
        supabase
          .from('registrations')
          .select('id, status', { count: 'exact' })
          .in('event_id', await getOrgEventIds(orgId)),
        supabase
          .from('orders')
          .select('total_amount')
          .eq('status', 'paid')
          .in('id', await getOrgOrderIds(orgId)),
      ])

      const totalEvents     = eventsRes.count ?? 0
      const publishedEvents = eventsRes.data?.filter(e => e.status === 'published').length ?? 0
      const totalRegs       = regsRes.count ?? 0
      const paidRegs        = regsRes.data?.filter(r => r.status === 'paid').length ?? 0
      const totalRevenue    = revenueRes.data?.reduce((s, o) => s + Number(o.total_amount), 0) ?? 0

      return { totalEvents, publishedEvents, totalRegs, paidRegs, totalRevenue }
    },
    enabled: !!orgId,
  })
}

async function getOrgEventIds(orgId: string): Promise<string[]> {
  const { data } = await supabase.from('events').select('id').eq('organization_id', orgId)
  return data?.map(e => e.id) ?? []
}

async function getOrgOrderIds(orgId: string): Promise<string[]> {
  const eventIds = await getOrgEventIds(orgId)
  if (!eventIds.length) return []
  const { data } = await supabase
    .from('registrations')
    .select('order_id')
    .in('event_id', eventIds)
    .not('order_id', 'is', null)
  return [...new Set(data?.map(r => r.order_id as string) ?? [])]
}

// ─── Organizer events ─────────────────────────────────────────────────────────

export function useOrgEvents(orgId: string) {
  return useQuery({
    queryKey: ['org-events', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id, name, slug, type, status, starts_at,
          registration_opens_at, registration_closes_at, location,
          ticket_types ( id, name, capacity, registered_count )
        `)
        .eq('organization_id', orgId)
        .order('starts_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!orgId,
  })
}

// ─── Toggle event status (organizer) ─────────────────────────────────────────

export function useOrgToggleEventStatus(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      const { error } = await supabase.from('events').update({ status }).eq('id', eventId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['org-events', orgId] }),
  })
}
