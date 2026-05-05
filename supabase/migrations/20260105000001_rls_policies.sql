-- ============================================================
-- TICKETMISIONESRUN — RLS Policies + Storage Policies
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_distances ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE complementary_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Helper: verifica si el usuario autenticado es admin
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = uid AND role = 'admin'
  );
$$;

-- ===== profiles =====
CREATE POLICY "users_select_own_profile" ON profiles FOR SELECT
  USING (id = auth.uid());
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE
  USING (id = auth.uid());
CREATE POLICY "users_insert_own_profile" ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());
CREATE POLICY "admin_full_profiles" ON profiles FOR ALL
  USING (is_admin(auth.uid()));

-- ===== events =====
CREATE POLICY "anyone_select_published_events" ON events FOR SELECT
  USING (status = 'published' OR is_admin(auth.uid()));
CREATE POLICY "admin_full_events" ON events FOR ALL
  USING (is_admin(auth.uid()));

-- ===== event_distances =====
CREATE POLICY "anyone_select_active_distances" ON event_distances FOR SELECT
  USING (active = TRUE OR is_admin(auth.uid()));
CREATE POLICY "admin_full_distances" ON event_distances FOR ALL
  USING (is_admin(auth.uid()));

-- ===== pricing_tiers =====
CREATE POLICY "anyone_select_active_tiers" ON pricing_tiers FOR SELECT
  USING (active = TRUE OR is_admin(auth.uid()));
CREATE POLICY "admin_full_tiers" ON pricing_tiers FOR ALL
  USING (is_admin(auth.uid()));

-- ===== coupons =====
CREATE POLICY "anyone_select_active_coupons" ON coupons FOR SELECT
  USING (active = TRUE OR is_admin(auth.uid()));
CREATE POLICY "admin_full_coupons" ON coupons FOR ALL
  USING (is_admin(auth.uid()));

-- ===== registrations =====
CREATE POLICY "runners_select_own_registrations" ON registrations FOR SELECT
  USING (runner_id = auth.uid());
CREATE POLICY "runners_insert_own_registration" ON registrations FOR INSERT
  WITH CHECK (runner_id = auth.uid());
CREATE POLICY "runners_update_own_registration" ON registrations FOR UPDATE
  USING (runner_id = auth.uid() AND status IN ('pending_payment'));
CREATE POLICY "admin_full_registrations" ON registrations FOR ALL
  USING (is_admin(auth.uid()));

-- ===== orders =====
CREATE POLICY "buyers_select_own_orders" ON orders FOR SELECT
  USING (buyer_id = auth.uid());
CREATE POLICY "buyers_insert_own_order" ON orders FOR INSERT
  WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "admin_full_orders" ON orders FOR ALL
  USING (is_admin(auth.uid()));

-- ===== complementary_services =====
CREATE POLICY "anyone_select_active_services" ON complementary_services FOR SELECT
  USING (active = TRUE OR is_admin(auth.uid()));
CREATE POLICY "admin_full_services" ON complementary_services FOR ALL
  USING (is_admin(auth.uid()));

-- ===== service_interests =====
CREATE POLICY "runners_select_own_interests" ON service_interests FOR SELECT
  USING (runner_id = auth.uid());
CREATE POLICY "runners_insert_own_interest" ON service_interests FOR INSERT
  WITH CHECK (runner_id = auth.uid());
CREATE POLICY "admin_full_interests" ON service_interests FOR ALL
  USING (is_admin(auth.uid()));

-- ===== email_log =====
CREATE POLICY "users_select_own_emails" ON email_log FOR SELECT
  USING (recipient_user_id = auth.uid());
CREATE POLICY "admin_full_emails" ON email_log FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================================
-- Storage Policies
-- ============================================================

-- avatars: cualquiera lee, sólo el dueño escribe
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- event-images: cualquiera lee, sólo admin escribe
CREATE POLICY "Event images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'event-images');
CREATE POLICY "Admins can upload event images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-images' AND is_admin(auth.uid()));

-- medical-certs: PRIVADO — sólo dueño y admin
CREATE POLICY "Users can upload their own medical cert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'medical-certs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can read their own medical cert"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'medical-certs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can read all medical certs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'medical-certs' AND is_admin(auth.uid()));

-- service-images: cualquiera lee, sólo admin escribe
CREATE POLICY "Service images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
CREATE POLICY "Admins can manage service images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'service-images' AND is_admin(auth.uid()));
