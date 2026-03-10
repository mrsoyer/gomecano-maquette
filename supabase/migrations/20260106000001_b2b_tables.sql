-- Session B2B: Tables principales
-- Project: Gomecano (ymkdslderliwjuipeisz)
-- Created: 2026-01-06

-- ============================================
-- TABLE: company_accounts
-- ============================================

CREATE TABLE company_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  siret TEXT UNIQUE,
  logo_url TEXT,
  industry TEXT,
  size TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE company_accounts IS 'Comptes entreprises B2B pour gestion de flotte';

CREATE UNIQUE INDEX idx_company_accounts_slug ON company_accounts(slug);
CREATE UNIQUE INDEX idx_company_accounts_siret ON company_accounts(siret) WHERE siret IS NOT NULL;
CREATE INDEX idx_company_accounts_industry ON company_accounts(industry);

-- ============================================
-- TABLE: company_sites
-- ============================================

CREATE TABLE company_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address JSONB NOT NULL,
  location GEOGRAPHY(POINT),
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  phone TEXT,
  email TEXT,
  is_main BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE company_sites IS 'Sites/établissements des entreprises B2B';

CREATE INDEX idx_company_sites_company ON company_sites(company_id);
CREATE INDEX idx_company_sites_manager ON company_sites(manager_id);
CREATE INDEX idx_company_sites_location ON company_sites USING GIST(location);
CREATE UNIQUE INDEX idx_company_sites_main ON company_sites(company_id) WHERE is_main = true;

-- ============================================
-- TABLE: company_users
-- ============================================

CREATE TABLE company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company_accounts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role company_role NOT NULL DEFAULT 'driver',
  assigned_sites UUID[] DEFAULT ARRAY[]::UUID[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, profile_id)
);

COMMENT ON TABLE company_users IS 'Utilisateurs membres des entreprises B2B';

CREATE INDEX idx_company_users_company ON company_users(company_id);
CREATE INDEX idx_company_users_profile ON company_users(profile_id);
CREATE INDEX idx_company_users_role ON company_users(role);
CREATE UNIQUE INDEX idx_company_users_unique ON company_users(company_id, profile_id);

-- ============================================
-- TABLE: fleet_vehicles
-- ============================================

CREATE TABLE fleet_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company_accounts(id) ON DELETE CASCADE,
  site_id UUID REFERENCES company_sites(id) ON DELETE SET NULL,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  assigned_driver UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category vehicle_category NOT NULL DEFAULT 'commercial',
  acquisition_date DATE NOT NULL,
  maintenance_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
  status fleet_vehicle_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, vehicle_id)
);

COMMENT ON TABLE fleet_vehicles IS 'Véhicules de flotte B2B avec données gestion';

CREATE INDEX idx_fleet_vehicles_company ON fleet_vehicles(company_id);
CREATE INDEX idx_fleet_vehicles_site ON fleet_vehicles(site_id);
CREATE INDEX idx_fleet_vehicles_vehicle ON fleet_vehicles(vehicle_id);
CREATE INDEX idx_fleet_vehicles_driver ON fleet_vehicles(assigned_driver);
CREATE INDEX idx_fleet_vehicles_status ON fleet_vehicles(status);

-- ============================================
-- TABLE: fleet_appointments
-- ============================================

CREATE TABLE fleet_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES company_accounts(id) ON DELETE CASCADE,
  site_id UUID REFERENCES company_sites(id) ON DELETE SET NULL,
  vehicle_id UUID NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
  group_id UUID,
  purchase_order TEXT,
  cost_center TEXT,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  invoice_company BOOLEAN NOT NULL DEFAULT true,
  notes_internal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE fleet_appointments IS 'RDV maintenance flotte B2B';

CREATE INDEX idx_fleet_appointments_company ON fleet_appointments(company_id);
CREATE INDEX idx_fleet_appointments_site ON fleet_appointments(site_id);
CREATE INDEX idx_fleet_appointments_vehicle ON fleet_appointments(vehicle_id);
CREATE INDEX idx_fleet_appointments_group ON fleet_appointments(group_id);
CREATE INDEX idx_fleet_appointments_appointment ON fleet_appointments(appointment_id);

