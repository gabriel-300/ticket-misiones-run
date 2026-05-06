import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  ),
})
