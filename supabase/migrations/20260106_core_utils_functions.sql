-- =====================================================
-- SESSION 10: CORE - Utility Functions
-- Date: 2026-01-06
-- Functions: core_search_global, core_get_mechanics_available
-- =====================================================

-- =====================================================
-- 1. CORE_SEARCH_GLOBAL
-- Recherche globale multi-entités (services, blog, faq, mechanics)
-- =====================================================

CREATE OR REPLACE FUNCTION core_search_global(
  p_query TEXT,
  p_types TEXT[] DEFAULT ARRAY['services', 'blog', 'faq', 'mechanics'],
  p_limit INT DEFAULT 5
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
  v_services JSON := '[]'::JSON;
  v_blog JSON := '[]'::JSON;
  v_faq JSON := '[]'::JSON;
  v_mechanics JSON := '[]'::JSON;
  v_total_count INT := 0;
  v_search_term TEXT;
BEGIN
  -- Sanitize and prepare search term
  v_search_term := '%' || LOWER(TRIM(p_query)) || '%';

  -- Validate query
  IF p_query IS NULL OR LENGTH(TRIM(p_query)) < 2 THEN
    RETURN json_build_object(
      'services', '[]'::JSON,
      'blog', '[]'::JSON,
      'faq', '[]'::JSON,
      'mechanics', '[]'::JSON,
      'total_count', 0,
      'error', 'Query must be at least 2 characters'
    );
  END IF;

  -- Search services
  IF 'services' = ANY(p_types) THEN
    SELECT COALESCE(json_agg(row_to_json(s)), '[]'::JSON)
    INTO v_services
    FROM (
      SELECT
        id,
        'service' as type,
        name as title,
        COALESCE(short_description, LEFT(description, 100)) as description,
        '/services/' || slug as url,
        category::TEXT as category,
        price_from,
        icon
      FROM services
      WHERE is_active = true
        AND (
          LOWER(name) LIKE v_search_term
          OR LOWER(description) LIKE v_search_term
          OR LOWER(short_description) LIKE v_search_term
        )
      ORDER BY is_popular DESC, display_order ASC
      LIMIT p_limit
    ) s;

    v_total_count := v_total_count + COALESCE(json_array_length(v_services), 0);
  END IF;

  -- Search blog posts
  IF 'blog' = ANY(p_types) THEN
    SELECT COALESCE(json_agg(row_to_json(b)), '[]'::JSON)
    INTO v_blog
    FROM (
      SELECT
        id,
        'blog' as type,
        title,
        COALESCE(excerpt, LEFT(content, 150)) as description,
        '/blog/' || slug as url,
        cover_image as image,
        published_at,
        reading_time
      FROM blog_posts
      WHERE status = 'published'
        AND (
          LOWER(title) LIKE v_search_term
          OR LOWER(excerpt) LIKE v_search_term
          OR LOWER(content) LIKE v_search_term
        )
      ORDER BY published_at DESC
      LIMIT p_limit
    ) b;

    v_total_count := v_total_count + COALESCE(json_array_length(v_blog), 0);
  END IF;

  -- Search FAQ
  IF 'faq' = ANY(p_types) THEN
    SELECT COALESCE(json_agg(row_to_json(f)), '[]'::JSON)
    INTO v_faq
    FROM (
      SELECT
        fi.id,
        'faq' as type,
        fi.question as title,
        LEFT(fi.answer, 150) as description,
        fc.name as category
      FROM faq_items fi
      LEFT JOIN faq_categories fc ON fi.category_id = fc.id
      WHERE fi.is_published = true
        AND (
          LOWER(fi.question) LIKE v_search_term
          OR LOWER(fi.answer) LIKE v_search_term
        )
      ORDER BY fi.is_featured DESC, fi.display_order ASC
      LIMIT p_limit
    ) f;

    v_total_count := v_total_count + COALESCE(json_array_length(v_faq), 0);
  END IF;

  -- Search mechanics (public profiles)
  IF 'mechanics' = ANY(p_types) THEN
    SELECT COALESCE(json_agg(row_to_json(m)), '[]'::JSON)
    INTO v_mechanics
    FROM (
      SELECT
        mech.id,
        'mechanic' as type,
        COALESCE(p.first_name || ' ' || p.last_name, 'Mécanicien') as name,
        mech.rating,
        mech.reviews_count,
        mech.specialties,
        mech.years_experience
      FROM mechanics mech
      LEFT JOIN profiles p ON mech.profile_id = p.id
      WHERE mech.is_available = true
        AND mech.is_verified = true
        AND (
          LOWER(p.first_name) LIKE v_search_term
          OR LOWER(p.last_name) LIKE v_search_term
          OR EXISTS (
            SELECT 1 FROM unnest(mech.specialties) spec
            WHERE LOWER(spec) LIKE v_search_term
          )
        )
      ORDER BY mech.rating DESC, mech.reviews_count DESC
      LIMIT p_limit
    ) m;

    v_total_count := v_total_count + COALESCE(json_array_length(v_mechanics), 0);
  END IF;

  -- Build final result
  v_result := json_build_object(
    'services', v_services,
    'blog', v_blog,
    'faq', v_faq,
    'mechanics', v_mechanics,
    'total_count', v_total_count,
    'query', p_query
  );

  RETURN v_result;
END;
$$;

-- Add comment
COMMENT ON FUNCTION core_search_global IS 'Global search across services, blog posts, FAQ items, and mechanics';


-- =====================================================
-- 2. CORE_GET_MECHANICS_AVAILABLE
-- Find available mechanics by location and date
-- =====================================================

CREATE OR REPLACE FUNCTION core_get_mechanics_available(
  p_latitude FLOAT,
  p_longitude FLOAT,
  p_date DATE,
  p_service_category TEXT DEFAULT NULL,
  p_limit INT DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
  v_day_of_week INT;
  v_point GEOGRAPHY;
BEGIN
  -- Validate inputs
  IF p_latitude IS NULL OR p_longitude IS NULL THEN
    RETURN json_build_object(
      'mechanics', '[]'::JSON,
      'error', 'Latitude and longitude are required'
    );
  END IF;

  IF p_date IS NULL OR p_date < CURRENT_DATE THEN
    RETURN json_build_object(
      'mechanics', '[]'::JSON,
      'error', 'Valid future date is required'
    );
  END IF;

  -- Get day of week (0 = Sunday, 1 = Monday, etc.)
  v_day_of_week := EXTRACT(DOW FROM p_date)::INT;

  -- Create point from coordinates
  v_point := ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::GEOGRAPHY;

  -- Find available mechanics
  SELECT json_build_object(
    'mechanics', COALESCE(json_agg(mech_data ORDER BY distance_km ASC, rating DESC), '[]'::JSON),
    'date', p_date,
    'location', json_build_object('lat', p_latitude, 'lng', p_longitude),
    'total_found', COUNT(*)
  )
  INTO v_result
  FROM (
    SELECT
      m.id,
      m.profile_id,
      COALESCE(p.first_name || ' ' || COALESCE(LEFT(p.last_name, 1) || '.', ''), 'Mécanicien') as name,
      p.avatar_url,
      m.rating,
      m.reviews_count,
      m.specialties,
      m.certifications,
      m.years_experience,
      m.completed_jobs,
      -- Calculate distance (use radius if no service_area_center)
      CASE
        WHEN m.service_area_center IS NOT NULL THEN
          ROUND((ST_Distance(m.service_area_center, v_point) / 1000)::NUMERIC, 1)
        ELSE
          m.service_area_radius_km::NUMERIC -- Assume max radius as placeholder
      END as distance_km,
      -- Get available time slots for this day
      (
        SELECT json_agg(
          json_build_object(
            'start', ma.start_time::TEXT,
            'end', ma.end_time::TEXT
          )
        )
        FROM mechanic_availability ma
        WHERE ma.mechanic_id = m.id
          AND ma.day_of_week = v_day_of_week
          AND ma.is_active = true
      ) as available_slots,
      -- Check if mechanic serves this area
      CASE
        WHEN m.service_area_center IS NOT NULL THEN
          ST_DWithin(m.service_area_center, v_point, m.service_area_radius_km * 1000)
        ELSE
          true -- If no center defined, assume available everywhere within radius
      END as is_in_service_area
    FROM mechanics m
    LEFT JOIN profiles p ON m.profile_id = p.id
    WHERE m.is_available = true
      AND m.is_verified = true
      -- Check availability for this day of week
      AND EXISTS (
        SELECT 1 FROM mechanic_availability ma
        WHERE ma.mechanic_id = m.id
          AND ma.day_of_week = v_day_of_week
          AND ma.is_active = true
      )
      -- Filter by service category if provided
      AND (
        p_service_category IS NULL
        OR p_service_category = ANY(m.specialties)
        OR EXISTS (
          SELECT 1 FROM mechanic_specializations ms
          WHERE ms.mechanic_id = m.id
            AND ms.category::TEXT = p_service_category
        )
      )
      -- Exclude mechanics with conflicting appointments (uses scheduled_date column)
      AND NOT EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.mechanic_id = m.id
          AND a.scheduled_date = p_date
          AND a.status NOT IN ('cancelled', 'completed')
      )
  ) mech_data
  WHERE mech_data.is_in_service_area = true
    OR mech_data.distance_km <= (
      SELECT service_area_radius_km
      FROM mechanics
      WHERE id = mech_data.id
    );

  RETURN v_result;
END;
$$;

-- Add comment
COMMENT ON FUNCTION core_get_mechanics_available IS 'Find available mechanics by geographic location and date, with optional service category filter';


-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION core_search_global TO anon, authenticated;
GRANT EXECUTE ON FUNCTION core_get_mechanics_available TO anon, authenticated;
