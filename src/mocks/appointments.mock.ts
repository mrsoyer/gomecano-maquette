import type { Appointment } from '@/types/appointment'

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientId: 'client-1',
    mechanicId: 'mech-1',
    vehicleId: 'vehicle-1',
    serviceId: '1',
    scheduledAt: '2024-12-05T10:00:00',
    address: '15 rue de la Paix',
    city: 'Paris',
    zipCode: '75002',
    status: 'confirmed',
    price: 89,
    duration: 60,
    notes: 'Préférence pour le matin',
    createdAt: '2024-11-30T14:30:00',
  },
  {
    id: '2',
    clientId: 'client-2',
    mechanicId: 'mech-2',
    vehicleId: 'vehicle-2',
    serviceId: '10',
    scheduledAt: '2024-12-06T14:00:00',
    address: '42 avenue des Champs',
    city: 'Lyon',
    zipCode: '69001',
    status: 'pending',
    price: 89,
    duration: 60,
    createdAt: '2024-11-30T15:20:00',
  },
  {
    id: '3',
    clientId: 'client-3',
    mechanicId: 'mech-1',
    vehicleId: 'vehicle-3',
    serviceId: '2',
    scheduledAt: '2024-11-28T09:00:00',
    address: '8 boulevard Victor Hugo',
    city: 'Paris',
    zipCode: '75015',
    status: 'completed',
    price: 149,
    duration: 90,
    createdAt: '2024-11-20T10:00:00',
  },
]

/**
 * Get appointment by ID
 */
export function getAppointmentById(id: string): Appointment | undefined {
  return mockAppointments.find(a => a.id === id)
}

/**
 * Get appointments by status
 */
export function getAppointmentsByStatus(status: string): Appointment[] {
  return mockAppointments.filter(a => a.status === status)
}

/**
 * Get appointments by client ID
 */
export function getAppointmentsByClientId(clientId: string): Appointment[] {
  return mockAppointments.filter(a => a.clientId === clientId)
}




