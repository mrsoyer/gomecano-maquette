/**
 * Auth Types - Authentication and session management
 */

export interface AuthSession {
  id: string
  userId: string
  token: string
  refreshToken: string
  expiresAt: string
  createdAt: string
  device: string
  ipAddress: string
}

export interface AuthError {
  code: string
  message: string
  field?: string
}

export interface PasswordReset {
  id: string
  userId: string
  email: string
  token: string
  expiresAt: string
  used: boolean
  createdAt: string
}

export interface EmailVerification {
  id: string
  userId: string
  email: string
  token: string
  verified: boolean
  verifiedAt?: string
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  acceptTerms: boolean
  acceptMarketing?: boolean
}

export interface PasswordStrength {
  score: number // 0-4
  feedback: string[]
  hasMinLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

export interface LoginHistory {
  id: string
  userId: string
  timestamp: string
  device: string
  browser: string
  ipAddress: string
  location?: string
  success: boolean
}

