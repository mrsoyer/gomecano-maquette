-- ============================================================================
-- Migration: B2C Home Functions
-- Session: 02-b2c-home
-- Date: 2026-01-06
-- Description: DB Functions for B2C homepage (services, testimonials, stats)
-- ============================================================================

-- ============================================================================
-- TABLE: services
-- ============================================================================

CREATE TABLE IF NOT EXISTS services (
  -- Identifiers
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  price_from DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 60, -- minutes
  category TEXT NOT NULL,
  image_url TEXT,

  -- Metadata
  badges JSONB DEFAULT '[]'::jsonb,
  is_instant_quote BOOLEAN DEFAULT false,
  included JSONB DEFAULT '[]'::jsonb,
  recommended BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  -- Dynamic pricing config (JSONB)
  questions JSONB,        -- ServiceQuestion[]
  pricing_tiers JSONB,    -- ServiceTier[]
  options JSONB,          -- ServiceOption[]
  comparison_table JSONB, -- ServiceComparison[]

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE services IS 'Services mécaniques proposés par Gomecano';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_recommended ON services(recommended) WHERE recommended = true;
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

-- RLS for services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_select_active"
  ON services FOR SELECT
  USING (active = true);

-- Trigger for updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: testimonials
-- ============================================================================

CREATE TABLE IF NOT EXISTS testimonials (
  -- Identifiers
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User info
  user_id TEXT NOT NULL, -- Can be UUID ref or mock ID
  user_name TEXT NOT NULL,
  user_avatar TEXT,

  -- Review
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,

  -- Service reference
  service_id TEXT, -- Can be UUID ref or mock ID
  service_name TEXT,

  -- Metadata
  verified BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE testimonials IS 'Avis clients vérifiés';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_testimonials_verified ON testimonials(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(featured) WHERE featured = true;

-- RLS for testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_select_verified"
  ON testimonials FOR SELECT
  USING (verified = true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to convert snake_case keys to camelCase in JSONB
CREATE OR REPLACE FUNCTION snake_to_camel(input_json JSONB)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  result JSONB;
  key TEXT;
  value JSONB;
  new_key TEXT;
BEGIN
  IF input_json IS NULL THEN
    RETURN NULL;
  END IF;

  IF jsonb_typeof(input_json) = 'object' THEN
    result := '{}'::jsonb;
    FOR key, value IN SELECT * FROM jsonb_each(input_json)
    LOOP
      -- Convert snake_case to camelCase
      new_key := regexp_replace(
        key,
        '_([a-z])',
        '\U\1',
        'g'
      );
      -- Recursion for nested objects
      result := result || jsonb_build_object(new_key, snake_to_camel(value));
    END LOOP;
    RETURN result;
  ELSIF jsonb_typeof(input_json) = 'array' THEN
    RETURN (
      SELECT COALESCE(jsonb_agg(snake_to_camel(elem)), '[]'::jsonb)
      FROM jsonb_array_elements(input_json) elem
    );
  ELSE
    RETURN input_json;
  END IF;
END;
$$;

COMMENT ON FUNCTION snake_to_camel(JSONB) IS 'Converts snake_case keys to camelCase in JSONB objects recursively';

-- ============================================================================
-- TABLE: home_stats
-- ============================================================================

CREATE TABLE IF NOT EXISTS home_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE home_stats IS 'Homepage statistics display data';

-- RLS for home_stats
ALTER TABLE home_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "home_stats_select_public"
  ON home_stats FOR SELECT
  USING (true);

-- Seed initial stats data
INSERT INTO home_stats (key, value, label, icon, sort_order) VALUES
  ('clients', '15 000+', 'Clients satisfaits', 'mdi-account-group', 1),
  ('rating', '4.9/5', 'Note moyenne', 'mdi-star', 2),
  ('interventions', '50 000+', 'Interventions réalisées', 'mdi-wrench', 3),
  ('mechanics', '200+', 'Mécaniciens certifiés', 'mdi-certificate', 4)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  label = EXCLUDED.label,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ============================================================================
-- FUNCTION 1: home_get_services()
-- Description: Get all active services
-- ============================================================================

CREATE OR REPLACE FUNCTION home_get_services()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(
      snake_to_camel(
        jsonb_build_object(
          'id', s.id,
          'slug', s.slug,
          'name', s.name,
          'description', s.description,
          'price_from', s.price_from,
          'duration', s.duration,
          'category', s.category,
          'image_url', s.image_url,
          'badges', COALESCE(s.badges, '[]'::jsonb),
          'is_instant_quote', s.is_instant_quote,
          'included', COALESCE(s.included, '[]'::jsonb),
          'recommended', s.recommended,
          'questions', s.questions,
          'pricing_tiers', s.pricing_tiers,
          'options', s.options,
          'comparison_table', s.comparison_table
        )
      )
      ORDER BY s.category, s.sort_order, s.name
    ),
    '[]'::jsonb
  ) INTO v_result
  FROM services s
  WHERE s.active = true;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_result,
    'count', jsonb_array_length(v_result)
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'data', '[]'::jsonb,
    'error', SQLERRM
  );
END;
$$;

COMMENT ON FUNCTION home_get_services() IS 'Get all active services for homepage display';

-- ============================================================================
-- FUNCTION 2: home_get_service(p_slug)
-- Description: Get a single service by slug
-- ============================================================================

CREATE OR REPLACE FUNCTION home_get_service(p_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Validate input
  IF p_slug IS NULL OR trim(p_slug) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'data', null,
      'error', 'Slug is required'
    );
  END IF;

  SELECT snake_to_camel(
    jsonb_build_object(
      'id', s.id,
      'slug', s.slug,
      'name', s.name,
      'description', s.description,
      'price_from', s.price_from,
      'duration', s.duration,
      'category', s.category,
      'image_url', s.image_url,
      'badges', COALESCE(s.badges, '[]'::jsonb),
      'is_instant_quote', s.is_instant_quote,
      'included', COALESCE(s.included, '[]'::jsonb),
      'recommended', s.recommended,
      'questions', s.questions,
      'pricing_tiers', s.pricing_tiers,
      'options', s.options,
      'comparison_table', s.comparison_table
    )
  ) INTO v_result
  FROM services s
  WHERE s.slug = p_slug AND s.active = true;

  IF v_result IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'data', null
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_result
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'data', null,
    'error', SQLERRM
  );
END;
$$;

COMMENT ON FUNCTION home_get_service(TEXT) IS 'Get a single service by its slug';

-- ============================================================================
-- FUNCTION 3: home_get_featured_services(p_limit)
-- Description: Get featured/recommended services
-- ============================================================================

CREATE OR REPLACE FUNCTION home_get_featured_services(p_limit INTEGER DEFAULT 6)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_limit INTEGER;
BEGIN
  -- Sanitize limit
  v_limit := LEAST(GREATEST(COALESCE(p_limit, 6), 1), 20);

  SELECT COALESCE(
    jsonb_agg(
      snake_to_camel(
        jsonb_build_object(
          'id', s.id,
          'slug', s.slug,
          'name', s.name,
          'description', s.description,
          'price_from', s.price_from,
          'duration', s.duration,
          'category', s.category,
          'image_url', s.image_url,
          'badges', COALESCE(s.badges, '[]'::jsonb),
          'is_instant_quote', s.is_instant_quote,
          'included', COALESCE(s.included, '[]'::jsonb),
          'recommended', s.recommended
        )
      )
      ORDER BY s.sort_order, s.name
    ),
    '[]'::jsonb
  ) INTO v_result
  FROM (
    SELECT *
    FROM services
    WHERE recommended = true AND active = true
    ORDER BY sort_order, name
    LIMIT v_limit
  ) s;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_result,
    'count', jsonb_array_length(v_result)
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'data', '[]'::jsonb,
    'error', SQLERRM
  );
