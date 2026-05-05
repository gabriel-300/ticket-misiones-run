import { createFileRoute, Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle2, Calendar, MapPin, Medal, Tag, ChevronRight, AlertCircle } from 'lucide-react'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { useRegistrationDetail } from '@/hooks/use-registration-detail'
import { useComplementaryServices, useServiceInterests } from '@/hooks/use-complementary-services'
import { useAuth } from '@/hooks/use-auth'
import ServiceCard from '@/components/confirmacion/service-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/confirmacion/$registrationId')({
  component: () => (
    <ProtectedRoute>
      <ConfirmacionPage />
    </ProtectedRoute>
  ),
})

function ConfirmacionPage() {
  const { registrationId } = Route.useParams()
  const { profile } = useAuth()
  const { data: reg, isLoading, error } = useRegistrationDetail(registrationId)
  const event = reg?.event as any
  const distance = reg?.distance as any

  const { data: services } = useComplementaryServices(event?.id ?? '')
  const { data: interestedIds } = useServiceInterests(registrationId)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error || !reg) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Inscripción no encontrada</h2>
        <Link to="/"><Button className="mt-6">Ir al inicio</Button></Link>
      </div>
    )
  }

  const location = event?.location as { city: string; province: string } | null

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">

      {/* Hero confirmación */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-extrabold">
          ¡Estás inscripto{profile?.gender === 'F' ? 'a' : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Hola {profile?.first_name}, tu lugar está reservado.
        </p>
      </div>

      {/* Detalle inscripción */}
      <div className="bg-muted/40 rounded-xl p-5 mb-8 space-y-3">
        <h2 className="font-bold text-lg">{event?.name}</h2>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{event?.starts_at ? format(new Date(event.starts_at), "d 'de' MMMM yyyy", { locale: es }) : '—'}</span>
          </div>
          {location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{location.city}, {location.province}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Tag className="h-4 w-4 shrink-0" />
            <span>{distance?.name} — {distance?.distance_km} km</span>
          </div>
          {reg.category && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Medal className="h-4 w-4 shrink-0" />
              <span>Categoría {reg.category}</span>
            </div>
          )}
        </div>

        {reg.bib_number && (
          <>
            <Separator />
            <div className="text-center py-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Número de dorsal</p>
              <p className="text-5xl font-extrabold text-primary">#{reg.bib_number}</p>
            </div>
          </>
        )}
      </div>

      {/* Upsell race-cation */}
      {services && services.length > 0 && (
        <div className="mb-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Armá tu race‑cation 🏃</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Servicios curados para que aproveches tu viaje a {location?.city ?? 'Misiones'} al máximo.
              Guardá los que te interesan con el ❤️ y contactá al proveedor directo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                registrationId={registrationId}
                isInterested={interestedIds?.includes(service.id) ?? false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Acciones finales */}
      <div className="flex flex-col sm:flex-row gap-3">
        {event?.slug && (
          <Link to="/eventos/$slug" params={{ slug: event.slug }} className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              Ver el evento
            </Button>
          </Link>
        )}
        <Link to="/eventos" className="flex-1">
          <Button className="w-full gap-2">
            Ver más eventos <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-6">
        Vas a recibir un email de confirmación en {profile?.first_name ? `la casilla de ${profile.first_name}` : 'tu casilla'} pronto.
      </p>
    </div>
  )
}
