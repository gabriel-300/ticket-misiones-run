import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Building2, ToggleLeft, ToggleRight, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout, AdminBreadcrumb } from '@/components/admin/admin-layout'
import {
  useAdminOrganizations, useUpdateOrganizationStatus,
  useUpdateOrganization, useDeleteOrganization,
} from '@/hooks/use-admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export const Route = createFileRoute('/admin/organizaciones/')({
  component: AdminOrganizaciones,
})

const STATUS_LABELS: Record<string, string> = {
  active: 'Activa', pending: 'Pendiente', suspended: 'Suspendida',
}
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default', pending: 'secondary', suspended: 'destructive',
}

interface EditState { id: string; name: string; contact_email: string; commission_rate: number }

function AdminOrganizaciones() {
  const { data: orgs, isLoading } = useAdminOrganizations()
  const { mutate: updateStatus, isPending: toggling } = useUpdateOrganizationStatus()
  const { mutate: updateOrg, isPending: saving } = useUpdateOrganization()
  const { mutate: deleteOrg, isPending: deleting } = useDeleteOrganization()

  const [editOrg, setEditOrg] = useState<EditState | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function handleToggle(orgId: string, currentStatus: string) {
    const next = currentStatus === 'active' ? 'suspended' : 'active'
    updateStatus({ orgId, status: next }, {
      onSuccess: () => toast.success(`Organización ${next === 'active' ? 'activada' : 'suspendida'}`),
      onError:   () => toast.error('No se pudo cambiar el estado'),
    })
  }

  function handleSaveEdit() {
    if (!editOrg) return
    updateOrg(
      { orgId: editOrg.id, data: { name: editOrg.name, contact_email: editOrg.contact_email, commission_rate: editOrg.commission_rate } },
      {
        onSuccess: () => { toast.success('Organización actualizada'); setEditOrg(null) },
        onError:   () => toast.error('No se pudo actualizar'),
      }
    )
  }

  function handleDelete(orgId: string) {
    deleteOrg(orgId, {
      onSuccess: () => { toast.success('Organización eliminada'); setConfirmDelete(null) },
      onError:   () => toast.error('No se pudo eliminar — puede tener eventos asociados'),
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
          <Button className="gap-2"><Plus className="h-4 w-4" /> Nueva organización</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : orgs?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Todavía no hay organizaciones</p>
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
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1" disabled={toggling}
                        onClick={() => handleToggle(org.id, org.status)}>
                        {org.status === 'active'
                          ? <><ToggleRight className="h-3.5 w-3.5 text-green-600" /> Activa</>
                          : <><ToggleLeft className="h-3.5 w-3.5" /> Activar</>}
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0"
                        onClick={() => setEditOrg({ id: org.id, name: org.name, contact_email: org.contact_email ?? '', commission_rate: org.commission_rate ?? 8 })}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {confirmDelete === org.id ? (
                        <div className="flex gap-1">
                          <Button size="sm" variant="destructive" className="h-8 text-xs" disabled={deleting}
                            onClick={() => handleDelete(org.id)}>
                            {deleting ? '...' : 'Confirmar'}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 text-xs"
                            onClick={() => setConfirmDelete(null)}>
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmDelete(org.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog editar */}
      <Dialog open={!!editOrg} onOpenChange={open => !open && setEditOrg(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar organización</DialogTitle>
          </DialogHeader>
          {editOrg && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input value={editOrg.name} onChange={e => setEditOrg({ ...editOrg, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email de contacto</Label>
                <Input type="email" value={editOrg.contact_email} onChange={e => setEditOrg({ ...editOrg, contact_email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Comisión (%)</Label>
                <Input type="number" min="0" max="100" step="0.5" value={editOrg.commission_rate}
                  onChange={e => setEditOrg({ ...editOrg, commission_rate: Number(e.target.value) })} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1" disabled={saving} onClick={handleSaveEdit}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button variant="outline" onClick={() => setEditOrg(null)}>Cancelar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
