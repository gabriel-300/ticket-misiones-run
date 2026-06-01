import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  User, Medal, FileCheck, Save, Upload, ExternalLink,
  CheckCircle2, Clock, XCircle, AlertCircle, ChevronRight, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { useAuth } from '@/hooks/use-auth'
import { useMyRegistrations, useUpdateProfile, useUploadApto } from '@/hooks/use-profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useSeo } from '@/hooks/use-seo'

const searchSchema = z.object({ tab: z.enum(['datos', 'carreras', 'apto']).optional() })

export const Route = createFileRoute('/perfil/')({
  validateSearch: searchSchema,
  component: () => <ProtectedRoute><PerfilPage /></ProtectedRoute>,
})

const profileSchema = z.object({
  first_name:              z.string().min(2, 'Mínimo 2 caracteres'),
  last_name:               z.string().min(2, 'Mínimo 2 caracteres'),
  phone:                   z.string().min(8, 'Teléfono inválido'),
  nationality:             z.string().min(2, 'Requerido'),
  shirt_size:              z.string().optional(),
  blood_type:              z.string().optional(),
  emergency_contact_name:  z.string().min(2, 'Requerido'),
  emergency_contact_phone: z.string().min(8, 'Teléfono inválido'),
  medical_conditions:      z.string().optional(),
})
type ProfileForm = z.infer<typeof profileSchema>

const TABS = [
  { id: 'datos',     label: 'Mis datos',    icon: User },
  { id: 'carreras',  label: 'Mis entradas', icon: Medal },
  { id: 'apto',      label: 'Apto médico',  icon: FileCheck },
]

const REG_STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  paid:            { label: 'Confirmado', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-green-600' },
  pending_payment: { label: 'Pago pendiente', icon: <Clock className="h-3.5 w-3.5" />,        color: 'text-orange-500' },
  cancelled:       { label: 'Cancelado',      icon: <XCircle className="h-3.5 w-3.5" />,       color: 'text-red-500' },
}

const APTO_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'En revisión',  color: 'bg-orange-50 border-orange-200 text-orange-800' },
  aprobado:  { label: 'Aprobado ✓',  color: 'bg-green-50 border-green-200 text-green-800' },
  rechazado: { label: 'Rechazado',   color: 'bg-red-50 border-red-200 text-red-800' },
}