END;
$$;

COMMENT ON FUNCTION home_get_featured_services(INTEGER) IS 'Get featured/recommended services with optional limit';

-- ============================================================================
-- FUNCTION 4: home_get_testimonials(p_limit)
-- Description: Get verified testimonials for homepage
-- ============================================================================

CREATE OR REPLACE FUNCTION home_get_testimonials(p_limit INTEGER DEFAULT 6)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_limit INTEGER;
BEGIN
  -- Sanitize limit
  v_limit := LEAST(GREATEST(COALESCE(p_limit, 6), 1), 20);

  SELECT COALESCE(
    jsonb_agg(
      snake_to_camel(
        jsonb_build_object(
          'id', t.id,
          'user_id', t.user_id,
          'user_name', t.user_name,
          'user_avatar', t.user_avatar,
          'rating', t.rating,
          'comment', t.comment,
          'service_id', t.service_id,
          'service_name', t.service_name,
          'created_at', t.created_at,
          'verified', t.verified
        )
      )
      ORDER BY t.created_at DESC
    ),
    '[]'::jsonb
  ) INTO v_result
  FROM (
    SELECT *
    FROM testimonials
    WHERE verified = true AND rating >= 4
    ORDER BY created_at DESC
    LIMIT v_limit
  ) t;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_result,
    'count', jsonb_array_length(v_result)
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'data', '[]'::jsonb,
    'error', SQLERRM
  );
