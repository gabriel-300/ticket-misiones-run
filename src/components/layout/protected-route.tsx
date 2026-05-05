import { Navigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'

interface Props {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/auth/login' }: Props) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />
  }

  return <>{children}</>
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/auth/login" />
  if (!isAdmin) return <Navigate to="/" />

  return <>{children}</>
}
