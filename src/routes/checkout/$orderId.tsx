import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { CreditCard } from 'lucide-react'

export const Route = createFileRoute('/checkout/$orderId')({
  component: () => (
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  ),
})

function CheckoutPage() {
  const { orderId } = Route.useParams()
  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-lg">
      <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
      <h1 className="text-2xl font-bold">Procesando pago</h1>
      <p className="text-muted-foreground mt-2">Orden: {orderId}</p>
      <p className="text-sm text-muted-foreground mt-4">
        La integración con Payway se completa en el Bloque 6.
      </p>
    </div>
  )
}
