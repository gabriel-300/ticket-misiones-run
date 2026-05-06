import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin, Calendar, Users, Clock } from 'lucide-react'
import { getActiveTier, formatARS } from '@/lib/utils'

interface PricingTier { price_ars: number; active: boolean; starts_at: string; ends_at: string }
interface EventDistance {
  id: string; name: string; distance_km: number
  capacity: number | null; registered_count: number; sort_order: number
  pricing_tiers?: PricingTier[]
}

export interface EventCardData {
  id: string; slug: string; name: string
  short_description: string | null; type: string
  starts_at: string; registration_closes_at: string
  location: { city: string; province: string }
  cover_image_url: string | null; status: string
  event_distances?: EventDistance[]
}

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  running:   { label: 'Running',   cls: 'bg-navy text-paper' },
  trail:     { label: 'Trail',     cls: 'bg-jungle text-cream' },
  triathlon: { label: 'Triatlón', cls: 'bg-[#3D2B5C] text-white' },
  cycling:   { label: 'Ciclismo', cls: 'bg-navy text-paper' },
  other:     { label: 'Evento',   cls: 'bg-navy text-paper' },
}

const PLACEHOLDER_GRAD: Record<string, string> = {
  running:   'linear-gradient(135deg,#0B1B2B,#1F3A2E)',
  trail:     'linear-gradient(135deg,#1F3A2E,#0B1B2B)',
  triathlon: 'linear-gradient(135deg,#3D2B5C,#0B1B2B)',
  cycling:   'linear-gradient(135deg,#1B4D6B,#0B1B2B)',
  other:     'linear-gradient(135deg,#C84B22,#1F3A2E)',
}

const STRIPE = 'repeating-linear-gradient(135deg,rgba(255,255,255,0.04) 0 2px,transparent 2px 14px)'

export default function EventCard({ event }: { event: EventCardData }) {
  const now        = new Date()
  const startsAt   = new Date(event.starts_at)
  const isOpen     = now < new Date(event.registration_closes_at)
  const isNight    = startsAt.getHours() >= 18
  const location   = event.location as { city: string; province: string }

  const distances  = [...(event.event_distances ?? [])].sort((a, b) => b.distance_km - a.distance_km)
  const allTiers   = distances.flatMap(d => d.pricing_tiers ?? [])
  const activeTier = getActiveTier(allTiers)

  const totalReg = distances.reduce((s, d) => s + d.registered_count, 0)
  const totalCap = distances.reduce((s, d) => s + (d.capacity ?? 0), 0)
  const spotsLeft = totalCap > 0 ? totalCap - totalReg : null

  const badge = TYPE_BADGE[event.type] ?? TYPE_BADGE.other
  const grad  = PLACEHOLDER_GRAD[event.type] ?? PLACEHOLDER_GRAD.other

  return (
    <Link to="/eventos/$slug" params={{ slug: event.slug }} className="block group">
      <article className="bg-white rounded-card overflow-hidden border border-line flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(11,27,43,0.25)]">

        {/* ── Image ── */}
        <div className="relative overflow-hidden bg-navy" style={{ aspectRatio: '4/3' }}>
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: `${STRIPE},${grad}` }}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/50 border border-dashed border-white/30 px-2.5 py-1.5 rounded">
                photo · {event.name.toLowerCase()}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3.5 left-3.5 flex gap-1.5">
            <span className={`text-[11px] font-bold tracking-[0.04em] px-3 py-1.5 rounded-full ${badge.cls}`}>
              {badge.label}
            </span>
            {isNight && (
              <span className="text-[11px] font-bold tracking-[0.04em] px-3 py-1.5 rounded-full bg-navy text-yellow">
                Nocturna
              </span>
            )}
            {!isOpen && (
              <span className="text-[11px] font-bold tracking-[0.04em] px-3 py-1.5 rounded-full bg-black/60 text-white/70">
                Cerrado
              </span>
            )}
          </div>

          {/* Date block */}
          <div className="absolute top-3.5 right-3.5 bg-white rounded-[10px] px-3 py-2 text-center shadow-md">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-terra font-bold">
              {format(startsAt, 'MMM', { locale: es }).replace('.', '').toUpperCase()}
            </div>
            <div className="font-display text-[22px] leading-none text-navy">
              {format(startsAt, 'd')}
            </div>
          </div>

          {/* Status dot */}
          <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white font-mono text-[11px] font-semibold tracking-[0.05em]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.25)]" />
            {spotsLeft !== null && spotsLeft < 150 ? `Cupos: ${spotsLeft}` : 'Abierta'}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-[22px] flex flex-col flex-1">
          <h3 className="font-display text-[22px] leading-[1.1] tracking-[-0.01em] text-navy mb-2">
            {event.name}
          </h3>
          {event.short_description && (
            <p className="text-[14px] text-brand-muted leading-[1.5] mb-4 line-clamp-2">
              {event.short_description}
            </p>
          )}

          {/* Distance pills */}
          {distances.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {distances.map((d, i) => (
                <span
                  key={d.id}
                  className={`px-2.5 py-[5px] rounded-full font-mono text-[11px] font-semibold ${
                    i === 0 ? 'bg-navy text-yellow' : 'bg-cream text-navy'
                  }`}
                >
                  {d.name}
                </span>
              ))}
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 py-3.5 border-y border-line text-[13px]">
            {[
              { Icon: Calendar, text: format(startsAt, "d MMM yyyy", { locale: es }) },
              { Icon: MapPin,   text: location.city },
              { Icon: Users,    text: `${totalReg} inscriptos` },
              { Icon: Clock,    text: format(startsAt, "HH:mm 'hs'") },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2 min-w-0">
                <Icon className="w-3.5 h-3.5 text-terra shrink-0" />
                <span className="font-mono text-[12px] font-medium truncate">{text}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3.5 mt-auto">
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted">Desde</span>
              <span className="font-display text-[22px] leading-none text-navy">
                {activeTier ? formatARS(activeTier.price_ars) : '—'}
              </span>
            </div>
            <span className="inline-flex items-center gap-2 bg-navy text-paper px-[18px] py-3 rounded-full text-[13px] font-semibold group-hover:bg-terra transition-colors">
              Inscribirme
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
