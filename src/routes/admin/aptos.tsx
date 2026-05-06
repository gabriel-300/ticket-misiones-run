import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CheckCircle2, XCircle, ExternalLink, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout, AdminBreadcrumb } from '@/components/admin/admin-layout'
import { useAdminAptos, useValidateApto } from '@/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/admin/aptos')({
  component: AdminAptos,
})

const STATUS_BADGE: Record<string, React.ReactNode> = {
  pendiente:  <Badge variant="outline" className="text-orange-600 border-orange-300">Pendiente</Badge>,
  aprobado:   <Badge className="bg-green-600">Aprobado</Badge>,
  rechazado:  <Badge variant="destructive">Rechazado</Badge>,
}

function AdminAptos() {
  const { data: profiles, isLoading } = useAdminAptos()
  const { mutate: validate, isPending } = useValidateApto()
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const pending   = profiles?.filter(p => p.apto_medico_status === 'pendiente') ?? []
  const processed = profiles?.filter(p => p.apto_medico_status !== 'pendiente') ?? []

  function handleApprove(profileId: string) {
    validate({ profileId, status: 'aprobado' }, {
      onSuccess: () => toast.success('Apto aprobado'),
      onError:   () => toast.error('Error al aprobar'),
    })
  }

  function handleReject(profileId: string) {
    if (!reason.trim()) { toast.error('Ingresá un motivo de rechazo'); return }
    validate({ profileId, status: 'rechazado', rejectionReason: reason }, {
      onSuccess: () => { toast.success('Apto rechazado'); setRejecting(null); setReason('') },
      onError:   () => toast.error('Error al rechazar'),
    })
  }

  return (
    <AdminLayout>
      <AdminBreadcrumb items={[{ label: 'Admin', to: '/admin' }, { label: 'Aptos médicos' }]} />

      <div className="mb-6">
        <h1 className="text-xl font-bold">Aptos médicos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {pending.length} pendiente{pending.length !== 1 ? 's' : ''} de validación
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : profiles?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3" />
          <p>No hay aptos médicos cargados todavía.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm text-orange-600 uppercase tracking-wider">Pendientes</h2>
              {pending.map(p => (
                <div key={p.id} className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{p.last_name}, {p.first_name}</p>
                      <p className="text-xs text-muted-foreground">DNI {p.dni}</p>
                    </div>
                    {STATUS_BADGE[p.apto_medico_status ?? 'pendiente']}
                  </div>

                  <a
                    href={p.apto_medico_url!}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Ver certificado
                  </a>

                  {rejecting === p.id ? (
                    <div className="space-y-2">
                      <textarea
                        className="w-full border rounded-lg p-2 text-sm resize-none"
                        rows={2}
                        placeholder="Motivo del rechazo..."
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" disabled={isPending}
                          onClick={() => handleReject(p.id)}>
                          Confirmar rechazo
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setRejecting(null); setReason('') }}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700" disabled={isPending}
                        onClick={() => handleApprove(p.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Aprobar
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 text-destructive border-destructive/30"
                        onClick={() => setRejecting(p.id)}>
                        <XCircle className="h-3.5 w-3.5" /> Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Processed */}
          {processed.length > 0 && (
            <>
              {pending.length > 0 && <Separator />}
              <div className="space-y-3">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Procesados</h2>
                {processed.map(p => (
                  <div key={p.id} className="border rounded-xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">{p.last_name}, {p.first_name}</p>
                      {p.apto_medico_rejection_reason && (
                        <p className="text-xs text-muted-foreground mt-0.5">Motivo: {p.apto_medico_rejection_reason}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={p.apto_medico_url!} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                      {STATUS_BADGE[p.apto_medico_status ?? 'pendiente']}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
