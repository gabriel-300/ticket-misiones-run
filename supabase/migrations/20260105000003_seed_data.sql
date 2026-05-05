-- ============================================================
-- TICKETMISIONESRUN — Seed data (eventos ficticios para dev)
-- ============================================================

-- 3 eventos ficticios de Misiones
INSERT INTO events (slug, name, short_description, type, starts_at, registration_opens_at, registration_closes_at, location, status, service_fee_percentage, waiver_text)
VALUES
  (
    'maraton-posadas-2026',
    'Maratón de Posadas 2026',
    'La maratón más importante del NEA, recorriendo la costanera de Posadas',
    'running',
    '2026-08-15 07:00:00-03',
    '2026-05-01 00:00:00-03',
    '2026-08-10 23:59:59-03',
    '{"city":"Posadas","province":"Misiones","country":"AR","address":"Costanera de Posadas","lat":-27.3621,"lng":-55.9008}'::jsonb,
    'published',
    8.00,
    'Declaro estar físicamente apto/a para participar en este evento deportivo. Eximo a los organizadores de toda responsabilidad ante accidentes, lesiones o daños que puedan surgir durante mi participación. Autorizo el uso de imágenes tomadas durante el evento para fines promocionales.'
  ),
  (
    'iguazu-trail-21k',
    'Iguazú Trail 21K',
    'Trail running por la selva misionera con vista a las Cataratas',
    'trail',
    '2026-09-20 06:30:00-03',
    '2026-05-15 00:00:00-03',
    '2026-09-15 23:59:59-03',
    '{"city":"Puerto Iguazú","province":"Misiones","country":"AR","address":"Parque Nacional Iguazú","lat":-25.6953,"lng":-54.4367}'::jsonb,
    'published',
    8.00,
    'Declaro estar físicamente apto/a para participar en este evento deportivo de trail running. Comprendo que el recorrido incluye terreno irregular y natural. Eximo a los organizadores de toda responsabilidad ante accidentes, lesiones o daños que puedan surgir durante mi participación.'
  ),
  (
    'san-ignacio-night-run-10k',
    'San Ignacio Night Run 10K',
    'Carrera nocturna por las Ruinas Jesuíticas iluminadas',
    'running',
    '2026-11-05 20:00:00-03',
    '2026-06-01 00:00:00-03',
    '2026-11-01 23:59:59-03',
    '{"city":"San Ignacio","province":"Misiones","country":"AR","address":"Ruinas Jesuíticas de San Ignacio","lat":-27.2549,"lng":-55.5364}'::jsonb,
    'published',
    8.00,
    'Declaro estar físicamente apto/a para participar en este evento deportivo nocturno. Eximo a los organizadores de toda responsabilidad ante accidentes, lesiones o daños que puedan surgir durante mi participación.'
  );

-- Distancias — Maratón Posadas
INSERT INTO event_distances (event_id, name, distance_km, capacity, start_time, sort_order)
SELECT id, '42K', 42.195, 500, '07:00:00'::time, 1 FROM events WHERE slug = 'maraton-posadas-2026'
UNION ALL
SELECT id, '21K', 21.097, 1000, '07:00:00'::time, 2 FROM events WHERE slug = 'maraton-posadas-2026'
UNION ALL
SELECT id, '10K', 10.0, 800, '07:30:00'::time, 3 FROM events WHERE slug = 'maraton-posadas-2026'
UNION ALL
SELECT id, '5K participativo', 5.0, 400, '08:00:00'::time, 4 FROM events WHERE slug = 'maraton-posadas-2026';

-- Distancias — Iguazú Trail
INSERT INTO event_distances (event_id, name, distance_km, capacity, start_time, sort_order)
SELECT id, 'Trail 21K', 21.0, 200, '06:30:00'::time, 1 FROM events WHERE slug = 'iguazu-trail-21k'
UNION ALL
SELECT id, 'Trail 12K', 12.0, 300, '07:00:00'::time, 2 FROM events WHERE slug = 'iguazu-trail-21k';

