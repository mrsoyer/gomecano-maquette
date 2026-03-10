-- Migration: B2C Account DB Functions
-- Date: 2026-01-06
-- Description: All account_* functions for B2C client area
-- Architecture: Functions-First (no direct table access from frontend)

-- ============================================
-- 1. account_get_dashboard
-- ============================================
-- Returns dashboard summary for authenticated user
CREATE OR REPLACE FUNCTION account_get_dashboard()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSON;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT json_build_object(
    'profile', (
      SELECT json_build_object(
        'id', p.id,
        'email', p.email,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'phone', p.phone,
        'avatar_url', p.avatar_url
      )
      FROM profiles p WHERE p.id = v_user_id
    ),
    'stats', json_build_object(
      'vehicles_count', (SELECT COUNT(*) FROM vehicles WHERE owner_id = v_user_id),
      'appointments_count', (SELECT COUNT(*) FROM appointments WHERE client_id = v_user_id),
      'upcoming_appointments', (
        SELECT COUNT(*) FROM appointments
        WHERE client_id = v_user_id
        AND status IN ('pending', 'confirmed', 'in_progress')
        AND scheduled_at > NOW()
      ),
      'unread_notifications', (
        SELECT COUNT(*) FROM notifications
        WHERE user_id = v_user_id AND read_at IS NULL
      )
    ),
    'next_appointment', (
      SELECT json_build_object(
        'id', a.id,
        'scheduled_at', a.scheduled_at,
        'status', a.status,
        'service_name', s.name
      )
      FROM appointments a
      LEFT JOIN services s ON s.id = a.service_id
      WHERE a.client_id = v_user_id
      AND a.status IN ('pending', 'confirmed')
      AND a.scheduled_at > NOW()
      ORDER BY a.scheduled_at ASC
      LIMIT 1
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_dashboard() TO authenticated;
COMMENT ON FUNCTION account_get_dashboard() IS 'Returns dashboard summary for authenticated user';

-- ============================================
-- 2. account_get_appointments
-- ============================================
-- Returns user appointments with filters
CREATE OR REPLACE FUNCTION account_get_appointments(
  p_status TEXT DEFAULT NULL,
  p_from_date TIMESTAMPTZ DEFAULT NULL,
  p_to_date TIMESTAMPTZ DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSON;
  v_total BIGINT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Count total
  SELECT COUNT(*) INTO v_total
  FROM appointments a
  WHERE a.client_id = v_user_id
    AND (p_status IS NULL OR a.status = p_status)
    AND (p_from_date IS NULL OR a.scheduled_at >= p_from_date)
    AND (p_to_date IS NULL OR a.scheduled_at <= p_to_date);

  -- Get appointments
  SELECT json_build_object(
    'appointments', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          a.id,
          a.scheduled_at,
          a.status,
          a.total_amount,
          a.address,
          a.notes,
          a.created_at,
          json_build_object(
            'id', s.id,
            'name', s.name,
            'slug', s.slug,
            'estimated_duration', s.estimated_duration
          ) as service,
          json_build_object(
            'id', v.id,
            'license_plate', v.license_plate,
            'make', vm.name,
            'model', vmo.name,
            'year', v.year
          ) as vehicle,
          CASE WHEN m.id IS NOT NULL THEN
            json_build_object(
              'id', m.id,
              'first_name', mp.first_name,
              'last_name', mp.last_name,
              'avatar_url', mp.avatar_url
            )
          ELSE NULL END as mechanic
        FROM appointments a
        LEFT JOIN services s ON s.id = a.service_id
        LEFT JOIN vehicles v ON v.id = a.vehicle_id
        LEFT JOIN vehicle_makes vm ON vm.id = v.make_id
        LEFT JOIN vehicle_models vmo ON vmo.id = v.model_id
        LEFT JOIN mechanics m ON m.id = a.mechanic_id
        LEFT JOIN profiles mp ON mp.id = m.profile_id
        WHERE a.client_id = v_user_id
          AND (p_status IS NULL OR a.status = p_status)
          AND (p_from_date IS NULL OR a.scheduled_at >= p_from_date)
          AND (p_to_date IS NULL OR a.scheduled_at <= p_to_date)
        ORDER BY a.scheduled_at DESC
        LIMIT p_limit OFFSET p_offset
      ) t
    ), '[]'::json),
    'total', v_total,
    'limit', p_limit,
    'offset', p_offset
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_appointments(TEXT, TIMESTAMPTZ, TIMESTAMPTZ, INTEGER, INTEGER) TO authenticated;
COMMENT ON FUNCTION account_get_appointments IS 'Returns user appointments with optional filters and pagination';

-- ============================================
-- 3. account_get_vehicles
-- ============================================
-- Returns all user vehicles
CREATE OR REPLACE FUNCTION account_get_vehicles()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN COALESCE((
    SELECT json_agg(row_to_json(t))
    FROM (
      SELECT
        v.id,
        v.license_plate,
        v.vin,
        v.year,
        v.fuel_type,
        v.mileage,
        v.color,
        v.is_primary,
        v.created_at,
        json_build_object(
          'id', vm.id,
          'name', vm.name,
          'logo_url', vm.logo_url
        ) as make,
        json_build_object(
          'id', vmo.id,
          'name', vmo.name
        ) as model,
        (SELECT COUNT(*) FROM appointments a WHERE a.vehicle_id = v.id) as appointments_count
      FROM vehicles v
      LEFT JOIN vehicle_makes vm ON vm.id = v.make_id
      LEFT JOIN vehicle_models vmo ON vmo.id = v.model_id
      WHERE v.owner_id = v_user_id
      ORDER BY v.is_primary DESC, v.created_at DESC
    ) t
  ), '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_vehicles() TO authenticated;
COMMENT ON FUNCTION account_get_vehicles() IS 'Returns all vehicles for authenticated user';

-- ============================================
-- 4. account_add_vehicle
-- ============================================
-- Add a new vehicle for user
CREATE OR REPLACE FUNCTION account_add_vehicle(
  p_license_plate TEXT,
  p_make_id UUID,
  p_model_id UUID,
  p_year INTEGER,
  p_fuel_type TEXT DEFAULT 'gasoline',
  p_vin TEXT DEFAULT NULL,
  p_mileage INTEGER DEFAULT NULL,
  p_color TEXT DEFAULT NULL,
  p_is_primary BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_vehicle_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate license plate uniqueness
  IF EXISTS (SELECT 1 FROM vehicles WHERE license_plate = UPPER(p_license_plate)) THEN
    RAISE EXCEPTION 'Vehicle with this license plate already exists';
  END IF;

  -- If setting as primary, unset others first
  IF p_is_primary THEN
    UPDATE vehicles SET is_primary = false WHERE owner_id = v_user_id;
  END IF;

  -- Insert vehicle
  INSERT INTO vehicles (
    owner_id,
    license_plate,
    make_id,
    model_id,
    year,
    fuel_type,
    vin,
    mileage,
    color,
    is_primary
  ) VALUES (
    v_user_id,
    UPPER(p_license_plate),
    p_make_id,
    p_model_id,
    p_year,
    p_fuel_type,
    p_vin,
    p_mileage,
    p_color,
    p_is_primary
  )
  RETURNING id INTO v_vehicle_id;

  -- Return created vehicle
  RETURN (
    SELECT json_build_object(
      'success', true,
      'vehicle', row_to_json(v)
    )
    FROM vehicles v
    WHERE v.id = v_vehicle_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION account_add_vehicle(TEXT, UUID, UUID, INTEGER, TEXT, TEXT, INTEGER, TEXT, BOOLEAN) TO authenticated;
COMMENT ON FUNCTION account_add_vehicle IS 'Add a new vehicle for authenticated user';

-- ============================================
-- 5. account_update_vehicle
-- ============================================
-- Update an existing vehicle
CREATE OR REPLACE FUNCTION account_update_vehicle(
  p_vehicle_id UUID,
  p_mileage INTEGER DEFAULT NULL,
  p_color TEXT DEFAULT NULL,
  p_is_primary BOOLEAN DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM vehicles WHERE id = p_vehicle_id AND owner_id = v_user_id) THEN
    RAISE EXCEPTION 'Vehicle not found or access denied';
  END IF;

  -- If setting as primary, unset others first
  IF p_is_primary = true THEN
    UPDATE vehicles SET is_primary = false WHERE owner_id = v_user_id;
  END IF;

  -- Update vehicle
  UPDATE vehicles
  SET
    mileage = COALESCE(p_mileage, mileage),
    color = COALESCE(p_color, color),
    is_primary = COALESCE(p_is_primary, is_primary),
    updated_at = NOW()
  WHERE id = p_vehicle_id AND owner_id = v_user_id;

  RETURN json_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION account_update_vehicle(UUID, INTEGER, TEXT, BOOLEAN) TO authenticated;
COMMENT ON FUNCTION account_update_vehicle IS 'Update vehicle details for authenticated user';

-- ============================================
-- 6. account_delete_vehicle
-- ============================================
-- Delete a vehicle (soft delete if has appointments)
CREATE OR REPLACE FUNCTION account_delete_vehicle(p_vehicle_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_has_appointments BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM vehicles WHERE id = p_vehicle_id AND owner_id = v_user_id) THEN
    RAISE EXCEPTION 'Vehicle not found or access denied';
  END IF;

  -- Check for appointments
  SELECT EXISTS (SELECT 1 FROM appointments WHERE vehicle_id = p_vehicle_id) INTO v_has_appointments;

  IF v_has_appointments THEN
    -- Soft delete - mark as inactive
    UPDATE vehicles SET is_active = false, updated_at = NOW() WHERE id = p_vehicle_id;
  ELSE
    -- Hard delete
    DELETE FROM vehicles WHERE id = p_vehicle_id;
  END IF;

  RETURN json_build_object('success', true, 'soft_deleted', v_has_appointments);
END;
$$;

GRANT EXECUTE ON FUNCTION account_delete_vehicle(UUID) TO authenticated;
COMMENT ON FUNCTION account_delete_vehicle IS 'Delete vehicle (soft delete if has appointments)';

-- ============================================
-- 7. account_get_documents
-- ============================================
-- Returns user documents (invoices, quotes, reports)
CREATE OR REPLACE FUNCTION account_get_documents(
  p_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSON;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT json_build_object(
    'invoices', CASE WHEN p_type IS NULL OR p_type = 'invoice' THEN (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT
          i.id,
          i.invoice_number,
          i.amount,
          i.status,
          i.pdf_url,
          i.created_at,
          a.scheduled_at as appointment_date,
          s.name as service_name
        FROM invoices i
        LEFT JOIN appointments a ON a.id = i.appointment_id
        LEFT JOIN services s ON s.id = a.service_id
        WHERE i.client_id = v_user_id
        ORDER BY i.created_at DESC
        LIMIT p_limit OFFSET p_offset
      ) t
    ) ELSE '[]'::json END,
    'quotes', CASE WHEN p_type IS NULL OR p_type = 'quote' THEN (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT
          q.id,
          q.quote_number,
          q.total_amount,
          q.status,
          q.valid_until,
          q.pdf_url,
          q.created_at,
          s.name as service_name
        FROM quotes q
        LEFT JOIN services s ON s.id = q.service_id
        WHERE q.client_id = v_user_id
        ORDER BY q.created_at DESC
        LIMIT p_limit OFFSET p_offset
      ) t
    ) ELSE '[]'::json END
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_documents(TEXT, INTEGER, INTEGER) TO authenticated;
COMMENT ON FUNCTION account_get_documents IS 'Returns user documents (invoices, quotes)';

-- ============================================
-- 8. account_get_notifications
-- ============================================
-- Returns user notifications
CREATE OR REPLACE FUNCTION account_get_notifications(
  p_unread_only BOOLEAN DEFAULT false,
  p_limit INTEGER DEFAULT 50
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN json_build_object(
    'notifications', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          n.id,
          n.type,
          n.title,
          n.message,
          n.data,
          n.read_at,
          n.created_at
        FROM notifications n
        WHERE n.user_id = v_user_id
          AND (NOT p_unread_only OR n.read_at IS NULL)
        ORDER BY n.created_at DESC
        LIMIT p_limit
      ) t
    ), '[]'::json),
    'unread_count', (
      SELECT COUNT(*) FROM notifications WHERE user_id = v_user_id AND read_at IS NULL
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_notifications(BOOLEAN, INTEGER) TO authenticated;
COMMENT ON FUNCTION account_get_notifications IS 'Returns user notifications';

-- ============================================
-- 9. account_mark_notification_read
-- ============================================
-- Mark notification(s) as read
CREATE OR REPLACE FUNCTION account_mark_notification_read(
  p_notification_id UUID DEFAULT NULL,
  p_mark_all BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_count INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_mark_all THEN
    UPDATE notifications
    SET read_at = NOW()
    WHERE user_id = v_user_id AND read_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
  ELSIF p_notification_id IS NOT NULL THEN
    UPDATE notifications
    SET read_at = NOW()
    WHERE id = p_notification_id AND user_id = v_user_id AND read_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
  ELSE
    v_count := 0;
  END IF;

  RETURN json_build_object('success', true, 'marked_count', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION account_mark_notification_read(UUID, BOOLEAN) TO authenticated;
COMMENT ON FUNCTION account_mark_notification_read IS 'Mark notification(s) as read';

-- ============================================
-- 10. account_get_loyalty
-- ============================================
-- Returns user loyalty account and rewards
CREATE OR REPLACE FUNCTION account_get_loyalty()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSON;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT json_build_object(
    'account', (
      SELECT json_build_object(
        'id', la.id,
        'points', la.points,
        'referral_code', la.referral_code,
        'referrals_count', la.referrals_count,
        'tier', (
          SELECT json_build_object(
            'id', lt.id,
            'name', lt.name,
            'min_points', lt.min_points,
            'benefits', lt.benefits
          )
          FROM loyalty_tiers lt WHERE lt.id = la.tier_id
        )
      )
      FROM loyalty_accounts la WHERE la.user_id = v_user_id
    ),
    'transactions', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT id, type, points, description, created_at
        FROM loyalty_transactions
        WHERE account_id = (SELECT id FROM loyalty_accounts WHERE user_id = v_user_id)
        ORDER BY created_at DESC
        LIMIT 20
      ) t
    ), '[]'::json),
    'available_rewards', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT id, title, description, points_required, image_url
        FROM loyalty_rewards
        WHERE is_active = true
        ORDER BY points_required ASC
      ) t
    ), '[]'::json),
    'tiers', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT id, name, min_points, benefits
        FROM loyalty_tiers
        ORDER BY min_points ASC
      ) t
    ), '[]'::json)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_loyalty() TO authenticated;
