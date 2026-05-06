import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, MapPin, Shield, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import EventCard from '@/components/eventos/event-card'
import { useEvents } from '@/hooks/use-events'
import { useSeo } from '@/hooks/use-seo'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  useSeo('Inscripciones a carreras en Misiones', 'Inscribite a las mejores carreras de running del NEA y armá tu race‑cation completa: hospedaje, traslados, gastronomía y más.')
  const { data: events, isLoading } = useEvents()

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/90 to-primary text-primary-foreground overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1400&q=80)` }}
        />
        <div className="relative container mx-auto px-4 py-20 md:py-32 text-center space-y-6">
          <span className="inline-block text-sm font-semibold bg-white/20 rounded-full px-4 py-1">
            🏃 Plataforma oficial de carreras · Misiones, Argentina
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Corré en<br />
            <span className="text-yellow-300">MISIONA HUB</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl mx-auto">
            Inscribite a las mejores carreras del NEA y armá tu race‑cation completa: hospedaje, traslados, gastronomía y más.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/eventos">
              <Button size="lg" variant="secondary" className="gap-2 font-semibold">
                Ver eventos <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/registro">
              <Button size="lg" variant="outline" className="gap-2 border-white text-white hover:bg-white/10">
                Crear cuenta gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Próximos eventos */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Próximos eventos</h2>
            <p className="text-muted-foreground">Inscripciones abiertas ahora</p>
          </div>
          <Link to="/eventos">
            <Button variant="outline" size="sm" className="gap-2">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.slice(0, 3).map(event => (
              <EventCard key={event.id} event={event as any} />
            ))}
          </div>
        )}
      </section>

      {/* Por qué MISIONA HUB */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">¿Por qué MISIONA HUB?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <MapPin className="h-8 w-8 text-primary" />,
                title: 'Todo en un lugar',
                desc: 'Inscripción, apto médico, confirmación y servicios complementarios desde una sola plataforma.',
              },
              {
                icon: <Shield className="h-8 w-8 text-primary" />,
                title: 'Pago seguro',
                desc: 'Procesamos tus pagos con Payway, la pasarela más confiable de Argentina.',
              },
              {
                icon: <Star className="h-8 w-8 text-primary" />,
                title: 'Race‑cation completa',
                desc: 'Después de inscribirte, te ayudamos a organizar tu estadía, traslados y experiencias en Misiones.',
              },
            ].map(item => (
              <div key={item.title} className="text-center space-y-3">
                <div className="flex justify-center">{item.icon}</div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
