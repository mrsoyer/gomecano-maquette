/**
 * Mock Data - Dimensions de pneus par véhicule
 * 
 * Simule l'API qui retournerait les dimensions compatibles
 * selon la marque/modèle du véhicule
 */

export interface TireDimension {
  value: string // Format: '205/55 R16 91 V'
  label: string // Format lisible: '205/55 R16 91 V'
  largeur: string // 205
  hauteur: string // 55
  diametre: string // 16
  charge: string // 91
  vitesse: string // V
  isOEM?: boolean // Dimension d'origine constructeur
}

/**
 * Dimensions de pneus par véhicule
 * Key: brand-model ou licensePlate
 */
export const tireDimensionsByVehicle: Record<string, TireDimension[]> = {
  // Peugeot 308
  'peugeot-308': [
    {
      value: '205/55 R16 91 V',
      label: '205/55 R16 91 V',
      largeur: '205',
      hauteur: '55',
      diametre: '16',
      charge: '91',
      vitesse: 'V',
      isOEM: true
    },
    {
      value: '205/55 R16 91 H',
      label: '205/55 R16 91 H',
      largeur: '205',
      hauteur: '55',
      diametre: '16',
      charge: '91',
      vitesse: 'H'
    },
    {
      value: '225/45 R17 91 W',
      label: '225/45 R17 91 W',
      largeur: '225',
      hauteur: '45',
      diametre: '17',
      charge: '91',
      vitesse: 'W'
    }
  ],

  // Renault Clio
  'renault-clio': [
    {
      value: '195/65 R15 91 T',
      label: '195/65 R15 91 T',
      largeur: '195',
      hauteur: '65',
      diametre: '15',
      charge: '91',
      vitesse: 'T',
      isOEM: true
    },
    {
      value: '195/65 R15 91 H',
      label: '195/65 R15 91 H',
      largeur: '195',
      hauteur: '65',
      diametre: '15',
      charge: '91',
      vitesse: 'H'
    }
  ],

  // Volkswagen Golf
  'volkswagen-golf': [
    {
      value: '205/55 R16 91 V',
      label: '205/55 R16 91 V',
      largeur: '205',
      hauteur: '55',
      diametre: '16',
      charge: '91',
      vitesse: 'V',
      isOEM: true
    },
    {
      value: '225/45 R17 91 W',
      label: '225/45 R17 91 W',
      largeur: '225',
      hauteur: '45',
      diametre: '17',
      charge: '91',
      vitesse: 'W'
    },
    {
      value: '225/40 R18 92 Y',
      label: '225/40 R18 92 Y',
      largeur: '225',
      hauteur: '40',
      diametre: '18',
      charge: '92',
      vitesse: 'Y'
    }
  ],

  // BMW Série 3
  'bmw-serie-3': [
    {
      value: '225/45 R17 91 W',
      label: '225/45 R17 91 W',
      largeur: '225',
      hauteur: '45',
      diametre: '17',
      charge: '91',
      vitesse: 'W',
      isOEM: true
    },
    {
      value: '225/40 R18 92 Y',
      label: '225/40 R18 92 Y',
      largeur: '225',
      hauteur: '40',
      diametre: '18',
      charge: '92',
      vitesse: 'Y'
    },
    {
      value: '245/35 R19 93 Y',
      label: '245/35 R19 93 Y',
      largeur: '245',
      hauteur: '35',
      diametre: '19',
      charge: '93',
      vitesse: 'Y'
    }
  ],

  // Audi A4
  'audi-a4': [
    {
      value: '225/50 R17 94 W',
      label: '225/50 R17 94 W',
      largeur: '225',
      hauteur: '50',
      diametre: '17',
      charge: '94',
      vitesse: 'W',
      isOEM: true
    },
    {
      value: '245/40 R18 97 Y',
      label: '245/40 R18 97 Y',
      largeur: '245',
      hauteur: '40',
      diametre: '18',
      charge: '97',
      vitesse: 'Y'
    }
  ],

  // Mercedes Classe C
  'mercedes-classe-c': [
    {
      value: '225/45 R17 91 W',
      label: '225/45 R17 91 W',
      largeur: '225',
      hauteur: '45',
      diametre: '17',
      charge: '91',
      vitesse: 'W',
      isOEM: true
    },
    {
      value: '225/40 R18 92 Y',
      label: '225/40 R18 92 Y',
      largeur: '225',
      hauteur: '40',
      diametre: '18',
      charge: '92',
      vitesse: 'Y'
    }
  ],

  // Citroën C3
  'citroen-c3': [
    {
      value: '185/65 R15 88 T',
      label: '185/65 R15 88 T',
      largeur: '185',
      hauteur: '65',
      diametre: '15',
      charge: '88',
      vitesse: 'T',
      isOEM: true
    },
    {
      value: '195/55 R16 87 H',
      label: '195/55 R16 87 H',
      largeur: '195',
      hauteur: '55',
      diametre: '16',
      charge: '87',
      vitesse: 'H'
    }
  ],

  // Default (si véhicule non trouvé)
  'default': [
    {
      value: '195/65 R15 91 V',
      label: '195/65 R15 91 V',
      largeur: '195',
      hauteur: '65',
      diametre: '15',
      charge: '91',
      vitesse: 'V'
    },
    {
      value: '205/55 R16 91 V',
      label: '205/55 R16 91 V',
      largeur: '205',
      hauteur: '55',
      diametre: '16',
      charge: '91',
      vitesse: 'V'
    },
    {
      value: '225/45 R17 91 W',
      label: '225/45 R17 91 W',
      largeur: '225',
      hauteur: '45',
      diametre: '17',
      charge: '91',
      vitesse: 'W'
    }
  ]
}

/**
 * Récupérer dimensions compatibles pour un véhicule
 * 
 * @param brand - Marque du véhicule
 * @param model - Modèle du véhicule
 * @returns Liste des dimensions compatibles
 */
export function getTireDimensionsForVehicle(brand: string, model: string): TireDimension[] {
  const key = `${brand.toLowerCase()}-${model.toLowerCase()}`
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
  
  return tireDimensionsByVehicle[key] || tireDimensionsByVehicle['default']
}

/**
 * Parser une dimension de pneu au format string
 * Ex: "205/55 R16 91 V" → { largeur: '205', hauteur: '55', ... }
 * 
 * @param dimensionString - String au format "205/55 R16 91 V"
 * @returns Objet avec les composants séparés
 */
export function parseTireDimension(dimensionString: string): Partial<TireDimension> | null {
  // Regex: 205/55 R16 91 V ou 205/55R16 91V
  const regex = /^(\d{3})\/(\d{2})\s?R(\d{2})\s?(\d{2,3})\s?([A-Z])$/i
  const match = dimensionString.trim().match(regex)
  
  if (!match) return null
  
  return {
    value: dimensionString,
    label: dimensionString,
    largeur: match[1],
    hauteur: match[2],
    diametre: match[3],
    charge: match[4],
    vitesse: match[5].toUpperCase()
  }
}

/**
 * Formatter une dimension depuis les composants
 * 
 * @param largeur - Largeur (mm)
 * @param hauteur - Hauteur (%)
 * @param diametre - Diamètre (pouces)
 * @param charge - Indice de charge
 * @param vitesse - Indice de vitesse
 * @returns String formaté "205/55 R16 91 V"
 */
export function formatTireDimension(
  largeur: string,
  hauteur: string,
  diametre: string,
  charge: string,
  vitesse: string
): string {
  return `${largeur}/${hauteur} R${diametre} ${charge} ${vitesse}`
}