COMMENT ON FUNCTION account_get_loyalty IS 'Returns user loyalty account, transactions, and available rewards';

-- ============================================
-- 11. account_get_family_members
-- ============================================
-- Returns family sharing members
CREATE OR REPLACE FUNCTION account_get_family_members()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN json_build_object(
    'members', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          fm.id,
          fm.relationship,
          fm.can_book,
          fm.can_view_history,
          fm.can_manage_vehicles,
          fm.can_manage_payments,
          fm.accepted_at,
          fm.created_at,
          json_build_object(
            'id', p.id,
            'email', p.email,
            'first_name', p.first_name,
            'last_name', p.last_name,
            'avatar_url', p.avatar_url
          ) as member
        FROM family_members fm
        LEFT JOIN profiles p ON p.id = fm.member_id
        WHERE fm.owner_id = v_user_id
        ORDER BY fm.created_at DESC
      ) t
    ), '[]'::json),
    'invitations', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          fi.id,
          fi.email,
          fi.permissions,
          fi.status,
          fi.expires_at,
          fi.created_at
        FROM family_invitations fi
        WHERE fi.owner_id = v_user_id
          AND fi.status = 'pending'
        ORDER BY fi.created_at DESC
      ) t
    ), '[]'::json)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION account_get_family_members() TO authenticated;
COMMENT ON FUNCTION account_get_family_members IS 'Returns family sharing members and pending invitations';

-- ============================================
-- Verification
-- ============================================
-- SELECT proname, pronargs FROM pg_proc WHERE proname LIKE 'account_%';
