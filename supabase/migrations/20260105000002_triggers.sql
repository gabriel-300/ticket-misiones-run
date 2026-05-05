-- ============================================================
-- TICKETMISIONESRUN — Triggers
-- ============================================================

-- Auto-actualizar updated_at en tablas que lo tienen
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_events
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_registrations
  BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Incrementar/decrementar registered_count al cambiar estado de inscripción
CREATE OR REPLACE FUNCTION increment_registered_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    UPDATE event_distances SET registered_count = registered_count + 1
    WHERE id = NEW.distance_id;
  ELSIF OLD.status = 'paid' AND NEW.status != 'paid' THEN
    UPDATE event_distances SET registered_count = registered_count - 1
    WHERE id = NEW.distance_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registered_count
  AFTER INSERT OR UPDATE OF status ON registrations
  FOR EACH ROW EXECUTE FUNCTION increment_registered_count();

-- Crear profile automáticamente cuando se registra un nuevo usuario en auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name, dni, dni_type, birth_date, gender, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'dni', ''),
    COALESCE(NEW.raw_user_meta_data->>'dni_type', 'DNI'),
    COALESCE((NEW.raw_user_meta_data->>'birth_date')::date, '1990-01-01'),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'M'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
