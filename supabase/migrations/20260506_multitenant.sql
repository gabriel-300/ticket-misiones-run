-- ============================================================
-- Misiona Hub — Multi-tenant platform migration
-- Run this in the Supabase SQL editor
-- ============================================================

-- ── 1. Organizations ─────────────────────────────────────────
CREATE TABLE organizations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT        NOT NULL,
  slug              TEXT        UNIQUE NOT NULL,
  description       TEXT,
  logo_url          TEXT,
  website_url       TEXT,
  contact_email     TEXT        NOT NULL,
  phone             TEXT,
  owner_id          UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  commission_rate   NUMERIC(5,2) NOT NULL DEFAULT 8.00,
  status            TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'active', 'suspended')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Link events to organizations ──────────────────────────
ALTER TABLE events
  ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- ── 3. Rename event_distances → ticket_types ─────────────────
-- (FK references update automatically in PostgreSQL)
ALTER TABLE event_distances RENAME TO ticket_types;

-- distance_km is optional for non-sports events
ALTER TABLE ticket_types ALTER COLUMN distance_km DROP NOT NULL;
ALTER TABLE ticket_types ALTER COLUMN distance_km SET DEFAULT NULL;

-- ── 4. Update registrations columns ──────────────────────────
ALTER TABLE registrations RENAME COLUMN runner_id    TO buyer_id;
ALTER TABLE registrations RENAME COLUMN distance_id  TO ticket_type_id;

-- ── 5. Update pricing_tiers column ───────────────────────────
ALTER TABLE pricing_tiers RENAME COLUMN distance_id TO ticket_type_id;

-- ── 6. Add organization_id to complementary_services ─────────
ALTER TABLE complementary_services
  ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- ── 7. Update profile roles ───────────────────────────────────
-- runner → buyer, admin → super_admin
UPDATE profiles SET role = 'buyer'       WHERE role = 'runner';
UPDATE profiles SET role = 'super_admin' WHERE role = 'admin';

-- ── 8. Trigger: organizations.updated_at ─────────────────────
-- Reuse existing function if present, otherwise create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 9. DB helper functions ────────────────────────────────────
CREATE OR REPLACE FUNCTION is_super_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = uid AND role = 'super_admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_organizer(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = uid AND role IN ('organizer', 'super_admin')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Keep is_admin as alias for existing RLS policies
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT is_super_admin(uid);
$$ LANGUAGE SQL SECURITY DEFINER;

-- ── 10. RLS: organizations ────────────────────────────────────
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin: full access"
  ON organizations FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "organizer: view own org"
  ON organizations FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "organizer: update own org"
  ON organizations FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "public: view active orgs"
  ON organizations FOR SELECT
  USING (status = 'active');

-- ── 11. RLS: events — add organizer access ────────────────────
-- Organizer can manage events belonging to their organization
CREATE POLICY "organizer: manage own events"
  ON events FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- ── 12. RLS: ticket_types — organizer access ──────────────────
CREATE POLICY "organizer: manage own ticket_types"
  ON ticket_types FOR ALL
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organizations o ON e.organization_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organizations o ON e.organization_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  );

-- ── 13. Seed: Misiona Hub as first organization ───────────────
-- Run manually after confirming the super_admin user's profile id
-- INSERT INTO organizations (name, slug, contact_email, status, commission_rate)
-- VALUES ('Misiona Hub', 'misiona-hub', 'hola@misionahub.com', 'active', 0.00);
