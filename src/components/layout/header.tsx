import { Link, useNavigate } from '@tanstack/react-router'
import { LogIn, LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function Header() {
  const { isAuthenticated, isAdmin, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Sesión cerrada')
    navigate({ to: '/' })
    setMobileOpen(false)
  }

  const navLinks = [
    { to: '/eventos', label: 'Eventos' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          🏃 MISIONA HUB
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: 'text-foreground' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth actions - desktop */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/mi-perfil">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {profile?.first_name ?? 'Mi perfil'}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/auth/registro">
                <Button size="sm">Registrarse</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menú"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block text-sm font-medium py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Separator />
          {isAuthenticated ? (
            <>
              <Link to="/mi-perfil" className="block text-sm py-1" onClick={() => setMobileOpen(false)}>
                <User className="inline h-4 w-4 mr-2" />
                {profile?.first_name ?? 'Mi perfil'}
              </Link>
              <button onClick={handleSignOut} className="block text-sm py-1 text-destructive">
                <LogOut className="inline h-4 w-4 mr-2" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="block text-sm py-1" onClick={() => setMobileOpen(false)}>
                Iniciar sesión
              </Link>
              <Link to="/auth/registro" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full">Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
