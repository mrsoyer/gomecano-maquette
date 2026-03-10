-- ============================================================================
-- Tests: B2C Home Functions
-- Session: 02-b2c-home
-- Date: 2026-01-06
-- Run with: psql -f home_functions.test.sql
-- ============================================================================

-- Enable verbose output
\set VERBOSITY verbose

-- ============================================================================
-- Test Setup
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '====== Starting Home Functions Tests ======';
END $$;

-- ============================================================================
-- TEST 1: home_get_services()
-- ============================================================================

DO $$
DECLARE
  v_result JSONB;
  v_success BOOLEAN;
  v_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 1: home_get_services()';

  -- Execute function
  v_result := home_get_services();
  v_success := (v_result->>'success')::boolean;
  v_count := (v_result->>'count')::integer;

  -- Assertions
  IF NOT v_success THEN
    RAISE EXCEPTION 'TEST 1 FAILED: success should be true, got: %', v_result->>'error';
  END IF;

  IF v_count < 1 THEN
    RAISE EXCEPTION 'TEST 1 FAILED: should return at least 1 service, got: %', v_count;
  END IF;

  -- Check first service has camelCase keys
  IF v_result->'data'->0->>'priceFrom' IS NULL THEN
    RAISE EXCEPTION 'TEST 1 FAILED: priceFrom key should exist (camelCase)';
  END IF;

  RAISE NOTICE 'TEST 1 PASSED: Returned % services', v_count;
END $$;

-- ============================================================================
-- TEST 2: home_get_service(slug) - Existing service
-- ============================================================================

DO $$
DECLARE
  v_result JSONB;
  v_success BOOLEAN;
  v_service_name TEXT;
BEGIN
  RAISE NOTICE 'TEST 2: home_get_service(slug) - Existing service';

  -- Execute function with existing slug
  v_result := home_get_service('vidange-huile-moteur');
  v_success := (v_result->>'success')::boolean;
  v_service_name := v_result->'data'->>'name';

  -- Assertions
  IF NOT v_success THEN
    RAISE EXCEPTION 'TEST 2 FAILED: success should be true, got: %', v_result->>'error';
  END IF;

  IF v_service_name IS NULL THEN
    RAISE EXCEPTION 'TEST 2 FAILED: should return service data';
  END IF;

  IF v_service_name != 'Vidange huile moteur' THEN
    RAISE EXCEPTION 'TEST 2 FAILED: expected "Vidange huile moteur", got: %', v_service_name;
  END IF;

  RAISE NOTICE 'TEST 2 PASSED: Found service "%"', v_service_name;
END $$;

-- ============================================================================
-- TEST 3: home_get_service(slug) - Non-existing service
-- ============================================================================

DO $$
DECLARE
  v_result JSONB;
  v_success BOOLEAN;
BEGIN
  RAISE NOTICE 'TEST 3: home_get_service(slug) - Non-existing service';

  -- Execute function with non-existing slug
  v_result := home_get_service('non-existing-slug');
  v_success := (v_result->>'success')::boolean;

  -- Assertions
  IF NOT v_success THEN
    RAISE EXCEPTION 'TEST 3 FAILED: success should be true even for non-existing slug';
  END IF;

  IF v_result->'data' IS NOT NULL AND v_result->>'data' != 'null' THEN
    RAISE EXCEPTION 'TEST 3 FAILED: data should be null for non-existing slug, got: %', v_result->'data';
  END IF;

  RAISE NOTICE 'TEST 3 PASSED: Correctly returned null for non-existing slug';
END $$;

-- ============================================================================
-- TEST 4: home_get_service(slug) - Empty slug
-- ============================================================================

DO $$
DECLARE
  v_result JSONB;
  v_success BOOLEAN;
BEGIN
  RAISE NOTICE 'TEST 4: home_get_service(slug) - Empty slug';

  -- Execute function with empty slug
  v_result := home_get_service('');
  v_success := (v_result->>'success')::boolean;

  -- Assertions
  IF v_success THEN
    RAISE EXCEPTION 'TEST 4 FAILED: success should be false for empty slug';
  END IF;

  IF v_result->>'error' IS NULL THEN
    RAISE EXCEPTION 'TEST 4 FAILED: should have error message';
  END IF;

  RAISE NOTICE 'TEST 4 PASSED: Correctly returned error for empty slug';
END $$;

