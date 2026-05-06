import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import EventCard from '@/components/eventos/event-card'
import { useEvents } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { useSeo } from '@/hooks/use-seo'

const searchSchema = z.object({ tipo: z.string().optional() })

export const Route = createFileRoute('/eventos/')({
  validateSearch: searchSchema,
  component: EventosPage,
})

const TIPOS = [
  { value: '', label: 'Todos' },
  { value: 'running', label: 'Running' },
  { value: 'trail', label: 'Trail' },
  { value: 'triathlon', label: 'Triatlón' },
  { value: 'cycling', label: 'Ciclismo' },
]

function EventosPage() {
  useSeo('Eventos', 'Encontrá todas las carreras de running disponibles en Misiones y el NEA.')
  const { tipo } = Route.useSearch()
  const [selected, setSelected] = useState(tipo ?? '')
  const { data: events, isLoading } = useEvents(selected || undefined)

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Eventos</h1>
        <p className="text-muted-foreground mt-1">Encontrá tu próxima carrera en Misiones</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TIPOS.map(t => (
          <Button
            key={t.value}
            variant={selected === t.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelected(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No hay eventos publicados en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map(event => (
            <EventCard key={event.id} event={event as any} />
          ))}
        </div>
      )}
    </div>
  )
}
