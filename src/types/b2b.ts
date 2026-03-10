/**
 * B2B Types - Types TypeScript pour la page Entreprises
 */

/**
 * B2B Client - Représente un client entreprise de référence
 */
export interface B2BClient {
  name: string
  emoji: string
  logo?: string // Pour plus tard quand images disponibles
}

/**
 * Process Step - Étape du processus de fonctionnement
 */
export interface ProcessStep {
  emoji: string
  icon: string // Iconify icon name (e.g., 'mdi:rocket-launch')
  title: string
  items: string[]
}

/**
 * B2B Service - Service mécanique sur site pour flottes
 */
export interface B2BService {
  id: number
  emoji: string
  icon: string // Iconify icon name
  iconColor: string // Icon color class (e.g., 'text-green-primary')
  name: string
  description: string
}

/**
 * FAQ Item - Question/Réponse FAQ B2B
 */
export interface FaqItem {
  question: string
  answer: string
}
