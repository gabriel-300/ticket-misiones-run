import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, Plus, Trash2, Tag, Users, Calendar, ToggleLeft, ToggleRight, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout, AdminBreadcrumb } from '@/components/admin/admin-layout'
import { useToggleEventStatus } from '@/hooks/use-admin'
import {
  useOrgEventDetail, useCreatePricingTier, useDeletePricingTier,
  type CreatePricingTierInput,
} from '@/hooks/use-organizer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

export const Route = createFileRoute('/admin/eventos/$eventId')({
  component: AdminEventDetailPage,
})

const formatARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador', published: 'Publicado', closed: 'Cerrado',
  finished: 'Finalizado', cancelled: 'Cancelado',
}
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary', published: 'default', closed: 'outline',
  finished: 'outline', cancelled: 'destructive',
}

function PricingTierForm({ eventId, ticketTypeId, onClose }: {
  eventId: string; ticketTypeId: string; onClose: () => void
}) {
  const { mutate: create, isPending } = useCreatePricingTier(eventId)
  const [name, setName] = useState('General')
  const [price, setPrice] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !price || !startsAt || !endsAt) { toast.error('Completá todos los campos'); return }
    const input: CreatePricingTierInput = {
      event_id: eventId,
      ticket_type_id: ticketTypeId,
      name,
      price_ars: Number(price),
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
    }
    create(input, {
      onSuccess: () => { toast.success('Precio agregado'); onClose() },
      onError: (err: any) => toast.error(err?.message ?? 'Error al guardar'),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Nombre del precio</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Early Bird / General / VIP" />
      </div>
      <div className="space-y-1.5">
        <Label>Precio (ARS)</Label>
        <Input type="number" min="0" step="1" value={price} onChange={e => setPrice(e.target.value)} placeholder="5000" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Vigencia desde</Label>
          <Input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Vigencia hasta</Label>
          <Input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? 'Guardando...' : 'Agregar precio'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  )
}

function TicketTypeCard({ tt, eventId }: { tt: any; eventId: string }) {
  const [open, setOpen] = useState(false)
  const { mutate: deleteTier, isPending: deleting } = useDeletePricingTier(eventId)
  const now = new Date()
  const tiers = (tt.pricing_tiers ?? []) as any[]
  const activeTier = tiers.find((t: any) => t.active && now >= new Date(t.starts_at) && now <= new Date(t.ends_at))

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">{tt.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tt.distance_km != null ? `${tt.distance_km} km · ` : ''}
              {tt.registered_count ?? 0}/{tt.capacity ?? '∞'} inscriptos
              {activeTier && <span className="ml-2 text-green-600 font-medium">· {formatARS(activeTier.price_ars)} vigente</span>}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" /> Precio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar precio — {tt.name}</DialogTitle>
              </DialogHeader>
              <PricingTierForm eventId={eventId} ticketTypeId={tt.id} onClose={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      {tiers.length > 0 ? (
        <CardContent className="pt-0">
          <div className="space-y-1.5">
            {tiers.map((tier: any) => {
              const isActive = tier.active && now >= new Date(tier.starts_at) && now <= new Date(tier.ends_at)
              return (
                <div key={tier.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md bg-muted/40">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{tier.name}</span>
                    <span className="text-muted-foreground">{formatARS(tier.price_ars)}</span>
                    {isActive && <Badge className="h-4 text-[10px] px-1.5 bg-green-600">Vigente</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {format(new Date(tier.starts_at), 'd/M/yy', { locale: es })}
                      {' — '}
                      {format(new Date(tier.ends_at), 'd/M/yy', { locale: es })}
                    </span>
                    <button
                      onClick={() => deleteTier(tier.id, {
                        onSuccess: () => toast.success('Precio eliminado'),
                        onError:   () => toast.error('No se pudo eliminar'),
                      })}
                      disabled={deleting}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      ) : (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground italic px-2">Sin precios — los usuarios verán "—" al inscribirse.</p>
        </CardContent>
      )}
    </Card>
  )
}

function AdminEventDetailPage() {
  const { eventId } = Route.useParams()
  const { data: event, isLoading } = useOrgEventDetail(eventId)
  const { mutate: toggleStatus, isPending: toggling } = useToggleEventStatus()

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </AdminLayout>
    )
  }

  if (!event) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Evento no encontrado.</p>
      </AdminLayout>
    )
  }

  const location = event.location as { city: string; province: string }
  const ticketTypes = (event.ticket_types as any[]) ?? []

  function handleToggle() {
    const next = event!.status === 'published' ? 'draft' : 'published'
    toggleStatus({ eventId, status: next }, {
      onSuccess: () => toast.success(`Evento ${next === 'published' ? 'publicado' : 'despublicado'}`),
      onError:   () => toast.error('No se pudo cambiar el estado'),
    })
  }

  return (
    <AdminLayout>
      <AdminBreadcrumb items={[
        { label: 'Admin', to: '/admin' },
        { label: 'Eventos', to: '/admin/eventos' },
        { label: event.name },
      ]} />

      <div className="space-y-6 max-w-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin/eventos">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl font-bold">{event.name}</h1>
                <Badge variant={STATUS_VARIANTS[event.status] ?? 'secondary'}>
                  {STATUS_LABELS[event.status] ?? event.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground capitalize">{event.type}</p>
            </div>
          </div>

          <Button size="sm" variant="outline" className="shrink-0 gap-1.5" disabled={toggling} onClick={handleToggle}>
            {event.status === 'published'
              ? <><ToggleRight className="h-4 w-4 text-green-600" /> Publicado</>
              : <><ToggleLeft className="h-4 w-4" /> Publicar</>
            }
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{format(new Date(event.starts_at), "d 'de' MMMM yyyy", { locale: es })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              <span>
                {ticketTypes.reduce((s: number, t: any) => s + t.registered_count, 0)} inscriptos ·{' '}
                {ticketTypes.reduce((s: number, t: any) => s + (t.capacity ?? 0), 0)} cupos
              </span>
            </div>
            <div className="col-span-2 text-muted-foreground">📍 {location?.city}, {location?.province}</div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">
                Inscripciones:{' '}
                {format(new Date(event.registration_opens_at), "d/M/yy HH:mm", { locale: es })}
                {' → '}
                {format(new Date(event.registration_closes_at), "d/M/yy HH:mm", { locale: es })}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link to="/admin/inscripciones/$eventId" params={{ eventId }}>
            <Button variant="outline" className="gap-2">
              <ClipboardList className="h-4 w-4" /> Ver inscripciones
            </Button>
          </Link>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-3">Tipos de entrada y precios</h2>
          {ticketTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este evento no tiene tipos de entrada.</p>
          ) : (
            <div className="space-y-3">
              {ticketTypes.map((tt: any) => (
                <TicketTypeCard key={tt.id} tt={tt} eventId={eventId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
