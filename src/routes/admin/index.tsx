import { createFileRoute, Link } from '@tanstack/react-router'
import { Users, CalendarDays, DollarSign, Building2, TrendingUp, ArrowRight } from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { useAdminStats, useAdminEvents } from '@/hooks/use-admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/admin/')({
  component: AdminHome,
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

function AdminHome() {
  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: events, isLoading: eventsLoading } = useAdminEvents()

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Resumen</h1>
          <p className="text-muted-foreground text-sm mt-1">Visión general de la plataforma</p>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Organizaciones" value={stats.activeOrgs} sub={`${stats.totalOrgs} en total`} icon={Building2} accent="bg-blue-100 text-blue-700" />
            <StatCard title="Eventos publicados" value={stats.publishedEvents} sub={`${stats.totalEvents} en total`} icon={CalendarDays} accent="bg-indigo-100 text-indigo-700" />
            <StatCard title="Inscripciones" value={stats.totalRegs} sub={`${stats.paidRegs} pagas`} icon={Users} accent="bg-green-100 text-green-700" />
            <StatCard title="Recaudación" value={formatARS(stats.totalRevenue)} sub="órdenes pagas" icon={DollarSign} accent="bg-emerald-100 text-emerald-700" />
            <StatCard title="Tasa de conversión" value={stats.totalRegs > 0 ? `${Math.round((stats.paidRegs / stats.totalRegs) * 100)}%` : '—'} sub="inscriptos → pagos" icon={TrendingUp} accent="bg-purple-100 text-purple-700" />
          </div>
        )}

        {/* Recent events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Eventos recientes</h2>
            <Link to="/admin/eventos" className="text-sm text-primary flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {eventsLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {events?.slice(0, 4).map(event => {
                const distances = (event.ticket_types as any[]) ?? []
                const totalCap  = distances.reduce((s: number, d: any) => s + (d.capacity ?? 0), 0)
                const totalReg  = distances.reduce((s: number, d: any) => s + d.registered_count, 0)
                return (
                  <Link key={event.id} to="/admin/inscripciones/$eventId" params={{ eventId: event.id }}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{event.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {totalReg} inscriptos{totalCap > 0 ? ` / ${totalCap} cupos` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
