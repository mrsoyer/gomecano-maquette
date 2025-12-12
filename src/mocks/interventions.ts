import type {
  Intervention,
  InterventionEvent,
  ChatMessage,
  ChecklistItem,
  Quote,
  Invoice,
  Review,
  Notification
} from '@/types/account'
import { mockMechanics } from './mechanics'
import { mockServices } from './services'

/**
 * Mock Interventions - Various intervention statuses
 */
export const mockInterventions: Intervention[] = [
  // Intervention en cours (user-1)
  {
    id: 'int-1',
    status: 'en_cours',
    currentStep: 4,
    service: mockServices[0], // Vidange moteur
    vehicle: {
      id: 'veh-1',
      make: 'Peugeot',
      model: '308',
      year: 2020,
      plate: 'AB-123-CD',
      mileage: 45000,
      fuelType: 'diesel'
    },
    mechanic: mockMechanics[0],
    scheduledAt: new Date().toISOString(),
    address: {
      street: '15 rue de la République',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    },
    quote: {
      serviceId: '1',
      serviceName: 'Vidange moteur',
      partsPrice: 45,
      laborPrice: 44,
      totalPrice: 89,
      duration: 60,
      details: ['Huile moteur 5W30', 'Filtre à huile', 'Joint de vidange']
    },
    timeline: [],
    checklist: [],
    photos: [],
    createdAt: '2024-12-04T08:00:00Z'
  },
  // Intervention en route (user-1)
  {
    id: 'int-2',
    status: 'en_route',
    currentStep: 2,
    service: mockServices[5], // Changement plaquettes freins
    vehicle: {
      id: 'veh-1',
      make: 'Peugeot',
      model: '308',
      year: 2020,
      plate: 'AB-123-CD',
      mileage: 45000,
      fuelType: 'diesel'
    },
    mechanic: mockMechanics[1],
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Dans 2h
    address: {
      street: '15 rue de la République',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    },
    quote: {
      serviceId: '6',
      serviceName: 'Changement plaquettes de freins',
      partsPrice: 95,
      laborPrice: 60,
      totalPrice: 155,
      duration: 90,
      details: ['Plaquettes avant', 'Contrôle disques', 'Nettoyage étriers']
    },
    timeline: [],
    checklist: [],
    photos: [],
    createdAt: '2024-12-03T16:00:00Z'
  },
  // Intervention confirmée (user-1)
  {
    id: 'int-3',
    status: 'confirmed',
    currentStep: 1,
    service: mockServices[1], // Révision complète
    vehicle: {
      id: 'veh-1',
      make: 'Peugeot',
      model: '308',
      year: 2020,
      plate: 'AB-123-CD',
      mileage: 45000,
      fuelType: 'diesel'
    },
    mechanic: mockMechanics[0],
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Dans 3 jours
    address: {
      street: '15 rue de la République',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    },
    quote: {
      serviceId: '2',
      serviceName: 'Révision complète',
      partsPrice: 120,
      laborPrice: 69,
      totalPrice: 189,
      duration: 120,
      details: ['Vidange', 'Filtres (air, huile, habitacle)', 'Contrôle 30 points']
    },
    timeline: [],
    checklist: [],
    photos: [],
    createdAt: '2024-12-02T10:00:00Z'
  },
  // Intervention terminée avec facture (user-1)
  {
    id: 'int-4',
    status: 'termine',
    currentStep: 5,
    service: mockServices[0], // Vidange moteur
    vehicle: {
      id: 'veh-1',
      make: 'Peugeot',
      model: '308',
      year: 2020,
      plate: 'AB-123-CD',
      mileage: 42000,
      fuelType: 'diesel'
    },
    mechanic: mockMechanics[2],
    scheduledAt: '2024-11-15T10:00:00Z',
    address: {
      street: '15 rue de la République',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    },
    quote: {
      serviceId: '1',
      serviceName: 'Vidange moteur',
      partsPrice: 45,
      laborPrice: 44,
      totalPrice: 89,
      duration: 60,
      details: ['Huile moteur 5W30', 'Filtre à huile']
    },
    timeline: [],
    checklist: [],
    photos: [],
    invoice: {
      id: 'inv-1',
      interventionId: 'int-4',
      number: 'FACT-2024-001',
      date: '2024-11-15T12:00:00Z',
      totalHT: 74.17,
      totalTTC: 89,
      tva: 14.83,
      status: 'paid',
      pdfUrl: '/invoices/FACT-2024-001.pdf'
    },
    review: {
      id: 'rev-1',
      interventionId: 'int-4',
      rating: 5,
      comment: 'Service impeccable ! Le mécanicien était très professionnel.',
      createdAt: '2024-11-15T14:00:00Z',
      verified: true
    },
    createdAt: '2024-11-10T09:00:00Z'
  },
  // Intervention user-2
  {
    id: 'int-5',
    status: 'confirmed',
    currentStep: 1,
    service: mockServices[3], // Remplacement batterie
    vehicle: {
      id: 'veh-2',
      make: 'Renault',
      model: 'Clio V',
      year: 2021,
      plate: 'EF-456-GH',
      mileage: 28000,
      fuelType: 'essence'
    },
    mechanic: mockMechanics[1],
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    address: {
      street: '42 avenue des Champs',
      complement: 'Appt 12',
      city: 'Lyon',
      postalCode: '69001',
      country: 'France'
    },
    quote: {
      serviceId: '4',
      serviceName: 'Remplacement batterie',
      partsPrice: 95,
      laborPrice: 30,
      totalPrice: 125,
      duration: 45,
      details: ['Batterie 60Ah', 'Test alternateur', 'Recyclage ancienne batterie']
    },
    timeline: [],
    checklist: [],
    photos: [],
    createdAt: '2024-12-01T11:00:00Z'
  },
  // Intervention user-3
  {
    id: 'int-6',
    status: 'termine',
    currentStep: 5,
    service: mockServices[5], // Changement plaquettes freins
    vehicle: {
      id: 'veh-3',
      make: 'Volkswagen',
      model: 'Golf 7',
      year: 2019,
      plate: 'IJ-789-KL',
      mileage: 62000,
      fuelType: 'essence'
    },
    mechanic: mockMechanics[0],
    scheduledAt: '2024-10-20T14:00:00Z',
    address: {
      street: '8 rue Victor Hugo',
      city: 'Marseille',
      postalCode: '13001',
      country: 'France'
    },
    quote: {
      serviceId: '6',
      serviceName: 'Changement plaquettes de freins',
      partsPrice: 95,
      laborPrice: 60,
      totalPrice: 155,
      duration: 90,
      details: ['Plaquettes AV', 'Contrôle disques', 'Purge liquide']
    },
    timeline: [],
    checklist: [],
    photos: [],
    invoice: {
      id: 'inv-2',
      interventionId: 'int-6',
      number: 'FACT-2024-002',
      date: '2024-10-20T16:00:00Z',
      totalHT: 129.17,
      totalTTC: 155,
      tva: 25.83,
      status: 'paid'
    },
    review: {
      id: 'rev-2',
      interventionId: 'int-6',
      rating: 5,
      comment: 'Excellent travail, très pro et rapide !',
      createdAt: '2024-10-20T17:00:00Z',
      verified: true
    },
    createdAt: '2024-10-15T08:00:00Z'
  }
]

