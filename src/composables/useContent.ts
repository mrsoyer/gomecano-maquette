import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import type {
  BlogPost,
  FAQCategory,
  Testimonial,
  BlogListParams
} from '@/types/composables.types'

// ============================================
// Response Types from RPC Functions
// ============================================

interface BlogPostsRpcResponse {
  success: boolean
  data: BlogPost[]
  count: number
  error?: string
}

interface BlogPostRpcResponse {
  success: boolean
  data: BlogPost | null
  error?: string
}

interface FAQCategoriesRpcResponse {
  success: boolean
  data: FAQCategory[]
  count: number
  error?: string
}

interface TestimonialsRpcResponse {
  success: boolean
  data: Testimonial[]
  count: number
  error?: string
}

/**
 * Composable for content (blog, FAQ, testimonials) with Supabase RPC Functions
 *
 * Uses Functions-First architecture:
 * - inst_get_blog_posts(p_category_id, p_limit, p_offset)
 * - inst_get_blog_post(p_slug)
 * - inst_get_faq_categories()
 * - home_get_testimonials(p_limit)
 */
export function useContent() {
  const blogPosts = ref<BlogPost[]>([])
  const faqCategories = ref<FAQCategory[]>([])
  const testimonials = ref<Testimonial[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch blog posts using inst_get_blog_posts RPC function
   */
  async function fetchBlogPosts(params?: BlogListParams) {
    loading.value = true
    error.value = null

    try {
      // Type assertion needed because RPC types are not auto-generated
      const { data, error: fetchError } = await (supabase.rpc as CallableFunction)('inst_get_blog_posts', {
        p_category_id: null, // Category filtering done client-side or via separate param
        p_limit: params?.limit || 50,
        p_offset: 0
      })

      if (fetchError) throw fetchError

      const response = data as BlogPostsRpcResponse
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch blog posts')
      }

      // Apply client-side filtering if needed
      let posts = response.data || []

      if (params?.category) {
        posts = posts.filter(post => post.category?.slug === params.category)
      }

      if (params?.search) {
        const searchLower = params.search.toLowerCase()
        posts = posts.filter(post =>
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt.toLowerCase().includes(searchLower)
        )
      }

      blogPosts.value = posts

      return blogPosts.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch blog posts'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch single blog post by slug using inst_get_blog_post RPC function
   * Note: This function automatically increments view_count
   */
  async function fetchBlogPost(slug: string) {
    try {
      // Type assertion needed because RPC types are not auto-generated
      const { data, error: fetchError } = await (supabase.rpc as CallableFunction)('inst_get_blog_post', {
        p_slug: slug
      })

      if (fetchError) throw fetchError

      const response = data as BlogPostRpcResponse
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch blog post')
      }

      // RPC function automatically increments view_count, no need for separate update
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch blog post'
      return null
    }
  }

  /**
   * Fetch FAQ categories with items using inst_get_faq_categories RPC function
   */
  async function fetchFAQs() {
    loading.value = true
    error.value = null

    try {
      // Type assertion needed because RPC types are not auto-generated
      const { data, error: fetchError } = await (supabase.rpc as CallableFunction)('inst_get_faq_categories')

      if (fetchError) throw fetchError

      const response = data as FAQCategoriesRpcResponse
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch FAQs')
      }

      faqCategories.value = response.data || []

      return faqCategories.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch FAQs'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Rate FAQ as helpful or not using increment_faq_rating RPC function
   */
  async function rateFAQ(faqId: string, helpful: boolean) {
    try {
      const column = helpful ? 'helpful_count' : 'not_helpful_count'

      // Type assertion needed because RPC types are not auto-generated
      await (supabase.rpc as CallableFunction)('increment_faq_rating', {
        faq_id: faqId,
        column_name: column
      })

      return { success: true }
    } catch {
      return { success: false }
    }
  }

  /**
   * Fetch testimonials using home_get_testimonials RPC function
   * Note: Type and featured filtering done client-side
   */
  async function fetchTestimonials(type?: 'b2c' | 'b2b' | 'mechanic', featured?: boolean) {
    loading.value = true
    error.value = null

    try {
      // Type assertion needed because RPC types are not auto-generated
      const { data, error: fetchError } = await (supabase.rpc as CallableFunction)('home_get_testimonials', {
        p_limit: 50 // Fetch all, filter client-side
      })

      if (fetchError) throw fetchError

      const response = data as TestimonialsRpcResponse
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch testimonials')
      }

      // Apply client-side filtering
      let items = response.data || []

      if (type) {
        items = items.filter(t => t.type === type)
      }

      if (featured) {
        items = items.filter(t => t.isFeatured)
      }

      testimonials.value = items

      return testimonials.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch testimonials'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    blogPosts,
    faqCategories,
    testimonials,
    loading,
    error,
    fetchBlogPosts,
    fetchBlogPost,
    fetchFAQs,
    rateFAQ,
    fetchTestimonials
  }
}
