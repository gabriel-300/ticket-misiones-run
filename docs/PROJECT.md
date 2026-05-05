# PROJECT.md — Visión y alcance

## Contexto del cliente
**Misiones Online** es un medio digital de Misiones, Argentina. Ofrecen su plataforma `ticketmisiones.com/shop` pero está pensada para espectáculos musicales, no para eventos deportivos. Nos dieron luz verde para construir una plataforma propia, novedosa, orientada a carreras de running y adaptable a cualquier tipo de evento.

## Visión
Construir la plataforma de inscripción a eventos deportivos **más completa de la región Misiones / NEA**, con un diferencial claro: después de inscribirte a la carrera, te ofrecemos todo lo que necesitás para tu **race-cation** — hospedaje, comida, transporte, masajes, fotos, experiencias.

## Alcance Fase 1 (lo que se codea ahora)

### Funciones incluidas
1. **Auth y perfiles de corredores** (Supabase Auth con email + password).
2. **Catálogo de eventos** (multi-evento, multi-distancia).
3. **Formulario de inscripción dinámico** con validación.
4. **Subida de apto médico** (PDF/imagen) con vencimiento a 1 año.
5. **Deslinde de responsabilidad** firmado digitalmente con timestamp.
6. **Pago con Payway** (tokenización + autorización + webhook).
7. **Upsell estático post-pago**: pantalla de confirmación con servicios complementarios curados manualmente. Las reservas de upsell en Fase 1 se gestionan **por email**.
8. **Emails transaccionales** (confirmación, recordatorios pre-carrera).
9. **Dashboard de admin** (Misiones Online): ver inscriptos, exportar CSV, validar aptos médicos, asignar dorsales.
10. **Landing pública del evento** con countdown, mapa, galería, FAQs.
11. **Facturación electrónica AFIP/ARCA** — opcional/diferible.

### Funciones EXPLÍCITAMENTE excluidas de Fase 1
- ❌ Onboarding self-service de proveedores
- ❌ Sistema de listings con CRUD para proveedores
- ❌ Calendario de disponibilidad
- ❌ KYC fiscal automatizado
- ❌ Split de pagos / payouts a proveedores
- ❌ Reviews y ratings
- ❌ Search y filtros de servicios complementarios
- ❌ Bundle builder dinámico
- ❌ Multi-idioma
- ❌ App nativa
- ❌ Cronometraje en vivo
- ❌ Integración con Strava

## Roles de usuario en Fase 1
1. **Anonymous** — ve landings públicos, puede registrarse.
2. **Runner** — corredor inscripto.
3. **Admin** — empleado de Misiones Online.

## Modelo de negocio Fase 1
- Misiones Online cobra el 100% de la inscripción vía Payway.
- Fee de servicio configurable por evento (default 8%), desglosado al corredor.
- Upsell: acuerdos comerciales bilaterales, el corredor expresa interés y Misiones Online conecta con el partner.
