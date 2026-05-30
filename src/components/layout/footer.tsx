import { Link } from '@tanstack/react-router'

const LINKS = {
  Eventos: [
    { label: 'Próximos eventos', to: '/eventos' },
    { label: 'Ciclismo',         to: '/eventos' },
    { label: 'Running',          to: '/eventos' },
    { label: 'Trail',            to: '/eventos' },
  ],
  Soporte: [
    { label: 'Términos y condiciones',  to: '/legal/terminos' },
    { label: 'Política de privacidad',  to: '/legal/terminos' },
    { label: 'Contacto',               to: '/legal/terminos' },
  ],
}

function SocialIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="w-9 h-9 rounded-full border border-white/15 grid place-items-center text-paper/70 hover:bg-yellow hover:text-ink hover:border-yellow transition-all"
    >
      {children}
    </a>
  )
}

export function Footer() {
  return (
    <footer className="bg-navy text-paper">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 py-16 border-b border-white/10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="38" height="38" rx="9" fill="#C84B22"/>
                <circle cx="19" cy="19" r="12" stroke="#071A2F" strokeWidth="2.6" fill="none"
                  strokeDasharray="67 9" strokeLinecap="round" transform="rotate(-30 19 19)"/>
                <line x1="11" y1="18.5" x2="27" y2="18.5" stroke="white" strokeWidth="3.2" strokeLinecap="round"/>
                <line x1="19" y1="18.5" x2="19" y2="29" stroke="white" strokeWidth="3.2" strokeLinecap="round"/>
              </svg>
              <span className="font-display text-[18px] tracking-[0.04em] text-paper">
                TEVEN<span className="text-[#C84B22]">T</span>
              </span>
            </div>
            <p className="text-paper/60 text-[14px] leading-[1.5] mt-5 mb-6 max-w-xs">
              La plataforma de eventos de Misiones. Inscribite, pagá seguro y viví tu experiencia en el NEA.
            </p>
            <div className="flex gap-2">
              <SocialIcon label="Instagram">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </SocialIcon>
              <SocialIcon label="Facebook">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </SocialIcon>
              <SocialIcon label="WhatsApp">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 12a9 9 0 1 1-3.8-7.3L21 3l-1.3 4.2A9 9 0 0 1 21 12z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h5 className="font-mono text-[12px] uppercase tracking-[0.12em] text-yellow mb-4">{title}</h5>
              <ul className="space-y-3">
                {links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to as any} className="text-paper/70 text-[14px] hover:text-paper transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center py-8 gap-3 font-mono text-[12px] text-paper/50">
          <span>© {new Date().getFullYear()} tevent · Misiones Online · Todos los derechos reservados</span>
          <span>Hecho en Misiones, Argentina 🇦🇷</span>
        </div>
      </div>
    </footer>
  )
}
