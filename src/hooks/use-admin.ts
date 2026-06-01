import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ─── Stats ────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [orgsRes, eventsRes, regsRes, revenueRes] = await Promise.all([
        supabase.from('organizations').select('id, status', { count: 'exact' }),
        supabase.from('events').select('id, status', { count: 'exact' }),
        supabase.from('registrations').select('id, status', { count: 'exact' }),
        supabase.from('orders').select('total_amount').eq('status', 'paid'),
      ])

      const totalOrgs      = orgsRes.count ?? 0
      const activeOrgs     = orgsRes.data?.filter(o => o.status === 'active').length ?? 0
      const totalEvents    = eventsRes.count ?? 0
      const publishedEvents = eventsRes.data?.filter(e => e.status === 'published').length ?? 0
      const totalRegs      = regsRes.count ?? 0
      const paidRegs       = regsRes.data?.filter(r => r.status === 'paid').length ?? 0
      const totalRevenue   = revenueRes.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0

      return { totalOrgs, activeOrgs, totalEvents, publishedEvents, totalRegs, paidRegs, totalRevenue }
    },
  })
}

// ─── Organizations ────────────────────────────────────────────────────────────

export function useAdminOrganizations() {
  return useQuery({
    queryKey: ['admin-organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          id, name, slug, contact_email, status, commission_rate,
          logo_url, created_at,
          owner:owner_id ( first_name, last_name )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

export interface CreateOrganizationInput {
  name: string
  slug: string
  contact_email: string
  phone?: string
  description?: string
  logo_url?: string
  website_url?: string
  commission_rate: number
  owner_id?: string
}

export function useCreateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateOrganizationInput) => {
      const { data, error } = await supabase
        .from('organizations')
        .insert({ ...input, status: 'active' })
        .select('id')
        .single()
      if (error) throw error
      return data.id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-organizations'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export function useUpdateOrganizationStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ orgId, status }: { orgId: string; status: string }) => {
      const { error } = await supabase
        .from('organizations')
        .update({ status })
        .eq('id', orgId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-organizations'] }),
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
          location, organization_id,
          organization:organization_id ( name, slug ),
          ticket_types ( id, name, distance_km, capacity, registered_count )
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
          buyer:buyer_id (
            first_name, last_name, dni, gender, phone,
            blood_type, apto_medico_status, apto_medico_url,
            emergency_contact
          ),
          ticket_type:ticket_type_id ( name, distance_km )
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

export function useUpdateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ orgId, data }: { orgId: string; data: { name?: string; contact_email?: string; commission_rate?: number } }) => {
      const { error } = await supabase.from('organizations').update(data).eq('id', orgId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-organizations'] }),
  })
}

export function useDeleteOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (orgId: string) => {
      const { error } = await supabase.from('organizations').delete().eq('id', orgId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-organizations'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export interface UpdateEventInput {
  name?: string
  starts_at?: string
  registration_opens_at?: string
  registration_closes_at?: string
  city?: string
  province?: string
  address?: string
  short_description?: string
  description?: string
  cover_image_url?: string
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: UpdateEventInput }) => {
      const { city, province, address, ...rest } = data
      const update: Record<string, any> = { ...rest }
      if (city !== undefined || province !== undefined) {
        update.location = { city: city ?? '', province: province ?? '', address: address ?? '' }
      }
      const { error } = await supabase.from('events').update(update).eq('id', eventId)
      if (error) throw error
    },
    onSuccess: (_, { eventId }) => {
      qc.invalidateQueries({ queryKey: ['admin-events'] })
      qc.invalidateQueries({ queryKey: ['org-event-detail', eventId] })
    },
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from('events').delete().eq('id', eventId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] })
      qc.invalidateQueries({ queryKey: ['events'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

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

export function useSetFeaturedEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ eventId, featured }: { eventId: string; featured: boolean }) => {
      // Si se marca como featured, primero quitar el featured anterior
      if (featured) {
        await supabase.from('events').update({ is_featured: false }).eq('is_featured', true)
      }
      const { error } = await supabase.from('events').update({ is_featured: featured }).eq('id', eventId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] })
      qc.invalidateQueries({ queryKey: ['events', 'featured'] })
    },
  })
}

// ─── Create event ─────────────────────────────────────────────────────────────

export interface CreateEventInput {
  name: string
  slug: string
  type: string
  status: 'draft' | 'published'
  organization_id?: string
  starts_at: string
  registration_opens_at: string
  registration_closes_at: string
  short_description: string
  description?: string
  city: string
  province: string
  address?: string
  cover_image_url?: string
  ticket_types: Array<{ name: string; distance_km?: number; capacity: number }>
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          name: input.name,
          slug: input.slug,
          type: input.type,
          status: input.status,
          organization_id: input.organization_id ?? null,
          starts_at: input.starts_at,
          registration_opens_at: input.registration_opens_at,
          registration_closes_at: input.registration_closes_at,
          short_description: input.short_description,
          description: input.description || null,
          location: { city: input.city, province: input.province, address: input.address || '' },
          cover_image_url: input.cover_image_url || null,
        })
        .select('id')
        .single()

      if (eventError) throw eventError

      const ticketTypes = input.ticket_types.map((t, i) => ({
        event_id: event.id,
        name: t.name,
        distance_km: t.distance_km ?? null,
        capacity: t.capacity,
        sort_order: i + 1,
        active: true,
        registered_count: 0,
      }))

      const { error: ttError } = await supabase.from('ticket_types').insert(ticketTypes)
      if (ttError) throw ttError

      return event.id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}
