# TicketMisionesRun

Plataforma de inscripción a eventos de running para Misiones Online, con upsell de servicios complementarios (race-cation).

## Stack

- **Frontend**: React 19 + Vite + TypeScript (strict) + TanStack Router + TanStack Query + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions)
- **Pasarela**: Payway / Decidir
- **Emails**: Resend + React Email
- **Hosting**: Vercel (frontend) + Supabase managed (backend)

## Setup local

### 1. Clonar el repo

```bash
git clone https://github.com/[org]/ticket-misiones-run.git
cd ticket-misiones-run
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

```bash
cp .env.example .env.local
```

Completar `.env.local` con los valores reales (pedirlos a Gabriel Lytwyn):
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` — del proyecto Supabase
- `VITE_PAYWAY_PUBLIC_KEY` — sandbox Payway
- `VITE_MAPBOX_TOKEN` — token Mapbox

### 4. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

### 5. Build de producción

```bash
npm run build
npm run preview
```

## Supabase

### Setup local (requiere Docker)

```bash
npx supabase start
npx supabase db reset   # aplica migrations + seed
npx supabase gen types typescript --local > src/types/database.ts
```

### Aplicar migrations al cloud

```bash
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
npx supabase functions deploy payway-create-payment
```

## Deploy

Push a `main` → Vercel deploya automáticamente.

## Documentación

- [`docs/PROJECT.md`](docs/PROJECT.md) — Visión y alcance
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Stack y estructura
- [`docs/DATABASE.md`](docs/DATABASE.md) — Schema Supabase
- [`docs/PAYWAY.md`](docs/PAYWAY.md) — Integración Payway
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — Bloques de desarrollo Fase 1
- [`docs/PHASE2.md`](docs/PHASE2.md) — Marketplace (Fase 2, no ejecutar aún)
