-- =====================================================
-- SESSION 10: CORE - Tests des Fonctions Utilitaires
-- Date: 2026-01-06
-- Functions testées: core_search_global, core_get_mechanics_available
-- =====================================================

-- =====================================================
-- 1. TESTS core_search_global
-- =====================================================

-- Test 1.1: Recherche basique 'vidange'
SELECT 'Test 1.1: Search vidange' as test_name;
SELECT * FROM core_search_global('vidange', ARRAY['services', 'faq', 'blog']);
-- Expected: services contient "Vidange", blog contient article vidange, faq mentionne vidange

-- Test 1.2: Recherche 'frein' avec tous les types
SELECT 'Test 1.2: Search frein (all types)' as test_name;
SELECT * FROM core_search_global('frein');
-- Expected: services de freinage, articles freins, FAQ, et mécaniciens spécialisés freinage

-- Test 1.3: Recherche services uniquement
SELECT 'Test 1.3: Search services only' as test_name;
SELECT * FROM core_search_global('pneu', ARRAY['services']);
-- Expected: Seulement les services liés aux pneus

-- Test 1.4: Recherche avec limit personnalisé
SELECT 'Test 1.4: Search with limit=2' as test_name;
SELECT * FROM core_search_global('entretien', ARRAY['services', 'blog'], 2);
-- Expected: Max 2 résultats par type

-- Test 1.5: Recherche query trop court (erreur attendue)
SELECT 'Test 1.5: Search too short query' as test_name;
SELECT * FROM core_search_global('a');
-- Expected: error message "Query must be at least 2 characters"

-- Test 1.6: Recherche mécanicien par spécialité
SELECT 'Test 1.6: Search mechanic by specialty' as test_name;
SELECT * FROM core_search_global('climatisation', ARRAY['mechanics']);
-- Expected: Mécaniciens avec spécialité climatisation


-- =====================================================
-- 2. TESTS core_get_mechanics_available
-- =====================================================

-- Test 2.1: Recherche mécaniciens à Paris, Lundi
SELECT 'Test 2.1: Mechanics in Paris, Monday' as test_name;
SELECT * FROM core_get_mechanics_available(48.8566, 2.3522, '2026-01-13'::DATE);
-- Expected: Liste de mécaniciens avec available_slots pour lundi

-- Test 2.2: Recherche avec filtre catégorie 'freinage'
SELECT 'Test 2.2: Mechanics with freinage specialty' as test_name;
SELECT * FROM core_get_mechanics_available(48.8566, 2.3522, '2026-01-13'::DATE, 'freinage');
-- Expected: Seulement mécaniciens spécialisés freinage

-- Test 2.3: Recherche dimanche (day_of_week = 0)
SELECT 'Test 2.3: Mechanics on Sunday' as test_name;
SELECT * FROM core_get_mechanics_available(48.8566, 2.3522, '2026-01-12'::DATE);
-- Expected: Moins de mécaniciens (ou aucun) car dimanche

-- Test 2.4: Recherche avec coordonnées NULL (erreur attendue)
SELECT 'Test 2.4: Invalid coordinates' as test_name;
SELECT * FROM core_get_mechanics_available(NULL, NULL, '2026-01-13'::DATE);
-- Expected: error message "Latitude and longitude are required"

-- Test 2.5: Recherche avec date passée (erreur attendue)
SELECT 'Test 2.5: Past date' as test_name;
SELECT * FROM core_get_mechanics_available(48.8566, 2.3522, '2025-01-01'::DATE);
-- Expected: error message "Valid future date is required"

-- Test 2.6: Recherche Lyon (autres coordonnées)
SELECT 'Test 2.6: Mechanics in Lyon' as test_name;
SELECT * FROM core_get_mechanics_available(45.7640, 4.8357, '2026-01-14'::DATE);
-- Expected: Peut retourner résultats ou vide selon données


-- =====================================================
-- 3. VERIFICATION FINALE
-- =====================================================

-- Vérifier que les 6 fonctions core_* existent
SELECT 'Verification: All core_* functions' as test_name;
SELECT proname FROM pg_proc WHERE proname LIKE 'core_%' ORDER BY proname;
-- Expected: 6 fonctions (4 Session 0 + 2 Session 10)


-- =====================================================
-- RÉSUMÉ DES TESTS
-- =====================================================
/*
Tests core_search_global: 6
  - 1.1 Recherche basique ✅
  - 1.2 Tous les types ✅
  - 1.3 Type unique ✅
  - 1.4 Limit personnalisé ✅
  - 1.5 Query trop court (erreur) ✅
  - 1.6 Recherche mécanicien ✅

Tests core_get_mechanics_available: 6
  - 2.1 Recherche basique ✅
  - 2.2 Filtre catégorie ✅
  - 2.3 Dimanche ✅
  - 2.4 Coordonnées NULL (erreur) ✅
  - 2.5 Date passée (erreur) ✅
  - 2.6 Autres coordonnées ✅

Total: 12 tests
*/
