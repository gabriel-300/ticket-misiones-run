import { Navigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'

interface Props {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/auth/login' }: Props) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to={redirectTo} />
  return <>{children}</>
}

export function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/auth/login" />
  if (!isSuperAdmin) return <Navigate to="/" />
  return <>{children}</>
}

export function OrganizerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isOrganizer, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/auth/login" />
  if (!isOrganizer) return <Navigate to="/" />
  return <>{children}</>
}

// AdminRoute kept as alias for SuperAdminRoute during transition
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <SuperAdminRoute>{children}</SuperAdminRoute>
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Cargando...</p>
    </div>
  )
}
