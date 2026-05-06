import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useComplementaryServices(eventId: string) {
  return useQuery({
    queryKey: ['complementary-services', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complementary_services')
        .select('*')
        .eq('event_id', eventId)
        .eq('active', true)
        .order('display_order')

      if (error) throw error
      return data
    },
    enabled: !!eventId,
  })
}

export function useServiceInterests(registrationId: string) {
  return useQuery({
    queryKey: ['service-interests', registrationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_interests')
        .select('service_id')
        .eq('registration_id', registrationId)

      if (error) throw error
      return data?.map(r => r.service_id) ?? []
    },
    enabled: !!registrationId,
  })
}

export function useToggleServiceInterest(registrationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ serviceId, alreadyInterested }: { serviceId: string; alreadyInterested: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      if (alreadyInterested) {
        const { error } = await supabase
          .from('service_interests')
          .delete()
          .eq('registration_id', registrationId)
          .eq('service_id', serviceId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('service_interests')
          .insert({ registration_id: registrationId, service_id: serviceId, buyer_id: user.id })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-interests', registrationId] })
    },
  })
}
