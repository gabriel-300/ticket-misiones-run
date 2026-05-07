-- Fix 1: handle_new_user — usa UUID como DNI placeholder (evita colisión UNIQUE)
-- y role = 'buyer' (nombre actual tras la migración multitenant).
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, first_name, last_name, dni, dni_type, birth_date, gender, phone)
  VALUES (
    NEW.id,
    'buyer',
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'first_name', ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'last_name',  ''), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'dni', ''), NEW.id::text),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'dni_type', ''), 'DNI'),
    COALESCE((NULLIF(NEW.raw_user_meta_data->>'birth_date', ''))::date, '1990-01-01'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'gender', ''), 'M'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill: crea perfiles para usuarios de auth que no tienen fila en profiles.
INSERT INTO profiles (id, role, first_name, last_name, dni, dni_type, birth_date, gender, phone)
SELECT
  u.id,
  'buyer',
  '',
  '',
  u.id::text,
  'DNI',
  '1990-01-01',
  'M',
  ''
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- Fix 2: create_registration_with_order — reemplaza UPDATE profiles por UPSERT
-- para que funcione aunque el trigger haya fallado al crear la sesión.
-- Usa los nombres de columna correctos tras la migración multitenant:
-- ticket_types (ex event_distances), ticket_type_id (ex distance_id), buyer_id (ex runner_id).
CREATE OR REPLACE FUNCTION create_registration_with_order(
  p_event_id UUID,
  p_distance_id UUID,   -- parámetro mantenido para compatibilidad con el frontend
  p_user_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT,
  p_birth_date DATE,
  p_gender TEXT,
  p_dni_type TEXT,
  p_dni TEXT,
  p_nationality TEXT,
  p_shirt_size TEXT,
  p_is_first_race BOOLEAN,
  p_club TEXT,
  p_emergency_contact_name TEXT,
  p_emergency_contact_phone TEXT,
  p_blood_type TEXT,
  p_medical_conditions TEXT,
  p_allergies TEXT,
  p_medical_certificate_url TEXT,
  p_accepts_image_rights BOOLEAN,
  p_category TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_registration_id UUID;
  v_order_id UUID;
  v_price NUMERIC;
  v_tier_id UUID;
  v_fee_pct NUMERIC;
  v_service_fee NUMERIC;
  v_total NUMERIC;
  v_bib INT;
BEGIN
  -- Check capacity with row lock
  PERFORM 1
  FROM ticket_types
  WHERE id = p_distance_id
    AND active = TRUE
    AND (capacity IS NULL OR registered_count < capacity)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cupos agotados para esta entrada';
  END IF;

  -- Check not already registered
  IF EXISTS (
    SELECT 1 FROM registrations
    WHERE event_id = p_event_id AND buyer_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Ya estás inscripto en este evento';
  END IF;

  -- Get active pricing tier
  SELECT id, price_ars INTO v_tier_id, v_price
  FROM pricing_tiers
  WHERE ticket_type_id = p_distance_id
    AND active = TRUE
    AND NOW() BETWEEN starts_at AND ends_at
  ORDER BY sort_order
  LIMIT 1;

  IF v_price IS NULL THEN
    RAISE EXCEPTION 'No hay precio activo para esta entrada';
  END IF;

  -- Compute fees
  SELECT service_fee_percentage INTO v_fee_pct FROM events WHERE id = p_event_id;
  v_service_fee := ROUND(v_price * COALESCE(v_fee_pct, 0) / 100, 2);
  v_total := v_price + v_service_fee;

  -- Assign bib number
  SELECT COALESCE(MAX(bib_number), 0) + 1 INTO v_bib
  FROM registrations WHERE event_id = p_event_id;

  -- Upsert profile: crea la fila si el trigger falló, actualiza si ya existe.
  INSERT INTO profiles (
    id, role, first_name, last_name, phone, birth_date, gender,
    dni_type, dni, nationality, shirt_size, blood_type, medical_conditions,
    emergency_contact, apto_medico_url, apto_medico_status,
    marketing_consent, updated_at
  ) VALUES (
    p_user_id, 'buyer', p_first_name, p_last_name, p_phone, p_birth_date, p_gender,
    p_dni_type, p_dni, p_nationality, p_shirt_size, p_blood_type, p_medical_conditions,
    jsonb_build_object('name', p_emergency_contact_name, 'phone', p_emergency_contact_phone),
    p_medical_certificate_url,
    CASE WHEN p_medical_certificate_url IS NOT NULL THEN 'pendiente' ELSE 'pendiente' END,
    p_accepts_image_rights, NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name         = EXCLUDED.first_name,
    last_name          = EXCLUDED.last_name,
    phone              = EXCLUDED.phone,
    birth_date         = EXCLUDED.birth_date,
    gender             = EXCLUDED.gender,
    dni_type           = EXCLUDED.dni_type,
    dni                = EXCLUDED.dni,
    nationality        = EXCLUDED.nationality,
    shirt_size         = EXCLUDED.shirt_size,
    blood_type         = EXCLUDED.blood_type,
    medical_conditions = EXCLUDED.medical_conditions,
    emergency_contact  = EXCLUDED.emergency_contact,
    apto_medico_url    = COALESCE(EXCLUDED.apto_medico_url, profiles.apto_medico_url),
    apto_medico_status = CASE
      WHEN EXCLUDED.apto_medico_url IS NOT NULL THEN 'pendiente'
      ELSE profiles.apto_medico_status
    END,
    marketing_consent  = EXCLUDED.marketing_consent,
    updated_at         = NOW();

  -- Create pending order
  INSERT INTO orders (
    buyer_id, items, total_amount, currency, status
  ) VALUES (
    p_user_id,
    jsonb_build_array(jsonb_build_object(
      'type', 'registration',
      'event_id', p_event_id,
      'ticket_type_id', p_distance_id,
      'base_price', v_price,
      'service_fee', v_service_fee,
      'is_first_race', p_is_first_race,
      'club', p_club,
      'allergies', p_allergies
    )),
    v_total, 'ARS', 'pending'
  )
  RETURNING id INTO v_order_id;

  -- Create registration
  INSERT INTO registrations (
    event_id, ticket_type_id, pricing_tier_id, buyer_id, order_id,
    bib_number, category,
    base_price, service_fee, total_amount,
    acceptance_log,
    custom_field_values,
    status
  ) VALUES (
    p_event_id, p_distance_id, v_tier_id, p_user_id, v_order_id,
    v_bib, p_category,
    v_price, v_service_fee, v_total,
    jsonb_build_object(
      'accepts_terms', TRUE,
      'accepts_waiver', TRUE,
      'accepts_image_rights', p_accepts_image_rights,
      'accepted_at', NOW()
    ),
    jsonb_build_object(
      'is_first_race', p_is_first_race,
      'club', p_club,
      'allergies', p_allergies,
      'shirt_size', p_shirt_size
    ),
    'pending_payment'
  )
  RETURNING id INTO v_registration_id;

  -- Link order back to registration
  UPDATE orders SET registration_id = v_registration_id WHERE id = v_order_id;

  -- Increment registered_count
  UPDATE ticket_types SET registered_count = registered_count + 1 WHERE id = p_distance_id;

  RETURN json_build_object(
    'registration_id', v_registration_id,
    'order_id', v_order_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION create_registration_with_order TO authenticated;
