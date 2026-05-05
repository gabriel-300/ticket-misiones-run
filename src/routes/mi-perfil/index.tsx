import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/layout/protected-route'

export const Route = createFileRoute('/mi-perfil/')({
  component: () => (
    <ProtectedRoute>
      <MiPerfilPage />
    </ProtectedRoute>
  ),
})

function MiPerfilPage() {
  const { profile } = useAuth()
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Mi perfil</h1>
      <p className="text-muted-foreground mt-2">
        Bienvenido, {profile?.first_name} {profile?.last_name}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Esta sección se completa en el Bloque 10.
      </p>
    </div>
  )
}
