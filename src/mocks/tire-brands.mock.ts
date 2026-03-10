/**
 * Mock data for tire brands
 * Contains brand information with logos, prices, and available types
 */

export interface TireBrand {
  id: string
  name: string
  logo: string // MDI icon name
  typesAvailable: number
  priceMin: number
  priceMax: number
  description: string
  isPopular?: boolean
}

/**
 * Available tire brands with pricing and details
 */
export const tireBrands: TireBrand[] = [
  {
    id: 'michelin',
    name: 'Michelin',
    logo: 'mdi:tire', // Remplacer par logo si disponible
    typesAvailable: 3,
    priceMin: 89,
    priceMax: 245,
    description: 'Qualité premium, longévité exceptionnelle',
    isPopular: true
  },
  {
    id: 'continental',
    name: 'Continental',
    logo: 'mdi:tire',
    typesAvailable: 3,
    priceMin: 75,
    priceMax: 220,
    description: 'Excellent rapport qualité-prix',
    isPopular: true
  },
  {
    id: 'bridgestone',
    name: 'Bridgestone',
    logo: 'mdi:tire',
    typesAvailable: 3,
    priceMin: 70,
    priceMax: 210,
    description: 'Performance et fiabilité'
  },
  {
    id: 'goodyear',
    name: 'Goodyear',
    logo: 'mdi:tire',
    typesAvailable: 3,
    priceMin: 72,
    priceMax: 215,
    description: 'Innovation et technologie'
  },
  {
    id: 'pirelli',
    name: 'Pirelli',
    logo: 'mdi:tire',
    typesAvailable: 3,
    priceMin: 80,
    priceMax: 230,
    description: 'Performance sportive'
  },
  {
    id: 'dunlop',
    name: 'Dunlop',
    logo: 'mdi:tire',
    typesAvailable: 3,
    priceMin: 68,
    priceMax: 190,
    description: 'Qualité reconnue'
  },
  {
    id: 'nokian',
    name: 'Nokian',
    logo: 'mdi:tire',
    typesAvailable: 3,
    priceMin: 75,
    priceMax: 205,
    description: 'Spécialiste hiver'
  },
  {
    id: 'hankook',
    name: 'Hankook',
    logo: 'mdi:tire',
    typesAvailable: 3,
    priceMin: 62,
    priceMax: 175,
    description: 'Bon rapport qualité-prix'
  },
  {
    id: 'budget',
    name: 'Marques budget',
    logo: 'mdi:cash-multiple',
    typesAvailable: 2,
    priceMin: 45,
    priceMax: 120,
    description: 'Solution économique'
  }
]

/**
 * Get tire brand by ID
 * 
 * @param brandId - Brand identifier
 * @returns Tire brand or undefined
 */
export function getTireBrandById(brandId: string): TireBrand | undefined {
  return tireBrands.find(brand => brand.id === brandId)
}

/**
 * Get popular tire brands (for suggestions)
 * 
 * @returns Array of popular brands
 */
export function getPopularTireBrands(): TireBrand[] {
  return tireBrands.filter(brand => brand.isPopular)
}


