/**
 * Mock data for booking flow
 * Used for prototyping and testing the complete user journey
 */

export interface MockService {
  id: string
  name: string
  category: string
  price: number
  originalPrice?: number
  duration: number // in minutes
  description: string
  longDescription?: string
  included: string[]
  urgency: 'high' | 'medium' | 'low'
  badge: 'URGENT' | 'RECOMMANDÉ' | null
  reason?: string
  image?: string
  vehicleSpecific?: string
}

export interface MockVehicle {
  id: string
  brand: string
  model: string
  version: string
  year: number
  licensePlate: string
  mileage: number
  image: string
}

export interface MockSlot {
  date: string
  slots: string[]
}

export interface MockCity {
  name: string
  postalCode: string
  department: string
}

export interface MockMechanic {
  id: string
  firstName: string
  lastName: string
  rating: number
  reviewsCount: number
  specialties: string[]
  experience: number
  photo: string
  bio: string
}

export interface MockUser {
  firstName: string
  lastName: string
  email: string
  phone: string
}

/**
 * Mock services with realistic pricing and details
 */
export const MOCK_SERVICES: MockService[] = [
  {
    id: 'revision-60k',
    name: 'Révision 60 000 km',
    category: 'Révision & Vidange',
    price: 487,
    originalPrice: 650,
    duration: 210,
    description: 'Révision complète selon préconisations constructeur',
    longDescription: 'La révision à 60 000 km est une étape cruciale pour maintenir votre véhicule en bon état. Elle comprend le remplacement de pièces d\'usure importantes et un contrôle approfondi de tous les systèmes de votre voiture. Nos mécaniciens certifiés utilisent exclusivement des pièces de qualité équivalente constructeur et respectent scrupuleusement le carnet d\'entretien de votre véhicule.',
    included: [
      'Courroie de distribution',
      'Bougies d\'allumage',
      'Filtres complets (air, huile, habitacle)',
      'Liquide de refroidissement',
      'Contrôle freinage complet',
      'Contrôle système de direction',
      'Vérification des niveaux',
      'Contrôle pneumatiques et pression',
      'Tampon carnet d\'entretien'
    ],
    urgency: 'high',
    badge: 'URGENT',
    reason: 'Constructeur recommande à 60 000 km',
    image: '/images/services/revision.jpg',
    vehicleSpecific: 'Pour les véhicules récents, il est parfois nécessaire de remplacer à la fois les capteurs et les plaquettes de frein. Nous vous contactons toujours avant si l\'état de votre véhicule nécessite une autre intervention, nous vous contactons.'
  },
  {
    id: 'courroie-distribution',
    name: 'Courroie de distribution',
    category: 'Distribution',
    price: 289,
    originalPrice: 450,
    duration: 180,
    description: 'Remplacement de la courroie de distribution et galet tendeur',
    longDescription: 'La courroie de distribution est un élément essentiel du moteur. Son remplacement préventif évite une panne coûteuse et des dommages graves au moteur. Nous effectuons ce remplacement selon les préconisations du constructeur, en utilisant des pièces de qualité premium.',
    included: [
      'Courroie de distribution neuve',
      'Galets tendeurs',
      'Pompe à eau si nécessaire',
      'Contrôle complet du système',
      'Main d\'œuvre',
      'Garantie 24 mois'
    ],
    urgency: 'high',
    badge: 'RECOMMANDÉ',
    reason: 'Constructeur recommande à 60 000 km',
    image: '/images/services/courroie.jpg',
    vehicleSpecific: 'Nous utilisons des pièces d\'origine ou de qualité équivalente premium pour votre véhicule.'
  },
  {
    id: 'plaquettes-frein',
    name: 'Plaquettes de frein avant (une paire)',
    category: 'Freinage',
    price: 189,
    originalPrice: 245,
    duration: 90,
    description: 'Remplacement des plaquettes de frein avant',
    longDescription: 'Le liquide de frein absorbe progressivement l\'humidité, réduisant ainsi l\'efficacité du freinage. Une purge tous les 2 ans ou 30 000 km remplace le liquide contaminé pour garantir fiabilité et sécurité.',
    included: [
      'Retrait des plaquettes de frein arrière',
      'Remplacement par des plaquettes de frein neuves',
      'Contrôle du bon fonctionnement du système de freinage',
      'Garantie de 12 mois sur les pièces'
    ],
    urgency: 'medium',
    badge: 'RECOMMANDÉ',
    reason: 'Usure détectée lors du dernier contrôle',
    image: '/images/services/plaquettes.jpg',
    vehicleSpecific: 'Sur les véhicules récents, il est parfois nécessaire de remplacer à la fois les capteurs et les plaquettes de frein. Nous vous contactons toujours avant. Si l\'état de votre véhicule nécessite une autre intervention, nous vous contactons.'
  },
  {
    id: 'vidange',
    name: 'Vidange complète',
    category: 'Révision & Vidange',
    price: 89,
    duration: 45,
    description: 'Vidange moteur avec changement du filtre à huile',
    included: [
      'Huile moteur qualité',
      'Filtre à huile',
      'Contrôle multi-points',
      'Main d\'œuvre'
    ],
    urgency: 'low',
    badge: null,
    image: '/images/services/vidange.jpg'
  },
  {
    id: 'pneus',
    name: 'Changement 4 pneus',
    category: 'Pneus',
    price: 299,
    duration: 60,
    description: 'Démontage et montage de 4 pneus avec équilibrage',
    included: [
      'Démontage',
      'Montage',
      'Équilibrage 4 roues',
      'Valves neuves'
    ],
    urgency: 'low',
    badge: null,
    image: '/images/services/pneus.jpg'
  },
  {
    id: 'purge-liquide-frein',
    name: 'Purge du liquide de frein',
    category: 'Freinage',
    price: 84.95,
    duration: 45,
    description: 'Purge complète du circuit de freinage',
    included: [
      'Liquide de frein DOT4',
      'Purge circuit complet',
      'Contrôle étanchéité',
      'Main d\'œuvre'
    ],
    urgency: 'low',
    badge: null,
    image: '/images/services/liquide-frein.jpg'
  },
  {
    id: 'purge-liquide-refroidissement',
    name: 'Purge du liquide de refroidissement',
    category: 'Entretien',
    price: 89.95,
    duration: 60,
    description: 'Purge et remplissage du circuit de refroidissement',
    included: [
      'Liquide de refroidissement',
      'Purge circuit',
      'Contrôle thermostat',
      'Main d\'œuvre'
    ],
    urgency: 'low',
    badge: null,
    image: '/images/services/refroidissement.jpg'
  }
]

