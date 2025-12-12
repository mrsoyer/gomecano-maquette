import { ref } from 'vue'
import type { LoginCredentials, RegisterData, PasswordReset } from '@/types/auth'
import type { UserAccount } from '@/types/account'
import {
  mockUserPasswords,
  mockAuthErrors,
  calculatePasswordStrength,
  createPasswordReset,
  createEmailVerification,
  verifyResetToken,
  useResetToken,
  addLoginHistory
} from '@/mocks/auth.mock'
import { getUserByEmail, mockUserAccounts } from '@/mocks/users'
import { useUserStore } from '@/stores/user.store'

/**
 * Authentication composable
 * Mocks Supabase Auth with realistic flows, validations, and error handling
 * 
 * @returns Auth state and methods
 */
export function useAuth() {
  const userStore = useUserStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Login user
   * 
   * @param credentials - Login credentials
   */
  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800))

      // Find user by email
      const user = getUserByEmail(credentials.email)
      if (!user) {
        throw new Error(mockAuthErrors.INVALID_CREDENTIALS.message)
      }

      // Mock password check (in production: bcrypt.compare)
      const storedPassword = mockUserPasswords[user.id]
      if (!storedPassword) {
        throw new Error(mockAuthErrors.INVALID_CREDENTIALS.message)
      }

      // Random login failure (2% for testing)
      if (Math.random() < 0.02) {
        addLoginHistory(user.id, false)
        throw new Error(mockAuthErrors.INVALID_CREDENTIALS.message)
      }

      // Check email verified (mock)
      // In production: check user.emailVerified
      // For demo, skip verification check

      // Success
      await userStore.loginById(user.id)
      addLoginHistory(user.id, true)

      console.log('[Auth] Login successful:', user.email)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      console.error('[Auth] Login error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Register new user
   * 
   * @param data - Registration data
   */
  async function register(data: RegisterData): Promise<UserAccount> {
    isLoading.value = true
    error.value = null

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check email not exists
      if (getUserByEmail(data.email)) {
        throw new Error(mockAuthErrors.EMAIL_EXISTS.message)
      }

      // Check password strength
      const strength = calculatePasswordStrength(data.password)
      if (strength.score < 3) {
        throw new Error(mockAuthErrors.WEAK_PASSWORD.message)
      }

      // Create new user
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        email: data.email,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          preferences: {
            notifications: {
              email: true,
              sms: data.acceptMarketing || false,
              push: true
            },
            language: 'fr',
            currency: 'EUR'
          },
          loyaltyPoints: 0
        },
        accountType: 'b2c',
        createdAt: new Date().toISOString()
      }

      // Add to mock users
      mockUserAccounts.push(newUser)

      // Add mock password
      mockUserPasswords[newUser.id] = `mock_hash_${data.password}`

      // Create email verification (mock)
      createEmailVerification(newUser.id, newUser.email)

      // Auto-login
      userStore.user = newUser

      console.log('[Auth] User registered:', newUser.email)

      return newUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      console.error('[Auth] Register error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Request password reset
   * 
   * @param email - User email
   */
  async function forgotPassword(email: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Find user
      const user = getUserByEmail(email)
      if (!user) {
        // For security, don't reveal if email exists
        // Just show success message
        console.log('[Auth] Password reset requested for:', email)
        return
      }

      // Create reset token
      const reset = createPasswordReset(user.id, email)

      console.log('[Auth] Password reset email sent (mock)')
      console.log('[Auth] Reset token:', reset.token)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Password reset failed'
      console.error('[Auth] Forgot password error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset password with token
   * 
   * @param token - Reset token
   * @param newPassword - New password
   */
  async function resetPassword(token: string, newPassword: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Verify token
      const reset = verifyResetToken(token)
      if (!reset) {
        throw new Error(mockAuthErrors.INVALID_TOKEN.message)
      }

      // Check password strength
      const strength = calculatePasswordStrength(newPassword)
      if (strength.score < 3) {
        throw new Error(mockAuthErrors.WEAK_PASSWORD.message)
      }

      // Update password (mock)
      mockUserPasswords[reset.userId] = `mock_hash_${newPassword}`

      // Mark token as used
      useResetToken(token)

      console.log('[Auth] Password reset successful for user:', reset.userId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Password reset failed'
      console.error('[Auth] Reset password error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verify email with token
   * 
   * @param token - Verification token
   */
  async function verifyEmail(token: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800))

      // In production: verify token with Supabase
      // For mock: just log success

      console.log('[Auth] Email verified (mock):', token)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Email verification failed'
      console.error('[Auth] Verify email error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user
   */
  async function logout(): Promise<void> {
    isLoading.value = true

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))

      userStore.logout()

      console.log('[Auth] User logged out')
    } catch (err) {
      console.error('[Auth] Logout error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Check password strength
   * 
   * @param password - Password to check
   * @returns Password strength object
   */
  function checkPasswordStrength(password: string) {
    return calculatePasswordStrength(password)
  }

  return {
    isLoading,
    error,
    login,
    register,
    forgotPassword,
    resetPassword,
    verifyEmail,
    logout,
    checkPasswordStrength
  }
}