END;
$$;

COMMENT ON FUNCTION home_get_testimonials(INTEGER) IS 'Get verified testimonials with rating >= 4 for homepage';

-- ============================================================================
-- FUNCTION 5: home_get_stats()
-- Description: Get homepage statistics
-- ============================================================================

CREATE OR REPLACE FUNCTION home_get_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'key', hs.key,
        'value', hs.value,
        'label', hs.label,
        'icon', hs.icon
      )
      ORDER BY hs.sort_order
    ),
    '[]'::jsonb
  ) INTO v_result
  FROM home_stats hs;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_result,
    'count', jsonb_array_length(v_result)
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'data', '[]'::jsonb,
    'error', SQLERRM
  );
END;
$$;

COMMENT ON FUNCTION home_get_stats() IS 'Get homepage statistics (clients count, rating, interventions, mechanics)';

-- ============================================================================
-- FUNCTION 6: home_search_services(p_query)
-- Description: Search services by text
-- ============================================================================

CREATE OR REPLACE FUNCTION home_search_services(p_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_query TEXT;
BEGIN
  -- Sanitize and prepare query
  v_query := trim(COALESCE(p_query, ''));

  -- If query is too short, return all services
  IF length(v_query) < 2 THEN
    RETURN home_get_services();
  END IF;

  -- Search in name, description, and category
  SELECT COALESCE(
    jsonb_agg(
      snake_to_camel(
        jsonb_build_object(
          'id', s.id,
          'slug', s.slug,
          'name', s.name,
          'description', s.description,
          'price_from', s.price_from,
          'duration', s.duration,
          'category', s.category,
          'image_url', s.image_url,
          'badges', COALESCE(s.badges, '[]'::jsonb),
          'is_instant_quote', s.is_instant_quote,
          'included', COALESCE(s.included, '[]'::jsonb),
          'recommended', s.recommended
        )
      )
      ORDER BY
        -- Exact match in name first
        CASE WHEN lower(s.name) = lower(v_query) THEN 0
             WHEN lower(s.name) LIKE lower(v_query) || '%' THEN 1
             WHEN lower(s.name) LIKE '%' || lower(v_query) || '%' THEN 2
             ELSE 3
        END,
        s.name
    ),
    '[]'::jsonb
  ) INTO v_result
  FROM services s
  WHERE s.active = true
    AND (
      lower(s.name) LIKE '%' || lower(v_query) || '%'
      OR lower(s.description) LIKE '%' || lower(v_query) || '%'
      OR lower(s.category) LIKE '%' || lower(v_query) || '%'
    )
  LIMIT 20;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_result,
    'count', jsonb_array_length(v_result),
    'query', v_query
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'data', '[]'::jsonb,
    'error', SQLERRM
  );
END;
$$;

