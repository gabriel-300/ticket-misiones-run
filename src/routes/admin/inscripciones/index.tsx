import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { AdminLayout, AdminBreadcrumb } from '@/components/admin/admin-layout'
import { useAdminEvents } from '@/hooks/use-admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/admin/inscripciones/')({
  component: AdminInscripciones,
})

function AdminInscripciones() {
  const { data: events, isLoading } = useAdminEvents()

  return (
    <AdminLayout>
      <AdminBreadcrumb items={[{ label: 'Admin', to: '/admin' }, { label: 'Inscripciones' }]} />
      <h1 className="text-xl font-bold mb-6">Inscripciones por evento</h1>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {events?.map(event => {
            const distances = (event.ticket_types as any[]) ?? []
            const totalReg  = distances.reduce((s: number, d: any) => s + d.registered_count, 0)
            return (
              <Link key={event.id} to="/admin/inscripciones/$eventId" params={{ eventId: event.id }}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{totalReg} inscriptos</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>{event.status}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
