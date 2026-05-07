import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Download, Search, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { OrgLayout, OrgBreadcrumb } from '@/components/org/org-layout'
import { useAdminRegistrations } from '@/hooks/use-admin'
import { useOrgEventDetail } from '@/hooks/use-organizer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/org/inscripciones/$eventId')({
  component: OrgInscripcionesEvento,
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
  const headers = ['Dorsal','Categoría','Apellido','Nombre','DNI','Género','Entrada','Talle','Club','Estado']
  const rows = registrations.map(r => {
    const buyer = r.buyer as any
    const tt    = r.ticket_type as any
    const cf    = r.custom_field_values as any ?? {}
    return [
      r.bib_number ?? '',
      r.category ?? '',
      buyer?.last_name ?? '',
      buyer?.first_name ?? '',
      buyer?.dni ?? '',
      buyer?.gender ?? '',
      tt?.name ?? '',
      cf.shirt_size ?? '',
      cf.club ?? '',
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

function OrgInscripcionesEvento() {
  const { eventId } = Route.useParams()
  const { data: regs, isLoading } = useAdminRegistrations(eventId)
  const { data: event } = useOrgEventDetail(eventId)
  const [search, setSearch] = useState('')

  const filtered = regs?.filter(r => {
    if (!search) return true
    const q      = search.toLowerCase()
    const buyer  = r.buyer as any
    return (
      buyer?.first_name?.toLowerCase().includes(q) ||
      buyer?.last_name?.toLowerCase().includes(q) ||
      buyer?.dni?.includes(q) ||
      String(r.bib_number).includes(q)
    )
  })

  const paidCount    = regs?.filter(r => r.status === 'paid').length ?? 0
  const pendingCount = regs?.filter(r => r.status === 'pending_payment').length ?? 0

  return (
    <OrgLayout>
      <OrgBreadcrumb items={[
        { label: 'Mi organización', to: '/org' },
        { label: 'Eventos', to: '/org/eventos' },
        { label: event?.name ?? '…', to: `/org/eventos/${eventId}` },
        { label: 'Inscripciones' },
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

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, apellido o DNI..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {['#','Estado','Apellido y nombre','DNI','Entrada','Cat.','Talle'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-medium text-muted-foreground text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered?.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground text-sm">Sin resultados</td></tr>
                )}
                {filtered?.map(r => {
                  const buyer = r.buyer as any
                  const tt    = r.ticket_type as any
                  const cf    = r.custom_field_values as any ?? {}
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
                        {buyer?.last_name}, {buyer?.first_name}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{buyer?.dni}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{tt?.name}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className="text-xs">{r.category ?? '—'}</Badge>
                      </td>
                      <td className="px-3 py-2.5">{cf.shirt_size ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </OrgLayout>
  )
}
