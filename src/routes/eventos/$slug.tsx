import { createFileRoute, Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin, Calendar, Clock, Users, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useEvent } from '@/hooks/use-events'
import { useSeo } from '@/hooks/use-seo'
import Countdown from '@/components/eventos/countdown'
import { useAuth } from '@/hooks/use-auth'
import { useMyEventRegistration } from '@/hooks/use-profile'
import { getActiveTier, formatARS } from '@/lib/utils'

const CourseMap = lazy(() => import('@/components/eventos/course-map'))

export const Route = createFileRoute('/eventos/$slug')({
  component: EventoDetallePage,
})

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  running:     { label: 'Running',     cls: 'bg-navy text-paper' },
  trail:       { label: 'Trail',       cls: 'bg-jungle text-cream' },
  triathlon:   { label: 'Triatlón',   cls: 'bg-[#3D2B5C] text-white' },
  cycling:     { label: 'Ciclismo',   cls: 'bg-navy text-paper' },
  concierto:   { label: 'Concierto',  cls: 'bg-terra text-paper' },
  teatro:      { label: 'Teatro',     cls: 'bg-[#3D2B5C] text-white' },
  conferencia: { label: 'Conferencia', cls: 'bg-[#1B4D6B] text-white' },
  other:       { label: 'Evento',     cls: 'bg-navy text-paper' },
}

