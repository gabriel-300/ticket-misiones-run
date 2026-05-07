-- ============================================================
-- SEED EVENTOS GENERALES — MISIONA HUB
-- Concierto · Teatro · Conferencia
-- Ejecutar en Supabase SQL Editor > New Query
-- (Requiere que ya exista la org aaaaaaaa-0000-0000-0000-000000000001)
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 0. EXPANDIR CHECK CONSTRAINT DE type EN events
--    El constraint original solo permite running/trail/triathlon/cycling/other
-- ──────────────────────────────────────────────────────────────
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_type_check;
ALTER TABLE events ADD CONSTRAINT events_type_check
  CHECK (type IN ('running', 'trail', 'triathlon', 'cycling', 'concierto', 'teatro', 'conferencia', 'other'));

-- ──────────────────────────────────────────────────────────────
-- 1. EVENTOS
-- ──────────────────────────────────────────────────────────────

-- Evento 4: Concierto de Folklore
INSERT INTO events (
  id, slug, name, short_description, description, type,
  starts_at, registration_opens_at, registration_closes_at,
  location, cover_image_url,
  requires_medical_certificate,
  service_fee_percentage, status, organization_id
) VALUES (
  'bbbbbbbb-0000-0000-0000-000000000004',
  'festival-folklore-posadas-2026',
  'Festival del Folklore Misionero 2026',
  'La noche más grande del folklore del NEA. Artistas nacionales y regionales en el Anfiteatro del Paraná.',
  '<p>El <strong>Festival del Folklore Misionero</strong> reúne a los artistas más representativos del NEA en una noche memorable frente al Río Paraná. Tres escenarios simultáneos, gastronomía típica y artesanías en una propuesta cultural única en la región.</p><p>Contará con la participación de artistas nacionales y la aparición especial de las colectividades de Oberá. Una experiencia que mezcla música, danza y la calidez misionera.</p>',
  'concierto',
  '2026-07-18 20:00:00+00',
  '2026-05-01 00:00:00+00',
  '2026-07-16 23:59:59+00',
  '{"city": "Posadas", "province": "Misiones", "address": "Anfiteatro Manuel Antonio Ramírez, Costanera Norte", "lat": -27.3621, "lng": -55.8912}',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=85&auto=format&fit=crop',
  false,
  8.00, 'published',
  'aaaaaaaa-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- Evento 5: Festival de Teatro
INSERT INTO events (
  id, slug, name, short_description, description, type,
  starts_at, registration_opens_at, registration_closes_at,
  location, cover_image_url,
  requires_medical_certificate,
  service_fee_percentage, status, organization_id
) VALUES (
  'bbbbbbbb-0000-0000-0000-000000000005',
  'festival-teatro-iguazu-2026',
  'Festival Internacional de Teatro Iguazú 2026',
  'Cinco días de teatro contemporáneo con elencos de Argentina, Brasil y Paraguay en Puerto Iguazú.',
  '<p>El <strong>Festival Internacional de Teatro Iguazú</strong> llega a su tercera edición con elencos de Argentina, Brasil y Paraguay. Durante cinco días, el Teatro Municipal de Iguazú se convierte en el centro cultural más vibrante del NEA.</p><p>Obras de teatro contemporáneo, performances callejeras, talleres abiertos y una muestra de títeres para toda la familia. Un festival que desborda creatividad en el corazón de la Triple Frontera.</p>',
  'teatro',
  '2026-11-05 20:30:00+00',
  '2026-07-01 00:00:00+00',
  '2026-11-03 23:59:59+00',
  '{"city": "Puerto Iguazú", "province": "Misiones", "address": "Teatro Municipal de Puerto Iguazú, Av. Aguirre 239", "lat": -25.5972, "lng": -54.5783}',
  'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=85&auto=format&fit=crop',
  false,
  8.00, 'published',
  'aaaaaaaa-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- Evento 6: Conferencia de Tecnología y Emprendimiento
INSERT INTO events (
  id, slug, name, short_description, description, type,
  starts_at, registration_opens_at, registration_closes_at,
  location, cover_image_url,
  requires_medical_certificate,
  service_fee_percentage, status, organization_id
) VALUES (
  'bbbbbbbb-0000-0000-0000-000000000006',
  'misiones-tech-summit-2026',
  'Misiones Tech Summit 2026',
  'El encuentro de tecnología y emprendimiento más importante del interior del país. Networking, workshops y speakers de primer nivel.',
  '<p>El <strong>Misiones Tech Summit</strong> es el evento de tecnología más esperado del NOA/NEA. Dos días de contenido de alto impacto para emprendedores, desarrolladores, diseñadores y líderes de empresas tecnológicas.</p><p>Contaremos con speakers de empresas como MercadoLibre, Globant, Satellogic y startups del ecosistema regional. Acceso a un espacio de co-working exclusivo, zona de networking y feria de empleo tech.</p>',
  'conferencia',
  '2026-09-25 09:00:00+00',
  '2026-06-01 00:00:00+00',
  '2026-09-22 23:59:59+00',
  '{"city": "Posadas", "province": "Misiones", "address": "Centro de Convenciones Misiones, Av. Roca 4198", "lat": -27.4106, "lng": -55.9100}',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=85&auto=format&fit=crop',
  false,
  8.00, 'published',
  'aaaaaaaa-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 2. TICKET TYPES
-- ──────────────────────────────────────────────────────────────

-- Evento 4: Festival Folklore (sin distance_km)
INSERT INTO ticket_types (id, event_id, name, distance_km, capacity, registered_count, sort_order, active)
VALUES
  ('cccccccc-0004-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000004', 'Campo General', NULL, 3000, 1247, 1, true),
  ('cccccccc-0004-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000004', 'Platea',        NULL,  800,  312, 2, true),
  ('cccccccc-0004-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000004', 'VIP',           NULL,  200,   89, 3, true)
ON CONFLICT (id) DO NOTHING;

-- Evento 5: Festival de Teatro
INSERT INTO ticket_types (id, event_id, name, distance_km, capacity, registered_count, sort_order, active)
VALUES
  ('cccccccc-0005-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000005', 'Entrada General', NULL, 400, 187, 1, true),
  ('cccccccc-0005-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000005', 'Pase 5 Días',     NULL, 150,  43, 2, true),
  ('cccccccc-0005-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000005', 'Palco VIP',       NULL,  50,  18, 3, true)
ON CONFLICT (id) DO NOTHING;

-- Evento 6: Tech Summit
INSERT INTO ticket_types (id, event_id, name, distance_km, capacity, registered_count, sort_order, active)
VALUES
  ('cccccccc-0006-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000006', 'Early Bird',    NULL, 200, 200, 1, true),
  ('cccccccc-0006-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000006', 'General',       NULL, 600, 341, 2, true),
  ('cccccccc-0006-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000006', 'VIP + Workshop',NULL, 100,  57, 3, true)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 3. PRICING TIERS
-- ──────────────────────────────────────────────────────────────

-- Evento 4: Festival Folklore
INSERT INTO pricing_tiers (event_id, ticket_type_id, name, price_ars, starts_at, ends_at, active, sort_order)
VALUES
  ('bbbbbbbb-0000-0000-0000-000000000004', 'cccccccc-0004-0000-0000-000000000001', 'Preventa',  8000, '2026-05-01', '2026-06-30', true,  1),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'cccccccc-0004-0000-0000-000000000001', 'General',  12000, '2026-07-01', '2026-07-16', false, 2),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'cccccccc-0004-0000-0000-000000000002', 'Preventa', 18000, '2026-05-01', '2026-06-30', true,  1),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'cccccccc-0004-0000-0000-000000000002', 'General',  25000, '2026-07-01', '2026-07-16', false, 2),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'cccccccc-0004-0000-0000-000000000003', 'VIP',      45000, '2026-05-01', '2026-07-16', true,  1);

