-- ============================================================
-- SEED DE DEMO — MISIONA HUB
-- Ejecutar en Supabase SQL Editor > New Query
-- ============================================================

-- 1. Organización
INSERT INTO organizations (id, name, slug, description, contact_email, status)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Misiones Online',
  'misiones-online',
  'La organización de running más importante del NEA.',
  'eventos@misionesonline.net',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 2. EVENTOS
-- ──────────────────────────────────────────────────────────────

-- Evento 1: Maratón Internacional Posadas
INSERT INTO events (
  id, slug, name, short_description, description, type,
  starts_at, registration_opens_at, registration_closes_at,
  location, cover_image_url,
  requires_medical_certificate, medical_certificate_min_distance_km,
  service_fee_percentage, status, organization_id
) VALUES (
  'bbbbbbbb-0000-0000-0000-000000000001',
  'maraton-internacional-posadas-2026',
  'Maratón Internacional Posadas 2026',
  'La carrera más importante del NEA. Largada frente al río Paraná.',
  '<p>El <strong>Maratón Internacional Posadas</strong> es el evento de running más esperado del año en Misiones. Un recorrido espectacular por la costanera del Paraná, cruzando puentes históricos y rodeado de miles de corredores del NEA y países limítrofes.</p><p>Incluye distancias para todos los niveles: desde los primeros 5K hasta el desafío completo de 42K.</p>',
  'running',
  '2026-08-16 07:00:00+00',
  '2026-05-01 00:00:00+00',
  '2026-08-10 23:59:59+00',
  '{"city": "Posadas", "province": "Misiones", "address": "Costanera Norte, frente a Plaza 9 de Julio", "lat": -27.3671, "lng": -55.8965}',
  'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=1200&q=85&auto=format&fit=crop',
  true, 10,
  8.00, 'published',
  'aaaaaaaa-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- Evento 2: Trail Cataratas
INSERT INTO events (
  id, slug, name, short_description, description, type,
  starts_at, registration_opens_at, registration_closes_at,
  location, cover_image_url,
  requires_medical_certificate, medical_certificate_min_distance_km,
  service_fee_percentage, status, organization_id
) VALUES (
  'bbbbbbbb-0000-0000-0000-000000000002',
  'trail-cataratas-2026',
  'Trail Cataratas 2026',
  'Corré entre la selva misionera con las Cataratas como telón de fondo.',
  '<p>El <strong>Trail Cataratas</strong> te lleva por senderos vírgenes dentro del Parque Nacional Iguazú. Un desafío único en su tipo: tierra roja, selva paranaense y el estruendo de las cataratas más impresionantes del mundo.</p><p>Distancias de 15K y 30K, con desniveles que ponen a prueba a los mejores.</p>',
  'trail',
  '2026-09-13 06:00:00+00',
  '2026-05-01 00:00:00+00',
  '2026-09-07 23:59:59+00',
  '{"city": "Puerto Iguazú", "province": "Misiones", "address": "Parque Nacional Iguazú, Av. Tres Fronteras s/n", "lat": -25.6953, "lng": -54.4367}',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85&auto=format&fit=crop',
  true, 15,
  8.00, 'published',
  'aaaaaaaa-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- Evento 3: Media Maratón Oberá
INSERT INTO events (
  id, slug, name, short_description, description, type,
  starts_at, registration_opens_at, registration_closes_at,
  location, cover_image_url,
  requires_medical_certificate, medical_certificate_min_distance_km,
  service_fee_percentage, status, organization_id
) VALUES (
  'bbbbbbbb-0000-0000-0000-000000000003',
  'media-maraton-obera-2026',
  'Media Maratón Oberá 2026',
  'La carrera nocturna más mística del NEA. Oberá bajo las luces.',
  '<p>La <strong>Media Maratón Oberá</strong> es el evento estrella del interior misionero. Largada nocturna, ciudad iluminada y una atmósfera única que solo Oberá, la Ciudad de las Colectividades, puede ofrecer.</p><p>21K y 10K, con premio para las tres categorías de la familia corrida.</p>',
  'running',
  '2026-10-10 20:00:00+00',
  '2026-05-01 00:00:00+00',
  '2026-10-05 23:59:59+00',
  '{"city": "Oberá", "province": "Misiones", "address": "Plaza 9 de Julio, Av. Libertad s/n", "lat": -27.4878, "lng": -55.1198}',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&q=85&auto=format&fit=crop',
  true, 10,
  8.00, 'published',
  'aaaaaaaa-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 3. TICKET TYPES (distancias)
-- ──────────────────────────────────────────────────────────────

-- Evento 1: Maratón Posadas
INSERT INTO ticket_types (id, event_id, name, distance_km, capacity, registered_count, start_time, sort_order, active)
VALUES
  ('cccccccc-0001-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', '5K',  5,   800, 312, '08:30', 1, true),
  ('cccccccc-0001-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000001', '10K', 10, 1200, 547, '08:00', 2, true),
  ('cccccccc-0001-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000001', '21K', 21,  600, 189, '07:30', 3, true),
  ('cccccccc-0001-0000-0000-000000000004', 'bbbbbbbb-0000-0000-0000-000000000001', '42K', 42,  300,  74, '07:00', 4, true)
ON CONFLICT (id) DO NOTHING;

-- Evento 2: Trail Cataratas
INSERT INTO ticket_types (id, event_id, name, distance_km, capacity, registered_count, start_time, sort_order, active)
VALUES
  ('cccccccc-0002-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'Trail 15K', 15, 400, 156, '07:00', 1, true),
  ('cccccccc-0002-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000002', 'Trail 30K', 30, 200,  63, '06:00', 2, true)
ON CONFLICT (id) DO NOTHING;

-- Evento 3: Media Maratón Oberá
INSERT INTO ticket_types (id, event_id, name, distance_km, capacity, registered_count, start_time, sort_order, active)
VALUES
  ('cccccccc-0003-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000003', '10K',  10, 800, 298, '21:00', 1, true),
  ('cccccccc-0003-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000003', '21K', 21,  400, 127, '20:00', 2, true)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 4. PRICING TIERS (precios activos)
-- ──────────────────────────────────────────────────────────────

-- Evento 1: Maratón Posadas — Preventa vigente hasta julio
INSERT INTO pricing_tiers (event_id, ticket_type_id, name, price_ars, starts_at, ends_at, active)
VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000001', 'Preventa',  18000, '2026-05-01', '2026-07-01', true),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000002', 'Preventa',  28000, '2026-05-01', '2026-07-01', true),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000003', 'Preventa',  42000, '2026-05-01', '2026-07-01', true),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000004', 'Preventa',  65000, '2026-05-01', '2026-07-01', true),
  -- Precio normal (solapado, se activa después)
  ('bbbbbbbb-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000001', 'Normal',    25000, '2026-07-02', '2026-08-10', false),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000002', 'Normal',    38000, '2026-07-02', '2026-08-10', false),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000003', 'Normal',    58000, '2026-07-02', '2026-08-10', false),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000004', 'Normal',    85000, '2026-07-02', '2026-08-10', false);

-- Evento 2: Trail Cataratas
INSERT INTO pricing_tiers (event_id, ticket_type_id, name, price_ars, starts_at, ends_at, active)
VALUES
  ('bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0002-0000-0000-000000000001', 'Preventa',  35000, '2026-05-01', '2026-08-01', true),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0002-0000-0000-000000000002', 'Preventa',  55000, '2026-05-01', '2026-08-01', true);

-- Evento 3: Media Maratón Oberá
INSERT INTO pricing_tiers (event_id, ticket_type_id, name, price_ars, starts_at, ends_at, active)
VALUES
  ('bbbbbbbb-0000-0000-0000-000000000003', 'cccccccc-0003-0000-0000-000000000001', 'Preventa',  22000, '2026-05-01', '2026-09-01', true),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'cccccccc-0003-0000-0000-000000000002', 'Preventa',  38000, '2026-05-01', '2026-09-01', true);

