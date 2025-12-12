/**
 * Vehicle brands with their models and versions
 */

export interface VehicleVersion {
  id: string
  name: string
  year: number
  fuelType: string
  horsePower: number
}

export interface VehicleModel {
  id: string
  name: string
  versions: VehicleVersion[]
}

export interface VehicleBrand {
  id: string
  name: string
  models: VehicleModel[]
}

export const vehicleBrands: VehicleBrand[] = [
  {
    id: 'peugeot',
    name: 'Peugeot',
    models: [
      {
        id: '208',
        name: '208',
        versions: [
          { id: '208-1', name: '1.2 PureTech 75ch', year: 2023, fuelType: 'Essence', horsePower: 75 },
          { id: '208-2', name: '1.2 PureTech 100ch', year: 2023, fuelType: 'Essence', horsePower: 100 },
          { id: '208-3', name: '1.5 BlueHDi 100ch', year: 2023, fuelType: 'Diesel', horsePower: 100 },
        ]
      },
      {
        id: '308',
        name: '308',
        versions: [
          { id: '308-1', name: '1.2 PureTech 130ch', year: 2023, fuelType: 'Essence', horsePower: 130 },
          { id: '308-2', name: '1.5 BlueHDi 130ch', year: 2023, fuelType: 'Diesel', horsePower: 130 },
        ]
      },
      {
        id: '3008',
        name: '3008',
        versions: [
          { id: '3008-1', name: '1.5 BlueHDi 130ch', year: 2023, fuelType: 'Diesel', horsePower: 130 },
          { id: '3008-2', name: 'Hybrid4 300ch', year: 2023, fuelType: 'Hybride', horsePower: 300 },
        ]
      }
    ]
  },
  {
    id: 'renault',
    name: 'Renault',
    models: [
      {
        id: 'clio',
        name: 'Clio V',
        versions: [
          { id: 'clio-1', name: 'TCe 90', year: 2023, fuelType: 'Essence', horsePower: 90 },
          { id: 'clio-2', name: 'TCe 130', year: 2023, fuelType: 'Essence', horsePower: 130 },
          { id: 'clio-3', name: 'E-Tech Hybrid 140ch', year: 2023, fuelType: 'Hybride', horsePower: 140 },
        ]
      },
      {
        id: 'megane',
        name: 'Mégane',
        versions: [
          { id: 'megane-1', name: 'TCe 140', year: 2023, fuelType: 'Essence', horsePower: 140 },
          { id: 'megane-2', name: 'E-Tech EV60 220ch', year: 2023, fuelType: 'Électrique', horsePower: 220 },
        ]
      },
      {
        id: 'captur',
        name: 'Captur',
        versions: [
          { id: 'captur-1', name: 'TCe 100', year: 2023, fuelType: 'Essence', horsePower: 100 },
          { id: 'captur-2', name: 'E-Tech Hybrid 145ch', year: 2023, fuelType: 'Hybride', horsePower: 145 },
        ]
      }
    ]
  },
  {
    id: 'citroen',
    name: 'Citroën',
    models: [
      {
        id: 'c3',
        name: 'C3',
        versions: [
          { id: 'c3-1', name: 'PureTech 83', year: 2023, fuelType: 'Essence', horsePower: 83 },
          { id: 'c3-2', name: 'BlueHDi 100', year: 2023, fuelType: 'Diesel', horsePower: 100 },
        ]
      },
      {
        id: 'c4',
        name: 'C4',
        versions: [
          { id: 'c4-1', name: 'PureTech 130', year: 2023, fuelType: 'Essence', horsePower: 130 },
          { id: 'c4-2', name: 'ë-C4 136ch', year: 2023, fuelType: 'Électrique', horsePower: 136 },
        ]
      }
    ]
  },
  {
    id: 'volkswagen',
    name: 'Volkswagen',
    models: [
      {
        id: 'golf',
        name: 'Golf VIII',
        versions: [
          { id: 'golf-1', name: '1.0 TSI 110ch', year: 2023, fuelType: 'Essence', horsePower: 110 },
          { id: 'golf-2', name: '1.5 TSI 150ch', year: 2023, fuelType: 'Essence', horsePower: 150 },
          { id: 'golf-3', name: '2.0 TDI 150ch', year: 2023, fuelType: 'Diesel', horsePower: 150 },
        ]
      },
      {
        id: 'polo',
        name: 'Polo',
        versions: [
          { id: 'polo-1', name: '1.0 TSI 95ch', year: 2023, fuelType: 'Essence', horsePower: 95 },
          { id: 'polo-2', name: '1.0 TSI 110ch', year: 2023, fuelType: 'Essence', horsePower: 110 },
        ]
      }
    ]
  }
]