/**
 * Mock vehicle data
 */
export const MOCK_VEHICLE: MockVehicle = {
  id: 'mock-vehicle-1',
  brand: 'Peugeot',
  model: '308',
  version: '1.5 BlueHDi 130ch S&S BVM6',
  year: 2020,
  licensePlate: 'AB-123-CD',
  mileage: 62000,
  image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&auto=format&fit=crop&q=80'
}

/**
 * Mock available time slots for appointments
 */
export const MOCK_AVAILABLE_SLOTS: MockSlot[] = [
  {
    date: '2025-12-08',
    slots: ['09:00-09:30', '11:00-11:30', '14:00-14:30', '16:00-16:30']
  },
  {
    date: '2025-12-09',
    slots: ['09:00-09:30', '10:00-10:30', '14:00-14:30', '16:00-16:30']
  },
  {
    date: '2025-12-10',
    slots: ['09:00-09:30', '11:00-11:30', '14:00-14:30', '15:00-15:30', '17:00-17:30']
  },
  {
    date: '2025-12-11',
    slots: ['09:00-09:30', '10:00-10:30', '11:00-11:30', '14:00-14:30']
  }
]

/**
 * Mock cities data
 */
export const MOCK_CITIES: MockCity[] = [
  { name: 'Opio', postalCode: '06650', department: 'Alpes-Maritimes' },
  { name: 'Le Rouret', postalCode: '06650', department: 'Alpes-Maritimes' },
  { name: 'Paris', postalCode: '75011', department: 'Paris' },
  { name: 'Lyon', postalCode: '69001', department: 'Rhône' },
  { name: 'Marseille', postalCode: '13001', department: 'Bouches-du-Rhône' }
]

/**
 * Mock mechanic data
 */
export const MOCK_MECHANIC: MockMechanic = {
  id: 'mech-1',
  firstName: 'Pierre',
  lastName: 'D.',
  rating: 4.9,
  reviewsCount: 127,
  specialties: ['Peugeot', 'Citroën', 'Renault'],
  experience: 8,
  photo: '/images/mechanics/default-mechanic.jpg',
  bio: 'Expert en mécanique française depuis 8 ans. Spécialisé dans les interventions à domicile.'
}

/**
 * Mock user data
 */
export const MOCK_USER: MockUser = {
  firstName: 'Thomas',
  lastName: 'Dupont',
  email: 'thomas.dupont@example.com',
  phone: '+33 6 12 34 56 78'
}

/**
 * Helper function to get service by ID
 */
export function getMockServiceById(id: string): MockService | undefined {
  return MOCK_SERVICES.find(service => service.id === id)
}

/**
 * Helper function to simulate API delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
