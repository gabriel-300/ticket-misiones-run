# CLAUDE.md — Reglas de trabajo para Claude Code

## Quién soy yo (el usuario)
- **Nombre**: Gabriel Lytwyn
- **Rol**: Analista Administrativo + desarrollador full-stack autodidacta
- **Stack que ya manejo**: React, JavaScript, Supabase, Payway (lo integré en el proyecto Fanática del Calzado), N8N, SQL Server, Tango Gestión
- **Sistema operativo**: Windows, trabajo en VS Code
- **Idioma**: español (rioplatense). Respondé en español. Comentarios de código pueden ir en inglés si es convención del framework.

## Qué es este proyecto
**TicketMisionesRun** — Plataforma web de inscripción a carreras de running para Misiones Online, con flujo de upsell de servicios complementarios (hospedaje, comida, transporte, etc.) post-inscripción.

Este proyecto se desarrolla en **dos fases**:
- **Fase 1 (MVP)** — lo que vamos a construir AHORA. Single-merchant: Misiones Online cobra todo. Upsell estático con servicios curados manualmente.
- **Fase 2 (Marketplace)** — documentado pero NO se codea ahora. Onboarding self-service de proveedores estilo Airbnb.

## ⚠️ REGLAS CRÍTICAS DE TRABAJO

### 1. Antes de codear, leé estos archivos en orden:
1. `CLAUDE.md` (este archivo)
2. `docs/PROJECT.md` — visión y alcance
3. `docs/ARCHITECTURE.md` — stack y estructura
4. `docs/DATABASE.md` — schema completo Supabase
5. `docs/PAYWAY.md` — integración pasarela
6. `docs/ROADMAP.md` — bloques de trabajo en orden
7. `docs/PHASE2.md` — sólo para referencia, NO ejecutar ahora

### 2. Trabajamos por bloques del ROADMAP
- Hay 11 bloques en `docs/ROADMAP.md`. Los hacemos **uno a la vez**, en orden.
- Antes de empezar un bloque, **decime cuál vas a hacer** y esperá mi confirmación.
- Cuando termines un bloque, **mostrame los criterios de aceptación marcados** y esperá mi aprobación antes de pasar al siguiente.
- No te adelantes a bloques siguientes "porque ya está claro". Cada bloque tiene checkpoint.

### 3. NO MEZCLES Fase 1 con Fase 2
- Si te dan ganas de agregar onboarding de proveedores, listings, calendarios de disponibilidad, KYC, payouts, reviews → **eso es Fase 2**. Documentalo en `docs/PHASE2.md` si descubrís algo nuevo, pero NO lo codees.
- En Fase 1 los servicios de upsell se cargan manualmente en la base por un admin.

### 4. Pedime credenciales y secretos antes de asumir
Cuando llegues a un bloque que necesite:
- URL de Supabase + anon key + service role key
- Public key + private key de Payway sandbox
- API key de Resend (emails)
- Token de Mapbox (si usamos mapas)
- Cualquier otro secreto

→ **Pediime los valores** o decime qué archivo `.env.local` querés que arme. NO inventes claves de prueba sin avisarme.

### 5. Antes de instalar dependencias o tomar decisiones técnicas grandes
Preguntame. Ejemplos:
- "Voy a usar Zustand para state management, ¿está bien o preferís TanStack Query solo?"
- "Para validación de forms te propongo Zod + React Hook Form, ¿avanzo?"

Decisiones chicas (qué nombre tiene un componente, cómo organizar un hook) no hace falta que las consultes.

### 6. Convenciones de código
- **Idioma del código**: variables, funciones y componentes en **inglés**. Strings de UI en **español**.
- **Formato**: Prettier con configuración default + ESLint.
- **TypeScript**: estricto. `strict: true` en `tsconfig.json`.
- **Imports**: usar alias `@/` para `src/`.
- **Componentes**: PascalCase, un componente por archivo.
- **Hooks**: prefijo `use`, kebab-case en filename.
- **Tablas SQL**: snake_case plural (`registrations`, `event_distances`).
- **Columnas**: snake_case (`first_name`, `created_at`).

### 7. Cómo manejar errores y dudas
- Si algo del schema, lógica o flow no está claro en los docs → **preguntame**, no asumas.
- Si encontrás un conflicto entre dos archivos `.md` → preguntame cuál tiene prioridad. **El más específico siempre gana** (ej. `DATABASE.md` gana sobre `ARCHITECTURE.md` para temas de DB).
- Si una librería que pensabas usar está deprecada o tiene mejor alternativa → comentamelo antes.

### 8. Git
- Hacé commits **por bloque** del ROADMAP, con prefijo `feat(blockN):`, `fix:`, `docs:`, `chore:`.
- Mensaje descriptivo en español está OK.
- No hagas force push ni reescribas historia sin pedirme.

### 9. Datos de prueba
- Para el primer evento usamos eventos **ficticios** (varios, para probar multi-evento). En `ROADMAP.md` Bloque 2 hay un seed de ejemplos.
- DNI, CUIT, tarjetas: usar SIEMPRE datos de testing oficiales de Payway sandbox. Nunca datos reales.

### 10. Lo que NO debe hacer Claude Code
- ❌ Conectarse a la cuenta real de Payway de Fanática del Calzado en modo producción.
- ❌ Crear código que envíe emails reales hasta que yo confirme la API key.
- ❌ Usar `npm install -g` (instalaciones globales). Todo local al proyecto.
- ❌ Generar credenciales hardcodeadas. Todo va en `.env.local` (que está en `.gitignore`).
- ❌ Borrar archivos sin avisarme.
- ❌ Hacer "refactor masivo" sin pedirlo. Si ves algo mejorable, decímelo y yo decido.

## Cómo arrancamos
Cuando estés listo, decime:
> "Leí todos los docs. ¿Empezamos por el **Bloque 1: Setup inicial del proyecto** del ROADMAP?"

Y esperá mi confirmación.
