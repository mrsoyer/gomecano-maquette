import { ref, onMounted } from 'vue'
import {
  supabase,
  getCurrentUser,
  getSession,
  signOut,
  callRpc,
  callEdgeFunction,
  getVehicleMakes,
  getVehicleModels,
  getServiceCategories,
  getPartsCatalog,
  searchGlobal,
  getMechanicsAvailable,
} from '@/services/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type {
  VehicleMake,
  VehicleModel,
  ServiceCategory,
  PartsCatalogItem,
  GlobalSearchResult,
  MechanicsAvailableResult,
} from '@/services/supabase'

/**
 * Composable for Supabase authentication and connection status
 */
export function useSupabase() {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const isLoading = ref(true)
  const isConnected = ref(false)
  const error = ref<string | null>(null)

  /**
   * Check connection to Supabase
   */
  async function checkConnection() {
    try {
      isLoading.value = true
      error.value = null

      // Simple health check - try to get session
      const currentSession = await getSession()
      session.value = currentSession
      user.value = currentSession?.user ?? null
      isConnected.value = true

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Connection failed'
      isConnected.value = false
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sign in with email and password
   */
  async function signInWithEmail(email: string, password: string) {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      session.value = data.session
      user.value = data.user
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign in failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sign up with email and password
   */
  async function signUpWithEmail(email: string, password: string) {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) throw authError

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign up failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sign out current user
   */
  async function handleSignOut() {
    try {
      isLoading.value = true
      error.value = null

      await signOut()

      session.value = null
      user.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign out failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Listen to auth state changes
   */
  function setupAuthListener() {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        session.value = newSession
        user.value = newSession?.user ?? null

        if (event === 'SIGNED_OUT') {
          session.value = null
          user.value = null
        }
      }
    )

    return () => subscription.unsubscribe()
  }

  // Auto-check connection on mount
  onMounted(() => {
    checkConnection()
    setupAuthListener()
  })

  return {
    // State
    user,
    session,
    isLoading,
    isConnected,
    error,

    // Auth Actions
    checkConnection,
    signInWithEmail,
    signUpWithEmail,
    signOut: handleSignOut,

    // RPC & Edge Function Helpers
    callRpc,
    callEdgeFunction,

    // Reference Data Helpers
    getVehicleMakes,
    getVehicleModels,
    getServiceCategories,
    getPartsCatalog,

    // Session 10: Core Utils Helpers
    searchGlobal,
    getMechanicsAvailable,

    // Raw client for advanced usage
    supabase,
  }
}

// Re-export types for convenience
export type {
  VehicleMake,
  VehicleModel,
  ServiceCategory,
  PartsCatalogItem,
  GlobalSearchResult,
  MechanicsAvailableResult,
}
