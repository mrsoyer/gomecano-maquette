import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { Tables, TablesUpdate } from '@/types/database.types'
import type { User, Session } from '@supabase/supabase-js'

type Profile = Tables<'profiles'>
type UserRole = Profile['role']

const user = ref<User | null>(null)
const profile = ref<Profile | null>(null)
const session = ref<Session | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

/**
 * Composable for authentication management
 * Uses Supabase Auth with profile fetching
 */
export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)
  const isClient = computed(() => profile.value?.role === 'client')
  const isMechanic = computed(() => profile.value?.role === 'mechanic')
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const userRole = computed<UserRole | null>(() => profile.value?.role ?? null)

  /**
   * Initialize auth state and listen for changes
   */
  async function initialize() {
    try {
      loading.value = true

      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      session.value = currentSession
      user.value = currentSession?.user ?? null

      // Fetch profile if authenticated
      if (user.value) {
        await fetchProfile()
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        session.value = newSession
        user.value = newSession?.user ?? null

        if (event === 'SIGNED_IN' && user.value) {
          await fetchProfile()
        } else if (event === 'SIGNED_OUT') {
          profile.value = null
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Auth initialization failed'
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch user profile from database using RPC function
   */
  async function fetchProfile() {
    if (!user.value) return

    const { data, error: fetchError } = await supabase.rpc('auth_get_profile', {
      p_user_id: user.value.id
    }) as { data: Profile[] | null; error: { message: string } | null }

    if (fetchError) {
      error.value = fetchError.message
      return
    }

    // RPC returns SETOF, get first result
    profile.value = data?.[0] ?? null
  }

  /**
   * Sign in with email and password
   */
  async function signIn(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      user.value = data.user
      session.value = data.session
      await fetchProfile()

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign in failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sign up with email and password
   */
  async function signUp(email: string, password: string, metadata?: {
    firstName?: string
    lastName?: string
    phone?: string
  }) {
    loading.value = true
    error.value = null

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (signUpError) throw signUpError

      // Profile is created automatically via trigger
      return { success: true, user: data.user }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign up failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sign out
   */
  async function signOut() {
    loading.value = true

    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      user.value = null
      profile.value = null
      session.value = null

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign out failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update user profile using RPC function
   */
  async function updateProfile(updates: TablesUpdate<'profiles'>) {
    if (!user.value) return { success: false, error: 'Not authenticated' }

    try {
      const { data, error: updateError } = await supabase.rpc('auth_update_profile', {
        p_user_id: user.value.id,
        p_first_name: updates.first_name ?? null,
        p_last_name: updates.last_name ?? null,
        p_phone: updates.phone ?? null,
        p_avatar_url: updates.avatar_url ?? null,
        p_date_of_birth: updates.date_of_birth ?? null,
        p_address: updates.default_address ?? null,
        p_city: updates.city ?? null,
        p_zip_code: updates.zip_code ?? null,
        p_country: updates.country ?? null,
        p_locale: updates.locale ?? null,
        p_timezone: updates.timezone ?? null
      }) as { data: Profile[] | null; error: { message: string } | null }

      if (updateError) throw new Error(updateError.message)

      // RPC returns SETOF, get first result
      const updatedProfile = data?.[0] ?? null
      profile.value = updatedProfile
      return { success: true, profile: updatedProfile }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Update failed'
      return { success: false, error: error.value }
    }
  }

  /**
   * Reset password
   */
  async function resetPassword(email: string) {
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) throw resetError
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Reset failed'
      return { success: false, error: error.value }
    }
  }

  return {
    // State
    user,
    profile,
    session,
    loading,
    error,

    // Computed
    isAuthenticated,
    isClient,
    isMechanic,
    isAdmin,
    userRole,

    // Methods
    initialize,
    fetchProfile,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword
  }
}
