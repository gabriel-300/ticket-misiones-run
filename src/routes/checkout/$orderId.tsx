import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertCircle, Calendar, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useRef } from 'react'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { useOrder } from '@/hooks/use-order'
import { useUpsellCart } from '@/hooks/use-upsell-cart'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import CheckoutForm from '@/components/checkout/checkout-form'
import { formatARS } from '@/lib/utils'

export const Route = createFileRoute('/checkout/$orderId')({
  component: () => (
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  ),
})

function CheckoutPage() {
  const { orderId } = Route.useParams()
  const { data: order, isLoading, error, refetch } = useOrder(orderId)
  const navigate = useNavigate()
  const cart = useUpsellCart(orderId)
  const syncedRef = useRef(false)

  // Sync cart total into the order before rendering the payment form
  useEffect(() => {
    if (!order || syncedRef.current) return
    if (cart.items.length === 0) { syncedRef.current = true; return }

    const baseAmount = Number(order.total_amount)
    const newTotal = baseAmount + cart.total

    const existingItems = (order.items as any[]) ?? []
    const serviceItems = cart.items.map(i => ({
      type: 'service',
      service_id: i.serviceId,
      title: i.title,
      category: i.category,
      price: i.price,
    }))

    supabase
      .from('orders')
      .update({ total_amount: newTotal, items: [...existingItems, ...serviceItems] })
      .eq('id', orderId)
      .then(({ error }) => {
        if (!error) { syncedRef.current = true; refetch() }
      })
  }, [order, orderId, cart.items, cart.total, refetch])

  if (isLoading) {
    return (
      <div className="bg-paper min-h-screen">
        <div className="bg-navy h-32 animate-pulse" />
        <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-48 rounded-[16px]" />
          <Skeleton className="h-64 rounded-[16px]" />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="bg-paper min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-terra mx-auto mb-4" />
        <h2 className="font-display text-[26px] text-navy">Orden no encontrada</h2>
        <Link to="/eventos">
          <button className="mt-6 px-6 py-3 rounded-full bg-navy text-paper font-semibold hover:bg-terra transition-colors">
            Ver eventos
          </button>
        </Link>
      </div>
    )
  }

  if (order.status === 'paid') {
    const reg = (order as any).registration
    if (reg?.id) {
      navigate({ to: '/confirmacion/$registrationId', params: { registrationId: reg.id } })
      return null
    }
  }

  if (order.status === 'failed') {
    return (
      <div className="bg-paper min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center max-w-lg mx-auto">
        <AlertCircle className="h-12 w-12 text-terra mx-auto mb-4" />
        <h2 className="font-display text-[26px] text-navy">Pago fallido</h2>
        <p className="text-brand-muted mt-2 text-[15px]">El pago anterior fue rechazado. Podés intentar de nuevo.</p>
        <Link to="/eventos">
          <button className="mt-6 px-6 py-3 rounded-full bg-navy text-paper font-semibold hover:bg-terra transition-colors">
            Ver eventos
          </button>
        </Link>
      </div>
    )
  }

  const reg = order.registration as any
  const event = reg?.event as any
  const ticketType = reg?.ticket_type as any
  const items = (order.items as any[]) ?? []
  const baseItem = items.find((i: any) => i.type !== 'service') ?? items[0] ?? {}
  const basePriceFromItems = baseItem.base_price as number | undefined
  const serviceFeeFromItems = baseItem.service_fee as number | undefined

  // Use synced total (already updated in DB) or compute optimistically
  const displayTotal = cart.items.length > 0 && !syncedRef.current
    ? Number(order.total_amount) + cart.total
    : Number(order.total_amount)

  async function handlePayment({ token, bin, paymentMethodId, installments }: {
    token: string; bin: string; paymentMethodId: number; installments: number
  }) {
    const { data, error } = await supabase.functions.invoke('payway-checkout', {
      body: { order_id: orderId, token, bin, payment_method_id: paymentMethodId, installments },
    })

    if (error) {
      const detail = (error as any)?.context
        ? await (error as any).context.text?.().catch(() => null)
        : null
      throw new Error(detail ?? error.message)
    }

    if (data?.aprobado) {
      cart.clear()
      toast.success(data.mensaje)
      const regId = data.registration_id ?? (order?.registration as any)?.id
      if (regId) {
        navigate({ to: '/confirmacion/$registrationId', params: { registrationId: regId } })
      }
    } else {
      toast.error(data?.mensaje ?? 'Pago rechazado. Intentá con otra tarjeta.')
      throw new Error(data?.mensaje ?? 'Pago rechazado')
    }
  }

  return (
    <div className="bg-paper min-h-screen pb-12">

      {/* ── Header ── */}
      <div className="bg-navy text-paper px-4 py-10">
        <div className="max-w-xl mx-auto">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-yellow/70 mb-2">Paso final</p>
          <h1 className="font-display text-[clamp(28px,4vw,42px)] leading-[0.97] tracking-[-0.02em]">
            Confirmar y pagar
          </h1>
          {event?.name && (
            <p className="text-paper/60 text-[14px] mt-2">{event.name}</p>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-4">

        {/* ── Resumen ── */}
        <div className="bg-white rounded-[18px] border border-line overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h2 className="font-display text-[18px] text-navy">Resumen del pedido</h2>
          </div>

          <div className="px-5 py-4 space-y-3">
            {/* Event info */}
            {event && (
              <div className="space-y-0.5">
                <p className="font-semibold text-[15px] text-navy">{event.name}</p>
                {ticketType && (
                  <p className="text-[13px] text-brand-muted">
                    {ticketType.name}{ticketType.distance_km != null ? ` — ${ticketType.distance_km} km` : ''}
                  </p>
                )}
                {event.starts_at && (
                  <p className="text-[13px] text-brand-muted flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(event.starts_at), "d 'de' MMMM yyyy", { locale: es })}
                  </p>
                )}
              </div>
            )}

            <div className="border-t border-line pt-3 space-y-1.5 text-[14px]">
              {basePriceFromItems !== undefined && (
                <div className="flex justify-between text-brand-muted">
                  <span>Inscripción</span>
                  <span>{formatARS(basePriceFromItems)}</span>
                </div>
              )}
              {serviceFeeFromItems !== undefined && (
                <div className="flex justify-between text-brand-muted">
                  <span>Fee de servicio</span>
                  <span>{formatARS(serviceFeeFromItems)}</span>
                </div>
              )}

              {/* Cart services */}
              {cart.items.length > 0 && (
                <>
                  <div className="flex items-center gap-1.5 pt-2 pb-1">
                    <ShoppingCart className="h-3.5 w-3.5 text-yellow" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted">
                      Servicios adicionales
                    </span>
                  </div>
                  {cart.items.map(item => (
                    <div key={item.serviceId} className="flex justify-between text-navy">
                      <span className="truncate max-w-[65%]">{item.title}</span>
                      <span className="font-mono text-[13px] text-yellow shrink-0">{formatARS(item.price)}</span>
                    </div>
                  ))}
                </>
              )}

              <div className="flex justify-between font-bold text-[17px] text-navy border-t border-line pt-2 mt-2">
                <span>Total</span>
                <span className="font-display text-[22px]">{formatARS(displayTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Form de pago ── */}
        <div className="bg-white rounded-[18px] border border-line overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h2 className="font-display text-[18px] text-navy">Datos de pago</h2>
          </div>
          <div className="px-5 py-4">
            <CheckoutForm
              totalAmount={displayTotal}
              onSuccess={() => {}}
              onSubmit={handlePayment}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
