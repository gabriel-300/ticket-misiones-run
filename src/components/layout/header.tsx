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

  const navLinks: { label: string; to?: string; href?: string }[] = [
    { to: '/eventos', label: 'Eventos' },
    { href: '/#como-funciona', label: 'Cómo funciona' },
    { to: '/legal/terminos', label: 'Ayuda' },
    ...(isAuthenticated ? [{ to: '/perfil/?tab=carreras', label: 'Mis inscripciones' }] : []),
    ...(isOrganizer && !isSuperAdmin ? [{ to: '/org', label: 'Mi organización' }] : []),
    ...(isSuperAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-paper/85 backdrop-blur-[12px] backdrop-saturate-[180%]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex h-16 items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="9" fill="#071A2F"/>
            {/* Círculo/ruta — abierto arriba como un sendero */}
            <circle cx="18" cy="19" r="10" stroke="#C84B22" strokeWidth="2.2" fill="none"
              strokeDasharray="42 22" strokeLinecap="round" transform="rotate(110 18 19)"/>
            {/* T bold — barra horizontal */}
            <line x1="11" y1="15" x2="25" y2="15" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
            {/* T bold — barra vertical */}
            <line x1="18" y1="15" x2="18" y2="26" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
          </svg>
          <span className="font-display text-[18px] tracking-[0.04em] text-navy">
            TEVEN<span className="text-[#C84B22]">T</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
          {navLinks.map(link => link.href ? (
            <a
              key={link.href}
              href={link.href}
              className="text-[15px] font-semibold text-ink/70 hover:text-ink transition-colors py-2"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.to}
              to={link.to as any}
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
          {navLinks.map(link => link.href ? (
            <a
              key={link.href}
              href={link.href}
              className="block text-[15px] font-semibold text-ink/70 py-2.5 hover:text-ink transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.to}
              to={link.to as any}
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
