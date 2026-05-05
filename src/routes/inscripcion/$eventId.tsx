import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/layout/protected-route'

export const Route = createFileRoute('/inscripcion/$eventId')({
  component: () => (
    <ProtectedRoute>
      <InscripcionPage />
    </ProtectedRoute>
  ),
})

function InscripcionPage() {
  const { eventId } = Route.useParams()
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Formulario de inscripción</h1>
      <p className="text-muted-foreground mt-2">Evento ID: {eventId}</p>
      <p className="text-sm text-muted-foreground mt-1">Esta sección se completa en el Bloque 5.</p>
    </div>
  )
}