function EventoDetallePage() {
  const { slug } = Route.useParams()
  const { data: event, isLoading, error } = useEvent(slug)
  const { isAuthenticated } = useAuth()
  const { data: existingReg } = useMyEventRegistration(event?.id ?? '')
  useSeo(event?.name ?? 'Evento', event?.description ?? undefined)

  if (isLoading) {
    return (
      <div className="bg-paper min-h-screen">
        <div className="h-[440px] bg-navy animate-pulse" />
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-12">
          <div className="h-8 bg-navy/10 animate-pulse rounded w-1/3 mb-4" />
          <div className="h-4 bg-navy/10 animate-pulse rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="bg-paper min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-terra mx-auto mb-4" />
          <h2 className="font-display text-2xl text-navy mb-2">Evento no encontrado</h2>
          <p className="text-brand-muted mb-6">Este evento no existe o ya no está disponible.</p>
          <Link to="/eventos">
            <button className="px-6 py-3 rounded-full bg-navy text-paper font-semibold text-[14px]">
              Ver todos los eventos
            </button>
          </Link>
        </div>
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

  const distances = [...((event.ticket_types as any[]) ?? [])].sort((a, b) => a.sort_order - b.sort_order)

  const allTiers = distances.flatMap((d: any) => d.pricing_tiers ?? [])
  const activeTier = getActiveTier(allTiers)

  const totalReg = distances.reduce((s: number, d: any) => s + d.registered_count, 0)
  const totalCap = distances.reduce((s: number, d: any) => s + (d.capacity ?? 0), 0)

  const badge = TYPE_BADGE[event.type] ?? TYPE_BADGE.other

  return (
    <div className="bg-paper">

      {/* ── Hero ── */}
      <div className="relative h-[380px] md:h-[500px] overflow-hidden">
        <img
          src={coverUrl}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/40 to-transparent" />

        {/* Back link */}
        <Link
          to="/eventos"
          className="absolute top-6 left-6 flex items-center gap-2 text-paper/80 hover:text-paper text-[13px] font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Todos los eventos
        </Link>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-10 pb-8">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-[11px] font-bold tracking-[0.04em] px-3 py-1.5 rounded-full ${badge.cls}`}>
                {badge.label}
              </span>
              {!isRegistrationOpen && !isClosed && (
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-yellow text-ink">
                  Próximamente
                </span>
              )}
              {isRegistrationOpen && (
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-green-500 text-white">
                  Inscripciones abiertas
                </span>
              )}
              {isClosed && (
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-black/50 text-white/70">
                  Inscripciones cerradas
                </span>
              )}
            </div>
            <h1 className="font-display text-[clamp(28px,5vw,56px)] leading-[0.97] tracking-[-0.02em] text-paper mb-2">
              {event.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-paper/70 text-[14px] font-mono">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(event.starts_at), "d 'de' MMMM yyyy", { locale: es })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {location.city}, {location.province}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(event.starts_at), "HH:mm 'hs'")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">

          {/* ── Left column ── */}
          <div className="space-y-10">

            {/* Countdown */}
            {!isClosed && (
              <div className="bg-navy rounded-[18px] p-6">
                <Countdown targetDate={event.starts_at} label="Faltan para la largada" />
              </div>
            )}

            {/* Descripción */}
            {(event.description || event.short_description) && (
              <div>
                <div className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-terra mb-3.5">
                  <span className="w-6 h-px bg-terra" />
                  Sobre el evento
                </div>
                <p className="text-brand-muted text-[16px] leading-[1.65] whitespace-pre-line">
                  {event.description || event.short_description}
                </p>
              </div>
            )}

            {/* Distancias y precios */}
            <div>
              <div className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-terra mb-5">
                <span className="w-6 h-px bg-terra" />
                Entradas
              </div>
              <div className="space-y-3">
                {distances.map((d: any) => {
                  const spotsLeft = d.capacity ? d.capacity - d.registered_count : null
                  const isFull = spotsLeft !== null && spotsLeft <= 0
                  const tiers = [...(d.pricing_tiers ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order)
                  const dActiveTier = tiers.find((t: any) => {
                    const s = new Date(t.starts_at), e = new Date(t.ends_at)
                    return t.active && now >= s && now <= e
                  })

                  return (
                    <div
                      key={d.id}
                      className={`rounded-[14px] border p-5 flex items-start justify-between gap-4 ${
                        isFull ? 'border-line bg-paper opacity-60' : 'border-line bg-white'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <h3 className="font-display text-[20px] leading-none text-navy">
                            {d.name}
                            {d.distance_km != null && (
                              <span className="font-mono text-[14px] text-brand-muted ml-1.5">
                                {d.distance_km} km
                              </span>
                            )}
                          </h3>
                          {isFull && (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-terra/10 text-terra">
                              Agotado
                            </span>
                          )}
                          {!isFull && spotsLeft !== null && spotsLeft <= 50 && (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-yellow/20 text-ink">
                              {spotsLeft} cupos
                            </span>
                          )}
                        </div>
                        {d.start_time && (
                          <p className="font-mono text-[12px] text-brand-muted flex items-center gap-1 mb-2">
                            <Clock className="h-3 w-3" /> Largada: {d.start_time}
                          </p>
                        )}
                        {/* Tiers */}
                        {tiers.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {tiers.map((t: any) => {
                              const tStart = new Date(t.starts_at)
                              const tEnd = new Date(t.ends_at)
                              const isActive = t.active && now >= tStart && now <= tEnd
                              return (
                                <span
                                  key={t.id}
                                  className={`font-mono text-[12px] px-2.5 py-1 rounded-full ${
                                    isActive
                                      ? 'bg-navy text-yellow font-bold'
                                      : 'bg-cream text-brand-muted line-through'
                                  }`}
                                >
                                  {t.name}: {formatARS(t.price_ars)}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {dActiveTier && !isFull && (
                        <div className="text-right shrink-0">
                          <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted">Precio</span>
                          <span className="font-display text-[26px] leading-none text-navy">
                            {formatARS(dActiveTier.price_ars)}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Mapa */}
            <div>
              <div className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-terra mb-4">
                <span className="w-6 h-px bg-terra" />
                Ubicación
              </div>
              <p className="font-mono text-[13px] text-brand-muted mb-3 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-terra shrink-0" />
                {location.address}, {location.city}
              </p>
              <div className="rounded-[18px] overflow-hidden">
                <Suspense fallback={<div className="h-64 bg-navy/10 animate-pulse rounded-[18px]" />}>
                  <CourseMap lat={location.lat} lng={location.lng} label={location.address} />
                </Suspense>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div>
            <div className="sticky top-24 space-y-4">

              {/* CTA card */}
              <div className="bg-white border border-line rounded-[18px] p-6 space-y-5">

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-cream rounded-[12px] p-3 text-center">
                    <div className="font-display text-[28px] leading-none text-navy">{totalReg}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted mt-1">Inscriptos</div>
                  </div>
                  <div className="bg-cream rounded-[12px] p-3 text-center">
                    <div className="font-display text-[28px] leading-none text-navy">{totalCap || '∞'}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted mt-1">Cupos</div>
                  </div>
                </div>

                <div className="border-t border-line" />

                {/* Precio */}
                {activeTier && (
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand-muted">Desde</span>
                    <div className="font-display text-[36px] leading-none text-navy mt-0.5">
                      {formatARS(activeTier.price_ars)}
                    </div>
                    <p className="font-mono text-[11px] text-brand-muted mt-1">
                      Fee de servicio {event.service_fee_percentage}% incluido
                    </p>
                  </div>
                )}

                {/* Fechas clave */}
                <div className="space-y-2 text-[13px]">
                  <div className="flex items-center gap-2 text-brand-muted font-mono">
                    <Calendar className="h-3.5 w-3.5 text-terra shrink-0" />
                    <span>Evento: <strong className="text-navy">{format(new Date(event.starts_at), "d MMM yyyy", { locale: es })}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-brand-muted font-mono">
                    <Clock className="h-3.5 w-3.5 text-terra shrink-0" />
                    <span>Inscripciones hasta: <strong className="text-navy">{format(registrationCloses, "d MMM yyyy", { locale: es })}</strong></span>
                  </div>
                  {distances.length > 0 && (
                    <div className="flex items-center gap-2 text-brand-muted font-mono">
                      <Users className="h-3.5 w-3.5 text-terra shrink-0" />
                      <span>{distances.length} tipo{distances.length !== 1 ? 's' : ''} de entrada</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-line" />

                {/* CTA */}
                {isClosed ? (
                  <div className="text-center py-2">
                    <AlertCircle className="h-5 w-5 text-brand-muted mx-auto mb-1.5" />
                    <p className="font-mono text-[13px] text-brand-muted">Inscripciones cerradas</p>
                  </div>
                ) : !isRegistrationOpen ? (
                  <div className="text-center py-2">
                    <p className="font-mono text-[13px] text-brand-muted">
                      Inscripciones abren el{' '}
                      <strong className="text-navy">{format(registrationOpens, "d 'de' MMMM", { locale: es })}</strong>
                    </p>
                  </div>
                ) : isAuthenticated && existingReg ? (
                  <div className="space-y-2">
                    <div className={`text-center text-[13px] font-semibold py-3 rounded-full ${
                      existingReg.status === 'paid'
                        ? 'bg-green-500/10 text-green-700'
                        : 'bg-yellow/20 text-ink'
                    }`}>
                      {existingReg.status === 'paid' ? '✓ Ya estás inscripto/a' : '⏳ Pago pendiente'}
                    </div>
                    <Link to="/perfil" className="block">
                      <button className="w-full px-6 py-3 rounded-full border border-ink text-[14px] font-semibold text-ink hover:bg-ink hover:text-paper transition-colors">
                        Ver mis inscripciones
                      </button>
                    </Link>
                  </div>
                ) : isAuthenticated ? (
                  <Link to="/inscripcion/$eventId" params={{ eventId: event.id }}>
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-navy text-paper text-[15px] font-semibold hover:bg-terra transition-colors">
                      Inscribirme <ChevronRight className="h-4 w-4" />
                    </button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link to="/auth/registro">
                      <button className="w-full px-6 py-4 rounded-full bg-navy text-paper text-[14px] font-semibold hover:bg-terra transition-colors">
                        Crear cuenta e inscribirme
                      </button>
                    </Link>
                    <Link to="/auth/login" search={{ next: `/inscripcion/${event.id}` }}>
                      <button className="w-full px-6 py-3 rounded-full border border-ink text-[14px] font-semibold text-ink hover:bg-ink hover:text-paper transition-colors">
                        Ya tengo cuenta
                      </button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Apto médico aviso */}
              {event.requires_medical_certificate && (
                <div className="bg-yellow/10 border border-yellow/40 rounded-[14px] p-4">
                  <p className="text-[13px] font-semibold flex items-center gap-2 text-ink">
                    <AlertCircle className="h-4 w-4 text-terra shrink-0" />
                    Requiere apto médico
                  </p>
                  <p className="text-[12px] text-brand-muted mt-1 font-mono">
                    Distancias de {event.medical_certificate_min_distance_km} km o más requieren certificado vigente.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