-- Distancias — San Ignacio Night Run
INSERT INTO event_distances (event_id, name, distance_km, capacity, start_time, sort_order)
SELECT id, '10K', 10.0, 600, '20:00:00'::time, 1 FROM events WHERE slug = 'san-ignacio-night-run-10k'
UNION ALL
SELECT id, '5K', 5.0, 400, '20:30:00'::time, 2 FROM events WHERE slug = 'san-ignacio-night-run-10k';

-- Pricing tiers — Maratón Posadas 42K
INSERT INTO pricing_tiers (event_id, distance_id, name, price_ars, starts_at, ends_at, sort_order)
SELECT e.id, d.id, 'Early Bird', 25000, '2026-05-01 00:00:00-03'::timestamptz, '2026-06-30 23:59:59-03'::timestamptz, 1
  FROM events e JOIN event_distances d ON d.event_id = e.id
  WHERE e.slug = 'maraton-posadas-2026' AND d.name = '42K'
UNION ALL
SELECT e.id, d.id, 'Regular', 35000, '2026-07-01 00:00:00-03'::timestamptz, '2026-08-05 23:59:59-03'::timestamptz, 2
  FROM events e JOIN event_distances d ON d.event_id = e.id
  WHERE e.slug = 'maraton-posadas-2026' AND d.name = '42K'
UNION ALL
SELECT e.id, d.id, 'Last Minute', 45000, '2026-08-06 00:00:00-03'::timestamptz, '2026-08-10 23:59:59-03'::timestamptz, 3
  FROM events e JOIN event_distances d ON d.event_id = e.id
  WHERE e.slug = 'maraton-posadas-2026' AND d.name = '42K';

-- Pricing tiers — Maratón Posadas 21K
INSERT INTO pricing_tiers (event_id, distance_id, name, price_ars, starts_at, ends_at, sort_order)
SELECT e.id, d.id, 'Early Bird', 15000, '2026-05-01 00:00:00-03'::timestamptz, '2026-06-30 23:59:59-03'::timestamptz, 1
  FROM events e JOIN event_distances d ON d.event_id = e.id
  WHERE e.slug = 'maraton-posadas-2026' AND d.name = '21K'
UNION ALL
SELECT e.id, d.id, 'Regular', 20000, '2026-07-01 00:00:00-03'::timestamptz, '2026-08-05 23:59:59-03'::timestamptz, 2
  FROM events e JOIN event_distances d ON d.event_id = e.id
  WHERE e.slug = 'maraton-posadas-2026' AND d.name = '21K'
UNION ALL
SELECT e.id, d.id, 'Last Minute', 25000, '2026-08-06 00:00:00-03'::timestamptz, '2026-08-10 23:59:59-03'::timestamptz, 3
  FROM events e JOIN event_distances d ON d.event_id = e.id
  WHERE e.slug = 'maraton-posadas-2026' AND d.name = '21K';

-- Pricing tiers — Maratón Posadas 10K
INSERT INTO pricing_tiers (event_id, distance_id, name, price_ars, starts_at, ends_at, sort_order)
SELECT e.id, d.id, 'Early Bird', 8000, '2026-05-01 00:00:00-03'::timestamptz, '2026-06-30 23:59:59-03'::timestamptz, 1
  FROM events e JOIN event_distances d ON d.event_id = e.id
  WHERE e.slug = 'maraton-posadas-2026' AND d.name = '10K'
UNION ALL
SELECT e.id, d.id, 'Regular', 12000, '2026-07-01 00:00:00-03'::timestamptz, '2026-08-05 23:59:59-03'::timestamptz, 2
  FROM events e JOIN event_distances d ON d.event_id = e.id
  WHERE e.slug = 'maraton-posadas-2026' AND d.name = '10K'
