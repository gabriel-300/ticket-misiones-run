import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, ToggleLeft, ToggleRight, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { OrgLayout, OrgBreadcrumb } from '@/components/org/org-layout'
import {
  useMyOrganization,
  useOrgEvents,
  useOrgAddons,
  useCreateAddon,
  useToggleAddon,
} from '@/hooks/use-organizer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export const Route = createFileRoute('/org/addons/')({
  component: OrgAddonsPage,
})

const ADDON_TYPE_LABELS: Record<string, string> = {
  lodging:    'Hospedaje',
  food:       'Gastronomía',
  transport:  'Transporte',
  experience: 'Experiencia',
  other:      'Otro',
}

function OrgAddonsPage() {
  const { data: org } = useMyOrganization()
  const { data: events } = useOrgEvents(org?.id ?? '')
  const { data: addons, isLoading } = useOrgAddons(org?.id ?? '')
  const { mutate: createAddon, isPending: creating } = useCreateAddon()
  const { mutate: toggleAddon } = useToggleAddon(org?.id ?? '')

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    event_id: '',
    title: '',
    description: '',
    type: 'other',
    price_ars: '',
    max_units: '',
    image_url: '',
  })

  function handleCreate() {
    if (!org?.id || !form.event_id || !form.title || !form.price_ars) {
      toast.error('Completá los campos obligatorios')
      return
    }
    createAddon({
      organization_id: org.id,
      event_id: form.event_id,
      title: form.title,
      description: form.description || undefined,
      type: form.type,
      price_ars: Number(form.price_ars),
      max_units: form.max_units ? Number(form.max_units) : null,
      image_url: form.image_url || undefined,
    }, {
      onSuccess: () => {
        toast.success('Add-on creado')
        setOpen(false)
        setForm({ event_id: '', title: '', description: '', type: 'other', price_ars: '', max_units: '', image_url: '' })
      },
      onError: (err: any) => toast.error(err?.message ?? 'Error al crear el add-on'),
    })
  }

  const formatARS = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  return (
    <OrgLayout>
      <OrgBreadcrumb items={[
        { label: 'Mi organización', to: '/org' },
        { label: 'Add-ons' },
      ]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Add-ons / Servicios complementarios</h1>
          <p className="text-sm text-muted-foreground">
            Servicios que el comprador puede sumar al momento de comprar su entrada
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nuevo add-on
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo add-on</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Evento *</Label>
                <Select onValueChange={v => setForm(f => ({ ...f, event_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar evento" /></SelectTrigger>
                  <SelectContent>
                    {events?.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Título *</Label>
                <Input
                  placeholder="Combo desayuno VIP"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Textarea
                  placeholder="Descripción del servicio..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Tipo *</Label>
                  <Select defaultValue="other" onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ADDON_TYPE_LABELS).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Precio ARS *</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="5000"
                    value={form.price_ars}
                    onChange={e => setForm(f => ({ ...f, price_ars: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Cupos máx. (opcional)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={form.max_units}
                    onChange={e => setForm(f => ({ ...f, max_units: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>URL de imagen</Label>
                  <Input
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleCreate} disabled={creating} className="flex-1">
                  {creating ? 'Guardando...' : 'Crear add-on'}
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!org ? (
        <p className="text-sm text-muted-foreground">Cargando organización...</p>
      ) : isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : !addons?.length ? (
        <div className="text-center py-16 border rounded-xl text-muted-foreground">
          <p className="font-medium">Todavía no creaste ningún add-on</p>
          <p className="text-sm mt-1">
            Los add-ons aparecen al comprador después de seleccionar su entrada.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {addons.map((addon: any) => (
            <Card key={addon.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={addon.active ? 'default' : 'secondary'}>
                        {addon.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {ADDON_TYPE_LABELS[addon.type] ?? addon.type}
                      </span>
                    </div>
                    <p className="font-semibold truncate">{addon.title}</p>
                    {addon.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{addon.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{formatARS(addon.price_ars)}</span>
                      {addon.max_units && <span>Cupos: {addon.max_units}</span>}
                      {addon.event?.name && <span>· {addon.event.name}</span>}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1 shrink-0"
                    onClick={() => toggleAddon(
                      { addonId: addon.id, active: !addon.active },
                      {
                        onSuccess: () => toast.success(addon.active ? 'Add-on desactivado' : 'Add-on activado'),
                        onError: () => toast.error('No se pudo cambiar el estado'),
                      }
                    )}
                  >
                    {addon.active
                      ? <><ToggleRight className="h-3.5 w-3.5 text-green-600" /> Activo</>
                      : <><ToggleLeft className="h-3.5 w-3.5" /> Activar</>
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link to="/org">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ChevronLeft className="h-4 w-4" /> Volver al resumen
          </Button>
        </Link>
      </div>
    </OrgLayout>
  )
}