-- ──────────────────────────────────────────────────────────────
-- 5. SERVICIOS COMPLEMENTARIOS (upsell race-cation)
-- ──────────────────────────────────────────────────────────────

INSERT INTO complementary_services (
  event_id, organization_id, category, partner_name, title, description,
  image_url, price_from, contact_method, contact_value, display_order, active
) VALUES

-- ── Maratón Posadas ──
(
  'bbbbbbbb-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'hospedaje', 'Hotel El Libertador Posadas',
  'Pack Corredor — Hotel El Libertador',
  'Habitación doble con desayuno energético para corredores. Check-in Viernes, check-out Domingo. A 200m de la llegada.',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format&fit=crop',
  85000, 'whatsapp', '5493764100200', 1, true
),
(
  'bbbbbbbb-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'transporte', 'Iguazú Transfer',
  'Traslado Aeropuerto ↔ Hotel',
  'Servicio privado desde Aeropuerto Posadas hasta tu hotel y de regreso post-carrera.',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80&auto=format&fit=crop',
  15000, 'whatsapp', '5493764987654', 2, true
),
(
  'bbbbbbbb-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'comida', 'La Glorieta Costanera',
  'Cena de la Pasta — Viernes pre-carrera',
  'Cena de carbohidratos junto a cientos de corredores frente al Paraná. Incluye bebida sin alcohol.',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80&auto=format&fit=crop',
  12000, 'email', 'reservas@laglorieta.com.ar', 3, true
),
(
  'bbbbbbbb-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'experiencia', 'Misiones Expediciones',
  'Excursión Ruinas de San Ignacio — Sábado',
  'Tour guiado a las Ruinas Jesuíticas de San Ignacio Miní (Patrimonio UNESCO). Salida 14hs, regreso 20hs.',
  'https://images.unsplash.com/photo-1590059390047-bde93b7b8dbe?w=800&q=80&auto=format&fit=crop',
  28000, 'whatsapp', '5493764555111', 4, true
),