-- Evento 5: Festival de Teatro
INSERT INTO pricing_tiers (event_id, ticket_type_id, name, price_ars, starts_at, ends_at, active, sort_order)
VALUES
  ('bbbbbbbb-0000-0000-0000-000000000005', 'cccccccc-0005-0000-0000-000000000001', 'Preventa',   6000, '2026-07-01', '2026-09-30', true,  1),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'cccccccc-0005-0000-0000-000000000001', 'General',    9000, '2026-10-01', '2026-11-03', false, 2),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'cccccccc-0005-0000-0000-000000000002', 'Pase 5 días',25000, '2026-07-01', '2026-11-03', true,  1),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'cccccccc-0005-0000-0000-000000000003', 'Palco VIP',  40000, '2026-07-01', '2026-11-03', true,  1);

-- Evento 6: Tech Summit
INSERT INTO pricing_tiers (event_id, ticket_type_id, name, price_ars, starts_at, ends_at, active, sort_order)
VALUES
  ('bbbbbbbb-0000-0000-0000-000000000006', 'cccccccc-0006-0000-0000-000000000001', 'Early Bird', 35000, '2026-06-01', '2026-07-31', true,  1),
  ('bbbbbbbb-0000-0000-0000-000000000006', 'cccccccc-0006-0000-0000-000000000002', 'Preventa',   55000, '2026-06-01', '2026-08-31', true,  1),
  ('bbbbbbbb-0000-0000-0000-000000000006', 'cccccccc-0006-0000-0000-000000000002', 'General',    75000, '2026-09-01', '2026-09-22', false, 2),
  ('bbbbbbbb-0000-0000-0000-000000000006', 'cccccccc-0006-0000-0000-000000000003', 'VIP + Workshop', 120000, '2026-06-01', '2026-09-22', true, 1);