UNION ALL
SELECT e.id, d.id, 'Last Minute', 15000, '2026-08-06 00:00:00-03'::timestamptz, '2026-08-10 23:59:59-03'::timestamptz, 3
  FROM events e JOIN event_distances d ON d.event_id = e.id
  WHERE e.slug = 'maraton-posadas-2026' AND d.name = '10K';

-- Pricing tiers — Iguazú Trail 21K
INSERT INTO pricing_tiers (event_id, distance_id, name, price_ars, starts_at, ends_at, sort_order)
SELECT e.id, d.id, 'Early Bird', 18000, '2026-05-15 00:00:00-03'::timestamptz, '2026-07-31 23:59:59-03'::timestamptz, 1
  FROM events e JOIN event_distances d ON d.event_id = e.id
  WHERE e.slug = 'iguazu-trail-21k' AND d.name = 'Trail 21K'
UNION ALL
SELECT e.id, d.id, 'Regular', 25000, '2026-08-01 00:00:00-03'::timestamptz, '2026-09-15 23:59:59-03'::timestamptz, 2
  FROM events e JOIN event_distances d ON d.event_id = e.id
  WHERE e.slug = 'iguazu-trail-21k' AND d.name = 'Trail 21K';

-- Pricing tiers — San Ignacio Night Run 10K
INSERT INTO pricing_tiers (event_id, distance_id, name, price_ars, starts_at, ends_at, sort_order)
SELECT e.id, d.id, 'Early Bird', 6000, '2026-06-01 00:00:00-03'::timestamptz, '2026-09-30 23:59:59-03'::timestamptz, 1
  FROM events e JOIN event_distances d ON d.event_id = e.id
  WHERE e.slug = 'san-ignacio-night-run-10k' AND d.name = '10K'
UNION ALL
SELECT e.id, d.id, 'Regular', 9000, '2026-10-01 00:00:00-03'::timestamptz, '2026-11-01 23:59:59-03'::timestamptz, 2
  FROM events e JOIN event_distances d ON d.event_id = e.id
  WHERE e.slug = 'san-ignacio-night-run-10k' AND d.name = '10K';

-- Servicios complementarios — Maratón Posadas
INSERT INTO complementary_services (event_id, category, partner_name, title, description, price_from, contact_method, contact_value, display_order)
SELECT id, 'hospedaje', 'Hotel Continental Posadas', '2 noches en habitación doble',
       'A 3km de la largada, desayuno incluido, check-in temprano el día de la carrera', 85000, 'email', 'reservas@hotelcontinental.com.ar', 1
  FROM events WHERE slug = 'maraton-posadas-2026'
UNION ALL
SELECT id, 'transporte', 'Combis Misionero', 'Traslado aeropuerto / hotel / largada',
       'Servicio puerta a puerta, mínimo 4 personas', 12000, 'whatsapp', '+5493764123456', 2
  FROM events WHERE slug = 'maraton-posadas-2026'
UNION ALL
SELECT id, 'comida', 'Pasta Party Casa Italia', 'Cena pre-carrera (sábado 19hs)',
       'Menú alto en carbohidratos, opciones vegetarianas y celíacas', 8500, 'form', NULL, 3
  FROM events WHERE slug = 'maraton-posadas-2026'
UNION ALL
SELECT id, 'wellness', 'Kine Sport Posadas', 'Masaje deportivo post-carrera',
       'Recuperación de 30min con kinesiólogo matriculado', 15000, 'whatsapp', '+5493764987654', 4
  FROM events WHERE slug = 'maraton-posadas-2026'
UNION ALL
SELECT id, 'experiencia', 'Selva Adventure', 'Excursión Cataratas (lunes post-carrera)',
       'Día completo con almuerzo incluido', 45000, 'email', 'info@selvaadventure.com', 5
  FROM events WHERE slug = 'maraton-posadas-2026';
