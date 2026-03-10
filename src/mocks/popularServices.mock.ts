/**
 * Popular Services Mock Data
 * Services les plus demandés pour affichage page 404 et shortcuts
 */

export interface PopularService {
  id: string
  slug: string
  name: string
  icon: string
  priceFrom: number
}

export const popularServices: PopularService[] = [
  {
    id: '1',
    slug: 'vidange-moteur',
    name: 'Vidange moteur',
    icon: 'mdi:oil',
    priceFrom: 89
  },
  {
    id: '2',
    slug: 'revision-complete',
    name: 'Révision complète',
    icon: 'mdi:car-cog',
    priceFrom: 189
  },
  {
    id: '7',
    slug: 'plaquettes-freins-avant',
    name: 'Changement freins',
    icon: 'mdi:car-brake-alert',
    priceFrom: 149
  }
]