-- ============================================
-- TABLE: company_billing
-- ============================================

CREATE TABLE company_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES company_accounts(id) ON DELETE CASCADE,
  billing_address JSONB NOT NULL,
  vat_number TEXT,
  payment_terms INTEGER NOT NULL DEFAULT 30,
  payment_method TEXT NOT NULL DEFAULT 'sepa',
  auto_billing BOOLEAN NOT NULL DEFAULT false,
  billing_day INTEGER CHECK (billing_day BETWEEN 1 AND 28),
  billing_contact_email TEXT NOT NULL,
  billing_contact_name TEXT,
  purchase_order_required BOOLEAN NOT NULL DEFAULT false,
  cost_center_required BOOLEAN NOT NULL DEFAULT false,
  stripe_customer_id TEXT,
  sepa_mandate_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE company_billing IS 'Configuration facturation entreprises B2B';

CREATE UNIQUE INDEX idx_company_billing_company ON company_billing(company_id);
CREATE INDEX idx_company_billing_stripe ON company_billing(stripe_customer_id);
CREATE INDEX idx_company_billing_auto ON company_billing(auto_billing, billing_day);

-- ============================================
-- TABLE: company_invoices
-- ============================================

CREATE TABLE company_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES company_accounts(id) ON DELETE CASCADE,
  billing_period_start DATE,
  billing_period_end DATE,
  purchase_orders TEXT[],
  cost_centers TEXT[],
  total_ht DECIMAL(10,2) NOT NULL,
  total_tva DECIMAL(10,2) NOT NULL,
  total_ttc DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  appointment_count INTEGER NOT NULL DEFAULT 1,
  payment_due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE company_invoices IS 'Factures entreprises B2B avec groupage';

CREATE INDEX idx_company_invoices_company ON company_invoices(company_id);
CREATE INDEX idx_company_invoices_period ON company_invoices(billing_period_start, billing_period_end);
CREATE INDEX idx_company_invoices_due ON company_invoices(payment_due_date) WHERE paid_at IS NULL;
CREATE INDEX idx_company_invoices_invoice ON company_invoices(invoice_id);

-- ============================================
-- TABLE: company_analytics
-- ============================================

CREATE TABLE company_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company_accounts(id) ON DELETE CASCADE,
  period_month DATE NOT NULL,
  total_vehicles INTEGER NOT NULL DEFAULT 0,
  total_appointments INTEGER NOT NULL DEFAULT 0,
  completed_appointments INTEGER NOT NULL DEFAULT 0,
  cancelled_appointments INTEGER NOT NULL DEFAULT 0,
  total_spent_ht DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_spent_ttc DECIMAL(10,2) NOT NULL DEFAULT 0,
  average_cost_per_vehicle DECIMAL(10,2) NOT NULL DEFAULT 0,
  average_cost_per_km DECIMAL(6,4) NOT NULL DEFAULT 0,
  total_km_driven INTEGER NOT NULL DEFAULT 0,
  downtime_hours INTEGER NOT NULL DEFAULT 0,
  top_service_category TEXT,
  savings_vs_garage DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, period_month)
);

COMMENT ON TABLE company_analytics IS 'Statistiques et KPIs précalculés B2B';

CREATE UNIQUE INDEX idx_company_analytics_company_period ON company_analytics(company_id, period_month);
CREATE INDEX idx_company_analytics_company ON company_analytics(company_id);
CREATE INDEX idx_company_analytics_period ON company_analytics(period_month);

-- ============================================
-- TRIGGERS: updated_at auto-update
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_accounts_updated_at
  BEFORE UPDATE ON company_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_sites_updated_at
  BEFORE UPDATE ON company_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_users_updated_at
  BEFORE UPDATE ON company_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fleet_vehicles_updated_at
  BEFORE UPDATE ON fleet_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fleet_appointments_updated_at
  BEFORE UPDATE ON fleet_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_billing_updated_at
  BEFORE UPDATE ON company_billing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_invoices_updated_at
  BEFORE UPDATE ON company_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_analytics_updated_at
  BEFORE UPDATE ON company_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