function PerfilPage() {
  useSeo('Mi perfil')
  const { tab: tabParam } = useSearch({ from: '/perfil/' })
  const [tab, setTab] = useState<'datos' | 'carreras' | 'apto'>(tabParam ?? 'datos')
  const { profile, user } = useAuth()
  const { data: registrations, isLoading: regsLoading } = useMyRegistrations()
  const { mutate: updateProfile, isPending: saving }    = useUpdateProfile()
  const { mutate: uploadApto, isPending: uploading }    = useUploadApto()

  const ec = profile?.emergency_contact as { name?: string; phone?: string } | null

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      first_name:              profile?.first_name ?? '',
      last_name:               profile?.last_name ?? '',
      phone:                   profile?.phone ?? '',
      nationality:             profile?.nationality ?? '',
      shirt_size:              profile?.shirt_size ?? '',
      blood_type:              profile?.blood_type ?? '',
      emergency_contact_name:  ec?.name ?? '',
      emergency_contact_phone: ec?.phone ?? '',
      medical_conditions:      profile?.medical_conditions ?? '',
    },
  })

  function handleSave(data: ProfileForm) {
    updateProfile(data, {
      onSuccess: () => toast.success('Perfil actualizado'),
      onError:   (e) => toast.error(e instanceof Error ? e.message : 'Error al guardar'),
    })
  }

  function handleAptoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    uploadApto(file, {
      onSuccess: () => toast.success('Apto médico enviado — quedará en revisión'),
      onError:   () => toast.error('Error al subir el archivo'),
    })
  }

  if (!profile) return (
    <div className="container mx-auto px-4 py-16 max-w-2xl flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">Cargando perfil...</p>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
          {profile.first_name[0]}{profile.last_name[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold">{profile.first_name} {profile.last_name}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id as typeof tab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${tab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ─── Tab: Mis datos ─────────────────────────────── */}
      {tab === 'datos' && (
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input {...form.register('first_name')} />
              {form.formState.errors.first_name && <p className="text-xs text-destructive">{form.formState.errors.first_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Apellido *</Label>
              <Input {...form.register('last_name')} />
              {form.formState.errors.last_name && <p className="text-xs text-destructive">{form.formState.errors.last_name.message}</p>}
            </div>
          </div>

          {/* Read-only identity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">DNI / Documento</Label>
              <Input value={`${profile.dni_type} ${profile.dni}`} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Fecha de nacimiento</Label>
              <Input value={profile.birth_date ? format(new Date(profile.birth_date), 'dd/MM/yyyy') : ''} disabled className="bg-muted/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Teléfono *</Label>
              <Input {...form.register('phone')} />
              {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Nacionalidad *</Label>
              <Input {...form.register('nationality')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Talle de remera</Label>
              <Select value={form.watch('shirt_size') ?? ''} onValueChange={v => form.setValue('shirt_size', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {['XS','S','M','L','XL','XXL'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Grupo sanguíneo</Label>
              <Select value={form.watch('blood_type') ?? ''} onValueChange={v => form.setValue('blood_type', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {['A+','A-','B+','B-','AB+','AB-','0+','0-','No sé'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <h3 className="font-semibold text-sm">Contacto de emergencia</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre y apellido *</Label>
              <Input {...form.register('emergency_contact_name')} />
              {form.formState.errors.emergency_contact_name && <p className="text-xs text-destructive">{form.formState.errors.emergency_contact_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono *</Label>
              <Input {...form.register('emergency_contact_phone')} />
              {form.formState.errors.emergency_contact_phone && <p className="text-xs text-destructive">{form.formState.errors.emergency_contact_phone.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Condiciones médicas relevantes</Label>
            <Textarea {...form.register('medical_conditions')} placeholder="Alergias, condiciones crónicas, medicación..." rows={2} />
          </div>

          <Button type="submit" className="gap-2" disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4" /> Guardar cambios</>}
          </Button>
        </form>
      )}

      {/* ─── Tab: Mis carreras ───────────────────────────── */}
      {tab === 'carreras' && (
        <div className="space-y-3">
          {regsLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : registrations?.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Medal className="h-10 w-10 mx-auto mb-3" />
              <p className="font-medium">Todavía no tenés inscripciones</p>
              <Link to="/eventos">
                <Button className="mt-4 gap-1">Ver eventos <ChevronRight className="h-4 w-4" /></Button>
              </Link>
            </div>
          ) : registrations?.map(reg => {
            const event    = reg.event as any
            const distance = reg.ticket_type as any
            const status   = REG_STATUS_CONFIG[reg.status] ?? REG_STATUS_CONFIG.pending_payment
            return (
              <Card key={reg.id} className="overflow-hidden">
                <CardContent className="p-0 flex">
                  {event?.cover_image_url && (
                    <img src={event.cover_image_url} alt="" className="w-20 h-full object-cover shrink-0" />
                  )}
                  <div className="p-4 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{event?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {distance?.name} · {event?.starts_at ? format(new Date(event.starts_at), "d MMM yyyy", { locale: es }) : ''}
                        </p>
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-medium shrink-0 ${status.color}`}>
                        {status.icon}{status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {reg.bib_number && (
                        <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                          #{reg.bib_number}
                        </span>
                      )}
                      {reg.category && (
                        <span className="text-xs text-muted-foreground">{reg.category}</span>
                      )}
                      {reg.status === 'paid' && (
                        <Link to="/confirmacion/$registrationId" params={{ registrationId: reg.id }}
                          className="text-xs text-primary hover:underline ml-auto flex items-center gap-0.5">
                          Ver detalles <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                      {reg.status === 'pending_payment' && (reg as any).order_id && (
                        <Link to="/checkout/$orderId" params={{ orderId: (reg as any).order_id }}
                          className="text-xs text-orange-600 hover:underline ml-auto flex items-center gap-0.5 font-medium">
                          Completar pago <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ─── Tab: Apto médico ────────────────────────────── */}
      {tab === 'apto' && (
        <div className="space-y-5">
          {profile.apto_medico_url ? (
            <>
              <div className={`border rounded-xl p-4 ${APTO_STATUS_CONFIG[profile.apto_medico_status ?? 'pendiente'].color}`}>
                <p className="font-semibold">{APTO_STATUS_CONFIG[profile.apto_medico_status ?? 'pendiente'].label}</p>
                {profile.apto_medico_status === 'pendiente' && (
                  <p className="text-sm mt-1">Tu certificado fue enviado y está siendo revisado por el equipo de tevent.</p>
                )}
                {profile.apto_medico_status === 'aprobado' && (
                  <p className="text-sm mt-1">Tu certificado médico está vigente y aprobado. ¡Listo para correr!</p>
                )}
                {profile.apto_medico_status === 'rechazado' && (
                  <>
                    <p className="text-sm mt-1">Tu certificado fue rechazado. Por favor subí uno nuevo.</p>
                    {profile.apto_medico_rejection_reason && (
                      <p className="text-sm mt-1 font-medium">Motivo: {profile.apto_medico_rejection_reason}</p>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <a href={profile.apto_medico_url} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ExternalLink className="h-4 w-4" /> Ver certificado actual
                  </Button>
                </a>
                {(profile.apto_medico_status === 'rechazado' || profile.apto_medico_status === 'pendiente') && (
                  <label>
                    <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" disabled={uploading} asChild>
                      <span>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Subir nuevo
                      </span>
                    </Button>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleAptoUpload} />
                  </label>
                )}
              </div>
            </>
          ) : (
            <div className="border-2 border-dashed rounded-xl p-8 text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
              <div>
                <p className="font-medium">Sin apto médico cargado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Algunos eventos requieren certificado médico vigente para distancias largas.
                </p>
              </div>
              <label className="inline-block">
                <Button className="gap-2 cursor-pointer" disabled={uploading} asChild>
                  <span>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Subir apto médico
                  </span>
                </Button>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleAptoUpload} />
              </label>
              <p className="text-xs text-muted-foreground">PDF, JPG o PNG · máx. 5 MB</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
