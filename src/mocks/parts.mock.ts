import type { PartQuote } from '@/types/parts'

export const mockPartQuotes: PartQuote[] = [
  {
    id: 'part-1',
    name: 'Plaquettes de frein avant',
    originalPrice: 120,
    alternatives: [
      { id: 'alt-1', name: 'Bosch Original', price: 120, quality: 'original', brand: 'Bosch', warranty: '2 ans' },
      { id: 'alt-2', name: 'Brembo Premium', price: 95, quality: 'premium', brand: 'Brembo', warranty: '1 an' },
      { id: 'alt-3', name: 'Ferodo Standard', price: 75, quality: 'standard', brand: 'Ferodo', warranty: '1 an' }
    ]
  }
]

export async function getPartQuotes(interventionId: string): Promise<PartQuote[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockPartQuotes
}

