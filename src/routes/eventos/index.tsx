import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import EventCard from '@/components/eventos/event-card'
import { useEvents } from '@/hooks/use-events'
import { useSeo } from '@/hooks/use-seo'

const searchSchema = z.object({ tipo: z.string().optional() })

export const Route = createFileRoute('/eventos/')({
  validateSearch: searchSchema,
  component: EventosPage,
})

const FILTERS = [
  { value: '',            label: 'Todos' },
  { value: 'running',     label: 'Running' },
  { value: 'trail',       label: 'Trail' },
  { value: 'triathlon',   label: 'Triatlón' },
  { value: 'cycling',     label: 'Ciclismo' },
  { value: 'concierto',   label: 'Conciertos' },
  { value: 'teatro',      label: 'Teatro' },
  { value: 'conferencia', label: 'Conferencias' },
  { value: 'other',       label: 'Otros' },
]

function EventosPage() {
  useSeo('Eventos', 'Encontrá todos los eventos disponibles en Misiones: carreras, conciertos, teatro, conferencias y más.')
  const { tipo } = Route.useSearch()
  const [selected, setSelected] = useState(tipo ?? '')
  const { data: events, isLoading } = useEvents(selected || undefined)

  // Night filter: client-side
  const [nightOnly, setNightOnly] = useState(false)
  const filtered = nightOnly
    ? (events ?? []).filter(e => new Date(e.starts_at).getHours() >= 18)
    : (events ?? [])

  const nightCount = (events ?? []).filter(e => new Date(e.starts_at).getHours() >= 18).length

  return (
    <div className="bg-paper min-h-screen">
      {/* Page header */}
      <div className="bg-navy text-paper px-4 md:px-10 pt-16 pb-14">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-yellow mb-3.5">
            <span className="w-6 h-px bg-yellow" />
            Catálogo
          </div>
          <h1 className="font-display text-[clamp(40px,6vw,80px)] leading-[0.95] tracking-[-0.02em] m-0">
            Todas las Experiencias
          </h1>
          <p className="text-paper/60 text-[17px] mt-3 max-w-[500px]">
            Cupos limitados. Inscribite antes de que se agoten.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-10">
        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setSelected(f.value); setNightOnly(false) }}
              className={`px-4 py-2.5 rounded-full border text-[13px] font-semibold transition-all ${
                selected === f.value && !nightOnly
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-white text-ink border-line hover:border-ink'
              }`}
            >
              {f.label}
              {f.value === '' && events && (
                <span className="ml-1.5 font-mono text-[11px] opacity-50">{events.length}</span>
              )}
            </button>
          ))}
          <button
            onClick={() => { setNightOnly(!nightOnly); setSelected('') }}
            className={`px-4 py-2.5 rounded-full border text-[13px] font-semibold transition-all ${
              nightOnly
                ? 'bg-ink text-yellow border-ink'
                : 'bg-white text-ink border-line hover:border-ink'
            }`}
          >
            Nocturna
            {nightCount > 0 && (
              <span className="ml-1.5 font-mono text-[11px] opacity-50">{nightCount}</span>
            )}
          </button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/3] bg-navy/10 animate-pulse rounded-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 font-mono text-[14px] text-brand-muted">
            No hay eventos para este filtro.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => (
              <EventCard key={event.id} event={event as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
