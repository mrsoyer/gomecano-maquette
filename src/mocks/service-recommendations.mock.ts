/**
 * Mock data pour recommandations de services et conseils mécanicien
 */

/**
 * Conseils personnalisés du mécanicien par service
 */
export const mechanicAdvices: Record<string, string> = {
  'revision-complete': 
    'Avec cette révision complète, je vous recommande de vérifier aussi vos freins et pneus. À ce kilométrage, c\'est le moment idéal pour anticiper l\'usure et rouler en toute sécurité.',
  
  'vidange': 
    'Profitez de cette vidange pour faire contrôler vos freins et votre climatisation. Un entretien préventif vous évite des réparations coûteuses !',
  
  'plaquettes-freins': 
    'Après le changement des plaquettes, pensez à vérifier vos pneus et à faire une géométrie. Des freins neufs méritent une voiture bien entretenue !',
  
  'changement-pneus': 
    'Avec vos nouveaux pneus, une géométrie des roues est recommandée pour optimiser leur durée de vie. Pensez aussi à contrôler vos freins.',
  
  'courroie-distribution': 
    'Le remplacement de la courroie est l\'occasion parfaite pour vérifier la pompe à eau et faire une révision complète. Anticipez pour éviter la panne !',
  
  'filtre-air': 
    'Un filtre à air neuf améliore les performances. Profitez-en pour contrôler votre climatisation et vos bougies d\'allumage.',
  
  'geometrie': 
    'La géométrie optimise l\'usure des pneus. Je vous recommande aussi de vérifier vos freins et amortisseurs pour un confort optimal.',
  
  'climatisation': 
    'Une climatisation performante, c\'est essentiel ! Pensez aussi à changer votre filtre habitacle et à faire une révision de saison.'
}

/**
 * Recommandations de services par service actuel
 * Format : { serviceId: [service1Id, service2Id, service3Id] }
 */
export const serviceRecommendations: Record<string, string[]> = {
  // Révision complète → Freins, Pneus, Géométrie
  'revision-complete': [
    'plaquettes-freins',
    'changement-pneus',
    'geometrie'
  ],
  
  // Vidange → Filtre air, Freins, Courroie
  'vidange': [
    'filtre-air',
    'plaquettes-freins',
    'courroie-distribution'
  ],
  
  // Freins → Pneus, Géométrie, Révision
  'plaquettes-freins': [
    'changement-pneus',
    'geometrie',
    'revision-complete'
  ],
  
  // Pneus → Géométrie, Freins, Révision
  'changement-pneus': [
    'geometrie',
    'plaquettes-freins',
    'revision-complete'
  ],
  
  // Courroie → Pompe à eau, Révision, Vidange
  'courroie-distribution': [
    'revision-complete',
    'vidange',
    'climatisation'
  ],
  
  // Filtre air → Vidange, Climatisation, Révision
  'filtre-air': [
    'vidange',
    'climatisation',
    'revision-complete'
  ],
  
  // Géométrie → Pneus, Freins, Révision
  'geometrie': [
    'changement-pneus',
    'plaquettes-freins',
    'revision-complete'
  ],
  
  // Climatisation → Filtre habitacle, Révision, Vidange
  'climatisation': [
    'filtre-air',
    'revision-complete',
    'vidange'
  ]
}

/**
 * Conseil par défaut si service non trouvé
 */
export const defaultAdvice = 
  'Prenez soin de votre véhicule avec nos services complémentaires. Un entretien régulier prolonge sa durée de vie et assure votre sécurité.'

/**
 * Recommandations par défaut (services populaires)
 */
export const defaultRecommendations = [
  'revision-complete',
  'plaquettes-freins',
  'changement-pneus'
]