-- ── Trail Cataratas ──
(
  'bbbbbbbb-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'hospedaje', 'Posada La Selva',
  'Cabaña en la selva — 2 noches',
  'Cabaña para 2 personas rodeada de vegetación, a 5 minutos del punto de largada. Incluye desayuno orgánico.',
  'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80&auto=format&fit=crop',
  120000, 'whatsapp', '5493757400100', 1, true
),
(
  'bbbbbbbb-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'experiencia', 'Cataratas Tours',
  'Paseo en lancha Gran Aventura',
  'Navegás hasta el pie de las Cataratas del Iguazú. La experiencia más extrema de la Triple Frontera.',
  'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80&auto=format&fit=crop',
  45000, 'whatsapp', '5493757600200', 2, true
),
(
  'bbbbbbbb-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'comida', 'Apepú Restaurant',
  'Menú del Corredor post-trail',
  'Menú de recuperación: proteínas, jugos naturales y postre. Para después de cruzar la meta.',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80&auto=format&fit=crop',
  18000, 'email', 'reservas@apepu.com.ar', 3, true
),

-- ── Media Maratón Oberá ──
(
  'bbbbbbbb-0000-0000-0000-000000000003',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'hospedaje', 'Hotel Casino Oberá',
  'Pack VIP Corredor — Hotel Casino',
  'Habitación superior con desayuno buffet. Estacionamiento gratuito incluido. A 500m de la largada nocturna.',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80&auto=format&fit=crop',
  75000, 'whatsapp', '5493755200300', 1, true
),
(
  'bbbbbbbb-0000-0000-0000-000000000003',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'experiencia', 'Oberá Cultural',
  'Tour Colectividades Oberá',
  'Recorrido por las casas de las 14 colectividades que dan identidad a Oberá. Música, gastronomía típica y artesanías.',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80&auto=format&fit=crop',
  20000, 'whatsapp', '5493755100400', 2, true
);

-- ──────────────────────────────────────────────────────────────
-- Verificación rápida
-- ──────────────────────────────────────────────────────────────
SELECT
  e.name AS evento,
  e.status,
  COUNT(DISTINCT tt.id) AS distancias,
  COUNT(DISTINCT pt.id) AS precios,
  COUNT(DISTINCT cs.id) AS addons
FROM events e
LEFT JOIN ticket_types tt ON tt.event_id = e.id
LEFT JOIN pricing_tiers pt ON pt.event_id = e.id AND pt.active = true
LEFT JOIN complementary_services cs ON cs.event_id = e.id AND cs.active = true
WHERE e.organization_id = 'aaaaaaaa-0000-0000-0000-000000000001'
GROUP BY e.name, e.status
ORDER BY e.name;
