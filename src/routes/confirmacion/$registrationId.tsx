import { createFileRoute, Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle2, Calendar, MapPin, Medal, Tag, ChevronRight, AlertCircle } from 'lucide-react'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { useRegistrationDetail } from '@/hooks/use-registration-detail'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'

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
  const ticketType = reg?.ticket_type as any

  if (isLoading) {
    return (
      <div className="bg-paper min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
          <Skeleton className="h-32 rounded-[18px]" />
          <Skeleton className="h-24 rounded-[18px]" />
          <Skeleton className="h-64 rounded-[18px]" />
        </div>
      </div>
    )
  }

  if (error || !reg) {
    return (
      <div className="bg-paper min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-terra mx-auto mb-4" />
          <h2 className="font-display text-2xl text-navy mb-2">Inscripción no encontrada</h2>
          <Link to="/">
            <button className="mt-4 px-6 py-3 rounded-full bg-navy text-paper font-semibold text-[14px]">
              Ir al inicio
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const location = event?.location as { city: string; province: string } | null

  return (
    <div className="bg-paper min-h-screen">

      {/* ── Hero confirmación ── */}
      <div className="bg-navy text-paper px-4 md:px-10 pt-16 pb-14">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow/10 border-2 border-yellow/30 mb-6">
            <CheckCircle2 className="h-10 w-10 text-yellow" />
          </div>
          <h1 className="font-display text-[clamp(32px,5vw,56px)] leading-[0.97] tracking-[-0.02em]">
            ¡Estás inscripto{profile?.gender === 'F' ? 'a' : ''}!
          </h1>
          <p className="text-paper/70 text-[17px] mt-3">
            Hola <strong className="text-paper">{profile?.first_name}</strong>, tu lugar está reservado en{' '}
            <strong className="text-yellow">{event?.name}</strong>.
          </p>
          <p className="font-mono text-[13px] text-paper/50 mt-2">
            Vas a recibir un email de confirmación pronto.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* ── Detalle inscripción ── */}
        <div className="bg-white border border-line rounded-[18px] p-6">
          <div className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-terra mb-4">
            <span className="w-6 h-px bg-terra" />
            Tu inscripción
          </div>

          <h2 className="font-display text-[24px] text-navy mb-4">{event?.name}</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-cream rounded-[12px] p-3 flex items-start gap-2">
              <Calendar className="h-4 w-4 text-terra shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted block">Fecha</span>
                <span className="font-semibold text-[13px] text-navy">
                  {event?.starts_at ? format(new Date(event.starts_at), "d 'de' MMMM yyyy", { locale: es }) : '—'}
                </span>
              </div>
            </div>

            {location && (
              <div className="bg-cream rounded-[12px] p-3 flex items-start gap-2">
                <MapPin className="h-4 w-4 text-terra shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted block">Lugar</span>
                  <span className="font-semibold text-[13px] text-navy">{location.city}</span>
                </div>
              </div>
            )}

            <div className="bg-cream rounded-[12px] p-3 flex items-start gap-2">
              <Tag className="h-4 w-4 text-terra shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted block">Entrada</span>
                <span className="font-semibold text-[13px] text-navy">
                  {ticketType?.name}
                  {ticketType?.distance_km != null && ` — ${ticketType.distance_km} km`}
                </span>
              </div>
            </div>

            {reg.category && (
              <div className="bg-cream rounded-[12px] p-3 flex items-start gap-2">
                <Medal className="h-4 w-4 text-terra shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted block">Categoría</span>
                  <span className="font-semibold text-[13px] text-navy">{reg.category}</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── Acciones ── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {event?.slug && (
            <Link to="/eventos/$slug" params={{ slug: event.slug }} className="flex-1">
              <button className="w-full px-6 py-3 rounded-full border border-ink text-[14px] font-semibold text-ink hover:bg-ink hover:text-paper transition-colors">
                Ver el evento
              </button>
            </Link>
          )}
          <Link to="/eventos" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-navy text-paper text-[14px] font-semibold hover:bg-terra transition-colors">
              Ver más eventos <ChevronRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
