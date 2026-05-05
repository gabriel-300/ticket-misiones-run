-- Allow pending orders without a payway transaction ID (assigned in Block 6)
ALTER TABLE orders ALTER COLUMN payway_site_transaction_id DROP NOT NULL;

-- Add registration_id to orders for the circular FK (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'registration_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN registration_id UUID REFERENCES registrations(id);
  END IF;
END
$$;

-- Atomic: update profile snapshot + create registration + create pending order
CREATE OR REPLACE FUNCTION create_registration_with_order(
  p_event_id UUID,
  p_distance_id UUID,
  p_user_id UUID,
  -- profile updates
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
  FROM event_distances
  WHERE id = p_distance_id
    AND active = TRUE
    AND (capacity IS NULL OR registered_count < capacity)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cupos agotados para esta distancia';
  END IF;

  -- Check not already registered
  IF EXISTS (SELECT 1 FROM registrations WHERE event_id = p_event_id AND runner_id = p_user_id) THEN
    RAISE EXCEPTION 'Ya estás inscripto en este evento';
  END IF;

  -- Get active pricing tier
  SELECT id, price_ars INTO v_tier_id, v_price
  FROM pricing_tiers
  WHERE distance_id = p_distance_id
    AND active = TRUE
    AND NOW() BETWEEN starts_at AND ends_at
  ORDER BY sort_order
  LIMIT 1;

  IF v_price IS NULL THEN
    RAISE EXCEPTION 'No hay precio activo para esta distancia';
  END IF;

  -- Compute fees
  SELECT service_fee_percentage INTO v_fee_pct FROM events WHERE id = p_event_id;
  v_service_fee := ROUND(v_price * COALESCE(v_fee_pct, 0) / 100, 2);
  v_total := v_price + v_service_fee;

  -- Assign bib number
  SELECT COALESCE(MAX(bib_number), 0) + 1 INTO v_bib
  FROM registrations WHERE event_id = p_event_id;

  -- Update profile with collected data
  UPDATE profiles SET
    first_name = p_first_name,
    last_name = p_last_name,
    phone = p_phone,
    birth_date = p_birth_date,
    gender = p_gender,
    dni_type = p_dni_type,
    dni = p_dni,
    nationality = p_nationality,
    shirt_size = p_shirt_size,
    blood_type = p_blood_type,
    medical_conditions = p_medical_conditions,
    emergency_contact = jsonb_build_object(
      'name', p_emergency_contact_name,
      'phone', p_emergency_contact_phone
    ),
    apto_medico_url = COALESCE(p_medical_certificate_url, apto_medico_url),
    apto_medico_status = CASE
      WHEN p_medical_certificate_url IS NOT NULL THEN 'pendiente'
      ELSE apto_medico_status
    END,
    marketing_consent = p_accepts_image_rights,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Create pending order (no Payway ID yet — assigned in Block 6)
  INSERT INTO orders (
    buyer_id, items, total_amount, currency, status
  ) VALUES (
    p_user_id,
    jsonb_build_array(jsonb_build_object(
      'type', 'registration',
      'event_id', p_event_id,
      'distance_id', p_distance_id,
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
    event_id, distance_id, pricing_tier_id, runner_id, order_id,
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
      'accepted_at', NOW(),
      'ip', NULL
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
  UPDATE event_distances SET registered_count = registered_count + 1 WHERE id = p_distance_id;

  RETURN json_build_object(
    'registration_id', v_registration_id,
    'order_id', v_order_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION create_registration_with_order TO authenticated;
