# PROJECT.md — Visión y alcance

## Qué es Misiona Hub

**Misiona Hub** es una plataforma SaaS de ticketing multi-organizador para Misiones, Argentina.
Cualquier tipo de evento puede venderse aquí: carreras de running, conciertos, teatro, conferencias, ferias, etc.

**Misiona Hub** (la empresa) vende el servicio a **organizadores** (bandas, empresas de running, teatros, etc.).
Los organizadores crean sus eventos, configuran tipos de entrada y servicios complementarios.
Los compradores descubren eventos, compran entradas y opcionalmente suman add-ons (transporte, hospedaje, comida).

**Misiones Online** es un socio de distribución y potencialmente de pasarela de pagos (por su volumen de operaciones).
No son clientes ni propietarios de la plataforma.

## Roles

| Rol | Descripción |
|---|---|
| `super_admin` | Equipo de Misiona Hub. Gestiona organizaciones, ve todo. Panel en `/admin` |
| `organizer` | Empresa u organizador de eventos. Gestiona sus eventos y add-ons. Panel en `/org` |
| `buyer` | Comprador final. Compra entradas y servicios complementarios |

## Modelo de negocio

- Misiona Hub cobra un **porcentaje de comisión** por evento (configurable por organización, default 8%)
- El % se suma al precio base y se muestra desglosado al comprador
- Los servicios complementarios (add-ons) son configurados por el organizador como "proveedores oficiales"
- El comprador puede agregarlos al flujo de compra antes o después de pagar la entrada

## Alcance Fase 1 (MVP actual)

1. **Auth y perfiles** (Supabase Auth, email + password)
2. **Multi-organización**: super_admin crea organizaciones, asigna owner
3. **Multi-evento y multi-tipo**: running, trail, concierto, teatro, conferencia, etc.
4. **Catálogo público** de eventos
5. **Formulario de compra/inscripción** con tipos de entrada configurables
6. **Servicios complementarios** como add-ons opcionales en el flujo de compra
7. **Pago con Payway** (tokenización + webhook)
8. **Emails transaccionales** (confirmación, recordatorio)
9. **Dashboard admin** (super_admin): gestión de organizaciones, eventos, inscripciones
10. **Dashboard organizador** (organizer): sus eventos, sus ventas, sus add-ons
11. **Mi perfil** (buyer): historial de compras

## Funciones diferidas (Fase 2)

- ❌ Onboarding self-service de organizadores (registro público)
- ❌ Split de pagos / payouts automáticos a organizadores
- ❌ Marketplace de servicios complementarios (listings con CRUD público)
- ❌ Reviews y ratings
- ❌ App nativa
- ❌ Cronometraje en vivo
- ❌ Multi-idioma
