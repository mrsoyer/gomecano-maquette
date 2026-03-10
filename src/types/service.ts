// Service Question Types
export interface ServiceQuestion {
  id: string
  label: string
  type: ServiceQuestionType
  required: boolean
  helpText?: string
  placeholder?: string
  defaultValue?: string | number
  
  // Props conditionnelles selon type
  options?: ServiceQuestionOption[]
  min?: number
  max?: number
  unit?: string
  
  // Props spéciales
  hidePriceUntilAnswered?: boolean
  
  // Props tire-dimension
  suggestedDimensions?: any[]
  manualSelectors?: any
  explanationImage?: string
  explanationText?: string
}

export type ServiceQuestionType =
  // Types génériques
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'radio-icons'
  
  // Types spécialisés (pneus)
  | 'tire-dimension'
  | 'tire-brand'

export interface ServiceQuestionOption {
  value: string
  label: string
  description?: string
  icon?: string
  priceModifier?: number
}

export interface ServiceAnswer {
  questionId: string
  value: string | number
  label?: string
}

// Service Tier Types (Gammes de prix OU Modèles de pneus)
export interface ServiceTier {
  id: string
  name: string
  description: string
  basePrice: number
  duration: number
  features: string[]
  recommended?: boolean
  icon?: string
  
  // Props génériques extensibles
  badge?: TierBadge
  imageUrl?: string
  
  // Props dynamiques (générées selon réponses)
  isDynamic?: boolean
  generatedFrom?: ServiceAnswer[]
  
  // Props spécifiques PNEUS (optionnelles)
  tirePerformance?: TirePerformance
  tireCharacteristics?: TireCharacteristics
}

export type TierBadge = 'BUDGET' | 'PREMIUM' | 'STANDARD'

// Tire Performance (Étiquette européenne)
export interface TirePerformance {
  fuelEfficiency: TireRating    // A à G
  wetGrip: TireRating            // A à G
  noiseLevel: number             // dB (ex: 68, 70, 71)
  noiseClass: 'A' | 'B' | 'C'    // Classe de bruit
}

export type TireRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

// Tire Characteristics (Saison, usage)
export interface TireCharacteristics {
  season: 'summer' | 'winter' | 'all-season'
  isMountainLaw?: boolean        // Loi montagne
  brandLogo?: string             // URL ou MDI icon du logo marque
}

// Service Option Types
export interface ServiceOption {
  id: string
  name: string
  description: string
  price: number
  duration: number
  icon?: string
  category?: string
  
  // Props dynamiques
  isDynamic?: boolean
  recommendedFor?: string[]  // IDs des tiers recommandés
}

// Dynamic Generation Config
export interface TierGenerationRule {
  serviceId: string
  requiredAnswers: string[]  // IDs des questions requises
  generator: (answers: Record<string, any>) => ServiceTier[]
}

export interface OptionGenerationRule {
  serviceId: string
  requiredAnswers: string[]
  generator: (answers: Record<string, any>) => ServiceOption[]
}

// Service Interface - Représente un service mécanique proposé par Gomecano
export interface Service {
  id: string
  slug: string
  name: string
  description: string
  priceFrom: number
  duration: number // minutes
  category: ServiceCategory
  imageUrl: string
  badges: string[]
  isInstantQuote: boolean
  included: string[]
  recommended?: boolean
  
  // Configuration pricing dynamique
  questions?: ServiceQuestion[]
  pricingTiers?: ServiceTier[]
  options?: ServiceOption[]
  comparisonTable?: ServiceComparison[]
}

// Service Categories - Types d'interventions mécaniques proposées
export type ServiceCategory =
  | 'entretien'
  | 'freinage'
  | 'pneus'
  | 'distribution'
  | 'climatisation'
  | 'mecanique'
  | 'electricite'
  | 'carrosserie'
  | 'diagnostic'

// Service Comparison - Ligne du tableau comparatif
export interface ServiceComparison {
  feature: string
  eco: boolean | string
  standard: boolean | string
  premium: boolean | string
}
