import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { OrgLayout, OrgBreadcrumb } from '@/components/org/org-layout'
import { useMyOrganization } from '@/hooks/use-organizer'
import { useCreateEvent } from '@/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

export const Route = createFileRoute('/org/eventos/nuevo')({
  component: OrgNuevoEventoPage,
})

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const ticketTypeSchema = z.object({
  name:        z.string().min(1, 'Requerido'),
  distance_km: z.coerce.number().optional(),
  capacity:    z.coerce.number().int().positive('Debe ser mayor a 0'),
})

const eventSchema = z.object({
  name:                    z.string().min(3, 'Mínimo 3 caracteres'),
  slug:                    z.string().min(3).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  type:                    z.string().min(1, 'Requerido'),
  status:                  z.enum(['draft', 'published']),
  starts_at:               z.string().min(1, 'Requerido'),
  registration_opens_at:   z.string().min(1, 'Requerido'),
  registration_closes_at:  z.string().min(1, 'Requerido'),
  short_description:       z.string().min(10, 'Mínimo 10 caracteres'),
  description:             z.string().optional(),
  city:                    z.string().min(1, 'Requerido'),
  province:                z.string().min(1, 'Requerido'),
  address:                 z.string().optional(),
  cover_image_url:         z.string().optional(),
  ticket_types:            z.array(ticketTypeSchema).min(1, 'Agregá al menos un tipo de entrada'),
})

type EventFormData = z.infer<typeof eventSchema>

function OrgNuevoEventoPage() {
  const navigate = useNavigate()
  const { data: org } = useMyOrganization()
  const { mutate: createEvent, isPending } = useCreateEvent()

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      status: 'draft',
      type: 'running',
      province: 'Misiones',
      ticket_types: [{ name: '', capacity: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'ticket_types' })

  function onNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue('name', e.target.value)
    setValue('slug', slugify(e.target.value), { shouldValidate: true })
  }

  function onSubmit(data: EventFormData) {
    createEvent({
      ...data,
      organization_id: org?.id,
    }, {
      onSuccess: () => {
        toast.success('Evento creado')
        navigate({ to: '/org/eventos' })
      },
      onError: (err: any) => toast.error(err?.message ?? 'Error al crear el evento'),
    })
  }

  return (
    <OrgLayout>
      <OrgBreadcrumb items={[
        { label: 'Mi organización', to: '/org' },
        { label: 'Eventos', to: '/org/eventos' },
        { label: 'Nuevo evento' },
      ]} />

      <div className="flex items-center gap-3 mb-6">
        <Link to="/org/eventos">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ChevronLeft className="h-4 w-4" /> Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Nuevo evento</h1>
          {org && <p className="text-xs text-muted-foreground">{org.name}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">

        {/* Datos básicos */}
        <Card>
          <CardHeader><CardTitle className="text-base">Datos básicos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre del evento *</Label>
              <Input id="name" {...register('name')} onChange={onNameChange} placeholder="Rock en el Parque Posadas" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">
                Slug (URL) *{' '}
                <span className="font-normal text-muted-foreground">— se genera automáticamente</span>
              </Label>
              <Input id="slug" {...register('slug')} placeholder="rock-en-el-parque-posadas" />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo *</Label>
                <Select defaultValue="running" onValueChange={(v) => setValue('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="trail">Trail</SelectItem>
                    <SelectItem value="triathlon">Triatlón</SelectItem>
                    <SelectItem value="cycling">Ciclismo</SelectItem>
                    <SelectItem value="concierto">Concierto</SelectItem>
                    <SelectItem value="teatro">Teatro</SelectItem>
                    <SelectItem value="conferencia">Conferencia</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Estado inicial *</Label>
                <Select defaultValue="draft" onValueChange={(v) => setValue('status', v as EventFormData['status'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cover_image_url">URL de imagen de portada</Label>
              <Input id="cover_image_url" {...register('cover_image_url')} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        {/* Fechas */}
        <Card>
          <CardHeader><CardTitle className="text-base">Fechas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="starts_at">Fecha y hora del evento *</Label>
              <Input id="starts_at" type="datetime-local" {...register('starts_at')} />
              {errors.starts_at && <p className="text-xs text-destructive">{errors.starts_at.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="registration_opens_at">Apertura de inscripciones *</Label>
                <Input id="registration_opens_at" type="datetime-local" {...register('registration_opens_at')} />
                {errors.registration_opens_at && <p className="text-xs text-destructive">{errors.registration_opens_at.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="registration_closes_at">Cierre de inscripciones *</Label>
                <Input id="registration_closes_at" type="datetime-local" {...register('registration_closes_at')} />
                {errors.registration_closes_at && <p className="text-xs text-destructive">{errors.registration_closes_at.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader><CardTitle className="text-base">Ubicación</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city">Ciudad *</Label>
                <Input id="city" {...register('city')} placeholder="Posadas" />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="province">Provincia *</Label>
                <Input id="province" {...register('province')} placeholder="Misiones" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Dirección / lugar</Label>
              <Input id="address" {...register('address')} placeholder="Parque República, Posadas" />
            </div>
          </CardContent>
        </Card>

        {/* Descripción */}
        <Card>
          <CardHeader><CardTitle className="text-base">Descripción</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="short_description">
                Descripción corta *{' '}
                <span className="font-normal text-muted-foreground">— visible en la card</span>
              </Label>
              <Input id="short_description" {...register('short_description')} placeholder="Una noche de música en el corazón de Posadas..." />
              {errors.short_description && <p className="text-xs text-destructive">{errors.short_description.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Descripción completa</Label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                placeholder="Descripción detallada del evento..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tipos de entrada */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Tipos de entrada</CardTitle>
              <Button type="button" variant="outline" size="sm" className="gap-1.5"
                onClick={() => append({ name: '', capacity: 0 })}>
                <Plus className="h-3.5 w-3.5" /> Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(errors.ticket_types as any)?.message && (
              <p className="text-xs text-destructive">{(errors.ticket_types as any).message}</p>
            )}
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nombre *</Label>
                    <Input {...register(`ticket_types.${index}.name`)} placeholder="General / VIP / 10K" className="h-8 text-sm" />
                    {errors.ticket_types?.[index]?.name && (
                      <p className="text-xs text-destructive">{errors.ticket_types[index].name?.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Distancia km (opcional)</Label>
                    <Input {...register(`ticket_types.${index}.distance_km`)} type="number" step="0.1" min="0" placeholder="10" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cupos *</Label>
                    <Input {...register(`ticket_types.${index}.capacity`)} type="number" min="1" placeholder="500" className="h-8 text-sm" />
                    {errors.ticket_types?.[index]?.capacity && (
                      <p className="text-xs text-destructive">{errors.ticket_types[index].capacity?.message}</p>
                    )}
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm"
                  className="mt-5 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => fields.length > 1 && remove(index)}
                  disabled={fields.length === 1}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Los precios (early bird, general, etc.) se configuran después desde el detalle del evento.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-3 pb-8">
          <Button type="submit" disabled={isPending} className="min-w-36">
            {isPending ? 'Guardando...' : 'Crear evento'}
          </Button>
          <Link to="/org/eventos">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
        </div>
      </form>
    </OrgLayout>
  )
}
