/**
 * Emergency Mock Data
 */

import type { EmergencyRequest, SOSSession, TowService } from '@/types/emergency'

export const mockEmergencyRequests: EmergencyRequest[] = [
  {
    id: 'emer-1',
    userId: 'user-1',
    type: 'breakdown',
    location: {
      lat: 48.8566,
      lng: 2.3522,
      address: '15 Rue de Rivoli, 75001 Paris'
    },
    vehicleId: 'vehicle-1',
    description: 'Moteur qui ne démarre plus',
    status: 'resolved',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    assignedMechanicId: 'mech-1',
    estimatedArrival: '15 minutes',
    resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString()
  }
]

export const mockSOSSession: SOSSession = {
  requestId: 'emer-new',
  mechanicLocation: {
    lat: 48.8606,
    lng: 2.3376
  },
  distance: 2.5,
  eta: 12,
  mechanicPhone: '+33 6 12 34 56 78',
  updates: [
    {
      timestamp: new Date().toISOString(),
      message: 'SOS activé - Recherche d\'un mécanicien disponible...',
      type: 'info'
    },
    {
      timestamp: new Date(Date.now() + 30000).toISOString(),
      message: 'Mécanicien trouvé ! Jean arrive dans 12 minutes',
      type: 'success'
    }
  ]
}

export const mockTowServices: TowService[] = [
  {
    id: 'tow-1',
    name: 'Dépannage Express Paris',
    phone: '+33 1 23 45 67 89',
    estimatedArrival: 20,
    price: 89
  },
  {
    id: 'tow-2',
    name: 'SOS Remorquage 24/7',
    phone: '+33 1 98 76 54 32',
    estimatedArrival: 35,
    price: 75
  }
]

export async function createEmergencyRequest(data: Partial<EmergencyRequest>): Promise<EmergencyRequest> {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const newRequest: EmergencyRequest = {
    id: `emer-${Date.now()}`,
    userId: data.userId!,
    type: data.type!,
    location: data.location!,
    vehicleId: data.vehicleId!,
    description: data.description || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  
  mockEmergencyRequests.push(newRequest)
  return newRequest
}

export async function getSOSSession(requestId: string): Promise<SOSSession> {
  await new Promise(resolve => setTimeout(resolve, 1500))
  return mockSOSSession
}
