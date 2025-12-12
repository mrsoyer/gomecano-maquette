import type { Mechanic } from '@/types/user'

export const mockMechanics: Mechanic[] = [
  {
    id: '1',
    userId: 'mech-user-1',
    name: 'Pierre Laurent',
    avatar: '',
    rating: 4.9,
    reviewsCount: 127,
    specialties: ['Mécanique générale', 'Diagnostic', 'Entretien'],
    yearsExperience: 12,
    certifications: ['ASE Master Technician', 'Bosch Certified'],
  },
  {
    id: '2',
    userId: 'mech-user-2',
    name: 'Sophie Martin',
    avatar: '',
    rating: 4.8,
    reviewsCount: 98,
    specialties: ['Électricité', 'Diagnostic', 'Freinage'],
    yearsExperience: 8,
    certifications: ['Electrical Systems Expert'],
  },
  {
    id: '3',
    userId: 'mech-user-3',
    name: 'Marc Dubois',
    avatar: '',
    rating: 4.95,
    reviewsCount: 156,
    specialties: ['Distribution', 'Embrayage', 'Mécanique générale'],
    yearsExperience: 15,
    certifications: ['ASE Master Technician', 'Transmission Specialist'],
  },
  {
    id: '4',
    userId: 'mech-user-4',
    name: 'Julie Bernard',
    avatar: '',
    rating: 4.7,
    reviewsCount: 82,
    specialties: ['Entretien', 'Climatisation', 'Pneus'],
    yearsExperience: 6,
    certifications: ['HVAC Specialist'],
  },
  {
    id: '5',
    userId: 'mech-user-5',
    name: 'Alexandre Rousseau',
    avatar: '',
    rating: 4.85,
    reviewsCount: 134,
    specialties: ['Diagnostic', 'Électronique', 'Mécanique générale'],
    yearsExperience: 10,
    certifications: ['Electronics Diagnostics', 'Bosch Certified'],
  },
  {
    id: '6',
    userId: 'mech-user-6',
    name: 'Céline Petit',
    avatar: '',
    rating: 4.9,
    reviewsCount: 110,
    specialties: ['Freinage', 'Suspension', 'Entretien'],
    yearsExperience: 9,
    certifications: ['Brake Systems Specialist'],
  },
  {
    id: '7',
    userId: 'mech-user-7',
    name: 'Thomas Garcia',
    avatar: '',
    rating: 4.75,
    reviewsCount: 91,
    specialties: ['Pneus', 'Amortisseurs', 'Géométrie'],
    yearsExperience: 7,
    certifications: ['Tire & Wheel Specialist'],
  },
  {
    id: '8',
    userId: 'mech-user-8',
    name: 'Nathalie Moreau',
    avatar: '',
    rating: 4.92,
    reviewsCount: 145,
    specialties: ['Entretien', 'Révision', 'Vidange'],
    yearsExperience: 11,
    certifications: ['Maintenance Expert', 'ASE Certified'],
  },
  {
    id: '9',
    userId: 'mech-user-9',
    name: 'François Leroy',
    avatar: '',
    rating: 4.82,
    reviewsCount: 103,
    specialties: ['Distribution', 'Courroie', 'Mécanique générale'],
    yearsExperience: 13,
    certifications: ['Timing Belt Specialist'],
  },
  {
    id: '10',
    userId: 'mech-user-10',
    name: 'Caroline Fontaine',
    avatar: '',
    rating: 4.88,
    reviewsCount: 119,
    specialties: ['Climatisation', 'Électricité', 'Diagnostic'],
    yearsExperience: 9,
    certifications: ['HVAC Expert', 'Electrical Systems'],
  },
  {
    id: '11',
    userId: 'mech-user-11',
    name: 'David Mercier',
    avatar: '',
    rating: 4.91,
    reviewsCount: 128,
    specialties: ['Échappement', 'Catalyseur', 'FAP'],
    yearsExperience: 14,
    certifications: ['Exhaust Systems Specialist'],
  },
  {
    id: '12',
    userId: 'mech-user-12',
    name: 'Isabelle Lambert',
    avatar: '',
    rating: 4.78,
    reviewsCount: 87,
    specialties: ['Batterie', 'Alternateur', 'Démarreur'],
    yearsExperience: 8,
    certifications: ['Electrical Components Expert'],
  },
]

/**
 * Get mechanic by ID
 */
export function getMechanicById(id: string): Mechanic | undefined {
  return mockMechanics.find(m => m.id === id)
}

/**
 * Get all mechanics
 */
export function getAvailableMechanics(): Mechanic[] {
  return mockMechanics
}

/**
 * Get mechanics by specialty
 */
export function getMechanicsBySpecialty(specialty: string): Mechanic[] {
  return mockMechanics.filter(m => 
    m.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
  )
}
