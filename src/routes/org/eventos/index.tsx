import { createFileRoute, Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Users, ToggleLeft, ToggleRight, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { OrgLayout, OrgBreadcrumb } from '@/components/org/org-layout'
import { useMyOrganization, useOrgEvents, useOrgToggleEventStatus } from '@/hooks/use-organizer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/org/eventos/')({
  component: OrgEventos,
})

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador', published: 'Publicado', closed: 'Cerrado',
  finished: 'Finalizado', cancelled: 'Cancelado',
}
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary', published: 'default', closed: 'outline',
  finished: 'outline', cancelled: 'destructive',
}

function OrgEventos() {
  const { data: org } = useMyOrganization()
  const { data: events, isLoading } = useOrgEvents(org?.id ?? '')
  const { mutate: toggleStatus, isPending } = useOrgToggleEventStatus(org?.id ?? '')

  function handleToggle(eventId: string, currentStatus: string) {
    const next = currentStatus === 'published' ? 'draft' : 'published'
    toggleStatus({ eventId, status: next }, {
      onSuccess: () => toast.success(`Evento ${next === 'published' ? 'publicado' : 'despublicado'}`),
      onError:   () => toast.error('No se pudo cambiar el estado'),
    })
  }

  return (
    <OrgLayout>
      <OrgBreadcrumb items={[{ label: 'Mi organización', to: '/org' }, { label: 'Eventos' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Mis eventos</h1>
          <p className="text-sm text-muted-foreground">{events?.length ?? 0} eventos</p>
        </div>
        <Link to="/org/eventos/nuevo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo evento
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : events?.length === 0 ? (
        <div className="text-center py-16 border rounded-xl text-muted-foreground">
          <p className="font-medium">Todavía no creaste ningún evento</p>
          <Link to="/org/eventos/nuevo" className="text-primary text-sm hover:underline mt-2 inline-block">
            Crear el primero →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events?.map(event => {
            const tickets  = (event.ticket_types as any[]) ?? []
            const totalReg = tickets.reduce((s: number, t: any) => s + t.registered_count, 0)
            const totalCap = tickets.reduce((s: number, t: any) => s + (t.capacity ?? 0), 0)
            const pct      = totalCap > 0 ? Math.round((totalReg / totalCap) * 100) : null
            const location = event.location as { city: string }

            return (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <Link to="/org/eventos/$eventId" params={{ eventId: event.id }} className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={STATUS_VARIANTS[event.status] ?? 'secondary'}>
                          {STATUS_LABELS[event.status] ?? event.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">{event.type}</span>
                      </div>
                      <p className="font-semibold truncate">{event.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(event.starts_at), "d MMM yyyy", { locale: es })} · {location?.city}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {totalReg}{totalCap > 0 ? `/${totalCap}` : ''} inscriptos
                          {pct !== null && ` (${pct}%)`}
                        </span>
                        <span>{tickets.length} tipo{tickets.length !== 1 ? 's' : ''} de entrada</span>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        disabled={isPending}
                        onClick={() => handleToggle(event.id, event.status)}
                      >
                        {event.status === 'published'
                          ? <><ToggleRight className="h-3.5 w-3.5 text-green-600" /> Publicado</>
                          : <><ToggleLeft className="h-3.5 w-3.5" /> Publicar</>
                        }
                      </Button>
                      <Link to="/org/eventos/$eventId" params={{ eventId: event.id }}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </OrgLayout>
  )
}
