import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Download, Search, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { AdminLayout, AdminBreadcrumb } from '@/components/admin/admin-layout'
import { useAdminRegistrations } from '@/hooks/use-admin'
import { useAdminEvents } from '@/hooks/use-admin'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/admin/inscripciones/$eventId')({
  component: AdminInscripcionesEvento,
})

const STATUS_ICON: Record<string, React.ReactNode> = {
  paid:            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />,
  pending_payment: <Clock className="h-3.5 w-3.5 text-orange-500" />,
  cancelled:       <XCircle className="h-3.5 w-3.5 text-red-500" />,
}
const STATUS_LABEL: Record<string, string> = {
  paid: 'Pago', pending_payment: 'Pendiente', cancelled: 'Cancelado',
}

function exportCSV(registrations: any[], eventName: string) {
  const headers = ['Dorsal','Categoría','Apellido','Nombre','DNI','Género','Distancia','Talle','Club','Grupo sangre','Contacto emergencia','Estado']
  const rows = registrations.map(r => {
    const runner = r.runner as any
    const dist   = r.distance as any
    const cf     = r.custom_field_values as any ?? {}
    const ec     = runner?.emergency_contact as any
    return [
      r.bib_number ?? '',
      r.category ?? '',
      runner?.last_name ?? '',
      runner?.first_name ?? '',
      runner?.dni ?? '',
      runner?.gender ?? '',
      dist?.name ?? '',
      cf.shirt_size ?? '',
      cf.club ?? '',
      runner?.blood_type ?? '',
      ec ? `${ec.name} ${ec.phone}` : '',
      STATUS_LABEL[r.status] ?? r.status,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`)
  })

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `inscripciones-${eventName.replace(/\s+/g, '-').toLowerCase()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function AdminInscripcionesEvento() {
  const { eventId } = Route.useParams()
  const { data: regs, isLoading } = useAdminRegistrations(eventId)
  const { data: events } = useAdminEvents()
  const [search, setSearch] = useState('')

  const event = events?.find(e => e.id === eventId)
  const filtered = regs?.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    const runner = r.runner as any
    return (
      runner?.first_name?.toLowerCase().includes(q) ||
      runner?.last_name?.toLowerCase().includes(q) ||
      runner?.dni?.includes(q) ||
      String(r.bib_number).includes(q)
    )
  })

  const paidCount    = regs?.filter(r => r.status === 'paid').length ?? 0
  const pendingCount = regs?.filter(r => r.status === 'pending_payment').length ?? 0

  return (
    <AdminLayout>
      <AdminBreadcrumb items={[
        { label: 'Admin', to: '/admin' },
        { label: 'Inscripciones', to: '/admin/inscripciones' },
        { label: event?.name ?? '…' },
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">{event?.name ?? '…'}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {regs?.length ?? 0} inscriptos · {paidCount} pagos · {pendingCount} pendientes
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 self-start sm:self-auto"
          disabled={!regs?.length}
          onClick={() => regs && exportCSV(regs, event?.name ?? 'evento')}
        >
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, apellido o DNI..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {['#','Estado','Apellido y nombre','DNI','Distancia','Cat.','Talle','Apto'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-medium text-muted-foreground text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered?.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground text-sm">Sin resultados</td></tr>
                )}
                {filtered?.map(r => {
                  const runner = r.runner as any
                  const dist   = r.distance as any
                  const cf     = r.custom_field_values as any ?? {}
                  return (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5 font-bold text-primary">
                        {r.bib_number ? `#${r.bib_number}` : '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-1">
                          {STATUS_ICON[r.status]}
                          <span className="text-xs">{STATUS_LABEL[r.status] ?? r.status}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {runner?.last_name}, {runner?.first_name}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{runner?.dni}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{dist?.name}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className="text-xs">{r.category ?? '—'}</Badge>
                      </td>
                      <td className="px-3 py-2.5">{cf.shirt_size ?? '—'}</td>
                      <td className="px-3 py-2.5">
                        {runner?.apto_medico_url ? (
                          <a href={runner.apto_medico_url} target="_blank" rel="noreferrer"
                            className={`text-xs underline ${
                              runner.apto_medico_status === 'aprobado' ? 'text-green-600' :
                              runner.apto_medico_status === 'rechazado' ? 'text-red-500' : 'text-orange-500'
                            }`}>
                            {runner.apto_medico_status}
                          </a>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
