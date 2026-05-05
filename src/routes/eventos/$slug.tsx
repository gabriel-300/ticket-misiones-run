import { createFileRoute, Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin, Calendar, Clock, Users, ChevronRight, AlertCircle } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useEvent } from '@/hooks/use-events'
import Countdown from '@/components/eventos/countdown'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'

const CourseMap = lazy(() => import('@/components/eventos/course-map'))

export const Route = createFileRoute('/eventos/$slug')({
  component: EventoDetallePage,
})

const TYPE_LABELS: Record<string, string> = {
  running: 'Running',
  trail: 'Trail Running',
  triathlon: 'Triatlón',
  cycling: 'Ciclismo',
  other: 'Otro',
}

function PricingTierBadge({ tier }: { tier: { name: string; price_ars: number; starts_at: string; ends_at: string; active: boolean } }) {
  const now = new Date()
  const start = new Date(tier.starts_at)
  const end = new Date(tier.ends_at)
  const isActive = tier.active && now >= start && now <= end

  return (
    <div className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${isActive ? 'bg-green-50 border border-green-200' : 'bg-muted/50'}`}>
      <div>
        <span className="font-medium">{tier.name}</span>
        {isActive && <span className="ml-2 text-xs text-green-600 font-semibold">● ACTIVO</span>}
      </div>
      <span className="font-bold">
        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(tier.price_ars)}
      </span>
    </div>
  )
}

function EventoDetallePage() {
  const { slug } = Route.useParams()
  const { data: event, isLoading, error } = useEvent(slug)
  const { isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="h-64 bg-muted animate-pulse rounded-xl mb-6" />
        <div className="h-8 bg-muted animate-pulse rounded w-1/2 mb-4" />
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Evento no encontrado</h2>
        <p className="text-muted-foreground mt-2">Este evento no existe o ya no está disponible.</p>
        <Link to="/eventos"><Button className="mt-6">Ver todos los eventos</Button></Link>
      </div>
    )
  }

  const location = event.location as { city: string; province: string; address: string; lat: number; lng: number }
  const now = new Date()
  const registrationCloses = new Date(event.registration_closes_at)
  const registrationOpens = new Date(event.registration_opens_at)
  const isRegistrationOpen = now >= registrationOpens && now <= registrationCloses
  const isClosed = now > registrationCloses

  const coverUrl = event.cover_image_url ??
    `https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=1200&q=80`

  const distances = (event.event_distances as any[]) ?? []

  return (
    <div>
      {/* Hero */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img src={coverUrl} alt={event.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{TYPE_LABELS[event.type] ?? event.type}</Badge>
              {isClosed && <Badge variant="destructive">Inscripciones cerradas</Badge>}
              {isRegistrationOpen && <Badge className="bg-green-600">Inscripciones abiertas</Badge>}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">{event.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(event.starts_at), "d 'de' MMMM yyyy", { locale: es })}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {location.city}, {location.province}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Countdown */}
            {!isClosed && (
              <div className="bg-muted/40 rounded-xl p-6">
                <Countdown
                  targetDate={event.starts_at}
                  label="Faltan para la largada"
                />
              </div>
            )}

            {/* Descripción */}
            {event.description && (
              <div>
                <h2 className="text-xl font-bold mb-3">Sobre el evento</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            )}
            {!event.description && event.short_description && (
              <div>
                <h2 className="text-xl font-bold mb-3">Sobre el evento</h2>
                <p className="text-muted-foreground leading-relaxed">{event.short_description}</p>
              </div>
            )}

            {/* Distancias y precios */}
            <div>
              <h2 className="text-xl font-bold mb-4">Distancias y precios</h2>
              <div className="space-y-4">
                {distances.sort((a: any, b: any) => a.sort_order - b.sort_order).map((d: any) => {
                  const spotsLeft = d.capacity ? d.capacity - d.registered_count : null
                  const isFull = spotsLeft !== null && spotsLeft <= 0
                  const tiers = (d.pricing_tiers as any[]) ?? []
                  const activeTier = tiers.find((t: any) => {
                    const s = new Date(t.starts_at), e = new Date(t.ends_at)
                    return t.active && now >= s && now <= e
                  })

                  return (
                    <Card key={d.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{d.name} — {d.distance_km} km</CardTitle>
                          {isFull
                            ? <Badge variant="destructive">Cupos agotados</Badge>
                            : spotsLeft !== null && spotsLeft <= 50
                              ? <Badge variant="outline" className="text-orange-600">{spotsLeft} cupos</Badge>
                              : null
                          }
                        </div>
                        {d.start_time && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Largada: {d.start_time}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        {tiers.length > 0 ? (
                          <div className="space-y-1">
                            {tiers.sort((a: any, b: any) => a.sort_order - b.sort_order).map((t: any) => (
                              <PricingTierBadge key={t.id} tier={t} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Precio a confirmar</p>
                        )}
                        {activeTier && !isFull && (
                          <p className="text-sm font-semibold text-green-600 mt-2">
                            Precio actual: {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(activeTier.price_ars)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Mapa */}
            <div>
              <h2 className="text-xl font-bold mb-3">Ubicación</h2>
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {location.address}, {location.city}
              </p>
              <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-xl" />}>
                <CourseMap lat={location.lat} lng={location.lng} label={location.address} />
              </Suspense>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* CTA inscripción */}
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Evento: {format(new Date(event.starts_at), "d MMM yyyy", { locale: es })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Inscripciones hasta: {format(registrationCloses, "d MMM yyyy", { locale: es })}</span>
                  </div>
                  {distances.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{distances.length} distancia{distances.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {isClosed ? (
                  <div className="text-center text-sm text-muted-foreground">
                    <AlertCircle className="h-5 w-5 mx-auto mb-1" />
                    Las inscripciones están cerradas
                  </div>
                ) : !isRegistrationOpen ? (
                  <div className="text-center text-sm text-muted-foreground">
                    Inscripciones abren el{' '}
                    {format(registrationOpens, "d 'de' MMMM", { locale: es })}
                  </div>
                ) : isAuthenticated ? (
                  <Link to="/inscripcion/$eventId" params={{ eventId: event.id }}>
                    <Button className="w-full gap-2" size="lg">
                      Inscribirme <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link to="/auth/registro">
                      <Button className="w-full" size="lg">Crear cuenta e inscribirme</Button>
                    </Link>
                    <Link to="/auth/login" search={{ next: `/inscripcion/${event.id}` }}>
                      <Button variant="outline" className="w-full">Ya tengo cuenta</Button>
                    </Link>
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  Fee de servicio: {event.service_fee_percentage}% incluido
                </p>
              </CardContent>
            </Card>

            {/* Info adicional */}
            {event.requires_medical_certificate && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Requiere apto médico
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Distancias de {event.medical_certificate_min_distance_km}km o más requieren certificado médico vigente.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