-- ============================================================================
-- TEST 5: home_get_featured_services(limit)
-- ============================================================================

DO $$
DECLARE
  v_result JSONB;
  v_success BOOLEAN;
  v_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 5: home_get_featured_services(limit)';

  -- Execute function with default limit
  v_result := home_get_featured_services();
  v_success := (v_result->>'success')::boolean;
  v_count := (v_result->>'count')::integer;

  -- Assertions
  IF NOT v_success THEN
    RAISE EXCEPTION 'TEST 5 FAILED: success should be true, got: %', v_result->>'error';
  END IF;

  -- Check all returned services have recommended = true
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_result->'data') elem
    WHERE (elem->>'recommended')::boolean IS NOT TRUE
  ) THEN
    RAISE EXCEPTION 'TEST 5 FAILED: all services should have recommended = true';
  END IF;

  RAISE NOTICE 'TEST 5 PASSED: Returned % featured services', v_count;
END $$;

-- ============================================================================
-- TEST 6: home_get_featured_services(limit) - Custom limit
-- ============================================================================

DO $$
DECLARE
  v_result JSONB;
  v_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 6: home_get_featured_services(limit) - Custom limit';

  -- Execute function with limit = 2
  v_result := home_get_featured_services(2);
  v_count := (v_result->>'count')::integer;

  -- Assertions
  IF v_count > 2 THEN
    RAISE EXCEPTION 'TEST 6 FAILED: should return max 2 services, got: %', v_count;
  END IF;

  RAISE NOTICE 'TEST 6 PASSED: Respected limit of 2, returned % services', v_count;
END $$;

-- ============================================================================
-- TEST 7: home_get_testimonials(limit)
-- ============================================================================

DO $$
DECLARE
  v_result JSONB;
  v_success BOOLEAN;
  v_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 7: home_get_testimonials(limit)';

  -- Execute function
  v_result := home_get_testimonials();
  v_success := (v_result->>'success')::boolean;
  v_count := (v_result->>'count')::integer;

  -- Assertions
  IF NOT v_success THEN
    RAISE EXCEPTION 'TEST 7 FAILED: success should be true, got: %', v_result->>'error';
  END IF;

  IF v_count < 1 THEN
    RAISE EXCEPTION 'TEST 7 FAILED: should return at least 1 testimonial, got: %', v_count;
  END IF;

  -- Check all testimonials are verified and have rating >= 4
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_result->'data') elem
    WHERE (elem->>'verified')::boolean IS NOT TRUE
       OR (elem->>'rating')::integer < 4
  ) THEN
    RAISE EXCEPTION 'TEST 7 FAILED: all testimonials should be verified with rating >= 4';
  END IF;

  -- Check camelCase transformation
  IF v_result->'data'->0->>'userName' IS NULL THEN
    RAISE EXCEPTION 'TEST 7 FAILED: userName key should exist (camelCase)';
  END IF;

  RAISE NOTICE 'TEST 7 PASSED: Returned % verified testimonials', v_count;
END $$;

-- ============================================================================
-- TEST 8: home_get_stats()
-- ============================================================================

DO $$
DECLARE
  v_result JSONB;
  v_success BOOLEAN;
  v_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 8: home_get_stats()';

  -- Execute function
  v_result := home_get_stats();
  v_success := (v_result->>'success')::boolean;
  v_count := (v_result->>'count')::integer;

  -- Assertions
  IF NOT v_success THEN
    RAISE EXCEPTION 'TEST 8 FAILED: success should be true, got: %', v_result->>'error';
  END IF;

  IF v_count != 4 THEN
    RAISE EXCEPTION 'TEST 8 FAILED: should return exactly 4 stats, got: %', v_count;
  END IF;

  -- Check required keys exist
  IF v_result->'data'->0->>'key' IS NULL
     OR v_result->'data'->0->>'value' IS NULL
     OR v_result->'data'->0->>'label' IS NULL THEN
    RAISE EXCEPTION 'TEST 8 FAILED: stats should have key, value, label';
  END IF;

  RAISE NOTICE 'TEST 8 PASSED: Returned % stats', v_count;
END $$;

-- ============================================================================
-- TEST 9: home_search_services(query) - Valid query
-- ============================================================================

