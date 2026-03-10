import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSearch } from '../useSearch'

// Mock supabase service
vi.mock('@/services/supabase', () => ({
  searchGlobal: vi.fn(),
}))

import { searchGlobal } from '@/services/supabase'

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { query, results, isLoading, error, searchTypes } = useSearch()

      expect(query.value).toBe('')
      expect(results.value).toBeNull()
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(searchTypes.value).toEqual(['services', 'blog', 'faq', 'mechanics'])
    })
  })

  describe('computed properties', () => {
    it('isValidQuery should be false for short queries', () => {
      const { query, isValidQuery } = useSearch()

      query.value = ''
      expect(isValidQuery.value).toBe(false)

      query.value = 'a'
      expect(isValidQuery.value).toBe(false)

      query.value = 'ab'
      expect(isValidQuery.value).toBe(true)
    })

    it('hasResults should reflect results state', () => {
      const { results, hasResults } = useSearch()

      expect(hasResults.value).toBe(false)

      results.value = {
        services: [],
        blog: [],
        faq: [],
        mechanics: [],
        total_count: 0,
        query: 'test',
      }
      expect(hasResults.value).toBe(false)

      results.value.total_count = 5
      expect(hasResults.value).toBe(true)
    })

    it('allResults should flatten all result types', () => {
      const { results, allResults } = useSearch()

      results.value = {
        services: [{ id: '1', type: 'service', title: 'Service 1', description: 'desc' }],
        blog: [{ id: '2', type: 'blog', title: 'Blog 1', description: 'desc' }],
        faq: [],
        mechanics: [{ id: '3', type: 'mechanic', title: 'Mech 1', description: 'desc' }],
        total_count: 3,
        query: 'test',
      }

      expect(allResults.value).toHaveLength(3)
      expect(allResults.value[0].id).toBe('1')
      expect(allResults.value[1].id).toBe('2')
      expect(allResults.value[2].id).toBe('3')
    })
  })

  describe('search function', () => {
    it('should reject queries shorter than 2 characters', async () => {
      const { search, error } = useSearch()

      const result = await search('a')

      expect(result).toBeNull()
      expect(error.value).toBe('La recherche doit contenir au moins 2 caractères')
      expect(searchGlobal).not.toHaveBeenCalled()
    })

    it('should call searchGlobal with correct params', async () => {
      const mockResponse = {
        data: {
          services: [],
          blog: [],
          faq: [],
          mechanics: [],
          total_count: 0,
          query: 'vidange',
        },
        error: null,
      }
      vi.mocked(searchGlobal).mockResolvedValue(mockResponse)

      const { search, results } = useSearch()

      await search('vidange')

      expect(searchGlobal).toHaveBeenCalledWith(
        'vidange',
        ['services', 'blog', 'faq', 'mechanics'],
        5
      )
      expect(results.value).toEqual(mockResponse.data)
    })

    it('should handle search error', async () => {
      vi.mocked(searchGlobal).mockResolvedValue({
        data: null,
        error: new Error('Network error'),
      })

      const { search, error, results } = useSearch()

      await search('test query')

      expect(error.value).toBe('Network error')
      expect(results.value).toBeNull()
    })

    it('should handle API error in response', async () => {
      vi.mocked(searchGlobal).mockResolvedValue({
        data: {
          services: [],
          blog: [],
          faq: [],
          mechanics: [],
          total_count: 0,
          query: 'test',
          error: 'Query must be at least 2 characters',
        },
        error: null,
      })

      const { search, error } = useSearch()

      await search('test query')

      expect(error.value).toBe('Query must be at least 2 characters')
    })

    it('should set isLoading during search', async () => {
      let resolvePromise: (value: unknown) => void
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      vi.mocked(searchGlobal).mockReturnValue(pendingPromise as never)

      const { search, isLoading } = useSearch()

      expect(isLoading.value).toBe(false)

      const searchPromise = search('test query')
      expect(isLoading.value).toBe(true)

      resolvePromise!({
        data: { services: [], blog: [], faq: [], mechanics: [], total_count: 0, query: 'test' },
        error: null,
      })

      await searchPromise
      expect(isLoading.value).toBe(false)
    })
  })

  describe('specialized search functions', () => {
    beforeEach(() => {
      vi.mocked(searchGlobal).mockResolvedValue({
        data: {
          services: [],
          blog: [],
          faq: [],
          mechanics: [],
          total_count: 0,
          query: 'test',
        },
        error: null,
      })
    })

    it('searchServices should only search services', async () => {
      const { searchServices } = useSearch()

      await searchServices('vidange')

      expect(searchGlobal).toHaveBeenCalledWith('vidange', ['services'], 10)
    })

    it('searchBlog should only search blog', async () => {
      const { searchBlog } = useSearch()

      await searchBlog('entretien')

      expect(searchGlobal).toHaveBeenCalledWith('entretien', ['blog'], 10)
    })

    it('searchFaq should only search FAQ', async () => {
      const { searchFaq } = useSearch()

      await searchFaq('paiement')

      expect(searchGlobal).toHaveBeenCalledWith('paiement', ['faq'], 10)
    })

    it('searchMechanics should only search mechanics', async () => {
      const { searchMechanics } = useSearch()

      await searchMechanics('freinage')

      expect(searchGlobal).toHaveBeenCalledWith('freinage', ['mechanics'], 10)
    })
  })

  describe('clearSearch', () => {
    it('should reset all state', () => {
      const { query, results, error, clearSearch } = useSearch()

      query.value = 'test'
      results.value = {
        services: [],
        blog: [],
        faq: [],
        mechanics: [],
        total_count: 5,
        query: 'test',
      }
      error.value = 'Some error'

      clearSearch()

      expect(query.value).toBe('')
      expect(results.value).toBeNull()
      expect(error.value).toBeNull()
    })
  })

  describe('setSearchTypes', () => {
    it('should update search types', () => {
      const { searchTypes, setSearchTypes } = useSearch()

      expect(searchTypes.value).toEqual(['services', 'blog', 'faq', 'mechanics'])

      setSearchTypes(['services', 'faq'])

      expect(searchTypes.value).toEqual(['services', 'faq'])
    })
  })
})
