import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, AlertCircle, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  step1Schema, step2Schema, step5Schema,
  type Step1Data, type Step2Data, type Step5Data,
  type RegistrationFormData,
} from '@/lib/validators/registration'
import { useUpload } from '@/hooks/use-upload'
import { useCreateRegistration } from '@/hooks/use-registration'
import type { Tables } from '@/types/database'

const SPORTS_TYPES = ['running', 'trail', 'triathlon', 'cycling']

interface RegistrationFormProps {
  eventId: string
  eventName: string
  userEmail: string
  eventType: string
  distances: {
    id: string
    name: string
    distance_km: number | null
    capacity: number | null
    registered_count: number
    pricing_tiers: { price_ars: number; active: boolean; starts_at: string; ends_at: string }[]
  }[]
  requiresMedicalCert: boolean
  medicalCertMinKm: number | null
  profile: Tables<'profiles'> | null
}

function calcAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  return today >= new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? age : age - 1
}

export default function RegistrationForm({
  eventId, eventName, userEmail, eventType, distances, profile,
}: RegistrationFormProps) {
  const isSports = SPORTS_TYPES.includes(eventType)

  const STEPS = isSports
    ? ['Datos personales', 'Datos deportivos', 'Aceptaciones']
    : ['Datos personales', 'Selección de entrada', 'Aceptaciones']

  const STEP_KEYS = isSports
    ? ['personal', 'sports', 'terms'] as const
    : ['personal', 'ticket', 'terms'] as const

  const profileComplete = !!(
    profile?.first_name && profile?.last_name && profile?.phone &&
    profile?.birth_date && profile?.gender && profile?.dni && profile?.nationality
  )

  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({})
  const [editingPersonal, setEditingPersonal] = useState(!profileComplete)
  const navigate = useNavigate()
  const { uploading } = useUpload()
  const { mutateAsync: createRegistration, isPending } = useCreateRegistration()

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      email: userEmail,
      phone: profile?.phone ?? '',
      birth_date: profile?.birth_date ?? '',
      gender: (profile?.gender as 'M' | 'F' | 'X') ?? undefined,
      dni_type: (profile?.dni_type as 'DNI' | 'PASAPORTE' | 'CI') ?? 'DNI',
      dni: profile?.dni ?? '',
      nationality: profile?.nationality ?? 'Argentina',
      guardian_full_name: '',
      guardian_dni: '',
      guardian_phone: '',
      guardian_relationship: undefined,
      accepts_guardian_authorization: false,
    },
  })

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { distance_id: '', shirt_size: undefined, is_first_race: false, club: '' },
  })

  const form5 = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: { accepts_terms: undefined, accepts_waiver: undefined, accepts_image_rights: false },
  })

  // Resetear form1 cuando el perfil carga (llega después del primer render)
  useEffect(() => {
    if (!profile) return
    form1.reset({
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      email: userEmail,
      phone: profile.phone ?? '',
      birth_date: profile.birth_date ?? '',
      gender: (profile.gender as 'M' | 'F' | 'X') ?? undefined,
      dni_type: (profile.dni_type as 'DNI' | 'PASAPORTE' | 'CI') ?? 'DNI',
      dni: profile.dni ?? '',
      nationality: profile.nationality ?? 'Argentina',
      guardian_full_name: '',
      guardian_dni: '',
      guardian_phone: '',
      guardian_relationship: undefined,
      accepts_guardian_authorization: false,
    })
    if (profileComplete) setEditingPersonal(false)
  }, [profile?.id])

  const forms = [form1, form2, form5]
  const currentForm = forms[step]
  const currentStepKey = STEP_KEYS[step]

  const birthDateValue = form1.watch('birth_date')
  const isMinor = birthDateValue ? calcAge(birthDateValue) < 18 : false

  const selectedDistanceId = form2.watch('distance_id')
  const selectedDistance = distances.find(d => d.id === selectedDistanceId)

  function getActivePrice(d: typeof distances[0]) {
    const now = new Date()
    const tier = d.pricing_tiers?.find(t => t.active && now >= new Date(t.starts_at) && now <= new Date(t.ends_at))
    return tier?.price_ars ?? null
  }

  function formatARS(n: number) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
  }

  async function handleNext() {
    const valid = await currentForm.trigger()
    if (!valid) return
    const stepData = currentForm.getValues()
    const merged = { ...formData, ...stepData }
    setFormData(merged)
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      await handleSubmit(merged as RegistrationFormData)
    }
  }

  async function handleSubmit(data: RegistrationFormData) {
    try {
      const result = await createRegistration({ eventId, distanceId: data.distance_id, formData: data })
      toast.success('¡Inscripción registrada! Completá el pago para confirmar tu lugar.')
      navigate({ to: '/checkout/$orderId', params: { orderId: result.order_id } })
    } catch (err: any) {
      toast.error(err.message ?? 'Error al procesar la inscripción')
    }
  }

  const isSubmitting = uploading || isPending

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          {STEPS.map((s, i) => (
            <span key={s} className={i === step ? 'text-primary font-semibold' : i < step ? 'text-green-600' : ''}>{s}</span>
          ))}
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Paso {step + 1} de {STEPS.length}: <span className="font-medium text-foreground">{STEPS[step]}</span>
        </p>
      </div>

      {/* ── Step: datos personales ── */}
      {currentStepKey === 'personal' && (
        <div className="space-y-4">

          {/* Confirmación cuando el perfil ya está completo */}
          {!editingPersonal ? (
            <Card className="border-green-200 bg-green-50/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold text-sm">Datos cargados desde tu perfil</span>
                  </div>
                  <button
                    onClick={() => setEditingPersonal(true)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Nombre completo</p>
                    <p className="font-medium">{profile!.first_name} {profile!.last_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Documento</p>
                    <p className="font-medium">{profile!.dni_type ?? 'DNI'} {profile!.dni}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Fecha de nacimiento</p>
                    <p className="font-medium">
                      {format(new Date(profile!.birth_date!), "d 'de' MMMM yyyy", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Teléfono</p>
                    <p className="font-medium">{profile!.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs mb-0.5">Email</p>
                    <p className="font-medium">{userEmail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Formulario editable */
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre *</Label>
                    <Input id="first_name" {...form1.register('first_name')} />
                    {form1.formState.errors.first_name && <p className="text-xs text-destructive">{form1.formState.errors.first_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Apellido *</Label>
                    <Input id="last_name" {...form1.register('last_name')} />
                    {form1.formState.errors.last_name && <p className="text-xs text-destructive">{form1.formState.errors.last_name.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...form1.register('email')} />
                  {form1.formState.errors.email && <p className="text-xs text-destructive">{form1.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input id="phone" placeholder="+54 9 376 000-0000" {...form1.register('phone')} />
                  {form1.formState.errors.phone && <p className="text-xs text-destructive">{form1.formState.errors.phone.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Fecha de nacimiento *</Label>
                    <Input id="birth_date" type="date" {...form1.register('birth_date')} />
                    {form1.formState.errors.birth_date && <p className="text-xs text-destructive">{form1.formState.errors.birth_date.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Género *</Label>
                    <Select onValueChange={v => form1.setValue('gender', v as 'M' | 'F' | 'X')} defaultValue={form1.getValues('gender')}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Femenino</SelectItem>
                        <SelectItem value="X">No binario</SelectItem>
                      </SelectContent>
                    </Select>
                    {form1.formState.errors.gender && <p className="text-xs text-destructive">{form1.formState.errors.gender.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo doc.</Label>
                    <Select onValueChange={v => form1.setValue('dni_type', v as 'DNI' | 'PASAPORTE' | 'CI')} defaultValue={form1.getValues('dni_type')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DNI">DNI</SelectItem>
                        <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                        <SelectItem value="CI">CI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="dni">Número *</Label>
                    <Input id="dni" {...form1.register('dni')} />
                    {form1.formState.errors.dni && <p className="text-xs text-destructive">{form1.formState.errors.dni.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nacionalidad *</Label>
                  <Input id="nationality" {...form1.register('nationality')} />
                  {form1.formState.errors.nationality && <p className="text-xs text-destructive">{form1.formState.errors.nationality.message}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sección de menores — se muestra automáticamente si tiene menos de 18 años */}
          {isMinor && (
            <Card className="border-orange-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-2 text-orange-700 bg-orange-50 rounded-lg p-3">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">El participante es menor de edad</p>
                    <p className="text-xs mt-0.5 text-orange-600">
                      Es necesario el nombre, DNI y autorización del padre, madre o tutor legal.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="guardian_full_name">Nombre y apellido del responsable *</Label>
                    <Input id="guardian_full_name" placeholder="Ej: María García" {...form1.register('guardian_full_name')} />
                    {form1.formState.errors.guardian_full_name && <p className="text-xs text-destructive">{form1.formState.errors.guardian_full_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardian_dni">DNI del responsable *</Label>
                    <Input id="guardian_dni" placeholder="12345678" {...form1.register('guardian_dni')} />
                    {form1.formState.errors.guardian_dni && <p className="text-xs text-destructive">{form1.formState.errors.guardian_dni.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardian_phone">Teléfono del responsable *</Label>
                    <Input id="guardian_phone" placeholder="+54 9 376 000-0000" {...form1.register('guardian_phone')} />
                    {form1.formState.errors.guardian_phone && <p className="text-xs text-destructive">{form1.formState.errors.guardian_phone.message}</p>}
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Relación con el participante *</Label>
                    <Select
                      onValueChange={v => form1.setValue('guardian_relationship', v as any)}
                      defaultValue={form1.getValues('guardian_relationship')}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="padre">Padre</SelectItem>
                        <SelectItem value="madre">Madre</SelectItem>
                        <SelectItem value="tutor_legal">Tutor/a legal</SelectItem>
                        <SelectItem value="otro">Otro responsable</SelectItem>
                      </SelectContent>
                    </Select>
                    {form1.formState.errors.guardian_relationship && <p className="text-xs text-destructive">{form1.formState.errors.guardian_relationship.message}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="guardian_auth"
                    checked={form1.watch('accepts_guardian_authorization') === true}
                    onCheckedChange={v => form1.setValue('accepts_guardian_authorization', v === true)}
                  />
                  <Label htmlFor="guardian_auth" className="cursor-pointer text-sm leading-relaxed">
                    Autorizo la participación del menor en el evento y acepto la responsabilidad sobre su seguridad durante el mismo. *
                  </Label>
                </div>
                {form1.formState.errors.accepts_guardian_authorization && (
                  <p className="text-xs text-destructive ml-7">{form1.formState.errors.accepts_guardian_authorization.message}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Step: datos deportivos ── */}
      {currentStepKey === 'sports' && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Distancia *</Label>
              <RadioGroup
                onValueChange={v => form2.setValue('distance_id', v)}
                defaultValue={form2.getValues('distance_id')}
              >
                {distances.map(d => {
                  const price = getActivePrice(d)
                  const isFull = d.capacity !== null && d.registered_count >= d.capacity
                  return (
                    <div key={d.id} className={`flex items-center gap-3 p-3 rounded-lg border ${isFull ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/40 cursor-pointer'}`}>
                      <RadioGroupItem value={d.id} id={`s-${d.id}`} disabled={isFull} />
                      <Label htmlFor={`s-${d.id}`} className="flex-1 cursor-pointer">
                        <span className="font-medium">{d.name}</span>
                        {d.distance_km != null && <span className="text-muted-foreground ml-2">— {d.distance_km} km</span>}
                      </Label>
                      <span className="text-sm font-semibold">{price ? formatARS(price) : '—'}</span>
                      {isFull && <span className="text-xs text-destructive">Agotado</span>}
                    </div>
                  )
                })}
              </RadioGroup>
              {form2.formState.errors.distance_id && <p className="text-xs text-destructive">{form2.formState.errors.distance_id.message}</p>}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Talle de remera *</Label>
              <Select onValueChange={v => form2.setValue('shirt_size', v as any)} defaultValue={form2.getValues('shirt_size')}>
                <SelectTrigger><SelectValue placeholder="Seleccionar talle" /></SelectTrigger>
                <SelectContent>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form2.formState.errors.shirt_size && <p className="text-xs text-destructive">{form2.formState.errors.shirt_size.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="club">Club / equipo (opcional)</Label>
              <Input id="club" placeholder="Nombre del club" {...form2.register('club')} />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is_first_race"
                checked={form2.watch('is_first_race')}
                onCheckedChange={v => form2.setValue('is_first_race', v === true)}
              />
              <Label htmlFor="is_first_race" className="cursor-pointer">Esta es mi primera carrera</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step: selección de entrada (non-sports) ── */}
      {currentStepKey === 'ticket' && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tipo de entrada *</Label>
              <RadioGroup
                onValueChange={v => form2.setValue('distance_id', v)}
                defaultValue={form2.getValues('distance_id')}
              >
                {distances.map(d => {
                  const price = getActivePrice(d)
                  const isFull = d.capacity !== null && d.registered_count >= d.capacity
                  return (
                    <div key={d.id} className={`flex items-center gap-3 p-3 rounded-lg border ${isFull ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/40 cursor-pointer'}`}>
                      <RadioGroupItem value={d.id} id={`t-${d.id}`} disabled={isFull} />
                      <Label htmlFor={`t-${d.id}`} className="flex-1 cursor-pointer">
                        <span className="font-medium">{d.name}</span>
                      </Label>
                      <span className="text-sm font-semibold">{price ? formatARS(price) : '—'}</span>
                      {isFull && <span className="text-xs text-destructive">Agotado</span>}
                    </div>
                  )
                })}
              </RadioGroup>
              {form2.formState.errors.distance_id && <p className="text-xs text-destructive">{form2.formState.errors.distance_id.message}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step: aceptaciones ── */}
      {currentStepKey === 'terms' && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-1">Resumen de inscripción</h3>
              <p className="text-sm text-muted-foreground">{eventName}</p>
              {selectedDistance && (
                <p className="text-sm font-medium mt-1">
                  {selectedDistance.name}
                  {selectedDistance.distance_km != null && ` — ${selectedDistance.distance_km} km`}
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={form5.watch('accepts_terms') === true}
                  onCheckedChange={v => form5.setValue('accepts_terms', v === true ? true : undefined as any)}
                />
                <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed">
                  Acepto los <a href="/legal/terminos" target="_blank" className="underline text-primary">Términos y condiciones</a> de tevent. *
                </Label>
              </div>
              {form5.formState.errors.accepts_terms && <p className="text-xs text-destructive ml-7">{form5.formState.errors.accepts_terms.message}</p>}

              <div className="flex items-start gap-3">
                <Checkbox
                  id="waiver"
                  checked={form5.watch('accepts_waiver') === true}
                  onCheckedChange={v => form5.setValue('accepts_waiver', v === true ? true : undefined as any)}
                />
                <Label htmlFor="waiver" className="cursor-pointer text-sm leading-relaxed">
                  Acepto el deslinde de responsabilidad y confirmo que mis datos son correctos. *
                </Label>
              </div>
              {form5.formState.errors.accepts_waiver && <p className="text-xs text-destructive ml-7">{form5.formState.errors.accepts_waiver.message}</p>}

              <div className="flex items-start gap-3">
                <Checkbox
                  id="image"
                  checked={form5.watch('accepts_image_rights')}
                  onCheckedChange={v => form5.setValue('accepts_image_rights', v === true)}
                />
                <Label htmlFor="image" className="cursor-pointer text-sm leading-relaxed">
                  Autorizo el uso de mi imagen en fotos y videos del evento (opcional).
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navegación */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Anterior
        </Button>
        <Button onClick={handleNext} disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</>
          ) : step === STEPS.length - 1 ? (
            <>Confirmar e ir al pago <ChevronRight className="h-4 w-4" /></>
          ) : (
            <>Siguiente <ChevronRight className="h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  )
}