-- ──────────────────────────────────────────────────────────────
-- 4. SERVICIOS COMPLEMENTARIOS
-- ──────────────────────────────────────────────────────────────

INSERT INTO complementary_services (
  event_id, organization_id, category, partner_name, title, description,
  image_url, price_from, contact_method, contact_value, display_order, active
) VALUES

-- ── Festival Folklore ──
(
  'bbbbbbbb-0000-0000-0000-000000000004',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'hospedaje', 'Hotel Julio César Posadas',
  'Alojamiento — Noche del Festival',
  'Habitación doble con desayuno incluido. A 3 cuadras del Anfiteatro. Check-in viernes, check-out sábado.',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80&auto=format&fit=crop',
  70000, 'whatsapp', '5493764200100', 1, true
),
(
  'bbbbbbbb-0000-0000-0000-000000000004',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'comida', 'La Paradita del Puerto',
  'Cena Criolla Pre-Festival',
  'Asado misionero, chipá y empanadas frente al río. El plan perfecto antes del show. Reserva tu mesa.',
  'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80&auto=format&fit=crop',
  15000, 'whatsapp', '5493764300200', 2, true
),
(
  'bbbbbbbb-0000-0000-0000-000000000004',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'transporte', 'Posadas Transfer',
  'Traslado desde cualquier punto de la ciudad',
  'Van privada desde tu hotel hasta el Anfiteatro y regreso. Evitá el tráfico y disfrutá la noche.',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
  8000, 'whatsapp', '5493764400300', 3, true
),
(
  'bbbbbbbb-0000-0000-0000-000000000004',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'experiencia', 'Misiones Expediciones',
  'City Tour Posadas — Sábado de mañana',
  'Recorrí los puntos históricos de Posadas: Costanera, Catedral, Mercado Artesanal y el puente internacional.',
  'https://images.unsplash.com/photo-1590059390047-bde93b7b8dbe?w=800&q=80&auto=format&fit=crop',
  18000, 'whatsapp', '5493764555111', 4, true
),

