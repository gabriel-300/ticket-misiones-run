# ARCHITECTURE.md — Stack y estructura

## Stack final Fase 1

```
Frontend
├── React 18.3.x
├── Vite 5.x (bundler)
├── TypeScript 5.x (strict)
├── TanStack Router (file-based)
├── TanStack Query (server state)
├── Zustand (client state, sólo si hace falta)
├── React Hook Form + Zod (forms)
├── Tailwind CSS 3.x + shadcn/ui (UI)
├── react-map-gl + mapbox-gl (mapas)
├── date-fns (fechas)
├── lucide-react (íconos)
└── @supabase/supabase-js (cliente DB)

Backend
├── Supabase Cloud
│   ├── PostgreSQL 15 + RLS
│   ├── Auth (email + password en Fase 1)
│   ├── Storage (4 buckets)
│   └── Edge Functions (Deno + TypeScript)
├── Payway / Decidir (pasarela de pago)
├── Resend (emails transaccionales)
└── React Email (templates de email)

DevOps
├── GitHub (repo privado)
├── Vercel (hosting frontend, deploy automático desde main)
├── Supabase CLI (migrations + tipos generados)
└── Sentry (monitoring, free tier)
```

## Estructura de carpetas

```
src/
├── main.tsx
├── routeTree.gen.ts        # auto-generado por TanStack Router
├── index.css               # Tailwind directives
├── routes/                 # file-based routing
│   ├── __root.tsx          # layout raíz
│   ├── index.tsx           # / (home)
│   ├── eventos/
│   │   ├── index.tsx       # /eventos (listado)
│   │   └── $slug.tsx       # /eventos/maraton-posadas
│   ├── inscripcion/
│   │   └── $eventId.tsx    # /inscripcion/[id]
│   ├── checkout/
│   │   └── $orderId.tsx    # /checkout/[id]
│   ├── confirmacion/
│   │   └── $orderId.tsx    # /confirmacion/[id] (race-cation upsell)
│   ├── mi-perfil/
│   │   ├── index.tsx
│   │   └── inscripciones.tsx
│   ├── auth/
│   │   ├── login.tsx
│   │   ├── registro.tsx
│   │   ├── recuperar.tsx
│   │   └── callback.tsx
│   └── admin/
│       ├── _layout.tsx     # protected layout
│       ├── index.tsx       # dashboard
│       ├── eventos.tsx
│       ├── inscripciones.tsx
│       └── aptos-medicos.tsx
├── components/
│   ├── ui/                 # componentes shadcn
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── mobile-nav.tsx
│   ├── eventos/
│   │   ├── event-card.tsx
│   │   ├── event-hero.tsx
│   │   ├── distance-selector.tsx
│   │   ├── countdown.tsx
│   │   └── course-map.tsx
│   ├── inscripcion/
│   │   ├── registration-form.tsx
│   │   ├── personal-data-step.tsx
│   │   ├── sport-data-step.tsx
│   │   ├── medical-cert-upload.tsx
│   │   ├── waiver-acceptance.tsx
│   │   └── summary-step.tsx
│   ├── checkout/
│   │   ├── payway-card-form.tsx
│   │   └── order-summary.tsx
│   ├── upsell/
│   │   ├── racecation-grid.tsx
│   │   ├── service-card.tsx
│   │   └── interest-form.tsx
│   └── admin/
│       ├── registrations-table.tsx
│       ├── medical-cert-validator.tsx
│       └── csv-export-button.tsx
├── hooks/
│   ├── use-auth.ts
│   ├── use-events.ts
│   ├── use-registrations.ts
│   ├── use-payway.ts
│   ├── use-upload.ts
│   └── use-toast.ts
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   ├── validators/
│   │   ├── registration.ts
│   │   ├── auth.ts
│   │   └── event.ts
│   ├── payway/
│   │   ├── client.ts
│   │   └── types.ts
│   └── constants.ts
├── types/
│   ├── database.ts         # auto-generado por `supabase gen types`
│   ├── domain.ts
│   └── api.ts
└── stores/
    └── auth-store.ts
```

## Convenciones de código

- **Path aliases**: usar `@/` siempre.
- **Componentes**: PascalCase, default export, props tipadas.
- **Hooks**: prefijo `use-`, kebab-case en filename.
- **Variables de entorno**: frontend `VITE_*`, Edge Functions sin prefijo.
- **Service role key**: SÓLO en Edge Functions, NUNCA en el frontend.
