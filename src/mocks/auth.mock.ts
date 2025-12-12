import type {
  AuthSession,
  AuthError,
  PasswordReset,
  EmailVerification,
  LoginHistory,
  PasswordStrength
} from '@/types/auth'

/**
 * Mock Auth Sessions
 */
export const mockAuthSessions: AuthSession[] = [
  {
    id: 'session-1',
    userId: 'user-1',
    token: 'mock_token_1234567890abcdef',
    refreshToken: 'mock_refresh_1234567890abcdef',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    device: 'iPhone 15 Pro',
    ipAddress: '192.168.1.1'
  }
]

/**
 * Mock Auth Errors (realistic Supabase-like errors)
 */
export const mockAuthErrors: Record<string, AuthError> = {
  INVALID_CREDENTIALS: {
    code: 'invalid_credentials',
    message: 'Email ou mot de passe incorrect'
  },
  EMAIL_EXISTS: {
    code: 'email_exists',
    message: 'Un compte existe déjà avec cet email',
    field: 'email'
  },
  WEAK_PASSWORD: {
    code: 'weak_password',
    message: 'Mot de passe trop faible (min 8 caractères, 1 majuscule, 1 chiffre)',
    field: 'password'
  },
  INVALID_EMAIL: {
    code: 'invalid_email',
    message: 'Format email invalide',
    field: 'email'
  },
  EMAIL_NOT_VERIFIED: {
    code: 'email_not_verified',
    message: 'Veuillez vérifier votre email avant de vous connecter'
  },
  TOO_MANY_ATTEMPTS: {
    code: 'too_many_attempts',
    message: 'Trop de tentatives. Réessayez dans 15 minutes'
  },
  TOKEN_EXPIRED: {
    code: 'token_expired',
    message: 'Le lien a expiré. Demandez un nouveau lien'
  },
  INVALID_TOKEN: {
    code: 'invalid_token',
    message: 'Lien invalide'
  }
}

/**
 * Mock Password Resets
 */
export const mockPasswordResets: PasswordReset[] = []

/**
 * Mock Email Verifications
 */
export const mockEmailVerifications: EmailVerification[] = []

/**
 * Mock Login History
 */
export const mockLoginHistory: LoginHistory[] = [
  {
    id: 'login-1',
    userId: 'user-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    device: 'iPhone 15 Pro',
    browser: 'Safari 17.2',
    ipAddress: '192.168.1.1',
    location: 'Paris, France',
    success: true
  },
  {
    id: 'login-2',
    userId: 'user-1',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    device: 'MacBook Pro',
    browser: 'Chrome 120',
    ipAddress: '192.168.1.2',
    location: 'Paris, France',
    success: true
  },
  {
    id: 'login-3',
    userId: 'user-1',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    device: 'iPhone 15 Pro',
    browser: 'Safari 17.2',
    ipAddress: '192.168.1.1',
    location: 'Paris, France',
    success: false
  }
]

/**
 * Mock user passwords (hashed-like strings for demo)
 * In production: real bcrypt hashes
 */
export const mockUserPasswords: Record<string, string> = {
  'user-1': 'mock_hash_password123',
  'user-2': 'mock_hash_password456',
  'user-3': 'mock_hash_password789',
  'user-b2b-1': 'mock_hash_passwordB2B1',
  'user-b2b-2': 'mock_hash_passwordB2B2'
}

/**
 * Calculate password strength
 * 
 * @param password - Password to check
 * @returns Password strength score and feedback
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const checks = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar]
  const score = checks.filter(Boolean).length

  const feedback: string[] = []
  if (!hasMinLength) feedback.push('Minimum 8 caractères')
  if (!hasUppercase) feedback.push('Au moins 1 majuscule')
  if (!hasLowercase) feedback.push('Au moins 1 minuscule')
  if (!hasNumber) feedback.push('Au moins 1 chiffre')
  if (!hasSpecialChar) feedback.push('Au moins 1 caractère spécial')

  return {
    score: Math.min(score - 1, 4), // 0-4
    feedback,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar
  }
}

/**
 * Create password reset token
 * 
 * @param userId - User ID
 * @param email - User email
 * @returns Password reset object
 */
export function createPasswordReset(userId: string, email: string): PasswordReset {
  const reset: PasswordReset = {
    id: `reset-${Date.now()}`,
    userId,
    email,
    token: `reset_token_${Math.random().toString(36).substring(7)}`,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
    used: false,
    createdAt: new Date().toISOString()
  }

  mockPasswordResets.push(reset)
  return reset
}

/**
 * Create email verification token
 * 
 * @param userId - User ID
 * @param email - User email
 * @returns Email verification object
 */
export function createEmailVerification(userId: string, email: string): EmailVerification {
  const verification: EmailVerification = {
    id: `verify-${Date.now()}`,
    userId,
    email,
    token: `verify_token_${Math.random().toString(36).substring(7)}`,
    verified: false,
    createdAt: new Date().toISOString()
  }

  mockEmailVerifications.push(verification)
  return verification
}

/**
 * Verify password reset token
 * 
 * @param token - Reset token
 * @returns Password reset object or null if invalid/expired
 */
export function verifyResetToken(token: string): PasswordReset | null {
  const reset = mockPasswordResets.find(r => r.token === token && !r.used)
  if (!reset) return null

  const now = new Date()
  const expiresAt = new Date(reset.expiresAt)
  if (now > expiresAt) return null

  return reset
}

/**
 * Use password reset token
 * 
 * @param token - Reset token
 */
export function useResetToken(token: string): void {
  const reset = mockPasswordResets.find(r => r.token === token)
  if (reset) {
    reset.used = true
  }
}

/**
 * Add login attempt to history
 * 
 * @param userId - User ID
 * @param success - Whether login was successful
 */
export function addLoginHistory(userId: string, success: boolean): void {
  const entry: LoginHistory = {
    id: `login-${Date.now()}`,
    userId,
    timestamp: new Date().toISOString(),
    device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop',
    browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari',
    ipAddress: '192.168.1.1', // Mock IP
    location: 'Paris, France', // Mock location
    success
  }

  mockLoginHistory.unshift(entry)
}

/**
 * Get login history for user
 * 
 * @param userId - User ID
 * @returns Login history entries
 */
export function getLoginHistory(userId: string): LoginHistory[] {
  return mockLoginHistory
    .filter(h => h.userId === userId)
    .slice(0, 10) // Last 10 entries
}

