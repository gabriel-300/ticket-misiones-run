import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout, AdminBreadcrumb } from '@/components/admin/admin-layout'
import { useCreateOrganization } from '@/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/organizaciones/nueva')({
  component: NuevaOrganizacionPage,
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

const schema = z.object({
  name:            z.string().min(2, 'Mínimo 2 caracteres'),
  slug:            z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  contact_email:   z.string().email('Email inválido'),
  phone:           z.string().optional(),
  description:     z.string().optional(),
  website_url:     z.string().optional(),
  logo_url:        z.string().optional(),
  commission_rate: z.coerce.number().min(0).max(100),
})

type FormData = z.infer<typeof schema>

function NuevaOrganizacionPage() {
  const navigate = useNavigate()
  const { mutate: createOrg, isPending } = useCreateOrganization()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { commission_rate: 8 },
  })

  function onNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue('name', e.target.value)
    setValue('slug', slugify(e.target.value), { shouldValidate: true })
  }

  function onSubmit(data: FormData) {
    createOrg(data, {
      onSuccess: () => {
        toast.success('Organización creada')
        navigate({ to: '/admin/organizaciones' })
      },
      onError: (err: any) => toast.error(err?.message ?? 'Error al crear la organización'),
    })
  }

  return (
    <AdminLayout>
      <AdminBreadcrumb items={[
        { label: 'Admin', to: '/admin' },
        { label: 'Organizaciones', to: '/admin/organizaciones' },
        { label: 'Nueva organización' },
      ]} />

      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/organizaciones">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ChevronLeft className="h-4 w-4" /> Volver
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Nueva organización</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">

        <Card>
          <CardHeader><CardTitle className="text-base">Datos básicos</CardTitle></CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" {...register('name')} onChange={onNameChange} placeholder="Rock en Misiones" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">
                Slug *{' '}
                <span className="font-normal text-muted-foreground">— se genera automáticamente</span>
              </Label>
              <Input id="slug" {...register('slug')} placeholder="rock-en-misiones" />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                placeholder="Descripción de la organización..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="logo_url">URL del logo</Label>
              <Input id="logo_url" {...register('logo_url')} placeholder="https://..." />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website_url">Sitio web</Label>
              <Input id="website_url" {...register('website_url')} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Contacto y comisión</CardTitle></CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-1.5">
              <Label htmlFor="contact_email">Email de contacto *</Label>
              <Input id="contact_email" type="email" {...register('contact_email')} placeholder="hola@organizacion.com" />
              {errors.contact_email && <p className="text-xs text-destructive">{errors.contact_email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" {...register('phone')} placeholder="+54 376 4000000" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="commission_rate">
                Comisión Misiona Hub (%) *{' '}
                <span className="font-normal text-muted-foreground">— default 8%</span>
              </Label>
              <Input
                id="commission_rate"
                type="number"
                step="0.5"
                min="0"
                max="100"
                {...register('commission_rate')}
                className="max-w-[120px]"
              />
              {errors.commission_rate && <p className="text-xs text-destructive">{errors.commission_rate.message}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pb-8">
          <Button type="submit" disabled={isPending} className="min-w-40">
            {isPending ? 'Guardando...' : 'Crear organización'}
          </Button>
          <Link to="/admin/organizaciones">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
        </div>
      </form>
    </AdminLayout>
  )
}
