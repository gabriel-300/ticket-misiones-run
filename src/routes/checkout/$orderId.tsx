import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertCircle, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { useOrder } from '@/hooks/use-order'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import CheckoutForm from '@/components/checkout/checkout-form'

export const Route = createFileRoute('/checkout/$orderId')({
  component: () => (
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  ),
})

const formatARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

function CheckoutPage() {
  const { orderId } = Route.useParams()
  const { data: order, isLoading, error } = useOrder(orderId)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Orden no encontrada</h2>
        <Link to="/eventos"><Button className="mt-6">Ver eventos</Button></Link>
      </div>
    )
  }

  // Already paid — redirect to confirmation
  if (order.status === 'paid') {
    const reg = order.registration as any
    if (reg?.id) {
      navigate({ to: '/confirmacion/$registrationId', params: { registrationId: reg.id } })
      return null
    }
  }

  // Already failed/processed
  if (order.status === 'failed') {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Pago fallido</h2>
        <p className="text-muted-foreground mt-2">El pago anterior fue rechazado. Podés intentar de nuevo.</p>
        <Link to="/eventos"><Button className="mt-6">Ver eventos</Button></Link>
      </div>
    )
  }

  const reg = order.registration as any
  const event = reg?.event as any
  const ticketType = reg?.ticket_type as any
  const items = (order.items as any[])?.[0] ?? {}
  const basePriceFromItems = items.base_price as number | undefined
  const serviceFeeFromItems = items.service_fee as number | undefined

  async function handlePayment({ token, bin, paymentMethodId, installments }: {
    token: string; bin: string; paymentMethodId: number; installments: number
  }) {
    const { data, error } = await supabase.functions.invoke('payway-checkout', {
      body: { order_id: orderId, token, bin, payment_method_id: paymentMethodId, installments },
    })

    if (error) throw new Error(error.message)

    if (data?.aprobado) {
      toast.success(data.mensaje)
      const regId = (order?.registration as any)?.id
      if (regId) {
        navigate({ to: '/confirmacion/$registrationId', params: { registrationId: regId } })
      }
    } else {
      toast.error(data?.mensaje ?? 'Pago rechazado. Intentá con otra tarjeta.')
      throw new Error(data?.mensaje ?? 'Pago rechazado')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Finalizar inscripción</h1>

      <div className="space-y-4">
        {/* Order summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {event && (
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-base">{event.name}</p>
                {ticketType && (
                  <p className="text-muted-foreground">
                    {ticketType.name}{ticketType.distance_km != null ? ` — ${ticketType.distance_km} km` : ''}
                  </p>
                )}
                {event.starts_at && (
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(event.starts_at), "d 'de' MMMM yyyy", { locale: es })}
                  </p>
                )}
              </div>
            )}

            <Separator />

            <div className="space-y-1 text-sm">
              {basePriceFromItems !== undefined && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Inscripción</span>
                  <span>{formatARS(basePriceFromItems)}</span>
                </div>
              )}
              {serviceFeeFromItems !== undefined && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Fee de servicio</span>
                  <span>{formatARS(serviceFeeFromItems)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Total</span>
                <span>{formatARS(Number(order.total_amount))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card form */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Datos de pago</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckoutForm
              totalAmount={Number(order.total_amount)}
              onSuccess={() => {}}
              onSubmit={handlePayment}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