/**
 * Mock Intervention Events - Timeline for interventions
 */
export const mockInterventionEvents: Record<string, InterventionEvent[]> = {
  'int-1': [
    {
      id: 'evt-1-1',
      timestamp: '2024-12-04T08:00:00Z',
      type: 'status_change',
      description: 'Intervention créée',
      actor: 'client',
      metadata: { status: 'scheduled' }
    },
    {
      id: 'evt-1-2',
      timestamp: '2024-12-04T08:30:00Z',
      type: 'status_change',
      description: 'Intervention confirmée par le mécanicien',
      actor: 'mechanic',
      metadata: { status: 'confirmed' }
    },
    {
      id: 'evt-1-3',
      timestamp: '2024-12-04T09:45:00Z',
      type: 'status_change',
      description: 'Mécanicien en route',
      actor: 'mechanic',
      metadata: { status: 'en_route' }
    },
    {
      id: 'evt-1-4',
      timestamp: '2024-12-04T10:15:00Z',
      type: 'status_change',
      description: 'Mécanicien sur place',
      actor: 'mechanic',
      metadata: { status: 'sur_place' }
    },
    {
      id: 'evt-1-5',
      timestamp: '2024-12-04T10:20:00Z',
      type: 'status_change',
      description: 'Intervention en cours',
      actor: 'mechanic',
      metadata: { status: 'en_cours' }
    },
    {
      id: 'evt-1-6',
      timestamp: '2024-12-04T10:25:00Z',
      type: 'photo',
      description: 'Photo avant intervention ajoutée',
      actor: 'mechanic',
      metadata: { photoId: 'photo-1' }
    }
  ],
  'int-2': [
    {
      id: 'evt-2-1',
      timestamp: '2024-12-03T16:00:00Z',
      type: 'status_change',
      description: 'Intervention créée',
      actor: 'client',
      metadata: { status: 'scheduled' }
    },
    {
      id: 'evt-2-2',
      timestamp: '2024-12-03T16:30:00Z',
      type: 'status_change',
      description: 'Intervention confirmée',
      actor: 'mechanic',
      metadata: { status: 'confirmed' }
    },
    {
      id: 'evt-2-3',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      type: 'status_change',
      description: 'Mécanicien en route',
      actor: 'mechanic',
      metadata: { status: 'en_route' }
    }
  ]
}

/**
 * Mock Chat Messages - Real-time chat
 */
