import { z } from 'zod'

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
  rememberMe: z.boolean().optional()
})

/**
 * Register Step 1 validation schema (Email + Password)
 */
export const registerStep1Schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins 1 majuscule')
    .regex(/[a-z]/, 'Au moins 1 minuscule')
    .regex(/[0-9]/, 'Au moins 1 chiffre'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

/**
 * Register Step 2 validation schema (Personal Info)
 */
export const registerStep2Schema = z.object({
  firstName: z.string().min(2, 'Prénom requis (min 2 caractères)'),
  lastName: z.string().min(2, 'Nom requis (min 2 caractères)'),
  phone: z.string().regex(/^0[1-9]\d{8}$/, 'Téléphone invalide (format: 0612345678)'),
  acceptTerms: z.boolean().refine(v => v === true, 'Vous devez accepter les CGU'),
  acceptMarketing: z.boolean().optional()
})

/**
 * Forgot password validation schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide')
})

/**
 * Reset password validation schema
 */
export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins 1 majuscule')
    .regex(/[a-z]/, 'Au moins 1 minuscule')
    .regex(/[0-9]/, 'Au moins 1 chiffre'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

/**
 * Profile update validation schema
 */
export const profileUpdateSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis').optional(),
  lastName: z.string().min(2, 'Nom requis').optional(),
  phone: z.string().regex(/^0[1-9]\d{8}$/, 'Téléphone invalide').optional()
})

/**
 * Password change validation schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins 1 majuscule')
    .regex(/[a-z]/, 'Au moins 1 minuscule')
    .regex(/[0-9]/, 'Au moins 1 chiffre'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'Le nouveau mot de passe doit être différent',
  path: ['newPassword']
})

/**
 * Address validation schema
 */
export const addressSchema = z.object({
  label: z.string().min(1, 'Label requis (ex: Domicile, Travail)'),
  street: z.string().min(5, 'Adresse requise (min 5 caractères)'),
  complement: z.string().optional(),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
  country: z.string().default('France'),
  isDefault: z.boolean().default(false)
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterStep1Data = z.infer<typeof registerStep1Schema>
export type RegisterStep2Data = z.infer<typeof registerStep2Schema>
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>
export type ChangePasswordData = z.infer<typeof changePasswordSchema>
export type AddressFormData = z.infer<typeof addressSchema>

