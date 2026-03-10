-- Migration: Enable RLS for b2c-account tables
-- Date: 2026-01-06
-- Description: Implement Row Level Security policies for all b2c-account critical tables
-- Reference: docs/cleanup-categories/RLS-POLICIES-GUIDE.md

-- ====================
-- 1. PROFILES
-- ====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- UPDATE: Users can update own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- INSERT: Users can create own profile (signup)
CREATE POLICY "Users can create own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ====================
-- 2. VEHICLES
-- ====================

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view own vehicles
CREATE POLICY "Users can view own vehicles"
ON vehicles FOR SELECT
USING (auth.uid() = owner_id);

-- INSERT: Users can create own vehicles
CREATE POLICY "Users can create own vehicles"
ON vehicles FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- UPDATE: Only owners can update
CREATE POLICY "Users can update own vehicles"
ON vehicles FOR UPDATE
USING (auth.uid() = owner_id);

-- DELETE: Only owners can delete
CREATE POLICY "Users can delete own vehicles"
ON vehicles FOR DELETE
USING (auth.uid() = owner_id);

-- ====================
-- 3. APPOINTMENTS
-- ====================

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view own appointments (as client or mechanic)
CREATE POLICY "Users can view own appointments"
ON appointments FOR SELECT
USING (
  auth.uid() = client_id
  OR auth.uid() = mechanic_id
);

-- INSERT: Clients can create appointments
CREATE POLICY "Clients can create appointments"
ON appointments FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- UPDATE: Clients and mechanics can update
CREATE POLICY "Users can update own appointments"
ON appointments FOR UPDATE
USING (
  auth.uid() = client_id
  OR auth.uid() = mechanic_id
);

-- ====================
-- 4. INVOICES
-- ====================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view own invoices
CREATE POLICY "Users can view own invoices"
ON invoices FOR SELECT
USING (auth.uid() = client_id);

-- ====================
-- INDEXES FOR PERFORMANCE (Core tables only)
-- ====================

-- Optimize RLS policy lookups
CREATE INDEX IF NOT EXISTS idx_vehicles_owner_id ON vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_mechanic_id ON appointments(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);

-- ====================
-- VERIFICATION QUERIES
-- ====================

-- Run these to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('profiles', 'vehicles', 'appointments', 'invoices');

-- List all policies:
-- SELECT tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('profiles', 'vehicles', 'appointments', 'invoices');
