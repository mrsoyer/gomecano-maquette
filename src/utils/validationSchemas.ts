import { z } from 'zod'

/**
 * User Information Schema
 * Used in Confirmation page, Account page, etc.
 */
export const userInfoSchema = z.object({
  firstName: z.string()
    .min(2, 'Prénom requis (minimum 2 caractères)')
    .max(50, 'Prénom trop long (maximum 50 caractères)'),
  
  lastName: z.string()
    .min(2, 'Nom requis (minimum 2 caractères)')
    .max(50, 'Nom trop long (maximum 50 caractères)'),
  
  email: z.string()
    .email('Email invalide')
    .toLowerCase(),
  
  phone: z.string()
    .regex(/^0[1-9]\d{8}$/, 'Téléphone invalide (format: 0612345678)'),
  
  acceptTerms: z.boolean()
    .refine(v => v === true, 'Vous devez accepter les conditions générales')
})

/**
 * Vehicle Search Schema
 * Used in BookingStep3Vehicle
 */
export const vehicleSearchSchema = z.object({
  licensePlate: z.string()
    .regex(/^[A-Z]{2}-\d{3}-[A-Z]{2}$/, 'Format invalide (AB-123-CD)')
    .optional(),
  
  vin: z.string()
    .length(17, 'VIN doit faire exactement 17 caractères')
    .optional(),
  
  mileage: z.number()
    .positive('Le kilométrage doit être positif')
    .int('Le kilométrage doit être un nombre entier')
    .optional()
})

/**
 * Address Schema
 * Used in CollecteRestitution page
 */
export const addressSchema = z.object({
  street: z.string()
    .min(5, 'Adresse requise (minimum 5 caractères)'),
  
  complement: z.string()
    .optional(),
  
  city: z.string()
    .min(2, 'Ville requise'),
  
  postalCode: z.string()
    .regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)')
})

/**
 * Contact Form Schema
 * Used in Contact page
 */
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Nom requis'),
  
  email: z.string()
    .email('Email invalide'),
  
  phone: z.string()
    .regex(/^0[1-9]\d{8}$/, 'Téléphone invalide')
    .optional(),
  
  subject: z.string()
    .min(5, 'Sujet requis'),
  
  message: z.string()
    .min(20, 'Message trop court (minimum 20 caractères)')
    .max(1000, 'Message trop long (maximum 1000 caractères)')
})

/**
 * Mechanic Application Schema
 * Used in Recruitment pages
 */
export const mechanicApplicationSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^0[1-9]\d{8}$/, 'Téléphone invalide'),
  
  yearsExperience: z.number()
    .min(0, 'Expérience invalide')
    .max(50, 'Expérience invalide'),
  
  specialties: z.array(z.string())
    .min(1, 'Sélectionnez au moins une spécialité'),
  
  certifications: z.array(z.string())
    .optional(),
  
  motivation: z.string()
    .min(50, 'Motivation trop courte (minimum 50 caractères)')
    .max(500, 'Motivation trop longue (maximum 500 caractères)'),
  
  cv: z.instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, 'CV trop volumineux (max 5MB)')
    .refine(file => ['application/pdf', 'application/msword'].includes(file.type), 'Format CV invalide (PDF ou DOC)')
    .optional()
})

/**
 * Helper type extractors
 */
export type UserInfo = z.infer<typeof userInfoSchema>
export type VehicleSearch = z.infer<typeof vehicleSearchSchema>
export type Address = z.infer<typeof addressSchema>
export type ContactForm = z.infer<typeof contactFormSchema>
export type MechanicApplication = z.infer<typeof mechanicApplicationSchema>
