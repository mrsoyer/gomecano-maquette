-- Migration: B2C Account Extended Functions
-- Date: 2026-01-06
-- Session: 04 - B2C Account (Espace Client)
-- Description: Extended account_* functions for payments, loyalty, emergency, support, family
-- Architecture: Functions-First (no direct table access from frontend)

-- ============================================
-- SECTION 1: PAYMENT FUNCTIONS
-- ============================================

-- 1.1 Get payment methods
CREATE OR REPLACE FUNCTION account_get_payment_methods()
RETURNS TABLE (
  id UUID,
  type TEXT,
  card_last4 TEXT,
  card_brand TEXT,
  card_exp_month INT,
  card_exp_year INT,
  iban_last4 TEXT,
  bank_name TEXT,
  is_default BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    pm.id, pm.type, pm.card_last4, pm.card_brand,
    pm.card_exp_month, pm.card_exp_year, pm.iban_last4,
    pm.bank_name, pm.is_default, pm.is_active, pm.created_at
  FROM payment_methods pm
  WHERE pm.profile_id = auth.uid()
    AND pm.is_active = true
  ORDER BY pm.is_default DESC, pm.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_payment_methods() TO authenticated;
COMMENT ON FUNCTION account_get_payment_methods() IS 'Get active payment methods for authenticated user';

-- 1.2 Add payment method
CREATE OR REPLACE FUNCTION account_add_payment_method(
  p_type TEXT,
  p_card_last4 TEXT DEFAULT NULL,
  p_card_brand TEXT DEFAULT NULL,
  p_card_exp_month INT DEFAULT NULL,
  p_card_exp_year INT DEFAULT NULL,
  p_iban_last4 TEXT DEFAULT NULL,
  p_bank_name TEXT DEFAULT NULL,
  p_is_default BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_method_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate type
  IF p_type NOT IN ('card', 'sepa') THEN
    RAISE EXCEPTION 'Invalid payment method type';
  END IF;

  -- If default, unset others first
  IF p_is_default THEN
    UPDATE payment_methods
    SET is_default = false
    WHERE profile_id = auth.uid() AND is_default = true;
  END IF;

  -- Insert new method
  INSERT INTO payment_methods (
    profile_id, type, card_last4, card_brand,
    card_exp_month, card_exp_year, iban_last4,
    bank_name, is_default, is_active
  ) VALUES (
    auth.uid(), p_type, p_card_last4, p_card_brand,
    p_card_exp_month, p_card_exp_year, p_iban_last4,
    p_bank_name, p_is_default, true
  )
  RETURNING id INTO v_method_id;

  RETURN v_method_id;
END;
$$;

GRANT EXECUTE ON FUNCTION account_add_payment_method(TEXT, TEXT, TEXT, INT, INT, TEXT, TEXT, BOOLEAN) TO authenticated;
COMMENT ON FUNCTION account_add_payment_method IS 'Add a new payment method for authenticated user';

-- 1.3 Set default payment method
CREATE OR REPLACE FUNCTION account_set_default_payment_method(p_method_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM payment_methods
    WHERE id = p_method_id AND profile_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Payment method not found or access denied';
  END IF;

  -- Unset existing default
  UPDATE payment_methods
  SET is_default = false
  WHERE profile_id = auth.uid() AND is_default = true;

  -- Set new default
  UPDATE payment_methods
  SET is_default = true
  WHERE id = p_method_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION account_set_default_payment_method(UUID) TO authenticated;
COMMENT ON FUNCTION account_set_default_payment_method IS 'Set a payment method as default';

-- 1.4 Delete payment method (soft delete)
CREATE OR REPLACE FUNCTION account_delete_payment_method(p_method_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE payment_methods
  SET is_active = false
  WHERE id = p_method_id AND profile_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment method not found or access denied';
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION account_delete_payment_method(UUID) TO authenticated;
COMMENT ON FUNCTION account_delete_payment_method IS 'Soft delete a payment method';

-- 1.5 Get invoices
CREATE OR REPLACE FUNCTION account_get_invoices()
RETURNS TABLE (
  id UUID,
  appointment_id UUID,
  amount DECIMAL,
  status TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ,
  appointment_date TIMESTAMPTZ,
  service_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    i.id, i.appointment_id, i.amount, i.status, i.pdf_url, i.created_at,
    a.scheduled_at AS appointment_date,
    s.name AS service_name
  FROM invoices i
  JOIN appointments a ON i.appointment_id = a.id
  JOIN services s ON a.service_id = s.id
  WHERE a.client_id = auth.uid()
  ORDER BY i.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_invoices() TO authenticated;
COMMENT ON FUNCTION account_get_invoices IS 'Get all invoices for authenticated user';

-- ============================================
-- SECTION 2: LOYALTY FUNCTIONS (Extended)
-- ============================================

-- 2.1 Get loyalty account (auto-create if not exists)
CREATE OR REPLACE FUNCTION account_get_loyalty_account()
RETURNS TABLE (
  id UUID,
  points INT,
  tier_id UUID,
  tier_name TEXT,
  referral_code TEXT,
  referrals_count INT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_default_tier_id UUID;
  v_new_code TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get default tier (lowest min_points)
  SELECT lt.id INTO v_default_tier_id
  FROM loyalty_tiers lt
  ORDER BY lt.min_points ASC LIMIT 1;

  -- Generate referral code
  v_new_code := upper(substr(md5(auth.uid()::text || NOW()::text), 1, 8));

  -- Create account if not exists
  INSERT INTO loyalty_accounts (profile_id, points, current_tier_id, referral_code, referrals_count)
  VALUES (auth.uid(), 0, v_default_tier_id, v_new_code, 0)
  ON CONFLICT (profile_id) DO NOTHING;

  RETURN QUERY
  SELECT
    la.id, la.points, la.current_tier_id, lt.name,
    la.referral_code, la.referrals_count, la.created_at
  FROM loyalty_accounts la
  LEFT JOIN loyalty_tiers lt ON la.current_tier_id = lt.id
  WHERE la.profile_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_loyalty_account() TO authenticated;
COMMENT ON FUNCTION account_get_loyalty_account IS 'Get or create loyalty account for authenticated user';

-- 2.2 Get loyalty tiers
CREATE OR REPLACE FUNCTION account_get_loyalty_tiers()
RETURNS TABLE (
  id UUID,
  name TEXT,
  min_points INT,
  multiplier DECIMAL,
  benefits JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT lt.id, lt.name, lt.min_points, lt.multiplier, lt.benefits
  FROM loyalty_tiers lt
  ORDER BY lt.min_points ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_loyalty_tiers() TO authenticated;
COMMENT ON FUNCTION account_get_loyalty_tiers IS 'Get all loyalty tiers';

-- 2.3 Get loyalty transactions
CREATE OR REPLACE FUNCTION account_get_loyalty_transactions(p_limit INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  type TEXT,
  points INT,
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT lt.id, lt.type, lt.points, lt.description,
         lt.reference_type, lt.reference_id, lt.created_at
  FROM loyalty_transactions lt
  JOIN loyalty_accounts la ON lt.account_id = la.id
  WHERE la.profile_id = auth.uid()
  ORDER BY lt.created_at DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_loyalty_transactions(INT) TO authenticated;
COMMENT ON FUNCTION account_get_loyalty_transactions IS 'Get loyalty transaction history';

-- 2.4 Get available rewards
CREATE OR REPLACE FUNCTION account_get_loyalty_rewards()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  points_required INT,
  type TEXT,
  value DECIMAL,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT lr.id, lr.title, lr.description, lr.points_required,
         lr.type, lr.value, lr.is_active
  FROM loyalty_rewards lr
  WHERE lr.is_active = true
  ORDER BY lr.points_required ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_loyalty_rewards() TO authenticated;
COMMENT ON FUNCTION account_get_loyalty_rewards IS 'Get available loyalty rewards';

-- 2.5 Get redemption history
CREATE OR REPLACE FUNCTION account_get_loyalty_redemptions()
RETURNS TABLE (
  id UUID,
  reward_id UUID,
  reward_title TEXT,
  points_spent INT,
  status TEXT,
  code TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    lred.id, lred.reward_id, lr.title, lred.points_spent,
    lred.status, lred.code, lred.expires_at, lred.created_at
  FROM loyalty_redemptions lred
  JOIN loyalty_rewards lr ON lred.reward_id = lr.id
  JOIN loyalty_accounts la ON lred.account_id = la.id
  WHERE la.profile_id = auth.uid()
  ORDER BY lred.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_loyalty_redemptions() TO authenticated;
COMMENT ON FUNCTION account_get_loyalty_redemptions IS 'Get loyalty redemption history';

-- 2.6 Redeem reward
CREATE OR REPLACE FUNCTION account_redeem_loyalty_reward(p_reward_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account RECORD;
  v_reward RECORD;
  v_redemption_id UUID;
  v_code TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get account
  SELECT la.* INTO v_account
  FROM loyalty_accounts la
  WHERE la.profile_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loyalty account not found';
  END IF;

  -- Get reward
  SELECT * INTO v_reward
  FROM loyalty_rewards
  WHERE id = p_reward_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found or inactive';
  END IF;

  -- Check sufficient points
  IF v_account.points < v_reward.points_required THEN
    RAISE EXCEPTION 'Insufficient points (have: %, required: %)', v_account.points, v_reward.points_required;
  END IF;

  -- Generate unique code
  v_code := upper(substr(md5(random()::text || NOW()::text), 1, 8));

  -- Create redemption
  INSERT INTO loyalty_redemptions (
    account_id, reward_id, points_spent, status, code, expires_at
  ) VALUES (
    v_account.id, p_reward_id, v_reward.points_required,
    'pending', v_code, NOW() + INTERVAL '90 days'
  )
  RETURNING id INTO v_redemption_id;

  -- Deduct points
  UPDATE loyalty_accounts
  SET points = points - v_reward.points_required
  WHERE id = v_account.id;

  -- Create transaction
  INSERT INTO loyalty_transactions (
    account_id, type, points, description, reference_type, reference_id
  ) VALUES (
    v_account.id, 'redemption', -v_reward.points_required,
    'Échange: ' || v_reward.title, 'redemption', v_redemption_id
  );

  RETURN v_redemption_id;
END;
$$;

GRANT EXECUTE ON FUNCTION account_redeem_loyalty_reward(UUID) TO authenticated;
COMMENT ON FUNCTION account_redeem_loyalty_reward IS 'Redeem a loyalty reward';

-- 2.7 Add loyalty points
CREATE OR REPLACE FUNCTION account_add_loyalty_points(
  p_amount INT,
  p_description TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account RECORD;
  v_new_tier_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get account
  SELECT * INTO v_account
  FROM loyalty_accounts
  WHERE profile_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loyalty account not found';
  END IF;

  -- Add points
  UPDATE loyalty_accounts
  SET points = points + p_amount
  WHERE id = v_account.id;

  -- Create transaction
  INSERT INTO loyalty_transactions (
    account_id, type, points, description, reference_type, reference_id
  ) VALUES (
    v_account.id, 'earning', p_amount, p_description,
    p_reference_type, p_reference_id
  );

  -- Check tier upgrade
  SELECT lt.id INTO v_new_tier_id
  FROM loyalty_tiers lt
  WHERE lt.min_points <= (v_account.points + p_amount)
  ORDER BY lt.min_points DESC LIMIT 1;

  IF v_new_tier_id IS DISTINCT FROM v_account.current_tier_id THEN
    UPDATE loyalty_accounts
    SET current_tier_id = v_new_tier_id
    WHERE id = v_account.id;
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION account_add_loyalty_points(INT, TEXT, TEXT, UUID) TO authenticated;
COMMENT ON FUNCTION account_add_loyalty_points IS 'Add loyalty points with automatic tier upgrade check';

-- ============================================
-- SECTION 3: NOTIFICATION FUNCTIONS (Extended)
-- ============================================

-- 3.1 Get notifications (override existing for consistency)
DROP FUNCTION IF EXISTS account_get_notifications_v2();
CREATE OR REPLACE FUNCTION account_get_notifications_v2()
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  message TEXT,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  action_label TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT n.id, n.type, n.title, n.message, n.read_at,
         n.action_url, n.action_label, n.created_at
  FROM notifications n
  WHERE n.profile_id = auth.uid()
  ORDER BY n.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_notifications_v2() TO authenticated;
COMMENT ON FUNCTION account_get_notifications_v2 IS 'Get all notifications for authenticated user';

-- 3.2 Mark all notifications as read
CREATE OR REPLACE FUNCTION account_mark_all_notifications_read()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE notifications
  SET read_at = NOW()
  WHERE profile_id = auth.uid() AND read_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION account_mark_all_notifications_read() TO authenticated;
COMMENT ON FUNCTION account_mark_all_notifications_read IS 'Mark all notifications as read';

-- 3.3 Delete notification
CREATE OR REPLACE FUNCTION account_delete_notification(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM notifications
  WHERE id = p_notification_id AND profile_id = auth.uid();

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION account_delete_notification(UUID) TO authenticated;
COMMENT ON FUNCTION account_delete_notification IS 'Delete a notification';

-- ============================================
-- SECTION 4: EMERGENCY FUNCTIONS
-- ============================================

-- 4.1 Create emergency request
CREATE OR REPLACE FUNCTION account_create_emergency_request(
  p_description TEXT,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_vehicle_id UUID DEFAULT NULL,
  p_category TEXT DEFAULT 'breakdown',
  p_photos TEXT[] DEFAULT '{}',
  p_address TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate vehicle ownership if provided
  IF p_vehicle_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM vehicles WHERE id = p_vehicle_id AND owner_id = auth.uid()) THEN
      RAISE EXCEPTION 'Vehicle not found or access denied';
    END IF;
  END IF;

  INSERT INTO emergency_requests (
    client_id, vehicle_id, description, category,
    photos, location, address, status
  ) VALUES (
    auth.uid(), p_vehicle_id, p_description, p_category,
    p_photos, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326),
    p_address, 'pending'
  )
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$;

GRANT EXECUTE ON FUNCTION account_create_emergency_request(TEXT, DOUBLE PRECISION, DOUBLE PRECISION, UUID, TEXT, TEXT[], TEXT) TO authenticated;
COMMENT ON FUNCTION account_create_emergency_request IS 'Create an emergency/SOS request';

-- 4.2 Get active emergency request
CREATE OR REPLACE FUNCTION account_get_active_emergency_request()
RETURNS TABLE (
  id UUID,
  vehicle_id UUID,
  description TEXT,
  category TEXT,
  status TEXT,
  mechanic_id UUID,
  mechanic_name TEXT,
  mechanic_phone TEXT,
  mechanic_avatar TEXT,
  eta_minutes INT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    er.id, er.vehicle_id, er.description, er.category, er.status,
    m.id AS mechanic_id,
    COALESCE(p.first_name || ' ' || p.last_name, '') AS mechanic_name,
    p.phone AS mechanic_phone,
    p.avatar_url AS mechanic_avatar,
    er.eta_minutes,
    er.created_at
  FROM emergency_requests er
  LEFT JOIN mechanics m ON er.mechanic_id = m.id
  LEFT JOIN profiles p ON m.profile_id = p.id
  WHERE er.client_id = auth.uid()
    AND er.status IN ('pending', 'accepted', 'en_route', 'in_progress')
  ORDER BY er.created_at DESC
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_active_emergency_request() TO authenticated;
COMMENT ON FUNCTION account_get_active_emergency_request IS 'Get current active emergency request';

-- 4.3 Get SOS updates
CREATE OR REPLACE FUNCTION account_get_sos_updates(p_request_id UUID)
RETURNS TABLE (
  id UUID,
  message TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM emergency_requests
    WHERE id = p_request_id AND client_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Emergency request not found or access denied';
  END IF;

  RETURN QUERY
  SELECT su.id, su.message, su.status, su.created_at
  FROM sos_updates su
  WHERE su.request_id = p_request_id
  ORDER BY su.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_sos_updates(UUID) TO authenticated;
COMMENT ON FUNCTION account_get_sos_updates IS 'Get updates for an emergency request';

-- 4.4 Cancel emergency request
CREATE OR REPLACE FUNCTION account_cancel_emergency_request(p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE emergency_requests
  SET status = 'cancelled', cancelled_at = NOW()
  WHERE id = p_request_id
    AND client_id = auth.uid()
    AND status IN ('pending', 'accepted');

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION account_cancel_emergency_request(UUID) TO authenticated;
COMMENT ON FUNCTION account_cancel_emergency_request IS 'Cancel an emergency request';

-- ============================================
-- SECTION 5: FAMILY SHARING FUNCTIONS (Extended)
-- ============================================

-- 5.1 Get family invitations
CREATE OR REPLACE FUNCTION account_get_family_invitations()
RETURNS TABLE (
  id UUID,
  email TEXT,
  permissions JSONB,
  status TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT fi.id, fi.email, fi.permissions, fi.status,
         fi.expires_at, fi.created_at
  FROM family_invitations fi
  WHERE fi.owner_id = auth.uid() AND fi.status = 'pending';
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_family_invitations() TO authenticated;
COMMENT ON FUNCTION account_get_family_invitations IS 'Get pending family invitations';

-- 5.2 Invite family member
CREATE OR REPLACE FUNCTION account_invite_family_member(
  p_email TEXT,
  p_permissions JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation_id UUID;
  v_token TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if already invited
  IF EXISTS (
    SELECT 1 FROM family_invitations
    WHERE owner_id = auth.uid() AND email = p_email AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Invitation already sent to this email';
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO family_invitations (
    owner_id, email, token, permissions, status, expires_at
  ) VALUES (
    auth.uid(), p_email, v_token, p_permissions, 'pending',
    NOW() + INTERVAL '7 days'
  )
  RETURNING id INTO v_invitation_id;

  RETURN v_invitation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION account_invite_family_member(TEXT, JSONB) TO authenticated;
COMMENT ON FUNCTION account_invite_family_member IS 'Send invitation to family member';

-- 5.3 Remove family member
CREATE OR REPLACE FUNCTION account_remove_family_member(p_member_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM family_members
  WHERE id = p_member_id AND owner_id = auth.uid();

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION account_remove_family_member(UUID) TO authenticated;
COMMENT ON FUNCTION account_remove_family_member IS 'Remove a family member';

-- 5.4 Update family permissions
CREATE OR REPLACE FUNCTION account_update_family_permissions(
  p_member_id UUID,
  p_can_book BOOLEAN DEFAULT NULL,
  p_can_view_history BOOLEAN DEFAULT NULL,
  p_can_manage_vehicles BOOLEAN DEFAULT NULL,
  p_can_manage_payments BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE family_members
  SET
    can_book = COALESCE(p_can_book, can_book),
    can_view_history = COALESCE(p_can_view_history, can_view_history),
    can_manage_vehicles = COALESCE(p_can_manage_vehicles, can_manage_vehicles),
    can_manage_payments = COALESCE(p_can_manage_payments, can_manage_payments)
  WHERE id = p_member_id AND owner_id = auth.uid();

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION account_update_family_permissions(UUID, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;
COMMENT ON FUNCTION account_update_family_permissions IS 'Update family member permissions';

-- 5.5 Cancel family invitation
CREATE OR REPLACE FUNCTION account_cancel_family_invitation(p_invitation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE family_invitations
  SET status = 'cancelled'
  WHERE id = p_invitation_id AND owner_id = auth.uid() AND status = 'pending';

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION account_cancel_family_invitation(UUID) TO authenticated;
COMMENT ON FUNCTION account_cancel_family_invitation IS 'Cancel a family invitation';

-- ============================================
-- SECTION 6: SUPPORT FUNCTIONS
-- ============================================

-- 6.1 Get support tickets
CREATE OR REPLACE FUNCTION account_get_support_tickets()
RETURNS TABLE (
  id UUID,
  subject TEXT,
  description TEXT,
  category TEXT,
  priority TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT st.id, st.subject, st.description, st.category,
         st.priority, st.status, st.created_at, st.updated_at
  FROM support_tickets st
  WHERE st.profile_id = auth.uid()
  ORDER BY st.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_support_tickets() TO authenticated;
COMMENT ON FUNCTION account_get_support_tickets IS 'Get all support tickets for authenticated user';

-- 6.2 Get support ticket with messages
CREATE OR REPLACE FUNCTION account_get_support_ticket(p_ticket_id UUID)
RETURNS TABLE (
  ticket_id UUID,
  subject TEXT,
  description TEXT,
  category TEXT,
  priority TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  messages JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    st.id AS ticket_id, st.subject, st.description,
    st.category, st.priority, st.status, st.created_at,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', tm.id,
          'message', tm.message,
          'sender_id', tm.sender_id,
          'sender_name', COALESCE(p.first_name || ' ' || p.last_name, 'Support'),
          'sender_avatar', p.avatar_url,
          'is_internal', tm.is_internal,
          'created_at', tm.created_at
        ) ORDER BY tm.created_at
      ) FILTER (WHERE tm.id IS NOT NULL AND NOT tm.is_internal),
      '[]'::jsonb
    ) AS messages
  FROM support_tickets st
  LEFT JOIN ticket_messages tm ON tm.ticket_id = st.id
  LEFT JOIN profiles p ON tm.sender_id = p.id
  WHERE st.id = p_ticket_id AND st.profile_id = auth.uid()
  GROUP BY st.id;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_support_ticket(UUID) TO authenticated;
COMMENT ON FUNCTION account_get_support_ticket IS 'Get support ticket with messages';

-- 6.3 Create support ticket
CREATE OR REPLACE FUNCTION account_create_support_ticket(
  p_subject TEXT,
  p_description TEXT,
  p_category TEXT DEFAULT 'general',
  p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate priority
  IF p_priority NOT IN ('low', 'normal', 'high', 'urgent') THEN
    RAISE EXCEPTION 'Invalid priority';
  END IF;

  INSERT INTO support_tickets (
    profile_id, subject, description, category, priority, status
  ) VALUES (
    auth.uid(), p_subject, p_description, p_category, p_priority, 'open'
  )
  RETURNING id INTO v_ticket_id;

  RETURN v_ticket_id;
END;
$$;

GRANT EXECUTE ON FUNCTION account_create_support_ticket(TEXT, TEXT, TEXT, TEXT) TO authenticated;
COMMENT ON FUNCTION account_create_support_ticket IS 'Create a support ticket';

-- 6.4 Send ticket message
CREATE OR REPLACE FUNCTION account_send_ticket_message(
  p_ticket_id UUID,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify ticket ownership
  IF NOT EXISTS (
    SELECT 1 FROM support_tickets
    WHERE id = p_ticket_id AND profile_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Ticket not found or access denied';
  END IF;

  INSERT INTO ticket_messages (
    ticket_id, sender_id, message, is_internal
  ) VALUES (
    p_ticket_id, auth.uid(), p_message, false
  )
  RETURNING id INTO v_message_id;

  -- Reopen ticket if closed
  UPDATE support_tickets
  SET status = 'open', updated_at = NOW()
  WHERE id = p_ticket_id AND status = 'closed';

  RETURN v_message_id;
END;
$$;

GRANT EXECUTE ON FUNCTION account_send_ticket_message(UUID, TEXT) TO authenticated;
COMMENT ON FUNCTION account_send_ticket_message IS 'Send a message on a support ticket';

-- ============================================
-- VERIFICATION
-- ============================================
-- List all account functions:
-- SELECT proname FROM pg_proc WHERE proname LIKE 'account_%' ORDER BY proname;
