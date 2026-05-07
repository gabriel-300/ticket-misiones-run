import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      // orders ← registrations.order_id (reverse FK, returns array)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, total_amount, currency, status, items,
          registrations!order_id (
            id, bib_number, category, status,
            ticket_type:ticket_type_id ( name, distance_km ),
            event:event_id ( name, slug, starts_at )
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) throw error

      // Flatten the array to a single registration (1-to-1)
      const reg = Array.isArray((data as any)?.registrations)
        ? (data as any).registrations[0] ?? null
        : null

      return { ...data, registration: reg }
    },
    enabled: !!orderId,
  })
}
