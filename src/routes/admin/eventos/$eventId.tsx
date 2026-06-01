import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ChevronLeft, Plus, Trash2, Tag, Users, Calendar,
  ToggleLeft, ToggleRight, ClipboardList, Package, Star, Pencil,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout, AdminBreadcrumb } from '@/components/admin/admin-layout'
import { useToggleEventStatus, useSetFeaturedEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/use-admin'
import {
  useOrgEventDetail, useCreatePricingTier, useDeletePricingTier,
  useEventServices, useCreateService, useDeleteService, useToggleService,
  type CreatePricingTierInput, type CreateServiceInput,
} from '@/hooks/use-organizer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
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

const SERVICE_CATEGORIES = [
  { value: 'transporte',   label: 'Transporte',   emoji: '🚌' },
  { value: 'hospedaje',    label: 'Hospedaje',    emoji: '🏠' },
  { value: 'comida',       label: 'Gastronomía',  emoji: '🍽️' },
  { value: 'wellness',     label: 'Wellness',     emoji: '💆' },
  { value: 'equipamiento', label: 'Equipamiento', emoji: '🎒' },
  { value: 'experiencia',  label: 'Experiencia',  emoji: '🎟️' },
  { value: 'otro',         label: 'Otro',         emoji: '📦' },
]

const CONTACT_METHODS = [
  { value: 'email',     label: 'Email' },
  { value: 'whatsapp',  label: 'WhatsApp' },
  { value: 'form',      label: 'Formulario web' },
]

// ─── Pricing tier form ────────────────────────────────────────────────────────

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

// ─── Ticket type card ─────────────────────────────────────────────────────────

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

// ─── Service form ─────────────────────────────────────────────────────────────

function ServiceForm({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const { mutate: create, isPending } = useCreateService(eventId)

  const [category, setCategory]       = useState('transporte')
  const [title, setTitle]             = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [description, setDescription] = useState('')
  const [priceFrom, setPriceFrom]     = useState('')
  const [contactMethod, setContactMethod] = useState('email')
  const [contactValue, setContactValue]   = useState('')
  const [imageUrl, setImageUrl]       = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !partnerName) { toast.error('Completá título y proveedor'); return }

    const input: CreateServiceInput = {
      event_id: eventId,
      category,
      title,
      partner_name: partnerName,
      description: description || undefined,
      price_from: priceFrom ? Number(priceFrom) : null,
      contact_method: contactMethod,
      contact_value: contactValue || undefined,
      image_url: imageUrl || undefined,
    }
    create(input, {
      onSuccess: () => { toast.success('Servicio agregado'); onClose() },
      onError: (err: any) => toast.error(err?.message ?? 'Error al guardar'),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Categoría</Label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {SERVICE_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Título del servicio *</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Traslado Posadas → evento" />
        </div>
        <div className="space-y-1.5">
          <Label>Proveedor *</Label>
          <Input value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="Nombre del proveedor" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Descripción</Label>
        <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Breve descripción para el usuario" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Precio desde (ARS)</Label>
          <Input type="number" min="0" step="1" value={priceFrom} onChange={e => setPriceFrom(e.target.value)} placeholder="Dejar vacío = A consultar" />
        </div>
        <div className="space-y-1.5">
          <Label>Imagen (URL)</Label>
          <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Método de contacto</Label>
          <select
            value={contactMethod}
            onChange={e => setContactMethod(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {CONTACT_METHODS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Valor de contacto</Label>
          <Input value={contactValue} onChange={e => setContactValue(e.target.value)} placeholder="email / número / URL" />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? 'Guardando...' : 'Agregar servicio'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  )
}

// ─── Services section ─────────────────────────────────────────────────────────

function ServicesSection({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false)
  const { data: services, isLoading } = useEventServices(eventId)
  const { mutate: deleteService, isPending: deleting } = useDeleteService(eventId)
  const { mutate: toggleService } = useToggleService(eventId)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-base">Servicios complementarios</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
              <Plus className="h-3.5 w-3.5" /> Agregar servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo servicio complementario</DialogTitle>
            </DialogHeader>
            <ServiceForm eventId={eventId} onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
      ) : !services || services.length === 0 ? (
        <div className="border border-dashed rounded-xl py-10 text-center">
          <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Sin servicios. Agregá traslados, hospedaje o gastronomía para ofrecerlos en el upsell.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map((s: any) => {
            const cat = SERVICE_CATEGORIES.find(c => c.value === s.category)
            return (
              <div
                key={s.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm transition-opacity ${
                  s.active ? 'bg-white border-border' : 'bg-muted/30 border-dashed opacity-60'
                }`}
              >
                <span className="text-[18px] shrink-0">{cat?.emoji ?? '📦'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.partner_name}
                    {s.price_from ? ` · ${formatARS(Number(s.price_from))}` : ' · A consultar'}
                    {' · '}{cat?.label}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleService({ serviceId: s.id, active: !s.active }, {
                      onSuccess: () => toast.success(s.active ? 'Servicio desactivado' : 'Servicio activado'),
                      onError: () => toast.error('No se pudo cambiar el estado'),
                    })}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      s.active
                        ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                        : 'border-muted text-muted-foreground hover:border-green-200 hover:text-green-700'
                    }`}
                  >
                    {s.active ? 'Activo' : 'Inactivo'}
                  </button>
                  <button
                    onClick={() => deleteService(s.id, {
                      onSuccess: () => toast.success('Servicio eliminado'),
                      onError: () => toast.error('No se pudo eliminar'),
                    })}
                    disabled={deleting}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function toLocal(iso: string) {
  return iso ? new Date(iso).toISOString().slice(0, 16) : ''
}

// ─── Main page ────────────────────────────────────────────────────────────────

function AdminEventDetailPage() {
  const { eventId } = Route.useParams()
  const navigate = useNavigate()
  const { data: event, isLoading } = useOrgEventDetail(eventId)
  const { mutate: toggleStatus, isPending: toggling } = useToggleEventStatus()
  const { mutate: setFeatured, isPending: featuring } = useSetFeaturedEvent()
  const { mutate: updateEvent, isPending: saving } = useUpdateEvent()
  const { mutate: deleteEvent, isPending: deleting } = useDeleteEvent()

  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editData, setEditData] = useState<{
    name: string; starts_at: string; registration_opens_at: string
    registration_closes_at: string; city: string; province: string
    address: string; short_description: string; description: string; cover_image_url: string
  } | null>(null)

  function openEdit() {
    if (!event) return
    const loc = event.location as any
    setEditData({
      name: event.name,
      starts_at: toLocal(event.starts_at),
      registration_opens_at: toLocal(event.registration_opens_at),
      registration_closes_at: toLocal(event.registration_closes_at),
      city: loc?.city ?? '',
      province: loc?.province ?? '',
      address: loc?.address ?? '',
      short_description: (event as any).short_description ?? '',
      description: (event as any).description ?? '',
      cover_image_url: (event as any).cover_image_url ?? '',
    })
    setEditOpen(true)
  }

  function handleSaveEdit() {
    if (!editData) return
    updateEvent({ eventId, data: editData }, {
      onSuccess: () => { toast.success('Evento actualizado'); setEditOpen(false) },
      onError:   () => toast.error('No se pudo actualizar el evento'),
    })
  }

  function handleDelete() {
    deleteEvent(eventId, {
      onSuccess: () => { toast.success('Evento eliminado'); navigate({ to: '/admin/eventos' }) },
      onError:   () => toast.error('No se pudo eliminar — puede tener inscripciones asociadas'),
    })
  }

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
  const isFeatured = !!(event as any).is_featured

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

          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className={`shrink-0 gap-1.5 ${isFeatured ? 'border-yellow bg-yellow/10 text-ink' : ''}`}
              disabled={featuring}
              onClick={() => setFeatured({ eventId, featured: !isFeatured }, {
                onSuccess: () => toast.success(isFeatured ? 'Quitado de destacados' : '¡Evento destacado en la home!'),
                onError: () => toast.error('No se pudo actualizar'),
              })}
            >
              <Star className={`h-4 w-4 ${isFeatured ? 'fill-yellow text-yellow' : ''}`} />
              {isFeatured ? 'Destacado' : 'Destacar'}
            </Button>
            <Button size="sm" variant="outline" className="shrink-0 gap-1.5" disabled={toggling} onClick={handleToggle}>
              {event.status === 'published'
                ? <><ToggleRight className="h-4 w-4 text-green-600" /> Publicado</>
                : <><ToggleLeft className="h-4 w-4" /> Publicar</>
              }
            </Button>
            <Button size="sm" variant="outline" className="shrink-0 gap-1.5" onClick={openEdit}>
              <Pencil className="h-4 w-4" /> Editar
            </Button>
            {confirmDelete ? (
              <div className="flex gap-1">
                <Button size="sm" variant="destructive" className="h-8 text-xs" disabled={deleting}
                  onClick={handleDelete}>
                  {deleting ? '...' : 'Confirmar'}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs"
                  onClick={() => setConfirmDelete(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" className="shrink-0 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
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

        <ServicesSection eventId={eventId} />
      </div>

      {/* ── Dialog editar evento ── */}
      <Dialog open={editOpen} onOpenChange={open => !open && setEditOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar evento</DialogTitle>
          </DialogHeader>
          {editData && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Descripción corta *</Label>
                <Input value={editData.short_description}
                  onChange={e => setEditData({ ...editData, short_description: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Descripción completa</Label>
                <Textarea rows={3} value={editData.description}
                  onChange={e => setEditData({ ...editData, description: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Fecha y hora del evento *</Label>
                <Input type="datetime-local" value={editData.starts_at}
                  onChange={e => setEditData({ ...editData, starts_at: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Apertura inscripciones</Label>
                  <Input type="datetime-local" value={editData.registration_opens_at}
                    onChange={e => setEditData({ ...editData, registration_opens_at: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Cierre inscripciones</Label>
                  <Input type="datetime-local" value={editData.registration_closes_at}
                    onChange={e => setEditData({ ...editData, registration_closes_at: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Ciudad</Label>
                  <Input value={editData.city}
                    onChange={e => setEditData({ ...editData, city: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Provincia</Label>
                  <Input value={editData.province}
                    onChange={e => setEditData({ ...editData, province: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Dirección / punto de largada</Label>
                <Input value={editData.address}
                  onChange={e => setEditData({ ...editData, address: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>URL imagen de portada</Label>
                <Input value={editData.cover_image_url}
                  onChange={e => setEditData({ ...editData, cover_image_url: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1" disabled={saving} onClick={handleSaveEdit}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
