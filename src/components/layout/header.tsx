import { Link, useNavigate } from '@tanstack/react-router'
import { LogIn, LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

export function Header() {
  const { isAuthenticated, isSuperAdmin, isOrganizer, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Sesión cerrada')
    navigate({ to: '/' })
    setOpen(false)
  }

  const navLinks = [
    { to: '/eventos' as const, label: 'Eventos' },
    ...(isSuperAdmin ? [{ to: '/admin' as const, label: 'Admin' }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-paper/85 backdrop-blur-[12px] backdrop-saturate-[180%]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex h-16 items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-display text-[18px] tracking-[0.02em] text-navy shrink-0">
          <span className="w-9 h-9 bg-navy text-yellow rounded-[10px] grid place-items-center text-lg font-display">
            M
          </span>
          MISIONA HUB
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[15px] font-semibold text-ink/70 hover:text-ink transition-colors py-2"
              activeProps={{ className: 'text-[15px] font-semibold text-ink py-2 border-b-[3px] border-yellow' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              <Link to="/perfil">
                <button className="flex items-center gap-2 px-[18px] py-[11px] rounded-full text-[14px] font-semibold text-ink hover:bg-black/[0.06] transition-colors">
                  <User className="h-4 w-4" />
                  {profile?.first_name ?? 'Mi perfil'}
                </button>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-[18px] py-[11px] rounded-full border border-ink text-[14px] font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <button className="flex items-center gap-2 px-[18px] py-[11px] rounded-full text-[14px] font-semibold text-ink hover:bg-black/[0.06] transition-colors">
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </button>
              </Link>
              <Link to="/auth/registro">
                <button className="px-[18px] py-[11px] rounded-full bg-ink text-paper text-[14px] font-semibold hover:bg-black transition-colors">
                  Registrarse
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-ink"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-nav" className="md:hidden border-t border-line bg-paper px-4 py-4 space-y-1" role="navigation" aria-label="Navegación móvil">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="block text-[15px] font-semibold text-ink/70 py-2.5 hover:text-ink transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-line space-y-2">
            {isAuthenticated ? (
              <>
                <Link to="/perfil" className="flex items-center gap-2 text-[14px] font-semibold text-ink py-2" onClick={() => setOpen(false)}>
                  <User className="h-4 w-4" /> {profile?.first_name ?? 'Mi perfil'}
                </Link>
                <button onClick={handleSignOut} className="flex items-center gap-2 text-[14px] font-semibold text-terra py-2">
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="block text-[14px] font-semibold text-ink py-2" onClick={() => setOpen(false)}>
                  Iniciar sesión
                </Link>
                <Link to="/auth/registro" onClick={() => setOpen(false)}>
                  <button className="w-full px-4 py-2.5 rounded-full bg-ink text-paper text-[14px] font-semibold">
                    Registrarse
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
