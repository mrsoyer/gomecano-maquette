import type { VehicleMake, VehicleModel } from '@/types/vehicle'

export const mockVehicleMakes: VehicleMake[] = [
  { id: '1', name: 'Renault', logo: '' },
  { id: '2', name: 'Peugeot', logo: '' },
  { id: '3', name: 'Citroën', logo: '' },
  { id: '4', name: 'Volkswagen', logo: '' },
  { id: '5', name: 'BMW', logo: '' },
  { id: '6', name: 'Mercedes', logo: '' },
  { id: '7', name: 'Audi', logo: '' },
  { id: '8', name: 'Toyota', logo: '' },
  { id: '9', name: 'Honda', logo: '' },
  { id: '10', name: 'Ford', logo: '' },
  { id: '11', name: 'Opel', logo: '' },
  { id: '12', name: 'Fiat', logo: '' },
]

export const mockVehicleModels: VehicleModel[] = [
  // Renault
  { id: '1', makeId: '1', name: 'Clio V', years: [2019, 2020, 2021, 2022, 2023, 2024] },
  { id: '2', makeId: '1', name: 'Mégane', years: [2016, 2017, 2018, 2019, 2020, 2021] },
  { id: '3', makeId: '1', name: 'Captur', years: [2017, 2018, 2019, 2020, 2021, 2022, 2023] },
  { id: '4', makeId: '1', name: 'Scénic', years: [2016, 2017, 2018, 2019, 2020] },
  
  // Peugeot
  { id: '10', makeId: '2', name: '208', years: [2019, 2020, 2021, 2022, 2023, 2024] },
  { id: '11', makeId: '2', name: '308', years: [2017, 2018, 2019, 2020, 2021, 2022] },
  { id: '12', makeId: '2', name: '3008', years: [2017, 2018, 2019, 2020, 2021, 2022, 2023] },
  { id: '13', makeId: '2', name: '2008', years: [2019, 2020, 2021, 2022, 2023] },
  
  // Citroën
  { id: '20', makeId: '3', name: 'C3', years: [2017, 2018, 2019, 2020, 2021, 2022] },
  { id: '21', makeId: '3', name: 'C4', years: [2018, 2019, 2020, 2021, 2022, 2023] },
  { id: '22', makeId: '3', name: 'C5 Aircross', years: [2019, 2020, 2021, 2022, 2023] },
  
  // Volkswagen
  { id: '30', makeId: '4', name: 'Golf', years: [2017, 2018, 2019, 2020, 2021, 2022, 2023] },
  { id: '31', makeId: '4', name: 'Polo', years: [2018, 2019, 2020, 2021, 2022, 2023] },
  { id: '32', makeId: '4', name: 'Tiguan', years: [2016, 2017, 2018, 2019, 2020, 2021, 2022] },
]

/**
 * Get make by ID
 */
export function getMakeById(id: string): VehicleMake | undefined {
  return mockVehicleMakes.find(m => m.id === id)
}

/**
 * Get models by make ID
 */
export function getModelsByMake(makeId: string): VehicleModel[] {
  return mockVehicleModels.filter(m => m.makeId === makeId)
}

/**
 * Get model by ID
 */
export function getModelById(id: string): VehicleModel | undefined {
  return mockVehicleModels.find(m => m.id === id)
}




