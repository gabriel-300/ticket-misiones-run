import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { useEvent } from '@/hooks/use-events'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import RegistrationForm from '@/components/inscripcion/registration-form'

export const Route = createFileRoute('/inscripcion/$eventId')({
  component: () => (
    <ProtectedRoute>
      <InscripcionPage />
    </ProtectedRoute>
  ),
})

function InscripcionPage() {
  const { eventId } = Route.useParams()
  const { data: event, isLoading, error } = useEvent(eventId, 'id')
  const { profile, user } = useAuth()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-40 mb-8" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Evento no encontrado</h2>
        <Link to="/eventos"><Button className="mt-6">Ver todos los eventos</Button></Link>
      </div>
    )
  }

  const now = new Date()
  const registrationOpens = new Date(event.registration_opens_at)
  const registrationCloses = new Date(event.registration_closes_at)
  const isOpen = now >= registrationOpens && now <= registrationCloses

  if (!isOpen) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Inscripciones no disponibles</h2>
        <p className="text-muted-foreground mt-2">
          {now < registrationOpens ? 'Las inscripciones aún no abrieron.' : 'Las inscripciones ya están cerradas.'}
        </p>
        <Link to="/eventos/$slug" params={{ slug: event.slug }}>
          <Button className="mt-6">Volver al evento</Button>
        </Link>
      </div>
    )
  }

  const distances = (event.ticket_types as any[]) ?? []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/eventos/$slug" params={{ slug: event.slug }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Volver al evento
        </Link>
        <h1 className="text-2xl font-bold">Inscripción</h1>
        <p className="text-muted-foreground">{event.name}</p>
      </div>

      <RegistrationForm
        eventId={event.id}
        eventName={event.name}
        userEmail={user?.email ?? ''}
        eventType={event.type}
        distances={distances}
        requiresMedicalCert={event.requires_medical_certificate ?? false}
        medicalCertMinKm={event.medical_certificate_min_distance_km ?? null}
        profile={profile}
      />
    </div>
  )
}
