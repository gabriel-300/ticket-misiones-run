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

// ─── Add-ons (complementary services) ────────────────────────────────────────

export function useOrgAddons(orgId: string) {
  return useQuery({
    queryKey: ['org-addons', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complementary_services')
        .select('*, event:event_id(id, name)')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!orgId,
  })
}

interface CreateAddonPayload {
  organization_id: string
  event_id: string
  title: string
  description?: string
  category: string
  partner_name?: string
  price_from: number | null
  contact_method?: string
  contact_value?: string
  image_url?: string
}

export function useCreateAddon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateAddonPayload) => {
      const { data, error } = await supabase
        .from('complementary_services')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({
          organization_id: payload.organization_id,
          event_id: payload.event_id,
          title: payload.title,
          description: payload.description ?? null,
          category: payload.category,
          partner_name: payload.partner_name ?? '',
          price_from: payload.price_from,
          contact_method: payload.contact_method ?? 'form',
          contact_value: payload.contact_value ?? null,
          image_url: payload.image_url ?? null,
          active: true,
        } as any)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['org-addons', vars.organization_id] })
    },
  })
}

export function useToggleAddon(orgId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ addonId, active }: { addonId: string; active: boolean }) => {
      const { error } = await supabase
        .from('complementary_services')
        .update({ active })
        .eq('id', addonId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['org-addons', orgId] }),
  })
}

// ─── Event detail (for organizer) ────────────────────────────────────────────

export function useOrgEventDetail(eventId: string) {
  return useQuery({
    queryKey: ['org-event-detail', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id, name, slug, type, status, starts_at,
          registration_opens_at, registration_closes_at, location,
          short_description, description, cover_image_url,
          ticket_types (
            id, name, distance_km, capacity, registered_count, active,
            pricing_tiers ( id, name, price_ars, starts_at, ends_at, active )
          )
        `)
        .eq('id', eventId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!eventId,
  })
}

// ─── Pricing tiers ───────────────────────────────────────────────────────────

export interface CreatePricingTierInput {
  event_id: string
  ticket_type_id: string
  name: string
  price_ars: number
  starts_at: string
  ends_at: string
}

export function useCreatePricingTier(eventId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreatePricingTierInput) => {
      const { error } = await supabase.from('pricing_tiers').insert({ ...input, active: true })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['org-event-detail', eventId] }),
  })
}

export function useDeletePricingTier(eventId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (tierId: string) => {
      const { error } = await supabase.from('pricing_tiers').delete().eq('id', tierId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['org-event-detail', eventId] }),
  })
}
