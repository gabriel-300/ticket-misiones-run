import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-paper font-sans antialiased flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-paper font-sans antialiased flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-8xl font-extrabold text-muted-foreground/30 mb-4">404</p>
          <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
          <p className="text-muted-foreground mb-8">
            La página que buscás no existe o fue movida.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/"><Button variant="outline">Ir al inicio</Button></Link>
            <Link to="/eventos"><Button>Ver eventos</Button></Link>
          </div>
        </div>
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  ),
})
