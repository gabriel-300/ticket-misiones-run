-- ============================================================
-- TICKET MISIONES RUN — Grants explícitos
-- Requerido a partir del cambio de Supabase (oct 2026)
-- ============================================================

-- ── anon: solo lectura en tablas públicas ────────────────────
GRANT SELECT ON public.events                    TO anon;
GRANT SELECT ON public.ticket_types              TO anon;
GRANT SELECT ON public.pricing_tiers             TO anon;
GRANT SELECT ON public.coupons                   TO anon;
GRANT SELECT ON public.complementary_services    TO anon;
GRANT SELECT ON public.organizations             TO anon;

-- ── authenticated: operaciones según rol (RLS las restringe) ─
GRANT SELECT, INSERT, UPDATE          ON public.profiles               TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.events                 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.ticket_types           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.pricing_tiers          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.coupons                TO authenticated;
GRANT SELECT, INSERT, UPDATE          ON public.registrations          TO authenticated;
GRANT SELECT, INSERT, UPDATE          ON public.orders                 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.complementary_services TO authenticated;
GRANT SELECT, INSERT                  ON public.service_interests      TO authenticated;
GRANT SELECT                          ON public.email_log              TO authenticated;
GRANT SELECT, INSERT, UPDATE          ON public.organizations          TO authenticated;

-- ── service_role: acceso total para Edge Functions ───────────
GRANT ALL ON public.profiles               TO service_role;
GRANT ALL ON public.events                 TO service_role;
GRANT ALL ON public.ticket_types           TO service_role;
GRANT ALL ON public.pricing_tiers          TO service_role;
GRANT ALL ON public.coupons                TO service_role;
GRANT ALL ON public.registrations          TO service_role;
GRANT ALL ON public.orders                 TO service_role;
GRANT ALL ON public.complementary_services TO service_role;
GRANT ALL ON public.service_interests      TO service_role;
GRANT ALL ON public.email_log              TO service_role;
GRANT ALL ON public.organizations          TO service_role;
