export interface PartQuote {
  id: string
  name: string
  originalPrice: number
  alternatives: PartAlternative[]
  selected?: string
}

export interface PartAlternative {
  id: string
  name: string
  price: number
  quality: 'original' | 'premium' | 'standard'
  brand: string
  warranty: string
}
