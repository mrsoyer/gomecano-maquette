export interface Campaign {
  id: string
  title: string
  description: string
  discount: number
  validUntil: string
  imageUrl?: string
  targetServices: string[]
  isActive: boolean
}

export const mockCampaigns: Campaign[] = [
  {
    id: 'winter-2024',
    title: 'Forfait Hiver 2024',
    description: 'Préparez votre véhicule pour l\'hiver ! -20% sur les pneus hiver + batterie',
    discount: 20,
    validUntil: '2024-12-31',
    targetServices: ['pneus', 'batterie'],
    isActive: true
  }
]

export function getActiveCampaign(): Campaign | null {
  return mockCampaigns.find(c => c.isActive && new Date(c.validUntil) > new Date()) || null
}
