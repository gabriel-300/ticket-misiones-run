import { Link } from '@tanstack/react-router'
import { MapPin, Calendar, Users } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EventCardProps {
  event: {
    slug: string
    name: string
    short_description: string | null
    type: string
    starts_at: string
    registration_closes_at: string
    location: { city: string; province: string }
    cover_image_url: string | null
    status: string
    event_distances?: { id: string; name: string; distance_km: number; capacity: number | null; registered_count: number }[]
  }
}

const TYPE_LABELS: Record<string, string> = {
  running: 'Running',
  trail: 'Trail',
  triathlon: 'Triatlón',
  cycling: 'Ciclismo',
  other: 'Otro',
}

const TYPE_COLORS: Record<string, string> = {
  running: 'bg-blue-100 text-blue-700',
  trail: 'bg-green-100 text-green-700',
  triathlon: 'bg-purple-100 text-purple-700',
  cycling: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
}

export default function EventCard({ event }: EventCardProps) {
  const now = new Date()
  const closes = new Date(event.registration_closes_at)
  const isOpen = now < closes
  const location = event.location as { city: string; province: string }

  const coverUrl = event.cover_image_url ??
    `https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=600&q=80`

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverUrl}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TYPE_COLORS[event.type] ?? TYPE_COLORS.other}`}>
            {TYPE_LABELS[event.type] ?? event.type}
          </span>
          {!isOpen && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
              Cerrado
            </span>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <h3 className="font-bold text-lg leading-tight line-clamp-2">{event.name}</h3>

        {event.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{event.short_description}</p>
        )}

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{format(new Date(event.starts_at), "d 'de' MMMM yyyy", { locale: es })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{location.city}, {location.province}</span>
          </div>
          {event.event_distances && event.event_distances.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0" />
              <span>{event.event_distances.map(d => d.name).join(' · ')}</span>
            </div>
          )}
        </div>

        <Link to="/eventos/$slug" params={{ slug: event.slug }}>
          <Button className="w-full mt-2" variant={isOpen ? 'default' : 'outline'}>
            {isOpen ? 'Ver evento e inscribirme' : 'Ver detalles'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
