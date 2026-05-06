# DATABASE.md — Schema Supabase

## Tablas

### `organizations`
Organizaciones que usan la plataforma para vender entradas.

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| name | TEXT | Nombre público |
| slug | TEXT UNIQUE | URL-friendly |
| description | TEXT | Descripción opcional |
| logo_url | TEXT | URL del logo |
| website_url | TEXT | Sitio web |
| contact_email | TEXT | Email de contacto |
| phone | TEXT | Teléfono |
| owner_id | UUID → profiles | Responsable principal |
| commission_rate | NUMERIC(5,2) | % que cobra Misiona Hub (default 8) |
| status | TEXT | `pending` / `active` / `suspended` |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

### `profiles`
Un row por usuario autenticado (trigger en auth.users).

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK → auth.users | |
| role | TEXT | `buyer` / `organizer` / `super_admin` |
| first_name | TEXT | |
| last_name | TEXT | |
| dni | TEXT | |
| dni_type | TEXT | `DNI` / `PASAPORTE` / `CI` |
| birth_date | DATE | |
| gender | TEXT | `M` / `F` / `X` |
| phone | TEXT | |
| city / province | TEXT | |
| apto_medico_* | varios | Solo relevante para eventos deportivos |

---

### `events`
Cualquier tipo de evento: running, concierto, teatro, conferencia, etc.

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| organization_id | UUID → organizations | Org. que lo organiza (nullable = Misiona Hub) |
| name | TEXT | |
| slug | TEXT UNIQUE | |
| type | TEXT | Texto libre: `running`, `concierto`, `teatro`, etc. |
| status | TEXT | `draft` / `published` / `closed` / `finished` / `cancelled` |
| starts_at | TIMESTAMPTZ | |
| ends_at | TIMESTAMPTZ | Opcional |
| registration_opens_at | TIMESTAMPTZ | |
| registration_closes_at | TIMESTAMPTZ | |
| location | JSON | `{ city, province, address, lat?, lng? }` |
| short_description | TEXT | Visible en la card |
| description | TEXT | Detalle completo |
| cover_image_url | TEXT | |
| service_fee_percentage | NUMERIC | % fee de plataforma |
| requires_medical_certificate | BOOLEAN | Para eventos deportivos |
| custom_fields | JSON | Campos extra configurables |
| waiver_text | TEXT | Deslinde de responsabilidad |

---

### `ticket_types`
Tipos de entrada por evento. Para running: `10K`, `21K`. Para concierto: `Platea`, `Campo`, `VIP`.
`distance_km` es opcional (sólo relevante para eventos deportivos).

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| event_id | UUID → events | |
| name | TEXT | Ej: "General", "VIP", "10K" |
| distance_km | NUMERIC | Opcional. Sólo para running/trail |
| capacity | INT | Cupos disponibles |
| registered_count | INT | Inscriptos actuales (denormalizado) |
| start_time | TIMESTAMPTZ | Largada diferente por categoría |
| age_min / age_max | INT | Restricción de edad |
| sort_order | INT | Orden de display |
| active | BOOLEAN | |

---

### `pricing_tiers`
Precios por etapa (early bird, precio general, etc.) vinculados a un ticket_type.

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| event_id | UUID → events | |
| ticket_type_id | UUID → ticket_types | Nullable = aplica a todo el evento |
| name | TEXT | Ej: "Early Bird", "General" |
| price_ars | NUMERIC | Precio en ARS |
| starts_at | TIMESTAMPTZ | |
| ends_at | TIMESTAMPTZ | |
| active | BOOLEAN | |
| sort_order | INT | |

---

### `registrations`
Una inscripción/compra de un buyer para un ticket_type de un evento.

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| event_id | UUID → events | |
| ticket_type_id | UUID → ticket_types | |
| buyer_id | UUID → profiles | |
| pricing_tier_id | UUID → pricing_tiers | Precio al momento de comprar |
| status | TEXT | `pending_payment` / `paid` / `cancelled` / `refunded` |
| base_price | NUMERIC | |
| service_fee | NUMERIC | |
| total_amount | NUMERIC | |
| bib_number | INT | Para running |
| coupon_id | UUID → coupons | |
| custom_field_values | JSON | Respuestas a campos custom del evento |
| acceptance_log | JSON | Registro de aceptaciones (waivers) |

---

### `orders`
Un pago. Puede cubrir una o más registrations.

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| buyer_id | UUID → profiles | |
| status | TEXT | `pending` / `paid` / `failed` / `refunded` |
| total_amount | NUMERIC | |
| items | JSON | Detalle de lo que se compró |
| payway_site_transaction_id | TEXT | ID de la transacción |
| payway_payment_id | TEXT | |
| payway_status | TEXT | |
| paid_at | TIMESTAMPTZ | |

---

### `complementary_services`
Servicios opcionales que un organizador ofrece junto al evento (transport, hospedaje, comida, etc.).

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| event_id | UUID → events | Nullable = disponible para todos los eventos de la org |
| organization_id | UUID → organizations | |
| category | TEXT | `hospedaje`, `comida`, `transporte`, `wellness`, etc. |
| partner_name | TEXT | Nombre del proveedor |
| title | TEXT | |
| description | TEXT | |
| price_from | NUMERIC | Precio desde |
| contact_method | TEXT | `email` / `whatsapp` / `form` |
| contact_value | TEXT | Email o número |
| active | BOOLEAN | |

---

### `service_interests`
Registro de compradores interesados en un servicio complementario.

---

### `coupons`
Códigos de descuento por evento.

---

### `email_log`
Log de emails enviados por Resend.

---

## Funciones de DB

| Función | Descripción |
|---|---|
| `is_super_admin(uid)` | Retorna true si el usuario es super_admin |
| `is_organizer(uid)` | Retorna true si es organizer o super_admin |
| `is_admin(uid)` | Alias de `is_super_admin` (compatibilidad) |

## RLS Summary

- `organizations`: super_admin full access, organizer ve/edita la suya, público ve activas
- `events`: super_admin full, organizer gestiona los de su org, público ve publicados
- `ticket_types`: super_admin full, organizer gestiona los de sus eventos
- `registrations`: buyer ve las suyas, organizer ve las de sus eventos, super_admin todo
