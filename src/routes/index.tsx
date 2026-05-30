import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowRight, Bike, PersonStanding, MountainSnow, Waves, Star } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useSeo } from '@/hooks/use-seo'
import { useEvents, useFeaturedEvent } from '@/hooks/use-events'
import EventCard from '@/components/eventos/event-card'
import { formatARS, getActiveTier } from '@/lib/utils'

export const Route = createFileRoute('/')({ component: HomePage })

// ─── countdown ────────────────────────────────────────────────────────────────
function calcTime(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function CountdownCell({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="bg-black/25 rounded-[10px] py-2.5 px-1.5 text-center">
      <div className="font-display text-[28px] leading-none text-yellow">{String(value).padStart(2, '0')}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-paper/55 mt-1">{unit}</div>
    </div>
  )
}

// ─── hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const { data: featured } = useFeaturedEvent()
  const [t, setT] = useState(() => calcTime(featured ? new Date(featured.starts_at) : new Date()))

  useEffect(() => {
    if (!featured) return
    const target = new Date(featured.starts_at)
    const id = setInterval(() => setT(calcTime(target)), 1000)
    return () => clearInterval(id)
  }, [featured?.starts_at])

  const allTiers   = (featured as any)?.ticket_types?.flatMap((d: any) => d.pricing_tiers ?? []) ?? []
  const activeTier = getActiveTier(allTiers)
  const totalReg   = (featured as any)?.ticket_types?.reduce((s: number, d: any) => s + d.registered_count, 0) ?? 0
  const totalCap   = (featured as any)?.ticket_types?.reduce((s: number, d: any) => s + (d.capacity ?? 0), 0) ?? 0
  const loc        = featured?.location as { city: string; province: string } | null

  return (
    <section className="relative bg-navy text-paper overflow-hidden" style={{ padding: 0 }}>
      {/* Hero background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(https://yszfiaeajgkwuebxuvhg.supabase.co/storage/v1/object/public/assets/hero-runners.png)` }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,rgba(11,27,43,0.60) 0%,rgba(11,27,43,0.88) 70%,#0B1B2B 100%)`,
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-4 md:px-10 pt-20 md:pt-28 pb-0" style={{ minHeight: 620 }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-16 items-end">

          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-sm text-[13px] font-medium mb-7">
              <span className="w-2 h-2 rounded-full bg-yellow animate-pulse-dot" />
              Plataforma oficial de eventos · Misiones, Argentina
            </div>
            <h1 className="font-display text-[clamp(52px,8vw,120px)] leading-[0.95] tracking-[-0.02em] m-0">
              Encontrá<br />
              tu próximo<br />
              <span className="text-yellow">evento</span>.
            </h1>
            <p className="mt-7 text-[clamp(16px,1.4vw,20px)] leading-[1.55] text-paper/80 max-w-[520px]">
              Inscribite en los mejores eventos del NEA. Pago seguro, confirmación inmediata.
            </p>
            <div className="flex flex-wrap gap-3 mt-9">
              <Link to="/eventos">
                <button className="flex items-center gap-2 px-6 py-4 rounded-full bg-yellow text-ink text-[15px] font-semibold hover:bg-yellow-deep transition-colors">
                  Ver eventos <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link to="/auth/registro">
                <button className="flex items-center gap-2 px-6 py-4 rounded-full border border-white/40 text-paper text-[15px] font-semibold hover:bg-white/10 transition-colors">
                  Crear cuenta gratis
                </button>
              </Link>
            </div>
          </div>

          {/* Featured event card */}
          <aside className="bg-white/[0.06] border border-white/[0.12] rounded-[20px] p-6 backdrop-blur-[12px]">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-yellow mb-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow animate-pulse-dot" />
              Evento destacado
            </div>
            {featured ? (
              <>
                <h3 className="font-display text-[26px] leading-[1.05] mb-1">{featured.name}</h3>
                <p className="text-paper/70 text-[14px]">
                  {loc?.city} · {format(new Date(featured.starts_at), 'd MMM yyyy', { locale: es }).toUpperCase()}
                </p>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <CountdownCell value={t.days}    unit="días" />
                  <CountdownCell value={t.hours}   unit="hrs" />
                  <CountdownCell value={t.minutes} unit="min" />
                  <CountdownCell value={t.seconds} unit="seg" />
                </div>
                <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-white/10 text-[13px] text-paper/70">
                  <span>
                    Cupos{' '}
                    <strong className="text-paper font-semibold">
                      {totalReg} / {totalCap || '∞'}
                    </strong>
                  </span>
                  {activeTier && (
                    <span>
                      Desde{' '}
                      <strong className="text-paper font-semibold">{formatARS(activeTier.price_ars)}</strong>
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="h-32 flex items-center justify-center font-mono text-[13px] text-paper/40">
                Sin eventos próximos
              </div>
            )}
          </aside>
        </div>

      </div>
    </section>
  )
}

// ─── events section ────────────────────────────────────────────────────────────
function EventsSection() {
  const { data: events, isLoading } = useEvents()
  const top3 = events?.slice(0, 8) ?? []

  return (
    <section className="bg-paper py-24 px-4 md:px-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-terra mb-3.5">
              <span className="w-6 h-px bg-terra" />
              Próximos eventos
            </div>
            <h2 className="font-display text-[clamp(36px,4vw,64px)] leading-[0.98] tracking-[-0.02em] m-0">
              Elegí tu experiencia.
            </h2>
            <p className="text-brand-muted text-[17px] mt-4 max-w-[540px]">
              Eventos disponibles. Cupos limitados.
            </p>
          </div>
          <Link to="/eventos">
            <button className="flex items-center gap-2 px-[18px] py-[11px] rounded-full border border-ink text-[14px] font-semibold text-ink hover:bg-ink hover:text-paper transition-colors shrink-0">
              Ver todos <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/3] bg-navy/10 animate-pulse rounded-card" />
            ))}
          </div>
        ) : top3.length === 0 ? (
          <p className="text-brand-muted font-mono text-[14px]">No hay eventos publicados aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {top3.map(event => (
              <EventCard key={event.id} event={event as any} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── categories section ───────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Ciclismo',   icon: Bike,            color: 'bg-navy text-paper' },
  { label: 'Running',    icon: PersonStanding,  color: 'bg-terra text-cream' },
  { label: 'Trail',      icon: MountainSnow,    color: 'bg-navy text-paper' },
  { label: 'Aventura',   icon: Waves,           color: 'bg-terra text-cream' },
  { label: 'Destacados', icon: Star,            color: 'bg-yellow text-ink' },
]

function CategoriesSection() {
  return (
    <section className="bg-cream py-20 px-4 md:px-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-terra mb-3">
            <span className="w-6 h-px bg-terra" />
            Categorías
            <span className="w-6 h-px bg-terra" />
          </div>
          <h2 className="font-display text-[clamp(32px,4vw,56px)] leading-[0.98] tracking-[-0.02em] m-0">
            Encontrá una categoría
          </h2>
          <p className="text-brand-muted text-[16px] mt-3">Tu próxima experiencia según tu estilo.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            return (
              <Link key={cat.label} to="/eventos">
                <div className={`${cat.color} rounded-[16px] w-32 h-32 flex flex-col items-center justify-center gap-3 cursor-pointer hover:scale-105 transition-transform border border-line`}>
                  <Icon className="h-8 w-8" />
                  <span className="font-display text-[16px]">{cat.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── how it works ──────────────────────────────────────────────────────────────
const HOW_STEPS = [
  { num: '01', title: 'Encontrá tu evento', body: 'Explorá los eventos disponibles, elegí la fecha y la modalidad que más te gusta.' },
  { num: '02', title: 'Inscribite y comprá', body: 'Completá tus datos y pagá de forma segura. Todo en minutos.' },
  { num: '03', title: 'Viví la experiencia', body: 'Recibís tu confirmación al instante y llegás listo para disfrutar.' },
]

function HowItWorksSection() {
  return (
    <section id="como-funciona" className="bg-paper py-24 px-4 md:px-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-terra mb-3">
            <span className="w-6 h-px bg-terra" />
            Cómo funciona
            <span className="w-6 h-px bg-terra" />
          </div>
          <h2 className="font-display text-[clamp(36px,4vw,60px)] leading-[0.98] tracking-[-0.02em] m-0">
            Tres pasos para participar.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 border-y-2 border-ink divide-y-2 sm:divide-y-0 sm:divide-x divide-line">
          {HOW_STEPS.map((step, i) => (
            <div key={i} className={`py-9 ${i > 0 ? 'sm:pl-7' : ''} ${i < 2 ? 'sm:pr-7' : ''}`}>
              <div
                className="font-display text-[56px] leading-none mb-6"
                style={{ WebkitTextStroke: '1px #C84B22', color: 'transparent' }}
              >
                {step.num}
              </div>
              <h4 className="font-display text-[22px] leading-[1.05] tracking-[-0.01em] mb-2.5">{step.title}</h4>
              <p className="text-brand-muted text-[14px] leading-[1.5]">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── cta strip ────────────────────────────────────────────────────────────────
function CTAStrip() {
  return (
    <section className="bg-yellow text-ink py-28 px-4 md:px-10 text-center relative overflow-hidden">
      <div className="absolute inset-y-0 left-[-4vw] flex items-center font-display text-[22vw] leading-none text-ink/[0.06] pointer-events-none select-none">
        VIVÍ
      </div>
      <div className="absolute inset-y-0 right-[-4vw] flex items-center font-display text-[22vw] leading-none text-ink/[0.06] pointer-events-none select-none">
        YA
      </div>
      <div className="relative z-10">
        <h2 className="font-display text-[clamp(48px,6vw,96px)] leading-[0.95] tracking-[-0.02em] m-0 mb-5">
          Tu próximo evento<br />te está esperando.
        </h2>
        <p className="text-[18px] text-ink/70 mb-9">Sumate a los que eligen tevent para vivir sus eventos en el NEA.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/eventos">
            <button className="px-7 py-4 rounded-full bg-ink text-paper text-[15px] font-semibold hover:bg-navy-2 transition-colors">
              Ver todos los eventos
            </button>
          </Link>
          <Link to="/auth/registro">
            <button className="px-7 py-4 rounded-full border border-ink text-ink text-[15px] font-semibold hover:bg-ink/10 transition-colors">
              Crear cuenta gratis
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────
function HomePage() {
  useSeo('Eventos en Misiones', 'Inscribite a los mejores eventos del NEA. Pago seguro, confirmación inmediata.')
  return (
    <div className="bg-paper">
      <HeroSection />
      <EventsSection />
      <CategoriesSection />
      <HowItWorksSection />
      <CTAStrip />
    </div>
  )
}
