# Tests Composables

> Tests unitaires pour les composables Vue.js avec Vitest

---

## 📋 Vue d'Ensemble

**Framework** : Vitest + Vue Test Utils
**Coverage actuel** : 2/10 composables testés

### Tests Existants

| Composable | Test | Coverage | Statut |
|------------|------|----------|--------|
| usePayments | ✅ usePayments.test.ts | ~70% | ✅ Production |
| useLoyalty | ✅ useLoyalty.test.ts | ~60% | ✅ Production |
| useAuth | ❌ | 0% | ⏳ À créer |
| useVehicles | ❌ | 0% | ⏳ À créer |
| useSupport | ❌ | 0% | ⏳ À créer |
| useEmergency | ❌ | 0% | ⏳ À créer |
| useFamilySharing | ❌ | 0% | ⏳ À créer |
| useSubscription | ❌ | 0% | ⏳ À créer |

---

## 🚀 Lancer les Tests

```bash
# Tous les tests
npm run test

# Mode watch
npm run test:watch

# Coverage
npm run test:coverage

# Test spécifique
npm run test usePayments
```

---

## 📝 Template Test Composable

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMyComposable } from '../useMyComposable'
import { supabase } from '@/services/supabase'

// Mock Supabase
vi.mock('@/services/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'user-123' } },
        error: null
      }))
    }
  }
}))

describe('useMyComposable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchData', () => {
    it('should fetch data successfully', async () => {
      const mockData = [{ id: '1', name: 'Test' }]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ data: mockData, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq
      } as any)

      const { fetchData, data, loading, error } = useMyComposable()

      expect(loading.value).toBe(false)

      await fetchData()

      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
      expect(data.value).toEqual(mockData)
    })

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Database error')

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: mockError })
      } as any)

      const { fetchData, error } = useMyComposable()

      await fetchData()

      expect(error.value).toBeTruthy()
    })
  })

  describe('computed properties', () => {
    it('should compute values correctly', async () => {
      // Test computed logic
    })
  })
})
```

---

## 🎯 Bonnes Pratiques

### DO ✅

1. **Mock Supabase** systématiquement
2. **Tester happy path** et error cases
3. **Tester computed** properties
4. **Clear mocks** dans beforeEach
5. **TypeScript strict** dans tests
6. **JSDoc** pour tests complexes

### DON'T ❌

1. ❌ Tests sans mocks (appels DB réels)
2. ❌ Tests dépendants de l'ordre
3. ❌ Tests sans assertions
4. ❌ Console.log dans tests
5. ❌ Hardcoded IDs (utiliser factory)

---

## 📚 Ressources

- [Vitest Docs](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Composables](https://vuejs.org/guide/scaling-up/testing.html#testing-composables)

---

## 🎯 Objectifs Coverage

| Phase | Target | Deadline |
|-------|--------|----------|
| Phase 1 | 30% (3/10 composables) | Sprint 2 |
| Phase 2 | 60% (6/10 composables) | Sprint 3 |
| Phase 3 | 80% (8/10 composables) | Sprint 4 |

**Priorité tests** :
1. 🔴 useAuth (critique)
2. 🔴 usePayments (✅ fait)
3. 🔴 useLoyalty (✅ fait)
4. 🟡 useVehicles
5. 🟡 useSupport

---

**Créé le** : 2026-01-06
**Dernière mise à jour** : 2026-01-06
