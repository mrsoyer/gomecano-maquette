import type { BookingService, BookingSlot, City, BookingMechanic, BookingUser } from '@/types/booking'
import type { Vehicle } from '@/types/vehicle'

/**
 * Mock services for booking flow with realistic pricing and details
 */
export const mockBookingServices: BookingService[] = [
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
 * Mock vehicle for booking flow
 */
export const mockBookingVehicle: Vehicle = {
  id: 'mock-vehicle-1',
  make: 'Peugeot',
  model: '308',
  year: 2020,
  plate: 'AB-123-CD',
  mileage: 62000,
  vin: undefined,
  fuelType: 'diesel'
}

/**
 * Mock available time slots for appointments
 */
export const mockBookingSlots: BookingSlot[] = [
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
 * Mock cities available for service
 */
export const mockCities: City[] = [
  { name: 'Opio', postalCode: '06650', department: 'Alpes-Maritimes' },
  { name: 'Le Rouret', postalCode: '06650', department: 'Alpes-Maritimes' },
  { name: 'Paris', postalCode: '75011', department: 'Paris' },
  { name: 'Lyon', postalCode: '69001', department: 'Rhône' },
  { name: 'Marseille', postalCode: '13001', department: 'Bouches-du-Rhône' }
]

/**
 * Mock mechanic for booking flow
 */
export const mockBookingMechanic: BookingMechanic = {
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
 * Mock user for booking flow
 */
export const mockBookingUser: BookingUser = {
  firstName: 'Thomas',
  lastName: 'Dupont',
  email: 'thomas.dupont@example.com',
  phone: '+33 6 12 34 56 78'
}

/**
 * Get booking service by ID
 */
export function getBookingServiceById(id: string): BookingService | undefined {
  return mockBookingServices.find(service => service.id === id)
}

/**
 * Get booking slots for a specific date
 */
export function getBookingSlotsForDate(date: string): string[] {
  const daySlots = mockBookingSlots.find(s => s.date === date)
  return daySlots ? daySlots.slots : []
}

/**
 * Get city by postal code
 */
export function getCityByPostalCode(postalCode: string): City | undefined {
  return mockCities.find(c => c.postalCode === postalCode)
}
