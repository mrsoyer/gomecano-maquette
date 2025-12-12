import type { 
  ServiceTier, 
  ServiceOption, 
  TierGenerationRule, 
  OptionGenerationRule,
  TireCharacteristics 
} from '@/types/service'

/**
 * Tier Generation Rules - Génère dynamiquement les gammes selon réponses
 */
export const tierGenerationRules: Record<string, TierGenerationRule> = {
  // Service Pneus - Modèles de pneus selon marque et saison sélectionnées
  'changement-pneus': {
    serviceId: 'changement-pneus',
    requiredAnswers: ['nombre-pneus', 'dimension', 'saison', 'marque'],
    generator: (answers) => {
      const nombrePneus = Number(answers['nombre-pneus']) || 2
      const marque = String(answers['marque'] || 'michelin')
      const typePneu = String(answers['saison'] || 'ete')
      const dimension = String(answers['dimension'] || '205/55 R16 91 V')
      
      // Mapping caractéristiques par saison
      const seasonMap: Record<string, TireCharacteristics['season']> = {
        'ete': 'summer',
        'hiver': 'winter',
        '4-saisons': 'all-season'
      }
      
      // Mapping marques → modèles de pneus par gamme et saison
      const tireModels: Record<string, Record<string, any>> = {
        'michelin': {
          budget: { 
            name: 'MICHELIN ENERGY SAVER+', 
            fuel: 'B', wetGrip: 'C', noise: 70, noiseClass: 'B',
            features: ['Économies de carburant', 'Longévité accrue', 'Garantie 2 ans']
          },
          standard: { 
            name: typePneu === 'hiver' ? 'MICHELIN ALPIN 6' : 'MICHELIN PRIMACY 4', 
            fuel: 'A', wetGrip: 'A', noise: 68, noiseClass: 'A',
            features: ['Performances optimales', 'Adhérence exceptionnelle', 'Garantie 3 ans', 'Contrôle géométrie offert']
          },
          premium: { 
            name: typePneu === 'hiver' ? 'MICHELIN PILOT ALPIN 5' : 'MICHELIN PILOT SPORT 5', 
            fuel: 'A', wetGrip: 'A', noise: 68, noiseClass: 'A',
            features: ['Technologie premium', 'Performances maximales', 'Garantie 4 ans', 'Stockage saison offert']
          }
        },
        'continental': {
          budget: { 
            name: 'CONTINENTAL ECOCONTACT 6', 
            fuel: 'C', wetGrip: 'B', noise: 71, noiseClass: 'B',
            features: ['Efficacité énergétique', 'Bon rapport qualité/prix', 'Garantie 2 ans']
          },
          standard: { 
            name: 'CONTINENTAL PREMIUMCONTACT 6', 
            fuel: 'B', wetGrip: 'A', noise: 70, noiseClass: 'B',
            features: ['Confort de conduite', 'Sécurité accrue', 'Garantie 3 ans']
          },
          premium: { 
            name: 'CONTINENTAL SPORTCONTACT 6', 
            fuel: 'B', wetGrip: 'A', noise: 70, noiseClass: 'B',
            features: ['Haute performance', 'Tenue de route sportive', 'Garantie 4 ans']
          }
        },
        'goodyear': {
          budget: { 
            name: 'GOODYEAR EFFICIENTGRIP', 
            fuel: 'C', wetGrip: 'B', noise: 70, noiseClass: 'B',
            features: ['Économique', 'Durabilité', 'Garantie 2 ans']
          },
          standard: { 
            name: 'GOODYEAR EAGLE F1', 
            fuel: 'B', wetGrip: 'A', noise: 68, noiseClass: 'A',
            features: ['Performance équilibrée', 'Freinage court', 'Garantie 3 ans']
          },
          premium: { 
            name: 'GOODYEAR EAGLE F1 SUPERSPORT', 
            fuel: 'B', wetGrip: 'A', noise: 68, noiseClass: 'A',
            features: ['Technologie racing', 'Grip maximal', 'Garantie 4 ans']
          }
        },
        'dunlop': {
          budget: { 
            name: 'DUNLOP STREETRESPONSE 2', 
            fuel: 'C', wetGrip: 'B', noise: 70, noiseClass: 'B',
            features: ['Solution économique', 'Fiabilité', 'Garantie 2 ans']
          },
          standard: { 
            name: 'DUNLOP SPORT BLURESPONSE', 
            fuel: 'B', wetGrip: 'A', noise: 68, noiseClass: 'A',
            features: ['Confort et sécurité', 'Adhérence', 'Garantie 3 ans']
          },
          premium: { 
            name: 'DUNLOP SPORT MAXX RT2', 
            fuel: 'B', wetGrip: 'A', noise: 68, noiseClass: 'A',
            features: ['Sport premium', 'Maniabilité', 'Garantie 4 ans']
          }
        },
        'budget': {
          budget: { 
            name: typePneu === 'hiver' ? 'ROYAL BLACK ROYALWINTER HP' : 'LEAO IGREEN ALL SEASON', 
            fuel: typePneu === 'hiver' ? 'D' : 'C', 
            wetGrip: 'C', 
            noise: typePneu === 'hiver' ? 71 : 71, 
            noiseClass: 'B',
            features: ['Prix attractif', 'Qualité correcte', 'Garantie 1 an']
          },
          standard: { 
            name: 'ROYAL BLACK ROYALMILE', 
            fuel: 'D', wetGrip: 'C', noise: 70, noiseClass: 'B',
            features: ['Bon compromis', 'Usage quotidien', 'Garantie 2 ans']
          }
        }
      }
      
      const brandModels = tireModels[marque] || tireModels['michelin']
      
      // Prix de base par marque et gamme
      const brandPrices: Record<string, { budget: number, standard: number, premium?: number }> = {
        'michelin': { budget: 89, standard: 135, premium: 245 },
        'continental': { budget: 75, standard: 115, premium: 215 },
        'goodyear': { budget: 72, standard: 112, premium: 205 },
        'dunlop': { budget: 68, standard: 105, premium: 185 },
        'budget': { budget: 45, standard: 75 }
      }
      
      const basePrices = brandPrices[marque] || brandPrices['michelin']
      
      // Modificateur saison
      let seasonModifier = 0
      if (typePneu === 'hiver') seasonModifier = 15
      else if (typePneu === '4-saisons') seasonModifier = 10
      
      // Calcul prix total
      const calcPrice = (basePrice: number) => 
        (basePrice + seasonModifier) * nombrePneus
      
      const tiers: ServiceTier[] = []
      
      // Budget
      if (brandModels.budget) {
        const model = brandModels.budget
        tiers.push({
          id: 'budget',
          name: model.name,
          description: dimension,
          basePrice: calcPrice(basePrices.budget),
          duration: 60,
          features: model.features,
          badge: 'BUDGET',
          icon: 'mdi:tire',
          imageUrl: '/images/tires/generic-tire.png',
          tirePerformance: {
            fuelEfficiency: model.fuel,
            wetGrip: model.wetGrip,
            noiseLevel: model.noise,
            noiseClass: model.noiseClass
          },
          tireCharacteristics: {
            season: seasonMap[typePneu],
            isMountainLaw: typePneu === 'hiver' || typePneu === '4-saisons',
            brandLogo: 'mdi:tire'
          },
          isDynamic: true,
          generatedFrom: [
            { questionId: 'marque', value: marque },
            { questionId: 'nombre-pneus', value: nombrePneus },
            { questionId: 'saison', value: typePneu }
          ]
        })
      }
      
      // Standard (toujours présent)
      if (brandModels.standard) {
        const model = brandModels.standard
        tiers.push({
          id: 'standard',
          name: model.name,
          description: dimension,
          basePrice: calcPrice(basePrices.standard),
          duration: 75,
          features: model.features,
          badge: 'STANDARD',
          icon: 'mdi:tire',
          imageUrl: '/images/tires/generic-tire.png',
          recommended: true,
          tirePerformance: {
            fuelEfficiency: model.fuel,
            wetGrip: model.wetGrip,
            noiseLevel: model.noise,
            noiseClass: model.noiseClass
          },
          tireCharacteristics: {
            season: seasonMap[typePneu],
            isMountainLaw: typePneu === 'hiver' || typePneu === '4-saisons',
            brandLogo: 'mdi:tire'
          },
          isDynamic: true,
          generatedFrom: [
            { questionId: 'marque', value: marque },
            { questionId: 'nombre-pneus', value: nombrePneus },
            { questionId: 'saison', value: typePneu }
          ]
        })
      }
      
      // Premium (si disponible)
      if (brandModels.premium && basePrices.premium) {
        const model = brandModels.premium
        tiers.push({
          id: 'premium',
          name: model.name,
          description: dimension,
          basePrice: calcPrice(basePrices.premium),
          duration: 90,
          features: model.features,
          badge: 'PREMIUM',
          icon: 'mdi:tire',
          imageUrl: '/images/tires/generic-tire.png',
          tirePerformance: {
            fuelEfficiency: model.fuel,
            wetGrip: model.wetGrip,
            noiseLevel: model.noise,
            noiseClass: model.noiseClass
          },
          tireCharacteristics: {
            season: seasonMap[typePneu],
            isMountainLaw: typePneu === 'hiver' || typePneu === '4-saisons',
            brandLogo: 'mdi:tire'
          },
          isDynamic: true,
          generatedFrom: [
            { questionId: 'marque', value: marque },
            { questionId: 'nombre-pneus', value: nombrePneus },
            { questionId: 'saison', value: typePneu }
          ]
        })
      }
      
      // Retourner maximum 3 pneus
      return tiers.slice(0, 3)
    }
  },
  
  // Service Révision - Gammes selon kilométrage
  'revision': {
    serviceId: 'revision',
    requiredAnswers: ['kilometrage'],
    generator: (answers) => {
      const km = Number(answers['kilometrage']) || 0
      
      // Révision complète si > 100k km
      const isHighMileage = km > 100000
      
      const tiers: ServiceTier[] = [
        {
          id: 'basic',
          name: 'Essentielle',
          description: 'Révision de base selon constructeur',
          basePrice: 89,
          duration: 60,
          features: [
            'Vidange huile moteur',
            'Filtre à huile',
            'Contrôle freins',
            'Contrôle suspension',
            'Contrôle éclairage'
          ],
          icon: 'mdi:wrench',
          isDynamic: true
        },
        {
          id: 'complete',
          name: 'Complète',
          description: isHighMileage 
            ? 'Révision complète (recommandée > 100k km)'
            : 'Révision complète selon constructeur',
          basePrice: isHighMileage ? 189 : 159,
          duration: 120,
          features: [
            'Tout de la révision essentielle',
            'Filtre à air',
            'Filtre habitacle',
            'Liquide de refroidissement',
            'Liquide de frein',
            ...(isHighMileage ? ['Contrôle distribution', 'Nettoyage injecteurs'] : [])
          ],
          icon: 'mdi:star',
          recommended: true,
          isDynamic: true
        }
      ]
      
      return tiers
    }
  }
}

