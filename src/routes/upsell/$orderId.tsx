import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { ChevronRight, ArrowRight, Heart, MessageCircle, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { useOrder } from '@/hooks/use-order'
import { useComplementaryServices, useServiceInterests, useToggleServiceInterest } from '@/hooks/use-complementary-services'
import { Skeleton } from '@/components/ui/skeleton'
import { formatARS } from '@/lib/utils'

const STEPS = ['transporte', 'hospedaje', 'comida'] as const
type Step = typeof STEPS[number]

const STEP_CONFIG: Record<Step, { label: string; emoji: string; headline: string; sub: string }> = {
  transporte: {
    label: 'Transporte',
    emoji: '🚌',
    headline: '¿Cómo llegás al evento?',
    sub: 'Organizá tu traslado y llegá sin preocupaciones.',
  },
  hospedaje: {
    label: 'Hospedaje',
    emoji: '🏠',
    headline: '¿Dónde vas a quedarte?',
    sub: 'Alojamientos seleccionados cerca del evento con tarifas especiales.',
  },
  comida: {
    label: 'Gastronomía',
    emoji: '🍽️',
    headline: '¿Querés reservar una mesa?',
    sub: 'La mejor gastronomía misionera antes y después del evento.',
  },
}

const searchSchema = z.object({
  step: z.enum(STEPS).optional().default('transporte'),
})

export const Route = createFileRoute('/upsell/$orderId')({
  validateSearch: searchSchema,
  component: () => (
    <ProtectedRoute>
      <UpsellPage />
    </ProtectedRoute>
  ),
})

function UpsellPage() {
  const { orderId } = Route.useParams()
  const { step } = Route.useSearch()
  const navigate = useNavigate()

  const { data: order, isLoading } = useOrder(orderId)

  const reg = (order as any)?.registration
  const eventId: string = reg?.event_id ?? ''
  const registrationId: string = reg?.id ?? ''

  const { data: services } = useComplementaryServices(eventId)
  const { data: interestedIds } = useServiceInterests(registrationId)

  const stepConfig = STEP_CONFIG[step]
  const stepIndex = STEPS.indexOf(step)
  const categoryServices = (services ?? []).filter((s: any) => s.category === step)

  function goNext() {
    const nextIndex = stepIndex + 1
    if (nextIndex < STEPS.length) {
      navigate({ to: '/upsell/$orderId', params: { orderId }, search: { step: STEPS[nextIndex] } })
    } else {
      navigate({ to: '/checkout/$orderId', params: { orderId } })
    }
  }

  if (isLoading) {
    return (
      <div className="bg-paper min-h-screen">
        <div className="bg-navy h-48 animate-pulse" />
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-40 rounded-[16px]" />
          <Skeleton className="h-40 rounded-[16px]" />
        </div>
      </div>
    )
  }

  if (order?.status === 'paid' && reg?.id) {
    navigate({ to: '/confirmacion/$registrationId', params: { registrationId: reg.id } })
    return null
  }

  const event = reg?.event as any

  return (
    <div className="bg-paper min-h-screen">

      {/* ── Header ── */}
      <div className="bg-navy text-paper px-4 md:px-10 py-10">
        <div className="max-w-2xl mx-auto">

          {/* Progress stepper */}
          <div className="flex items-center gap-1.5 mb-8">
            {/* Paso 0: Inscripción (ya hecho) */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-paper/40">
              <div className="w-5 h-5 rounded-full bg-yellow text-ink grid place-items-center text-[10px] font-bold">✓</div>
              <span className="hidden sm:inline">Inscripción</span>
            </div>

            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="h-px w-4 bg-white/20" />
                <div className={`flex items-center gap-1.5 text-[11px] font-mono ${
                  i < stepIndex ? 'text-yellow' : i === stepIndex ? 'text-yellow' : 'text-paper/30'
                }`}>
                  <div className={`w-5 h-5 rounded-full border grid place-items-center text-[10px] font-bold ${
                    i < stepIndex  ? 'bg-yellow text-ink border-yellow' :
                    i === stepIndex ? 'border-yellow text-yellow' :
                    'border-white/20 text-white/30'
                  }`}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  <span className="hidden sm:inline">{STEP_CONFIG[s].label}</span>
                </div>
              </div>
            ))}

            {/* Pago (siguiente) */}
            <div className="flex items-center gap-1.5">
              <div className="h-px w-4 bg-white/20" />
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-paper/30">
                <div className="w-5 h-5 rounded-full border border-white/20 text-white/30 grid place-items-center text-[10px] font-bold">
                  {STEPS.length + 1}
                </div>
                <span className="hidden sm:inline">Pago</span>
              </div>
            </div>
          </div>

          {/* Step headline */}
          <div className="text-[36px] mb-2">{stepConfig.emoji}</div>
          <h1 className="font-display text-[clamp(26px,4vw,44px)] leading-[0.97] tracking-[-0.02em]">
            {stepConfig.headline}
          </h1>
          <p className="text-paper/60 text-[15px] mt-2">{stepConfig.sub}</p>

          {event?.name && (
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-yellow/80 mt-4">
              {event.name}
            </p>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 py-8">

        {categoryServices.length === 0 ? (
          <div className="text-center py-16 border border-line rounded-[18px]">
            <div className="text-[48px] mb-3">{stepConfig.emoji}</div>
            <p className="font-mono text-[13px] text-brand-muted">
              No hay servicios de {stepConfig.label.toLowerCase()} disponibles para este evento todavía.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoryServices.map((service: any) => (
              <UpsellCard
                key={service.id}
                service={service}
                registrationId={registrationId}
                isInterested={interestedIds?.includes(service.id) ?? false}
              />
            ))}
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-line">
          <button
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-navy text-paper text-[15px] font-semibold hover:bg-terra transition-colors"
          >
            {stepIndex < STEPS.length - 1 ? (
              <>Continuar <ChevronRight className="h-4 w-4" /></>
            ) : (
              <>Ir al pago <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
          <button
            onClick={goNext}
            className="px-6 py-4 rounded-full border border-line text-[14px] font-semibold text-brand-muted hover:border-navy hover:text-navy transition-colors"
          >
            Saltar este paso
          </button>
        </div>

        <p className="text-center font-mono text-[11px] text-brand-muted mt-4">
          Paso {stepIndex + 2} de {STEPS.length + 2} · Podés saltar cualquier paso
        </p>
      </div>
    </div>
  )
}

// ── Card individual ──────────────────────────────────────────────────────────

interface UpsellCardProps {
  service: any
  registrationId: string
  isInterested: boolean
}

function UpsellCard({ service, registrationId, isInterested }: UpsellCardProps) {
  const [optimistic, setOptimistic] = useState(isInterested)
  const { mutate: toggle, isPending } = useToggleServiceInterest(registrationId)

  function handleInterest() {
    const next = !optimistic
    setOptimistic(next)
    toggle(
      { serviceId: service.id, alreadyInterested: optimistic },
      {
        onError: () => {
          setOptimistic(!next)
          toast.error('No se pudo guardar')
        },
        onSuccess: () => {
          if (next) toast.success('¡Guardado! Lo verás en tu confirmación.')
        },
      }
    )
  }

  function handleContact() {
    if (service.contact_method === 'whatsapp' && service.contact_value) {
      const phone = service.contact_value.replace(/\D/g, '')
      const msg = encodeURIComponent(`Hola, me interesa "${service.title}" de MISIONA HUB`)
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
    } else if (service.contact_method === 'email' && service.contact_value) {
      window.open(`mailto:${service.contact_value}?subject=${encodeURIComponent(service.title)}`, '_blank')
    }
  }

  return (
    <div className={`bg-white rounded-[16px] border-2 overflow-hidden transition-all duration-200 ${
      optimistic
        ? 'border-navy shadow-[0_6px_24px_-6px_rgba(11,27,43,0.25)]'
        : 'border-line hover:border-navy/40'
    }`}>
      {service.image_url && (
        <div className="h-40 overflow-hidden">
          <img
            src={service.image_url}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[18px] leading-[1.1] text-navy">{service.title}</h3>
          <button
            onClick={handleInterest}
            disabled={isPending}
            className="shrink-0 p-1.5 rounded-full hover:bg-cream transition-colors"
            aria-label={optimistic ? 'Quitar interés' : 'Me interesa'}
          >
            <Heart className={`h-5 w-5 transition-colors ${
              optimistic ? 'fill-terra text-terra' : 'text-brand-muted hover:text-terra'
            }`} />
          </button>
        </div>

        {service.partner_name && (
          <p className="font-mono text-[11px] text-brand-muted">{service.partner_name}</p>
        )}

        {service.description && (
          <p className="text-[13px] text-brand-muted leading-[1.5]">{service.description}</p>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-line">
          {service.price_from ? (
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted block">Desde</span>
              <span className="font-display text-[20px] leading-none text-navy">{formatARS(service.price_from)}</span>
            </div>
          ) : (
            <span className="font-mono text-[12px] text-brand-muted">A consultar</span>
          )}

          {optimistic ? (
            <span className="text-[12px] font-semibold text-terra flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 fill-terra" /> Guardado
            </span>
          ) : service.contact_method !== 'form' && service.contact_value ? (
            <button
              onClick={handleContact}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-cream text-navy text-[12px] font-semibold hover:bg-navy hover:text-paper transition-colors"
            >
              {service.contact_method === 'whatsapp'
                ? <><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</>
                : <><Mail className="h-3.5 w-3.5" /> Email</>
              }
            </button>
          ) : (
            <button
              onClick={handleInterest}
              className="px-3 py-2 rounded-full bg-cream text-navy text-[12px] font-semibold hover:bg-navy hover:text-paper transition-colors"
            >
              Me interesa
            </button>
          )}
        </div>

        {optimistic && (
          <p className="text-[11px] font-mono text-terra/80 bg-terra/5 rounded-lg px-3 py-2 text-center">
            ✓ Lo verás en tu página de confirmación
          </p>
        )}
      </div>
    </div>
  )
}
