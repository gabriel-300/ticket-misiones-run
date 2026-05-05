import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="font-bold text-lg">MISIONA HUB</p>
            <p className="text-sm text-muted-foreground mt-1">
              La plataforma de carreras del NEA. Inscribite, preparate y viví tu race‑cation.
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">Eventos</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><Link to="/eventos" className="hover:text-foreground transition-colors">Ver todos los eventos</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">Legal</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Términos y condiciones</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Política de privacidad</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MISIONA HUB · Misiones Online · Todos los derechos reservados
        </div>
      </div>
    </footer>
  )
}