-- ── Festival de Teatro ──
(
  'bbbbbbbb-0000-0000-0000-000000000005',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'hospedaje', 'Garden Hotel Puerto Iguazú',
  'Estadía durante el Festival — 5 noches',
  'Habitación superior con pileta y desayuno. A 10 minutos del Teatro Municipal. Tarifa especial para asistentes.',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format&fit=crop',
  350000, 'whatsapp', '5493757500100', 1, true
),
(
  'bbbbbbbb-0000-0000-0000-000000000005',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'experiencia', 'Cataratas Tours',
  'Visita Cataratas del Iguazú — Circuito completo',
  'Aprovechá tu estadía y visitá las Cataratas. Entrada, guía bilingüe y almuerzo en el Parque Nacional.',
  'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80&auto=format&fit=crop',
  55000, 'whatsapp', '5493757600200', 2, true
),
(
  'bbbbbbbb-0000-0000-0000-000000000005',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'comida', 'Color Restaurant',
  'Cena con vista a la Triple Frontera',
  'Gastronomía de autor con ingredientes locales. El mejor atardecer de Puerto Iguazú acompaña tu noche de teatro.',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format&fit=crop',
  30000, 'email', 'reservas@colorrestaurant.com.ar', 3, true
),

-- ── Tech Summit ──
(
  'bbbbbbbb-0000-0000-0000-000000000006',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'hospedaje', 'NH Posadas',
  'Alojamiento Tech Summit — 2 noches',
  'Habitación ejecutiva con desayuno y acceso a sala de reuniones. A 5 minutos del Centro de Convenciones.',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80&auto=format&fit=crop',
  140000, 'whatsapp', '5493764700100', 1, true
),
(
  'bbbbbbbb-0000-0000-0000-000000000006',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'comida', 'Co-working Café Posadas',
  'Brunch de networking — Día 1',
  'Desayuno de trabajo con los speakers y otros asistentes. La mejor hora para hacer contactos del evento.',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80&auto=format&fit=crop',
  12000, 'email', 'hola@coworkingposadas.com', 2, true
),
(
  'bbbbbbbb-0000-0000-0000-000000000006',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'experiencia', 'Misiones Expediciones',
  'Paseo en kayak por el río Paraná — Tarde libre',
  'Una tarde diferente: navegá el Paraná en kayak con guías certificados. Ideal para desconectarse entre jornadas.',
  'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800&q=80&auto=format&fit=crop',
  22000, 'whatsapp', '5493764555111', 3, true
),
(
  'bbbbbbbb-0000-0000-0000-000000000006',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'transporte', 'Posadas Transfer',
  'Traslado Aeropuerto ↔ Hotel (ida y vuelta)',
  'Servicio privado ejecutivo desde el Aeropuerto Posadas hasta tu alojamiento. Puntual y sin sorpresas.',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80&auto=format&fit=crop',
  18000, 'whatsapp', '5493764400300', 4, true
);

-- ──────────────────────────────────────────────────────────────
-- Verificación
-- ──────────────────────────────────────────────────────────────
SELECT
  e.name AS evento,
  e.type AS tipo,
  e.status,
  COUNT(DISTINCT tt.id) AS tipos_entrada,
  COUNT(DISTINCT pt.id) AS precios_activos,
  COUNT(DISTINCT cs.id) AS servicios
FROM events e
LEFT JOIN ticket_types tt ON tt.event_id = e.id
LEFT JOIN pricing_tiers pt ON pt.event_id = e.id AND pt.active = true
LEFT JOIN complementary_services cs ON cs.event_id = e.id AND cs.active = true
WHERE e.id IN (
  'bbbbbbbb-0000-0000-0000-000000000004',
  'bbbbbbbb-0000-0000-0000-000000000005',
  'bbbbbbbb-0000-0000-0000-000000000006'
)
GROUP BY e.name, e.type, e.status
ORDER BY e.name;
