import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Building2, ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout, AdminBreadcrumb } from '@/components/admin/admin-layout'
import { useAdminOrganizations, useUpdateOrganizationStatus } from '@/hooks/use-admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/admin/organizaciones/')({
  component: AdminOrganizaciones,
})

const STATUS_LABELS: Record<string, string> = {
  active: 'Activa', pending: 'Pendiente', suspended: 'Suspendida',
}
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default', pending: 'secondary', suspended: 'destructive',
}

function AdminOrganizaciones() {
  const { data: orgs, isLoading } = useAdminOrganizations()
  const { mutate: updateStatus, isPending } = useUpdateOrganizationStatus()

  function handleToggle(orgId: string, currentStatus: string) {
    const next = currentStatus === 'active' ? 'suspended' : 'active'
    updateStatus({ orgId, status: next }, {
      onSuccess: () => toast.success(`Organización ${next === 'active' ? 'activada' : 'suspendida'}`),
      onError:   () => toast.error('No se pudo cambiar el estado'),
    })
  }

  return (
    <AdminLayout>
      <AdminBreadcrumb items={[{ label: 'Admin', to: '/admin' }, { label: 'Organizaciones' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Organizaciones</h1>
          <p className="text-sm text-muted-foreground">{orgs?.length ?? 0} organizaciones registradas</p>
        </div>
        <Link to="/admin/organizaciones/nueva">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva organización
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : orgs?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Todavía no hay organizaciones</p>
          <p className="text-sm mt-1">Creá la primera para empezar a asignar eventos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orgs?.map(org => {
            const owner = org.owner as any
            return (
              <Card key={org.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {org.logo_url ? (
                        <img src={org.logo_url} alt={org.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted grid place-items-center shrink-0">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{org.name}</p>
                          <Badge variant={STATUS_VARIANTS[org.status] ?? 'secondary'}>
                            {STATUS_LABELS[org.status] ?? org.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {org.contact_email}
                          {owner && ` · ${owner.first_name} ${owner.last_name}`}
                          {` · ${org.commission_rate}% comisión`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        disabled={isPending}
                        onClick={() => handleToggle(org.id, org.status)}
                      >
                        {org.status === 'active'
                          ? <><ToggleRight className="h-3.5 w-3.5 text-green-600" /> Activa</>
                          : <><ToggleLeft className="h-3.5 w-3.5" /> Activar</>
                        }
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" disabled>
                        Ver <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
