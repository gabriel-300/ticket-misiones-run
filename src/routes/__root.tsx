import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/layout/header'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Header />
      <main>
        <Outlet />
      </main>
      <Toaster richColors position="top-right" />
    </div>
  ),
})
