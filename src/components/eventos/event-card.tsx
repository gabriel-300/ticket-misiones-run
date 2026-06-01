import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin } from 'lucide-react'
import { getActiveTier, formatARS } from '@/lib/utils'

interface PricingTier { price_ars: number; active: boolean; starts_at: string; ends_at: string }
interface TicketType {
  id: string; name: string; distance_km: number | null
  capacity: number | null; registered_count: number; sort_order: number
  pricing_tiers?: PricingTier[]
}

export interface EventCardData {
  id: string; slug: string; name: string
  short_description: string | null; type: string
  starts_at: string; registration_closes_at: string
  location: { city: string; province: string }
  cover_image_url: string | null; status: string
  ticket_types?: TicketType[]
}

const TYPE_LABEL: Record<string, string> = {
  running:     'Running',
  trail:       'Trail',
  triathlon:   'Triatlón',
  cycling:     'Ciclismo',
  concierto:   'Concierto',
  teatro:      'Teatro',
  conferencia: 'Conferencia',
  other:       'Evento',
}

const PLACEHOLDER_GRAD: Record<string, string> = {
  running:     'linear-gradient(135deg,#07142F,#1F3A2E)',
  trail:       'linear-gradient(135deg,#1F3A2E,#07142F)',
  triathlon:   'linear-gradient(135deg,#3D2B5C,#07142F)',
  cycling:     'linear-gradient(135deg,#1B4D6B,#07142F)',
  concierto:   'linear-gradient(135deg,#F5C913,#07142F)',
  teatro:      'linear-gradient(135deg,#3D2B5C,#1F3A2E)',
  conferencia: 'linear-gradient(135deg,#1B4D6B,#1F3A2E)',
  other:       'linear-gradient(135deg,#F5C913,#07142F)',
}

export default function EventCard({ event }: { event: EventCardData }) {
  const startsAt  = new Date(event.starts_at)
  const isOpen    = new Date() < new Date(event.registration_closes_at)
  const location  = event.location as { city: string; province: string }

  const ticketTypes = [...(event.ticket_types ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  const allTiers    = ticketTypes.flatMap(t => t.pricing_tiers ?? [])
  const activeTier  = getActiveTier(allTiers)
  const grad        = PLACEHOLDER_GRAD[event.type] ?? PLACEHOLDER_GRAD.other
  const typeLabel   = TYPE_LABEL[event.type] ?? TYPE_LABEL.other

  return (
    <Link to="/eventos/$slug" params={{ slug: event.slug }} className="block group">
      <article className="bg-white rounded-[12px] overflow-hidden border border-line flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(11,27,43,0.18)]">

        {/* ── Image ── */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: `repeating-linear-gradient(135deg,rgba(255,255,255,0.03) 0 2px,transparent 2px 14px),${grad}` }}
            />
          )}

          {/* Date badge — estilo Eventick */}
          <div className="absolute top-0 left-0 bg-terra text-white px-2.5 py-1.5 rounded-br-[10px] text-center min-w-[52px]">
            <div className="font-display text-[18px] leading-none">{format(startsAt, 'd')}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] opacity-90">
              {format(startsAt, 'MMM', { locale: es }).replace('.', '')}
            </div>
          </div>

          {/* Cerrado badge */}
          {!isOpen && (
            <div className="absolute top-2 right-2 bg-black/60 text-white/80 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full">
              Cerrado
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-[12px] font-mono text-brand-muted mb-1">{typeLabel}</p>
          <h3 className="font-display text-[17px] leading-[1.15] tracking-[-0.01em] text-navy mb-2 line-clamp-2">
            {event.name}
          </h3>

          <div className="flex items-center gap-1.5 text-[13px] text-brand-muted mt-auto pt-3 border-t border-line">
            <MapPin className="w-3.5 h-3.5 text-terra shrink-0" />
            <span className="truncate">{location.city}</span>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted">Desde</span>
              <span className="font-display text-[18px] leading-none text-navy">
                {activeTier ? formatARS(activeTier.price_ars) : '—'}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-navy text-paper px-4 py-2 rounded-full text-[13px] font-semibold group-hover:bg-terra transition-colors">
              Ver más
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
