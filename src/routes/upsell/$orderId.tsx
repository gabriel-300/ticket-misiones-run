import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { ChevronRight, ArrowRight, Plus, Check, ShoppingCart } from 'lucide-react'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { useOrder } from '@/hooks/use-order'
import { useComplementaryServices } from '@/hooks/use-complementary-services'
import { useUpsellCart } from '@/hooks/use-upsell-cart'
import { Skeleton } from '@/components/ui/skeleton'
import { formatARS } from '@/lib/utils'

const STEPS = ['transporte', 'hospedaje', 'comida'] as const
type Step = typeof STEPS[number]

const STEP_CONFIG: Record<Step, { label: string; emoji: string; headline: string; sub: string }> = {
  transporte: {
    label: 'Transporte',
    emoji: '🚌',
    headline: '¿Cómo llegás al evento?',
    sub: 'Agregá un traslado y llegá sin preocupaciones.',
  },
  hospedaje: {
    label: 'Hospedaje',
    emoji: '🏠',
    headline: '¿Dónde vas a quedarte?',
    sub: 'Alojamientos seleccionados cerca del evento.',
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
  const cart = useUpsellCart(orderId)

  const reg = (order as any)?.registration
  const eventId: string = reg?.event_id ?? ''

  const { data: services } = useComplementaryServices(eventId)

  const stepConfig = STEP_CONFIG[step]
  const stepIndex = STEPS.indexOf(step)
  const categoryServices = (services ?? []).filter((s: any) => s.category === step)

  const baseAmount = Number(order?.total_amount ?? 0)

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
          <Skeleton className="h-48 rounded-[16px]" />
          <Skeleton className="h-48 rounded-[16px]" />
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
    <div className="bg-paper min-h-screen pb-36">

      {/* ── Header ── */}
      <div className="bg-navy text-paper px-4 md:px-10 py-10">
        <div className="max-w-2xl mx-auto">

          {/* Stepper */}
          <div className="flex items-center gap-1.5 mb-8 flex-wrap">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-paper/40">
              <div className="w-5 h-5 rounded-full bg-yellow text-ink grid place-items-center text-[10px] font-bold">✓</div>
              <span className="hidden sm:inline">Inscripción</span>
            </div>
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="h-px w-4 bg-white/20" />
                <div className={`flex items-center gap-1.5 text-[11px] font-mono ${
                  i <= stepIndex ? 'text-yellow' : 'text-paper/30'
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
            <div className="flex items-center gap-1.5">
              <div className="h-px w-4 bg-white/20" />
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-paper/30">
                <div className="w-5 h-5 rounded-full border border-white/20 grid place-items-center text-[10px] font-bold">
                  {STEPS.length + 1}
                </div>
                <span className="hidden sm:inline">Pago</span>
              </div>
            </div>
          </div>

          <div className="text-[36px] mb-2">{stepConfig.emoji}</div>
          <h1 className="font-display text-[clamp(26px,4vw,44px)] leading-[0.97] tracking-[-0.02em]">
            {stepConfig.headline}
          </h1>
          <p className="text-paper/60 text-[15px] mt-2">{stepConfig.sub}</p>
          {event?.name && (
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-yellow/70 mt-3">{event.name}</p>
          )}
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {categoryServices.length === 0 ? (
          <div className="text-center py-16 border border-line rounded-[18px]">
            <div className="text-[48px] mb-3">{stepConfig.emoji}</div>
            <p className="font-mono text-[13px] text-brand-muted">
              No hay servicios de {stepConfig.label.toLowerCase()} para este evento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoryServices.map((service: any) => (
              <ServiceCard
                key={service.id}
                service={service}
                inCart={cart.has(service.id)}
                onToggle={() => cart.toggle({
                  serviceId: service.id,
                  title: service.title,
                  category: service.category,
                  price: service.price_from ?? 0,
                  imageUrl: service.image_url,
                  partnerName: service.partner_name ?? '',
                })}
              />
            ))}
          </div>
        )}

        {/* ── Botones de navegación ── */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-line">
          <button
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-navy text-paper text-[15px] font-semibold hover:bg-terra transition-colors"
          >
            {stepIndex < STEPS.length - 1
              ? <><span>Continuar</span><ChevronRight className="h-4 w-4" /></>
              : <><span>Ir al pago</span><ArrowRight className="h-4 w-4" /></>
            }
          </button>
          <button
            onClick={goNext}
            className="px-6 py-4 rounded-full border border-line text-[14px] font-semibold text-brand-muted hover:border-navy hover:text-navy transition-colors"
          >
            Saltar este paso
          </button>
        </div>
        <p className="text-center font-mono text-[11px] text-brand-muted mt-3">
          Paso {stepIndex + 2} de {STEPS.length + 2} · Podés saltar cualquier paso
        </p>
      </div>

      {/* ── Carrito sticky ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <div className={`bg-navy text-paper rounded-[18px] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.5)] border border-white/10 transition-all duration-300 ${
            cart.items.length === 0 ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}>
            <div className="px-5 py-4">
              {/* Items */}
              {cart.items.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {cart.items.map(item => (
                    <div key={item.serviceId} className="flex items-center justify-between text-[13px]">
                      <span className="text-paper/70 truncate max-w-[60%]">{item.title}</span>
                      <span className="font-mono text-[12px] text-yellow shrink-0">{formatARS(item.price)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-yellow" />
                  <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-paper/60">
                    {cart.items.length} servicio{cart.items.length !== 1 ? 's' : ''} agregado{cart.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-paper/50 block">Total con servicios</span>
                  <span className="font-display text-[22px] leading-none text-yellow">
                    {formatARS(baseAmount + cart.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Card de servicio ─────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: any
  inCart: boolean
  onToggle: () => void
}

function ServiceCard({ service, inCart, onToggle }: ServiceCardProps) {
  return (
    <div className={`bg-white rounded-[16px] border-2 overflow-hidden transition-all duration-200 ${
      inCart
        ? 'border-navy shadow-[0_4px_20px_-4px_rgba(11,27,43,0.2)]'
        : 'border-line hover:border-navy/30'
    }`}>
      {service.image_url && (
        <div className="h-44 overflow-hidden relative">
          <img
            src={service.image_url}
            alt={service.title}
            className="w-full h-full object-cover"
          />
          {inCart && (
            <div className="absolute inset-0 bg-navy/40 flex items-center justify-center">
              <div className="bg-yellow text-ink rounded-full p-2">
                <Check className="h-6 w-6" strokeWidth={3} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-4 space-y-2">
        <div>
          <h3 className="font-display text-[19px] leading-[1.1] text-navy">{service.title}</h3>
          {service.partner_name && (
            <p className="font-mono text-[11px] text-brand-muted mt-0.5">{service.partner_name}</p>
          )}
        </div>

        {service.description && (
          <p className="text-[13px] text-brand-muted leading-[1.5]">{service.description}</p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-line">
          {service.price_from ? (
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-muted block">Desde</span>
              <span className="font-display text-[22px] leading-none text-navy">{formatARS(service.price_from)}</span>
            </div>
          ) : (
            <span className="font-mono text-[12px] text-brand-muted">A consultar</span>
          )}

          <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all ${
              inCart
                ? 'bg-navy text-paper hover:bg-terra'
                : 'bg-cream text-navy hover:bg-navy hover:text-paper border border-line'
            }`}
          >
            {inCart ? (
              <><Check className="h-4 w-4" strokeWidth={2.5} /> Agregado</>
            ) : (
              <><Plus className="h-4 w-4" /> Agregar</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