export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1-1',
    interventionId: 'int-1',
    content: 'Bonjour, je suis en route, j\'arrive dans 10 minutes',
    sender: 'mechanic',
    timestamp: '2024-12-04T09:45:00Z',
    read: true
  },
  {
    id: 'msg-1-2',
    interventionId: 'int-1',
    content: 'Parfait, merci !',
    sender: 'client',
    timestamp: '2024-12-04T09:46:00Z',
    read: true
  },
  {
    id: 'msg-1-3',
    interventionId: 'int-1',
    content: 'Je suis arrivé, je commence le diagnostic',
    sender: 'mechanic',
    timestamp: '2024-12-04T10:15:00Z',
    read: true
  },
  {
    id: 'msg-1-4',
    interventionId: 'int-1',
    content: 'Tout va bien, je commence la vidange',
    sender: 'mechanic',
    timestamp: '2024-12-04T10:25:00Z',
    read: false
  }
]

/**
 * Mock Checklists - Technical checklists
 */
export const mockChecklists: Record<string, ChecklistItem[]> = {
  'int-1': [
    {
      id: 'check-1-1',
      label: 'Vérification niveau huile moteur',
      checked: true,
      checkedAt: '2024-12-04T10:16:00Z',
      notes: 'Niveau bas, vidange nécessaire'
    },
    {
      id: 'check-1-2',
      label: 'Contrôle filtre à huile',
      checked: true,
      checkedAt: '2024-12-04T10:17:00Z',
      notes: 'Filtre encrassé, remplacement'
    },
    {
      id: 'check-1-3',
      label: 'Vidange huile moteur',
      checked: true,
      checkedAt: '2024-12-04T10:30:00Z'
    },
    {
      id: 'check-1-4',
      label: 'Installation nouveau filtre',
      checked: true,
      checkedAt: '2024-12-04T10:35:00Z'
    },
    {
      id: 'check-1-5',
      label: 'Remplissage huile neuve',
      checked: false
    },
    {
      id: 'check-1-6',
      label: 'Contrôle niveau et étanchéité',
      checked: false
    },
    {
      id: 'check-1-7',
      label: 'Réinitialisation indicateur entretien',
      checked: false
    }
  ]
}

/**
 * Mock Notifications
 */
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'intervention',
    title: 'Intervention en cours',
    message: 'Votre mécanicien a commencé l\'intervention',
    read: false,
    createdAt: '2024-12-04T10:20:00Z',
    actionUrl: '/account/interventions/int-1'
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'intervention',
    title: 'Mécanicien en route',
    message: 'Pierre Laurent est en route, arrivée prévue dans 15 min',
    read: true,
    createdAt: '2024-12-04T09:45:00Z',
    actionUrl: '/account/interventions/int-1'
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'vehicle',
    title: 'Rappel entretien',
    message: 'Votre Peugeot 308 nécessite une révision dans 2000 km',
    read: false,
    createdAt: '2024-12-03T10:00:00Z',
    actionUrl: '/account/vehicles/veh-1'
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    type: 'payment',
    title: 'Facture disponible',
    message: 'Votre facture FACT-2024-001 est disponible',
    read: true,
    createdAt: '2024-11-15T12:00:00Z',
    actionUrl: '/account/history'
  }
]

/**
 * Get intervention by ID
 */
export function getInterventionById(id: string): Intervention | undefined {
  return mockInterventions.find(i => i.id === id)
}

/**
 * Get interventions by user ID
 */
export function getInterventionsByUser(userId: string): Intervention[] {
  // Mock: retourne toutes les interventions pour user-1
  if (userId === 'user-1') {
    return mockInterventions.filter(i => ['int-1', 'int-2', 'int-3', 'int-4'].includes(i.id))
  }
  if (userId === 'user-2') {
    return mockInterventions.filter(i => i.id === 'int-5')
  }
  if (userId === 'user-3') {
    return mockInterventions.filter(i => i.id === 'int-6')
  }
  return []
}

/**
 * Get active interventions (en_route, sur_place, en_cours)
 */
export function getActiveInterventions(): Intervention[] {
  return mockInterventions.filter(i =>
    ['en_route', 'sur_place', 'en_cours'].includes(i.status)
  )
}

/**
 * Get upcoming interventions (scheduled, confirmed)
 */
export function getUpcomingInterventions(userId: string): Intervention[] {
  return getInterventionsByUser(userId).filter(i =>
    ['scheduled', 'confirmed'].includes(i.status)
  )
}

/**
 * Get recent interventions (termine)
 */
export function getRecentInterventions(userId: string): Intervention[] {
  return getInterventionsByUser(userId)
    .filter(i => i.status === 'termine')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 5)
}

/**
 * Get intervention timeline
 */
export function getInterventionTimeline(interventionId: string): InterventionEvent[] {
  return mockInterventionEvents[interventionId] || []
}

/**
 * Get intervention chat messages
 */
export function getInterventionMessages(interventionId: string): ChatMessage[] {
  return mockChatMessages.filter(m => m.interventionId === interventionId)
}

/**
 * Get intervention checklist
 */
export function getInterventionChecklist(interventionId: string): ChecklistItem[] {
  return mockChecklists[interventionId] || []
}

/**
 * Get user notifications
 */
export function getUserNotifications(userId: string): Notification[] {
  return mockNotifications.filter(n => n.userId === userId)
}

/**
 * Get unread notifications count
 */
export function getUnreadNotificationsCount(userId: string): number {
  return getUserNotifications(userId).filter(n => !n.read).length
}