/**
 * Option Generation Rules - Génère dynamiquement les options selon contexte
 */
export const optionGenerationRules: Record<string, OptionGenerationRule> = {
  // Options Pneus - Selon nombre et saison
  'changement-pneus': {
    serviceId: 'changement-pneus',
    requiredAnswers: ['nombre-pneus', 'saison'],
    generator: (answers) => {
      const nombrePneus = Number(answers['nombre-pneus']) || 2
      const typePneu = String(answers['saison'] || 'ete')
      
      const options: ServiceOption[] = [
        {
          id: 'equilibrage',
          name: 'Équilibrage renforcé',
          description: 'Équilibrage haute précision pour confort optimal',
          price: 15 * nombrePneus,
          duration: 15,
          icon: 'mdi:scale-balance',
          category: 'performance',
          isDynamic: true,
          recommendedFor: ['premium']
        },
        {
          id: 'valves',
          name: 'Remplacement des valves',
          description: 'Valves neuves pour éviter les fuites',
          price: 8 * nombrePneus,
          duration: 10,
          icon: 'mdi:valve',
          category: 'securite',
          isDynamic: true,
          recommendedFor: ['standard', 'premium']
        },
        {
          id: 'permutation',
          name: 'Permutation pneus',
          description: 'Permutation train avant/arrière pour usure homogène',
          price: 25,
          duration: 20,
          icon: 'mdi:swap-horizontal',
          category: 'entretien',
          isDynamic: true,
          recommendedFor: nombrePneus === 4 ? ['eco', 'standard', 'premium'] : []
        }
      ]
      
      // Option stockage pneus (seulement si hiver ou 4-saisons)
      if (typePneu === 'hiver' || typePneu === '4-saisons') {
        options.push({
          id: 'stockage',
          name: 'Stockage pneus saison',
          description: 'Stockage gratuit de vos pneus été/hiver (1 an)',
          price: 0,
          duration: 0,
          icon: 'mdi:warehouse',
          category: 'service',
          isDynamic: true,
          recommendedFor: ['premium']
        })
      }
      
      return options
    }
  },
  
  // Options Révision - Selon kilométrage
  'revision': {
    serviceId: 'revision',
    requiredAnswers: ['kilometrage'],
    generator: (answers) => {
      const km = Number(answers['kilometrage']) || 0
      
      const options: ServiceOption[] = [
        {
          id: 'diagnostic',
          name: 'Diagnostic électronique',
          description: 'Scan complet des calculateurs',
          price: 39,
          duration: 30,
          icon: 'mdi:laptop',
          category: 'diagnostic',
          isDynamic: true,
          recommendedFor: km > 50000 ? ['basic', 'complete'] : []
        },
        {
          id: 'clim',
          name: 'Contrôle climatisation',
          description: 'Vérification système + recharge gaz si nécessaire',
          price: 69,
          duration: 45,
          icon: 'mdi:air-conditioner',
          category: 'confort',
          isDynamic: true
        },
        {
          id: 'geometrie',
          name: 'Réglage géométrie',
          description: 'Parallélisme et carrossage',
          price: 59,
          duration: 30,
          icon: 'mdi:angle-acute',
          category: 'performance',
          isDynamic: true,
          recommendedFor: km > 80000 ? ['basic', 'complete'] : []
        }
      ]
      
      return options
    }
  }
}

/**
 * Get tier generation rule for a service
 */
export function getTierGenerationRule(serviceId: string): TierGenerationRule | undefined {
  return tierGenerationRules[serviceId]
}

/**
 * Get option generation rule for a service
 */
export function getOptionGenerationRule(serviceId: string): OptionGenerationRule | undefined {
  return optionGenerationRules[serviceId]
}

/**
 * Check if service has dynamic tiers
 */
export function hasDynamicTiers(serviceId: string): boolean {
  return !!tierGenerationRules[serviceId]
}

/**
 * Check if service has dynamic options
 */
export function hasDynamicOptions(serviceId: string): boolean {
  return !!optionGenerationRules[serviceId]
}


