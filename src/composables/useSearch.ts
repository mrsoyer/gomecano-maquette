import { ref, computed } from 'vue'
import {
  searchGlobal,
  type SearchType,
  type GlobalSearchResult,
  type SearchResultItem,
} from '@/services/supabase'

/**
 * Composable for global search functionality
 * Uses core_search_global RPC function
 */
export function useSearch() {
  const query = ref('')
  const results = ref<GlobalSearchResult | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchTypes = ref<SearchType[]>(['services', 'blog', 'faq', 'mechanics'])

  // Computed: all results flattened
  const allResults = computed<SearchResultItem[]>(() => {
    if (!results.value) return []
    return [
      ...results.value.services,
      ...results.value.blog,
      ...results.value.faq,
      ...results.value.mechanics,
    ]
  })

  // Computed: has results
  const hasResults = computed(() => results.value && results.value.total_count > 0)

  // Computed: is valid query (min 2 chars)
  const isValidQuery = computed(() => query.value.trim().length >= 2)

  /**
   * Perform search
   * @param searchQuery - Optional query override
   * @param types - Optional types override
   * @param limit - Max results per type
   */
  async function search(
    searchQuery?: string,
    types?: SearchType[],
    limit = 5
  ) {
    const q = searchQuery ?? query.value
    const t = types ?? searchTypes.value

    if (q.trim().length < 2) {
      error.value = 'La recherche doit contenir au moins 2 caractères'
      return null
    }

    try {
      isLoading.value = true
      error.value = null

      const { data, error: searchError } = await searchGlobal(q, t, limit)

      if (searchError) {
        throw searchError
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      results.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur de recherche'
      results.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Search only services
   */
  async function searchServices(searchQuery: string, limit = 10) {
    return search(searchQuery, ['services'], limit)
  }

  /**
   * Search only blog posts
   */
  async function searchBlog(searchQuery: string, limit = 10) {
    return search(searchQuery, ['blog'], limit)
  }

  /**
   * Search only FAQ
   */
  async function searchFaq(searchQuery: string, limit = 10) {
    return search(searchQuery, ['faq'], limit)
  }

  /**
   * Search only mechanics
   */
  async function searchMechanics(searchQuery: string, limit = 10) {
    return search(searchQuery, ['mechanics'], limit)
  }

  /**
   * Clear search results
   */
  function clearSearch() {
    query.value = ''
    results.value = null
    error.value = null
  }

  /**
   * Set search types to filter
   */
  function setSearchTypes(types: SearchType[]) {
    searchTypes.value = types
  }

  return {
    // State
    query,
    results,
    isLoading,
    error,
    searchTypes,

    // Computed
    allResults,
    hasResults,
    isValidQuery,

    // Actions
    search,
    searchServices,
    searchBlog,
    searchFaq,
    searchMechanics,
    clearSearch,
    setSearchTypes,
  }
}

// Re-export types
export type { SearchType, GlobalSearchResult, SearchResultItem }
