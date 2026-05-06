import { createFileRoute, Link } from '@tanstack/react-router'
import { CalendarDays, Users, DollarSign, TrendingUp, ArrowRight, Building2 } from 'lucide-react'
import { OrgLayout } from '@/components/org/org-layout'
import { useMyOrganization, useOrgStats, useOrgEvents } from '@/hooks/use-organizer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const Route = createFileRoute('/org/')({
  component: OrgHome,
})

const formatARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

function StatCard({ title, value, sub, icon: Icon, accent }: {
  title: string; value: string | number; sub?: string
  icon: React.ElementType; accent?: string
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${accent ?? 'bg-muted'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}

function OrgHome() {
  const { data: org, isLoading: orgLoading } = useMyOrganization()
  const { data: stats, isLoading: statsLoading } = useOrgStats(org?.id ?? '')
  const { data: events, isLoading: eventsLoading } = useOrgEvents(org?.id ?? '')

  if (orgLoading) {
    return (
      <OrgLayout>
        <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      </OrgLayout>
    )
  }

  if (!org) {
    return (
      <OrgLayout>
        <div className="text-center py-20">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h2 className="text-lg font-semibold mb-2">No tenés una organización asignada</h2>
          <p className="text-muted-foreground text-sm">Contactá al equipo de Misiona Hub para que te la configuren.</p>
        </div>
      </OrgLayout>
    )
  }

  return (
    <OrgLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{org.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Comisión: {org.commission_rate}% · {org.contact_email}
          </p>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Eventos publicados" value={stats.publishedEvents} sub={`${stats.totalEvents} en total`} icon={CalendarDays} accent="bg-blue-100 text-blue-700" />
            <StatCard title="Inscripciones" value={stats.totalRegs} sub={`${stats.paidRegs} pagas`} icon={Users} accent="bg-green-100 text-green-700" />
            <StatCard title="Recaudación" value={formatARS(stats.totalRevenue)} sub="órdenes pagas" icon={DollarSign} accent="bg-emerald-100 text-emerald-700" />
            <StatCard title="Conversión" value={stats.totalRegs > 0 ? `${Math.round((stats.paidRegs / stats.totalRegs) * 100)}%` : '—'} sub="inscriptos → pagos" icon={TrendingUp} accent="bg-purple-100 text-purple-700" />
          </div>
        )}

        {/* Recent events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Eventos recientes</h2>
            <Link to="/org/eventos" className="text-sm text-primary flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {eventsLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : events?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border rounded-xl">
              <p className="text-sm">Todavía no creaste ningún evento.</p>
              <Link to="/org/eventos/nuevo" className="text-primary text-sm hover:underline mt-1 inline-block">
                Crear el primero →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {events?.slice(0, 4).map(event => {
                const tickets = (event.ticket_types as any[]) ?? []
                const totalCap = tickets.reduce((s: number, t: any) => s + (t.capacity ?? 0), 0)
                const totalReg = tickets.reduce((s: number, t: any) => s + t.registered_count, 0)
                return (
                  <Card key={event.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{event.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(event.starts_at), "d MMM yyyy", { locale: es })}
                          {' · '}{totalReg} inscriptos{totalCap > 0 ? ` / ${totalCap} cupos` : ''}
                        </p>
                      </div>
                      <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                        {event.status === 'published' ? 'Publicado' : 'Borrador'}
                      </Badge>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </OrgLayout>
  )
}