DO $$
DECLARE
  v_result JSONB;
  v_success BOOLEAN;
  v_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 9: home_search_services(query) - Valid query';

  -- Execute function
  v_result := home_search_services('vidange');
  v_success := (v_result->>'success')::boolean;
  v_count := (v_result->>'count')::integer;

  -- Assertions
  IF NOT v_success THEN
    RAISE EXCEPTION 'TEST 9 FAILED: success should be true, got: %', v_result->>'error';
  END IF;

  IF v_count < 1 THEN
    RAISE EXCEPTION 'TEST 9 FAILED: should find services matching "vidange", got: %', v_count;
  END IF;

  IF v_result->>'query' != 'vidange' THEN
    RAISE EXCEPTION 'TEST 9 FAILED: query should be echoed in response';
  END IF;

  RAISE NOTICE 'TEST 9 PASSED: Found % services matching "vidange"', v_count;
END $$;

-- ============================================================================
-- TEST 10: home_search_services(query) - Short query
-- ============================================================================

DO $$
DECLARE
  v_result JSONB;
  v_success BOOLEAN;
  v_count INTEGER;
  v_all_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 10: home_search_services(query) - Short query';

  -- Get all services count first
  v_all_count := (home_get_services()->>'count')::integer;

  -- Execute function with short query
  v_result := home_search_services('a');
  v_success := (v_result->>'success')::boolean;
  v_count := (v_result->>'count')::integer;

  -- Assertions
  IF NOT v_success THEN
    RAISE EXCEPTION 'TEST 10 FAILED: success should be true';
  END IF;

  -- Short query should return all services
  IF v_count != v_all_count THEN
    RAISE EXCEPTION 'TEST 10 FAILED: short query should return all services (%), got: %', v_all_count, v_count;
  END IF;

  RAISE NOTICE 'TEST 10 PASSED: Short query returned all % services', v_count;
END $$;

-- ============================================================================
-- TEST 11: home_search_services(query) - Case insensitive
-- ============================================================================

DO $$
DECLARE
  v_result_lower JSONB;
  v_result_upper JSONB;
  v_count_lower INTEGER;
  v_count_upper INTEGER;
BEGIN
  RAISE NOTICE 'TEST 11: home_search_services(query) - Case insensitive';

  -- Execute function with different cases
  v_result_lower := home_search_services('vidange');
  v_result_upper := home_search_services('VIDANGE');
  v_count_lower := (v_result_lower->>'count')::integer;
  v_count_upper := (v_result_upper->>'count')::integer;

  -- Assertions
  IF v_count_lower != v_count_upper THEN
    RAISE EXCEPTION 'TEST 11 FAILED: search should be case insensitive. Lower: %, Upper: %', v_count_lower, v_count_upper;
  END IF;

  RAISE NOTICE 'TEST 11 PASSED: Case insensitive search works (% results)', v_count_lower;
END $$;

-- ============================================================================
-- TEST 12: snake_to_camel() helper function
-- ============================================================================

DO $$
DECLARE
  v_input JSONB;
  v_output JSONB;
BEGIN
  RAISE NOTICE 'TEST 12: snake_to_camel() helper function';

  -- Test simple object
  v_input := '{"first_name": "John", "last_name": "Doe"}'::jsonb;
  v_output := snake_to_camel(v_input);

  IF v_output->>'firstName' IS NULL OR v_output->>'lastName' IS NULL THEN
    RAISE EXCEPTION 'TEST 12 FAILED: should convert snake_case to camelCase';
  END IF;

  IF v_output->>'first_name' IS NOT NULL THEN
    RAISE EXCEPTION 'TEST 12 FAILED: should not have snake_case keys anymore';
  END IF;

  -- Test nested object
  v_input := '{"user_data": {"first_name": "John"}}'::jsonb;
  v_output := snake_to_camel(v_input);

  IF v_output->'userData'->>'firstName' IS NULL THEN
    RAISE EXCEPTION 'TEST 12 FAILED: should convert nested objects';
  END IF;

  -- Test array
  v_input := '[{"user_id": 1}, {"user_id": 2}]'::jsonb;
  v_output := snake_to_camel(v_input);

  IF v_output->0->>'userId' IS NULL THEN
    RAISE EXCEPTION 'TEST 12 FAILED: should convert arrays';
  END IF;

  RAISE NOTICE 'TEST 12 PASSED: snake_to_camel works correctly';
END $$;

-- ============================================================================
-- Test Summary
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '====== All Home Functions Tests PASSED ======';
END $$;
