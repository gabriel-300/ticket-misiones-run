-- ============================================================
-- TICKETMISIONESRUN — Schema inicial Fase 1
-- ============================================================

-- ===== profiles =====
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'runner' CHECK (role IN ('runner', 'admin')),

  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dni TEXT NOT NULL,
  dni_type TEXT NOT NULL DEFAULT 'DNI' CHECK (dni_type IN ('DNI', 'PASAPORTE', 'CI')),
  birth_date DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F', 'X')),
  nationality TEXT NOT NULL DEFAULT 'AR',
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  province TEXT,

  emergency_contact JSONB,
  blood_type TEXT,
  health_insurance JSONB,
  medical_conditions TEXT,

  shirt_size TEXT CHECK (shirt_size IN ('XS','S','M','L','XL','XXL','XXXL')),
  shoe_size TEXT,

  apto_medico_url TEXT,
  apto_medico_issued_at DATE,
  apto_medico_status TEXT DEFAULT 'pendiente' CHECK (apto_medico_status IN ('pendiente','aprobado','rechazado')),
  apto_medico_validated_by UUID REFERENCES auth.users(id),
  apto_medico_validated_at TIMESTAMPTZ,
  apto_medico_rejection_reason TEXT,

  avatar_url TEXT,
  marketing_consent BOOLEAN DEFAULT FALSE,
  data_processing_consent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(dni, dni_type)
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_dni ON profiles(dni);

-- ===== events =====
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'running' CHECK (type IN ('running', 'trail', 'triathlon', 'cycling', 'other')),

  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  registration_opens_at TIMESTAMPTZ NOT NULL,
  registration_closes_at TIMESTAMPTZ NOT NULL,

  location JSONB NOT NULL,
  course_map_url TEXT,
  course_geojson_url TEXT,

  cover_image_url TEXT,
  hero_video_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,

  requires_medical_certificate BOOLEAN NOT NULL DEFAULT TRUE,
  medical_certificate_min_distance_km INT DEFAULT 5,
  custom_fields JSONB DEFAULT '[]'::jsonb,

  terms_url TEXT,
  regulation_url TEXT,
  waiver_text TEXT,

  service_fee_percentage NUMERIC(5,2) NOT NULL DEFAULT 8.00,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','closed','finished','cancelled')),

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_starts_at ON events(starts_at);

-- ===== event_distances =====
CREATE TABLE event_distances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  distance_km NUMERIC(6,2) NOT NULL,
  capacity INT,
  registered_count INT NOT NULL DEFAULT 0,
  start_time TIME,
  age_min INT,
  age_max INT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_distances_event ON event_distances(event_id);

-- ===== pricing_tiers =====
CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  distance_id UUID REFERENCES event_distances(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_ars NUMERIC(12,2) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pricing_tiers_event ON pricing_tiers(event_id);
CREATE INDEX idx_pricing_tiers_distance ON pricing_tiers(distance_id);
CREATE INDEX idx_pricing_tiers_active ON pricing_tiers(active, starts_at, ends_at);

-- ===== coupons =====
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value NUMERIC(12,2) NOT NULL,
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, code)
);

-- ===== registrations =====
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  distance_id UUID NOT NULL REFERENCES event_distances(id),
  pricing_tier_id UUID REFERENCES pricing_tiers(id),
  runner_id UUID NOT NULL REFERENCES profiles(id),

  bib_number INT,
  category TEXT,
  estimated_time INTERVAL,
  team_name TEXT,
  custom_field_values JSONB DEFAULT '{}'::jsonb,

  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN (
    'pending_payment','paid','cancelled','refunded','transferred'
  )),
  order_id UUID,

  acceptance_log JSONB NOT NULL DEFAULT '{}'::jsonb,

  coupon_id UUID REFERENCES coupons(id),
  discount_amount NUMERIC(12,2) DEFAULT 0,

  base_price NUMERIC(12,2) NOT NULL,
  service_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(event_id, runner_id)
);

CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_runner ON registrations(runner_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_bib ON registrations(event_id, bib_number);

-- ===== orders =====
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id),

  items JSONB NOT NULL,

  total_amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',

  payway_site_transaction_id TEXT UNIQUE NOT NULL,
  payway_payment_id TEXT,
  payway_status TEXT,
  payway_response JSONB,
  payway_card_brand TEXT,
  payway_card_last4 TEXT,
  payway_installments INT,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','processing','paid','failed','refunded'
  )),

  paid_at TIMESTAMPTZ,
  failed_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payway_site_tx ON orders(payway_site_transaction_id);

-- FK circular registrations → orders
ALTER TABLE registrations
  ADD CONSTRAINT fk_registrations_order
  FOREIGN KEY (order_id) REFERENCES orders(id);

-- ===== complementary_services =====
CREATE TABLE complementary_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,

  category TEXT NOT NULL CHECK (category IN (
    'hospedaje','comida','transporte','wellness','equipamiento','experiencia','otro'
  )),
  subcategory TEXT,
  partner_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price_from NUMERIC(12,2),
  currency TEXT DEFAULT 'ARS',

  contact_method TEXT NOT NULL DEFAULT 'email' CHECK (contact_method IN ('email','whatsapp','form')),
  contact_value TEXT,

  display_order INT DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_complementary_services_event ON complementary_services(event_id, active);
CREATE INDEX idx_complementary_services_category ON complementary_services(category);

-- ===== service_interests =====
CREATE TABLE service_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES complementary_services(id),
  runner_id UUID NOT NULL REFERENCES profiles(id),

  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new','contacted','converted','declined','closed'
  )),
  contacted_at TIMESTAMPTZ,
  contacted_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_interests_registration ON service_interests(registration_id);
CREATE INDEX idx_service_interests_status ON service_interests(status);

-- ===== email_log =====
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id),
  template TEXT NOT NULL,
  subject TEXT NOT NULL,
  resend_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed','bounced')),
  error TEXT,
  related_registration_id UUID REFERENCES registrations(id),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_log_status ON email_log(status);

-- ===== Storage Buckets =====
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-certs', 'medical-certs', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true);
