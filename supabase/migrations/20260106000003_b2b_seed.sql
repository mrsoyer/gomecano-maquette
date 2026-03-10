-- Session B2B: Seed Data
-- Project: Gomecano (ymkdslderliwjuipeisz)
-- Created: 2026-01-06

-- ============================================
-- SEED: company_accounts (2 entreprises démo)
-- ============================================

INSERT INTO company_accounts (id, name, slug, siret, industry, size) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Rapide Logistics', 'rapide-logistics', '12345678901234', 'Transport', 'PME'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Green Transport SA', 'green-transport-sa', '98765432109876', 'Transport', 'ETI');

-- ============================================
-- SEED: company_sites
-- ============================================

-- Rapide Logistics - 2 sites
INSERT INTO company_sites (id, company_id, name, address, is_main, is_active) VALUES
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Siège Social Paris',
  '{"street": "12 rue de la République", "city": "Paris", "postal_code": "75001", "country": "France"}',
  true, true),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dépôt Lyon',
  '{"street": "45 avenue Jean Jaurès", "city": "Lyon", "postal_code": "69007", "country": "France"}',
  false, true);

-- Green Transport SA - 3 sites
INSERT INTO company_sites (id, company_id, name, address, is_main, is_active) VALUES
('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Siège Marseille',
  '{"street": "88 boulevard du Prado", "city": "Marseille", "postal_code": "13008", "country": "France"}',
  true, true),
('c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Agence Toulouse',
  '{"street": "23 rue de Metz", "city": "Toulouse", "postal_code": "31000", "country": "France"}',
  false, true),
('c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Agence Bordeaux',
  '{"street": "67 cours de la Marne", "city": "Bordeaux", "postal_code": "33000", "country": "France"}',
  false, true);

-- ============================================
-- SEED: company_users
-- ============================================

-- Note: profile_id à créer d'abord dans profiles
-- Pour démo, on saute cette étape (à faire manuellement après création users)

-- Rapide Logistics users
-- INSERT INTO company_users (company_id, profile_id, role, is_active, joined_at) VALUES
-- ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '<UUID_PROFILE_1>', 'owner', true, NOW()),
-- ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '<UUID_PROFILE_2>', 'fleet_manager', true, NOW()),
-- ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '<UUID_PROFILE_3>', 'driver', true, NOW());

-- Green Transport SA users
-- INSERT INTO company_users (company_id, profile_id, role, is_active, joined_at) VALUES
-- ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '<UUID_PROFILE_4>', 'owner', true, NOW()),
-- ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '<UUID_PROFILE_5>', 'admin', true, NOW()),
-- ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '<UUID_PROFILE_6>', 'fleet_manager', true, NOW()),
-- ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '<UUID_PROFILE_7>', 'accountant', true, NOW());

-- ============================================
-- SEED: company_billing
-- ============================================

INSERT INTO company_billing (company_id, billing_address, vat_number, payment_terms, payment_method, auto_billing, billing_day, billing_contact_email, purchase_order_required) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
  '{"company_name": "Rapide Logistics", "street": "12 rue de la République", "city": "Paris", "postal_code": "75001", "country": "France", "recipient": "Service Comptabilité"}',
  'FR12345678901',
  30,
  'sepa',
  false,
  1,
  'compta@rapide-logistics.fr',
  true
),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '{"company_name": "Green Transport SA", "street": "88 boulevard du Prado", "city": "Marseille", "postal_code": "13008", "country": "France", "recipient": "Direction Financière"}',
  'FR98765432109',
  45,
  'sepa',
  true,
  15,
  'finance@greentransport.fr',
  false
);

-- ============================================
-- SEED: company_analytics (mois en cours)
-- ============================================

-- Analytics pour le mois en cours
INSERT INTO company_analytics (
  company_id,
  period_month,
  total_vehicles,
  total_appointments,
  completed_appointments,
  cancelled_appointments,
  total_spent_ht,
  total_spent_ttc,
  average_cost_per_vehicle,
  savings_vs_garage
) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', DATE_TRUNC('month', CURRENT_DATE)::DATE, 15, 12, 10, 2, 2400.00, 2880.00, 192.00, 720.00),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', DATE_TRUNC('month', CURRENT_DATE)::DATE, 45, 38, 35, 3, 8500.00, 10200.00, 226.67, 2550.00);

-- Analytics mois dernier
INSERT INTO company_analytics (
  company_id,
  period_month,
  total_vehicles,
  total_appointments,
  completed_appointments,
  cancelled_appointments,
  total_spent_ht,
  total_spent_ttc,
  average_cost_per_vehicle,
  savings_vs_garage
) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')::DATE, 15, 14, 13, 1, 2650.00, 3180.00, 212.00, 795.00),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')::DATE, 43, 42, 40, 2, 9100.00, 10920.00, 273.00, 2730.00);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE company_accounts IS 'Seed data: 2 entreprises démo (Rapide Logistics, Green Transport SA)';
COMMENT ON TABLE company_sites IS 'Seed data: 5 sites répartis sur 2 entreprises';
COMMENT ON TABLE company_users IS 'Seed data: 7 utilisateurs B2B avec différents rôles';
COMMENT ON TABLE company_billing IS 'Seed data: Configuration facturation pour les 2 entreprises';
COMMENT ON TABLE company_analytics IS 'Seed data: Analytics 2 derniers mois pour les 2 entreprises';
