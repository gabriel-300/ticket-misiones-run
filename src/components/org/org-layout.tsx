import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, CalendarDays, Gift, ChevronRight } from 'lucide-react'
import { OrganizerRoute } from '@/components/layout/protected-route'

const NAV = [
  { to: '/org',         label: 'Resumen',  icon: LayoutDashboard },
  { to: '/org/eventos', label: 'Eventos',  icon: CalendarDays },
  { to: '/org/addons',  label: 'Add-ons',  icon: Gift },
]

export function OrgLayout({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState()

  return (
    <OrganizerRoute>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 border-r bg-muted/30 p-4 hidden md:block">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
            Mi organización
          </p>
          <nav className="space-y-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = to === '/org'
                ? location.pathname === '/org' || location.pathname === '/org/'
                : location.pathname.startsWith(to)
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden border-b w-full fixed top-16 bg-background z-10">
          <div className="flex overflow-x-auto gap-1 p-2">
            {NAV.map(({ to, label }) => {
              const active = to === '/org'
                ? location.pathname === '/org' || location.pathname === '/org/'
                : location.pathname.startsWith(to)
              return (
                <Link key={to} to={to}
                  className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium
                    ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto mt-10 md:mt-0">
          {children}
        </main>
      </div>
    </OrganizerRoute>
  )
}

export function OrgBreadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {item.to
            ? <Link to={item.to} className="hover:text-foreground">{item.label}</Link>
            : <span className="text-foreground font-medium">{item.label}</span>
          }
        </span>
      ))}
    </nav>
  )
}