COMMENT ON FUNCTION home_search_services(TEXT) IS 'Search services by name, description, or category';

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant execute to authenticated and anon users for public functions
GRANT EXECUTE ON FUNCTION home_get_services() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION home_get_service(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION home_get_featured_services(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION home_get_testimonials(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION home_get_stats() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION home_search_services(TEXT) TO authenticated, anon;

-- Grant select on tables
GRANT SELECT ON home_stats TO authenticated, anon;
GRANT SELECT ON services TO authenticated, anon;
GRANT SELECT ON testimonials TO authenticated, anon;

-- ============================================================================
-- SEED DATA: Sample services for testing
-- ============================================================================

INSERT INTO services (slug, name, description, price_from, duration, category, image_url, badges, is_instant_quote, included, recommended, sort_order) VALUES
  (
    'vidange-huile-moteur',
    'Vidange huile moteur',
    'Remplacement complet de l''huile moteur et du filtre à huile pour assurer le bon fonctionnement de votre véhicule.',
    69,
    45,
    'entretien',
    '/images/services/vidange.jpg',
    '["populaire", "rapide"]'::jsonb,
    true,
    '["Huile moteur 5W30/5W40", "Filtre à huile neuf", "Diagnostic 20 points", "Mise à niveau des liquides"]'::jsonb,
    true,
    1
  ),
  (
    'revision-complete',
    'Révision complète',
    'Révision complète de votre véhicule incluant vidange, filtres, et contrôle de tous les points de sécurité.',
    149,
    120,
    'entretien',
    '/images/services/revision.jpg',
    '["complet", "recommandé"]'::jsonb,
    true,
    '["Vidange huile moteur", "Tous filtres (huile, air, habitacle)", "Contrôle 50 points", "Mise à niveau liquides"]'::jsonb,
    true,
    2
  ),
  (
    'plaquettes-frein-avant',
    'Plaquettes de frein avant',
    'Remplacement des plaquettes de frein avant pour garantir votre sécurité.',
    89,
    60,
    'freinage',
    '/images/services/freins.jpg',
    '["sécurité", "urgent"]'::jsonb,
    true,
    '["Plaquettes de frein neuves", "Contrôle disques", "Purge du liquide de frein", "Test freinage"]'::jsonb,
    true,
    3
  ),
  (
    'disques-plaquettes-avant',
    'Disques + plaquettes avant',
    'Remplacement complet du système de freinage avant : disques et plaquettes.',
    189,
    90,
    'freinage',
    '/images/services/disques-freins.jpg',
    '["sécurité", "complet"]'::jsonb,
    true,
    '["Disques de frein neufs", "Plaquettes de frein neuves", "Purge liquide", "Test freinage complet"]'::jsonb,
    false,
    4
  ),
  (
    'montage-pneus',
    'Montage pneus',
    'Montage et équilibrage de vos pneus neufs ou de vos pneus de saison.',
    15,
    30,
    'pneus',
    '/images/services/pneus.jpg',
    '["rapide", "économique"]'::jsonb,
    true,
    '["Démontage anciens pneus", "Montage nouveaux pneus", "Équilibrage", "Contrôle pression"]'::jsonb,
    true,
    5
  ),
  (
    'climatisation-recharge',
    'Recharge climatisation',
    'Recharge du gaz de climatisation et contrôle du système pour un confort optimal.',
    79,
    45,
    'climatisation',
    '/images/services/climatisation.jpg',
    '["confort", "saisonnier"]'::jsonb,
    true,
    '["Diagnostic système", "Recharge gaz R134a/R1234yf", "Test de performance", "Contrôle fuites"]'::jsonb,
    true,
    6
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_from = EXCLUDED.price_from,
  duration = EXCLUDED.duration,
  category = EXCLUDED.category,
  badges = EXCLUDED.badges,
  is_instant_quote = EXCLUDED.is_instant_quote,
  included = EXCLUDED.included,
  recommended = EXCLUDED.recommended,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ============================================================================
-- SEED DATA: Sample testimonials for testing
-- ============================================================================

INSERT INTO testimonials (user_id, user_name, user_avatar, rating, comment, service_id, service_name, verified, created_at) VALUES
  (
    'user-1',
    'Marie D.',
    '/images/avatars/user1.jpg',
    5,
    'Service impeccable ! Le mécanicien est arrivé à l''heure, a fait la vidange rapidement et proprement. Je recommande vivement !',
    'vidange-huile-moteur',
    'Vidange huile moteur',
    true,
    NOW() - INTERVAL '5 days'
  ),
  (
    'user-2',
    'Thomas L.',
    '/images/avatars/user2.jpg',
    5,
    'Très satisfait de la révision complète. Le mécanicien a pris le temps de tout m''expliquer. Prix transparent, pas de surprise.',
    'revision-complete',
    'Révision complète',
    true,
    NOW() - INTERVAL '10 days'
  ),
  (
    'user-3',
    'Sophie M.',
    '/images/avatars/user3.jpg',
    4,
    'Changement de plaquettes de frein effectué rapidement. Bon rapport qualité/prix. Service à domicile très pratique.',
    'plaquettes-frein-avant',
    'Plaquettes de frein avant',
    true,
    NOW() - INTERVAL '15 days'
  ),
  (
    'user-4',
    'Pierre B.',
    '/images/avatars/user4.jpg',
    5,
    'Ma climatisation ne fonctionnait plus depuis des mois. Recharge faite en moins d''une heure, tout fonctionne parfaitement !',
    'climatisation-recharge',
    'Recharge climatisation',
    true,
    NOW() - INTERVAL '20 days'
  ),
  (
    'user-5',
    'Julie R.',
    '/images/avatars/user5.jpg',
    5,
    'Montage de mes 4 pneus hiver effectué sur mon parking. Gain de temps énorme, plus besoin d''aller au garage !',
    'montage-pneus',
    'Montage pneus',
    true,
    NOW() - INTERVAL '25 days'
  ),
  (
    'user-6',
    'Marc V.',
    '/images/avatars/user6.jpg',
    4,
    'Bon service, mécanicien professionnel. La révision a été faite dans les règles. Je referai appel à Gomecano.',
    'revision-complete',
    'Révision complète',
    true,
    NOW() - INTERVAL '30 days'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
