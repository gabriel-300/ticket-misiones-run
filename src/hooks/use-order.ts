import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, total_amount, currency, status, items,
          registration:registration_id (
            id, bib_number, category, status,
            ticket_type:ticket_type_id ( name, distance_km ),
            event:event_id ( name, slug, starts_at )
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!orderId,
  })
}
