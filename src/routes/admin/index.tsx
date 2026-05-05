import { createFileRoute } from '@tanstack/react-router'
import { AdminRoute } from '@/components/layout/protected-route'

export const Route = createFileRoute('/admin/')({
  component: () => (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  ),
})

function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      <p className="text-muted-foreground mt-2">Esta sección se completa en el Bloque 9.</p>
    </div>
  )
}
