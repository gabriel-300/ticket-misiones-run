# ROADMAP.md — Fase 1 (MVP) en 11 bloques

## Cómo se trabaja
- **Un bloque a la vez.** Antes de empezar, decime cuál vas a hacer.
- Al terminar, **mostrame los criterios de aceptación tildados** y esperá mi OK para avanzar.
- Cada bloque termina con un **commit en Git** con prefijo `feat(blockN):`.
- Si descubrís que un bloque debería dividirse, proponémelo y decidimos juntos.

---

## Bloque 1 — Setup inicial del proyecto
**Objetivo**: dejar el proyecto compilando y deployable, sin features todavía.

### Commit
`chore(block1): setup inicial Vite + React + TS + Tailwind + Supabase + Vercel`

---

## Bloque 2 — Supabase setup y schema
**Objetivo**: base de datos lista con todas las tablas, RLS, triggers, storage y datos seed.

### Commit
`feat(block2): schema completo + RLS + storage + seed`

---

## Bloque 3 — Auth (registro y login)
**Objetivo**: el flujo de auth funciona end-to-end.

### Tareas
1. Crear `src/hooks/use-auth.ts` con: `useUser()`, `signUp()`, `signIn()`, `signOut()`, `resetPassword()`.
2. Configurar email templates en Supabase (verificación, reset password) — en español.
3. Crear ruta `/auth/registro` con form: email, password, nombre, apellido, DNI, fecha nacimiento, sexo, teléfono. Validar con Zod.
4. Crear ruta `/auth/login` con form: email + password.
5. Crear ruta `/auth/recuperar` con form: email para reset.
6. Crear ruta `/auth/callback` que recibe el redirect de email confirmation.
7. Crear componente `<ProtectedRoute>` para rutas que requieren login.
8. Crear componente `<AdminRoute>` para rutas de admin.
9. Mostrar toast de éxito/error con shadcn/ui `<Toast>`.
10. Persistir sesión con `localStorage` (default Supabase).
11. Header global muestra "Iniciar sesión / Mi perfil" según estado.

### Criterios de aceptación
- [ ] Puedo registrarme con un email nuevo y recibo email de verificación.
- [ ] Tras verificar, puedo loguearme.
- [ ] Al registrarme, se crea automáticamente un row en `profiles` (vía trigger).
- [ ] Puedo cerrar sesión y volver a loguearme.
- [ ] Reset password funciona end-to-end.
- [ ] Si intento entrar a `/admin` sin ser admin, me redirige.
- [ ] Los textos de los emails están en español.

### Commit
`feat(block3): auth flow completo (registro, login, reset, protected routes)`

---

## Bloque 4 — Catálogo público de eventos
**Objetivo**: home + listado + detalle de evento navegables (sin inscripción todavía).

### Commit
`feat(block4): catálogo público de eventos con Mapbox y countdown`

---

## Bloque 5 — Formulario de inscripción
**Objetivo**: el corredor puede llenar el formulario de inscripción y crear una `registration` en estado `pending_payment`.

### Commit
`feat(block5): formulario multi-step de inscripción + apto médico + aceptaciones`

---

## Bloque 6 — Integración Payway
**Objetivo**: completar el pago end-to-end en sandbox y dejar la inscripción en estado `paid`.

### Commit
`feat(block6): integración Payway completa con Edge Function`

---

## Bloque 7 — Pantalla de confirmación + upsell estático
**Objetivo**: el corazón novedoso del producto — la "race-cation".

### Commit
`feat(block7): pantalla de confirmación con upsell de race-cation`

---

## Bloque 8 — Emails transaccionales con Resend
**Objetivo**: confirmaciones y recordatorios automáticos por email.

### Commit
`feat(block8): emails transaccionales con Resend + React Email`

---

## Bloque 9 — Dashboard admin
**Objetivo**: Misiones Online puede gestionar todo desde una UI.

### Commit
`feat(block9): dashboard admin completo`

---

## Bloque 10 — Mi perfil (corredor)
**Objetivo**: el corredor tiene un panel propio.

### Commit
`feat(block10): panel del corredor (mi perfil)`

---

## Bloque 11 — Pulido + deploy productivo
**Objetivo**: dejar todo listo para abrir las puertas.

### Commit
`chore(block11): pulido SEO + perf + a11y + deploy productivo`

---

## Después de Fase 1
Cuando los 11 bloques estén ✓ y el cliente apruebe el MVP, seguimos con `PHASE2.md`.
