-- Session B2B: Row Level Security Policies
-- Project: Gomecano (ymkdslderliwjuipeisz)
-- Created: 2026-01-06

-- ============================================
-- ENABLE RLS ON ALL B2B TABLES
-- ============================================

ALTER TABLE company_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: company_accounts
-- ============================================

-- SELECT: Membres de l'entreprise + admin
CREATE POLICY "company_accounts_select" ON company_accounts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_accounts.id
    AND cu.profile_id = auth.uid()
    AND cu.is_active = true
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- INSERT: Admin uniquement (création compte)
CREATE POLICY "company_accounts_insert" ON company_accounts
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- UPDATE: Owner/admin entreprise + admin global
CREATE POLICY "company_accounts_update" ON company_accounts
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_accounts.id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin')
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- DELETE: Admin global uniquement
CREATE POLICY "company_accounts_delete" ON company_accounts
FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- POLICIES: company_sites
-- ============================================

-- SELECT: Utilisateurs de l'entreprise
CREATE POLICY "company_sites_select" ON company_sites
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_sites.company_id
    AND cu.profile_id = auth.uid()
    AND cu.is_active = true
  )
);

-- INSERT: Admin/owner entreprise
CREATE POLICY "company_sites_insert" ON company_sites
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_sites.company_id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin')
  )
);

-- UPDATE: Admin/owner ou responsable du site
CREATE POLICY "company_sites_update" ON company_sites
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_sites.company_id
    AND cu.profile_id = auth.uid()
    AND (cu.role IN ('owner', 'admin') OR company_sites.manager_id = auth.uid())
  )
);

-- DELETE: Admin/owner uniquement
CREATE POLICY "company_sites_delete" ON company_sites
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_sites.company_id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin')
  )
);

-- ============================================
-- POLICIES: company_users
-- ============================================

-- SELECT: Utilisateurs de l'entreprise
CREATE POLICY "company_users_select" ON company_users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_users.company_id
    AND cu.profile_id = auth.uid()
    AND cu.is_active = true
  )
);

-- INSERT: Admin/owner entreprise
CREATE POLICY "company_users_insert" ON company_users
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_users.company_id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin')
  )
);

-- UPDATE: Admin/owner entreprise
CREATE POLICY "company_users_update" ON company_users
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_users.company_id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin')
  )
);

-- DELETE: Admin/owner entreprise
CREATE POLICY "company_users_delete" ON company_users
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_users.company_id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin')
  )
);

-- ============================================
-- POLICIES: fleet_vehicles
-- ============================================

-- SELECT: Utilisateurs de l'entreprise
CREATE POLICY "fleet_vehicles_select" ON fleet_vehicles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = fleet_vehicles.company_id
    AND cu.profile_id = auth.uid()
    AND cu.is_active = true
  )
);

-- INSERT: Fleet manager + admin
CREATE POLICY "fleet_vehicles_insert" ON fleet_vehicles
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = fleet_vehicles.company_id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin', 'fleet_manager')
  )
);

-- UPDATE: Fleet manager + admin
CREATE POLICY "fleet_vehicles_update" ON fleet_vehicles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = fleet_vehicles.company_id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin', 'fleet_manager')
  )
);

-- DELETE: Fleet manager + admin
CREATE POLICY "fleet_vehicles_delete" ON fleet_vehicles
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = fleet_vehicles.company_id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin', 'fleet_manager')
  )
);

-- ============================================
-- POLICIES: fleet_appointments
-- ============================================

-- SELECT: Utilisateurs de l'entreprise
CREATE POLICY "fleet_appointments_select" ON fleet_appointments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = fleet_appointments.company_id
    AND cu.profile_id = auth.uid()
    AND cu.is_active = true
  )
);

-- INSERT: Fleet managers + admins
CREATE POLICY "fleet_appointments_insert" ON fleet_appointments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = fleet_appointments.company_id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin', 'fleet_manager')
  )
);

-- UPDATE: Fleet managers + admins
CREATE POLICY "fleet_appointments_update" ON fleet_appointments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = fleet_appointments.company_id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin', 'fleet_manager')
  )
);

-- ============================================
-- POLICIES: company_billing
-- ============================================

-- SELECT: Owner/admin/accountant de l'entreprise
CREATE POLICY "company_billing_select" ON company_billing
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_billing.company_id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin', 'accountant')
  )
);

-- INSERT: Owner/admin uniquement
CREATE POLICY "company_billing_insert" ON company_billing
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_billing.company_id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin')
  )
);

-- UPDATE: Owner/admin uniquement
CREATE POLICY "company_billing_update" ON company_billing
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_billing.company_id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin')
  )
);

-- ============================================
-- POLICIES: company_invoices
-- ============================================

-- SELECT: Owner/admin/accountant de l'entreprise
CREATE POLICY "company_invoices_select" ON company_invoices
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_invoices.company_id
    AND cu.profile_id = auth.uid()
    AND cu.role IN ('owner', 'admin', 'accountant')
  )
);

-- INSERT: Système uniquement (via trigger ou edge function)
CREATE POLICY "company_invoices_insert" ON company_invoices
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- UPDATE: Admin global (paiement, corrections)
CREATE POLICY "company_invoices_update" ON company_invoices
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- POLICIES: company_analytics
-- ============================================

-- SELECT: Utilisateurs de l'entreprise
CREATE POLICY "company_analytics_select" ON company_analytics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_analytics.company_id
    AND cu.profile_id = auth.uid()
    AND cu.is_active = true
  )
);

-- INSERT/UPDATE: Système uniquement (edge functions, triggers)
CREATE POLICY "company_analytics_insert" ON company_analytics
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "company_analytics_update" ON company_analytics
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
