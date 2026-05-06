import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useSeo } from '@/hooks/use-seo'
import { useEvents, useFeaturedEvent, useStats } from '@/hooks/use-events'
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
  const { data: stats }    = useStats()
  const [t, setT] = useState(() => calcTime(featured ? new Date(featured.starts_at) : new Date()))

  useEffect(() => {
    if (!featured) return
    const target = new Date(featured.starts_at)
    const id = setInterval(() => setT(calcTime(target)), 1000)
    return () => clearInterval(id)
  }, [featured?.starts_at])

  const allTiers   = (featured as any)?.event_distances?.flatMap((d: any) => d.pricing_tiers ?? []) ?? []
  const activeTier = getActiveTier(allTiers)
  const totalReg   = (featured as any)?.event_distances?.reduce((s: number, d: any) => s + d.registered_count, 0) ?? 0
  const totalCap   = (featured as any)?.event_distances?.reduce((s: number, d: any) => s + (d.capacity ?? 0), 0) ?? 0
  const loc        = featured?.location as { city: string; province: string } | null

  return (
    <section className="relative bg-navy text-paper overflow-hidden" style={{ padding: 0 }}>
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg,rgba(11,27,43,0.55) 0%,rgba(11,27,43,0.85) 70%,#0B1B2B 100%),
            repeating-linear-gradient(45deg,rgba(255,255,255,0.03) 0 2px,transparent 2px 12px),
            radial-gradient(circle at 80% 20%,rgba(200,75,34,0.3),transparent 50%),
            radial-gradient(circle at 20% 80%,rgba(255,210,63,0.15),transparent 55%)
          `,
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-4 md:px-10 pt-20 md:pt-28 pb-0" style={{ minHeight: 680 }}>
        {/* Top: copy + card */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-16 items-end">

          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-sm text-[13px] font-medium mb-7">
              <span className="w-2 h-2 rounded-full bg-yellow animate-pulse-dot" />
              Plataforma oficial de carreras · Misiones, Argentina
            </div>
            <h1 className="font-display text-[clamp(56px,9vw,132px)] leading-[0.95] tracking-[-0.02em] m-0">
              Corré<br />
              en la <span className="text-yellow">selva</span><br />
              <span className="text-terra">misionera</span>.
            </h1>
            <p className="mt-7 text-[clamp(16px,1.4vw,20px)] leading-[1.55] text-paper/80 max-w-[520px]">
              Inscribite a las mejores carreras del NEA y armá tu race‑cation completa: hospedaje, traslados, gastronomía y más.
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

          {/* Featured race card */}
          <aside className="bg-white/[0.06] border border-white/[0.12] rounded-[20px] p-6 backdrop-blur-[12px]">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-yellow mb-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow animate-pulse-dot" />
              Próxima largada
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

        {/* Stats strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-white/[0.12] mt-16 pb-0">
          {[
            { num: stats?.events ?? '—', accent: true,  label: 'Eventos este año' },
            { num: stats ? `${stats.runners}+` : '—', accent: false, label: 'Corredores inscriptos' },
            { num: stats?.cities ?? '—', accent: true,  label: 'Ciudades del NEA' },
            { num: '100%', accent: false, label: 'Pago seguro · Payway' },
          ].map((s, i) => (
            <div
              key={i}
              className={`py-7 ${i > 0 ? 'border-l border-white/[0.08] pl-6' : ''} ${i < 3 ? 'pr-6' : ''}`}
            >
              <div className="font-display text-[44px] leading-none">
                {s.accent ? <span className="text-yellow">{s.num}</span> : s.num}
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper/55 mt-2.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── marquee ──────────────────────────────────────────────────────────────────
function Marquee() {
  const items = 'POSADAS · IGUAZÚ / SAN IGNACIO · OBERÁ / ELDORADO · APÓSTOLES / 5K · 10K · 21K · 42K · TRAIL / RACE-CATION INCLUIDA /'
  return (
    <div className="bg-yellow border-y-2 border-ink overflow-hidden py-3.5">
      <div className="flex gap-12 whitespace-nowrap motion-safe:animate-marquee font-display text-[22px] tracking-[-0.01em]">
        {[items, items].map((text, i) => (
          <span key={i} className="flex items-center gap-12 shrink-0">
            {text.split('/').map((part, j) => (
              <span key={j} className="flex items-center gap-12">
                {part.trim()}
                {j < text.split('/').length - 2 && <span className="text-terra">/</span>}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── events section ────────────────────────────────────────────────────────────
function EventsSection() {
  const { data: events, isLoading } = useEvents()
  const top3 = events?.slice(0, 3) ?? []

  return (
    <section className="bg-paper py-24 px-4 md:px-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-terra mb-3.5">
              <span className="w-6 h-px bg-terra" />
              01 / Próximos eventos
            </div>
            <h2 className="font-display text-[clamp(40px,5vw,72px)] leading-[0.98] tracking-[-0.02em] m-0">
              Inscripciones<br />abiertas ahora.
            </h2>
            <p className="text-brand-muted text-[17px] mt-4 max-w-[540px]">
              Elegí tu próxima carrera entre las propuestas más importantes del NEA. Cupos limitados.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {top3.map(event => (
              <EventCard key={event.id} event={event as any} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── region section (static) ───────────────────────────────────────────────────
function RegionSection() {
  const cities = [
    { num: '01', name: 'Posadas',       info: '4 eventos · próximo AGO' },
    { num: '02', name: 'Puerto Iguazú', info: '3 eventos · próximo SEP' },
    { num: '03', name: 'San Ignacio',   info: '2 eventos · próximo NOV' },
    { num: '04', name: 'Oberá',         info: '5 eventos · próximo JUL' },
    { num: '05', name: 'Eldorado',      info: '3 eventos · próximo OCT' },
    { num: '06', name: 'Apóstoles',     info: '4 eventos · próximo JUN' },
  ]

  return (
    <section className="bg-navy text-paper py-24 px-4 md:px-10 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.02) 0 2px,transparent 2px 16px)' }}
      />
      <div className="max-w-[1440px] mx-auto relative">
        <div className="mb-12">
          <div className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-yellow mb-3.5">
            <span className="w-6 h-px bg-yellow" />
            02 / Misiones
          </div>
          <h2 className="font-display text-[clamp(40px,5vw,72px)] leading-[0.98] tracking-[-0.02em] m-0">
            Una provincia,<br />ocho destinos para correr.
          </h2>
          <p className="text-paper/60 text-[17px] mt-4 max-w-[540px]">
            Desde la costanera de Posadas hasta los senderos de las Cataratas. Cada carrera, un paisaje distinto.
          </p>
        </div>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {cities.map(city => (
            <Link key={city.num} to="/eventos">
              <div className="flex items-center gap-5 py-5 hover:pl-3 transition-all duration-150 group cursor-pointer">
                <span className="font-mono text-[12px] text-paper/40 tracking-[0.1em] w-8 shrink-0">{city.num}</span>
                <div className="flex-1">
                  <div className="font-display text-[28px] leading-none">{city.name}</div>
                  <div className="font-mono text-[13px] text-paper/60 mt-1">{city.info}</div>
                </div>
                <span className="text-yellow text-[24px] group-hover:translate-x-1.5 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── race-cation bento ─────────────────────────────────────────────────────────
const TILES = [
  {
    cls: 'bg-navy text-paper lg:col-span-5',
    icon: '🏠',
    title: 'Una sola reserva, todo arreglado.',
    stat: '+ 80',
    statLabel: 'Hoteles, posadas y cabañas con tarifa runner en toda Misiones.',
  },
  {
    cls: 'bg-white text-ink lg:col-span-4',
    icon: '🚌',
    title: 'Traslados sin vueltas',
    body: 'Aeropuerto, hotel y largada. Coordinamos con operadores locales para que solo te enfoques en correr.',
  },
  {
    cls: 'bg-terra text-cream lg:col-span-3',
    icon: '🍽️',
    title: 'Gastronomía local',
    body: 'Reservás chipá, sopa paraguaya y menús pensados para corredores.',
  },
  {
    cls: 'bg-white text-ink lg:col-span-4',
    icon: '🌍',
    title: 'Experiencias post-carrera',
    body: 'Cataratas, Saltos del Moconá, Ruinas Jesuíticas. Excursiones agendadas para el día después.',
  },
  {
    cls: 'bg-yellow text-ink lg:col-span-4',
    icon: '💳',
    title: 'Pago seguro con Payway',
    body: 'Una sola factura para todo. Hasta 6 cuotas sin interés.',
  },
  {
    cls: 'bg-white text-ink lg:col-span-4',
    icon: '✅',
    title: 'Apto médico digital',
    body: 'Subí tu apto desde el celular y recibí confirmación en 24h.',
  },
]

function RaceCationSection() {
  return (
    <section className="bg-cream py-24 px-4 md:px-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-terra mb-3.5">
              <span className="w-6 h-px bg-terra" />
              03 / Race-cation
            </div>
            <h2 className="font-display text-[clamp(40px,5vw,72px)] leading-[0.98] tracking-[-0.02em] m-0">
              Corré, descansá,<br />conocé Misiones.
            </h2>
            <p className="text-brand-muted text-[17px] mt-4 max-w-[540px]">
              Después de inscribirte te ayudamos a organizar todo: alojamiento, traslados, alimentación y experiencias.
            </p>
          </div>
          <Link to="/eventos">
            <button className="flex items-center gap-2 px-[18px] py-[11px] rounded-full bg-ink text-paper text-[14px] font-semibold hover:bg-black transition-colors shrink-0">
              Ver eventos <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {TILES.map((tile, i) => (
            <div
              key={i}
              className={`rounded-card p-7 border border-line flex flex-col min-h-[280px] relative overflow-hidden ${tile.cls}`}
            >
              <div className="text-[44px] mb-4">{tile.icon}</div>
              {'stat' in tile ? (
                <>
                  <h3 className="font-display text-[26px] leading-[1.05] mb-2">{tile.title}</h3>
                  <div className="font-display text-[80px] leading-[0.9] text-yellow my-2">{tile.stat}</div>
                  <p className="text-[14px] leading-[1.55] opacity-70">{tile.statLabel}</p>
                </>
              ) : (
                <>
                  <h3 className="font-display text-[26px] leading-[1.05] mb-2">{tile.title}</h3>
                  <p className="text-[14px] leading-[1.55] opacity-85">{tile.body}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── how it works ──────────────────────────────────────────────────────────────
const STEPS = [
  { num: '01', title: 'Elegí tu carrera',     body: 'Filtrá por distancia, fecha y ciudad. Comparativa clara de cupos y precios.' },
  { num: '02', title: 'Inscribite y pagá',    body: 'Cargás tus datos, subís el apto médico y pagás con Payway en cuotas.' },
  { num: '03', title: 'Armá tu estadía',      body: 'Sumá hotel, traslado y comidas. Todo acumulado a tu reserva inicial.' },
  { num: '04', title: 'Vení a correr',        body: 'Recibís tu kit, mapa y cronograma. Llegás, corrés y disfrutás la provincia.' },
]

function HowItWorksSection() {
  return (
    <section className="bg-paper py-24 px-4 md:px-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-terra mb-3.5">
            <span className="w-6 h-px bg-terra" />
            04 / Cómo funciona
          </div>
          <h2 className="font-display text-[clamp(40px,5vw,72px)] leading-[0.98] tracking-[-0.02em] m-0">
            De la inscripción a la largada,<br />en cuatro pasos.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-y-2 border-ink divide-y-2 sm:divide-y-0 lg:divide-x lg:divide-y-0 divide-line">
          {STEPS.map((step, i) => (
            <div key={i} className={`py-9 ${i > 0 ? 'lg:pl-7' : ''} ${i < 3 ? 'lg:pr-7' : ''}`}>
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
        CORRÉ
      </div>
      <div className="absolute inset-y-0 right-[-4vw] flex items-center font-display text-[22vw] leading-none text-ink/[0.06] pointer-events-none select-none">
        YA
      </div>
      <div className="relative z-10">
        <h2 className="font-display text-[clamp(48px,6vw,96px)] leading-[0.95] tracking-[-0.02em] m-0 mb-5">
          Tu próxima carrera<br />te está esperando.
        </h2>
        <p className="text-[18px] text-ink/70 mb-9">Sumate a los runners que eligen MISIONA HUB para correr en el NEA.</p>
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
  useSeo('Inscripciones a carreras en Misiones', 'Inscribite a las mejores carreras de running del NEA y armá tu race‑cation completa.')
  return (
    <div className="bg-paper">
      <HeroSection />
      <Marquee />
      <EventsSection />
      <RegionSection />
      <RaceCationSection />
      <HowItWorksSection />
      <CTAStrip />
    </div>
  )
}
