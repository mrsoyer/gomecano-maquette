/**
 * Recruitment Types - Types pour la page de recrutement mécaniciens
 */

/**
 * Benefit - Avantage de rejoindre le réseau (3 piliers)
 */
export interface RecruitmentBenefit {
  id: string
  icon: string // Material Design Icon (mdi:)
  title: string
  subtitle: string
  description: string
  features: string[] // Liste de points clés
}

/**
 * ProcessStep - Étape du processus de recrutement
 */
export interface RecruitmentProcessStep {
  id: string
  stepNumber: number
  title: string
  icon: string // Material Design Icon
  description: string
  details: string[] // Liste de détails
  duration?: string // Ex: "5 minutes", "24-48h"
}

/**
 * Stats - Statistiques clés du réseau
 */
export interface RecruitmentStats {
  id: string
  label: string
  value: string | number
  icon: string
  suffix?: string // Ex: "€", "%", "h"
}

/**
 * Advantage - Petit avantage listé
 */
export interface RecruitmentAdvantage {
  id: string
  text: string
  icon?: string
}

/**
 * JobOffer - Offre d'emploi type mécanicien
 */
export interface RecruitmentJobOffer {
  id: string
  title: string
  location: string
  contractType: 'freelance' | 'micro-entreprise' | 'société'
  salary: {
    min: number
    max: number
    frequency: 'hour' | 'day' | 'month'
  }
  requirements: string[]
  benefits: string[]
  isActive: boolean
}

/**
 * ContactInfo - Informations de contact recrutement
 */
export interface RecruitmentContactInfo {
  phone: string
  email: string
  formUrl: string
  availability: string
}
