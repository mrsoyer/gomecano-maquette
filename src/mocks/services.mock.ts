import type { Service } from '@/types/service'

export const mockServices: Service[] = [
  // Entretien (15 services)
  {
    id: '1',
    slug: 'vidange-moteur',
    name: 'Vidange moteur',
    description: 'Vidange complète avec changement du filtre à huile et contrôle multi-points',
    priceFrom: 89,
    duration: 60,
    category: 'entretien',
    imageUrl: '/images/services/vidange.jpg',
    badges: ['Prix instantané', 'Garantie 24 mois'],
    isInstantQuote: true,
    included: ['Huile moteur qualité', 'Filtre à huile', 'Contrôle 20 points', 'Main d\'œuvre'],
    recommended: true,
  },
  {
    id: '2',
    slug: 'revision-complete',
    name: 'Révision complète',
    description: 'Entretien complet selon les préconisations constructeur avec vidange, changement des filtres et contrôle approfondi. Prolongez la durée de vie de votre véhicule et roulez en toute sérénité.',
    priceFrom: 189,
    duration: 120,
    category: 'entretien',
    imageUrl: '/images/services/revision.jpg',
    badges: ['Personnalisable', 'Garantie 24 mois'],
    isInstantQuote: false,
    included: [
      'Main d\'œuvre qualifiée',
      'Déplacement à domicile',
      'Contrôle complet du véhicule',
      'Mise à jour carnet d\'entretien',
      'Rapport détaillé de l\'intervention'
    ],
    recommended: true,
    
    // Questions conditionnelles
    questions: [
      {
        id: 'kilometrage',
        label: 'Kilométrage actuel de votre véhicule',
        type: 'number',
        required: true,
        unit: 'km',
        min: 0,
        max: 500000,
        placeholder: '75000',
        helpText: 'Le kilométrage influence le type de révision nécessaire'
      },
      {
        id: 'derniere-revision',
        label: 'Date de la dernière révision',
        type: 'select',
        required: false,
        options: [
          { value: '0-6', label: 'Il y a moins de 6 mois' },
          { value: '6-12', label: 'Il y a 6 à 12 mois' },
          { value: '12-24', label: 'Il y a 1 à 2 ans', priceModifier: 20 },
          { value: '24+', label: 'Il y a plus de 2 ans', priceModifier: 40 }
        ]
      }
    ],
    
    // Gammes de prix
    pricingTiers: [
      {
        id: 'eco',
        name: 'eco',
        label: 'Eco',
        price: 149,
        duration: 90,  // Révision rapide
        description: 'Pièces adaptables de qualité',
        features: [
          'Huile synthèse 5W30',
          'Filtre à huile adaptable',
          'Points de contrôle (20)',
          'Main d\'œuvre',
          'Garantie 12 mois'
        ]
      },
      {
        id: 'standard',
        name: 'standard',
        label: 'Standard',
        price: 189,
        duration: 120,  // Durée de base (contrôles renforcés)
        description: 'Pièces d\'origine constructeur',
        recommended: true,
        badge: 'RECOMMANDÉ',
        features: [
          'Huile 100% synthèse 5W30',
          'Filtre à huile d\'origine',
          'Filtre à air (si nécessaire)',
          'Points de contrôle (25)',
          'Main d\'œuvre',
          'Mise à jour carnet',
          'Garantie 24 mois'
        ]
      },
      {
        id: 'premium',
        name: 'premium',
        label: 'Premium',
        price: 249,
        duration: 150,  // + nettoyage moteur + tous filtres
        description: 'Pièces premium + prestations supplémentaires',
        features: [
          'Huile 100% synthèse premium longlife',
          'Tous filtres d\'origine (huile, air, habitacle)',
          'Liquides (contrôle + appoint complet)',
          'Points de contrôle (30)',
          'Nettoyage moteur',
          'Mise à jour carnet',
          'Main d\'œuvre',
          'Garantie 36 mois'
        ]
      }
    ],
    
    // Options supplémentaires
    options: [
      {
        id: 'geometrie',
        name: 'Géométrie des roues',
        description: 'Contrôle et réglage précis du parallélisme et carrossage',
        price: 45,
        duration: 30,
        recommended: true
      },
      {
        id: 'climatisation',
        name: 'Recharge climatisation',
        description: 'Contrôle étanchéité circuit + recharge gaz réfrigérant',
        price: 89,
        duration: 45
      },
      {
        id: 'nettoyage-injecteurs',
        name: 'Nettoyage injecteurs',
        description: 'Additif professionnel pour optimiser la combustion',
        price: 35,
        duration: 15
      }
    ],
    
    // Tableau comparatif
    comparisonTable: [
      { feature: 'Huile moteur', eco: '5W30 synthèse', standard: '5W30 100% synthèse', premium: 'Premium longlife' },
      { feature: 'Filtre à huile', eco: 'Adaptable qualité', standard: 'Origine constructeur', premium: 'Origine premium' },
      { feature: 'Filtre à air', eco: false, standard: 'Si nécessaire', premium: true },
      { feature: 'Filtre habitacle', eco: false, standard: false, premium: true },
      { feature: 'Liquides (contrôle)', eco: 'Basique', standard: 'Complet', premium: 'Complet + appoint' },
      { feature: 'Points de contrôle', eco: '20 points', standard: '25 points', premium: '30 points' },
      { feature: 'Nettoyage moteur', eco: false, standard: false, premium: true },
      { feature: 'Garantie', eco: '12 mois', standard: '24 mois', premium: '36 mois' }
    ]
  },
  {
    id: '3',
    slug: 'filtre-air',
    name: 'Changement filtre à air',
    description: 'Remplacement du filtre à air moteur',
    priceFrom: 35,
    duration: 20,
    category: 'entretien',
    imageUrl: '/images/services/filtre-air.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Filtre à air neuf', 'Main d\'œuvre'],
  },
  {
    id: '4',
    slug: 'filtre-habitacle',
    name: 'Changement filtre habitacle',
    description: 'Remplacement du filtre d\'habitacle (pollen)',
    priceFrom: 29,
    duration: 15,
    category: 'entretien',
    imageUrl: '/images/services/filtre-habitacle.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Filtre habitacle neuf', 'Main d\'œuvre'],
  },
  {
    id: '5',
    slug: 'liquide-refroidissement',
    name: 'Vidange liquide de refroidissement',
    description: 'Purge et remplissage du circuit de refroidissement',
    priceFrom: 79,
    duration: 45,
    category: 'entretien',
    imageUrl: '/images/services/refroidissement.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Liquide de refroidissement', 'Purge circuit', 'Main d\'œuvre'],
  },
  // Freinage (10 services)
  {
    id: '10',
    slug: 'plaquettes-frein-avant',
    name: 'Plaquettes de frein avant',
    description: 'Remplacement des plaquettes de frein avant',
    priceFrom: 89,
    duration: 60,
    category: 'freinage',
    imageUrl: '/images/services/plaquettes.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Plaquettes neuves', 'Contrôle disques', 'Main d\'œuvre'],
    recommended: true,
  },
  {
    id: '11',
    slug: 'plaquettes-frein-arriere',
    name: 'Plaquettes de frein arrière',
    description: 'Remplacement des plaquettes de frein arrière',
    priceFrom: 79,
    duration: 60,
    category: 'freinage',
    imageUrl: '/images/services/plaquettes-arriere.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Plaquettes neuves', 'Contrôle disques', 'Main d\'œuvre'],
  },
  {
    id: '12',
    slug: 'disques-frein-avant',
    name: 'Disques de frein avant',
    description: 'Remplacement des disques et plaquettes avant',
    priceFrom: 179,
    duration: 90,
    category: 'freinage',
    imageUrl: '/images/services/disques.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Disques neufs', 'Plaquettes neuves', 'Main d\'œuvre'],
  },
  {
    id: '13',
    slug: 'liquide-frein',
    name: 'Vidange liquide de frein',
    description: 'Purge complète du circuit de freinage',
    priceFrom: 69,
    duration: 45,
    category: 'freinage',
    imageUrl: '/images/services/liquide-frein.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Liquide de frein DOT4', 'Purge circuit', 'Main d\'œuvre'],
  },
  // Pneus (10 services)
  {
    id: '20',
    slug: 'changement-pneus',
    name: 'Changement de pneus',
    description: 'Montage et équilibrage de vos pneus à domicile. Choisissez parmi notre sélection de pneus de qualité adaptés à votre véhicule et à votre budget.',
    priceFrom: 49,
    duration: 60,
    category: 'pneus',
    imageUrl: '/images/services/pneus.jpg',
    badges: ['Personnalisable', 'Installation à domicile'],
    isInstantQuote: false,
    included: [
      'Déplacement à domicile',
      'Montage des pneus',
      'Valve neuve',
      'Évacuation anciens pneus'
    ],
    recommended: true,
    
    // Questions multiples complexes pour pneus
    questions: [
      {
        id: 'nombre-pneus',
        label: 'Combien de pneus à changer ?',
        type: 'radio',
        required: true,
        helpText: 'Le prix sera calculé après sélection de la quantité',
        hidePriceUntilAnswered: true, // Prix caché tant qu'on n'a pas répondu
        options: [
          { value: '2', label: '2 pneus (train avant ou arrière)' },
          { value: '4', label: '4 pneus (train complet)' }
        ]
      },
      {
        id: 'dimension',
        label: 'Dimensions de vos pneus',
        type: 'tire-dimension', // Type spécial pour pneus
        required: true,
        helpText: 'Sélectionnez une dimension proposée ou saisissez manuellement',
        // Dimensions suggérées (sera complété dynamiquement selon véhicule)
        suggestedDimensions: [
          { value: '195/65 R15 91 V', label: '195/65 R15 91 V' },
          { value: '205/55 R16 91 H', label: '205/55 R16 91 H' },
        ],
        // Sélecteurs manuels
        manualSelectors: {
          largeur: { label: 'Largeur', placeholder: '205', unit: 'mm' },
          hauteur: { label: 'Hauteur', placeholder: '55', unit: '%' },
          diametre: { label: 'Diamètre', placeholder: '16', unit: 'pouces' },
          charge: { label: 'Charge', placeholder: '91' },
          vitesse: { label: 'Vitesse', placeholder: 'V' }
        },
        // Image explicative
        explanationImage: 'https://www.idgarages.com/_com-tunnel/_next/static/media/how-to-read-tire.e66d2087.jpeg',
        explanationText: 'Regardez le côté de votre pneu (le flanc) : vous y verrez une suite de chiffres et de lettres, par exemple 205/55 R16 91V.'
      },
      {
        id: 'saison',
        label: 'Type de pneus',
        type: 'radio-icons', // Type avec icônes
        required: true,
        helpText: 'Choisissez selon la saison d\'utilisation',
        options: [
          { value: 'ete', label: 'Été', icon: 'mdi:white-balance-sunny', description: 'Performance optimale par temps chaud' },
          { value: 'hiver', label: 'Hiver', icon: 'mdi:snowflake', description: 'Adhérence maximale sur neige/verglas' },
          { value: '4-saisons', label: '4 saisons', icon: 'mdi:weather-partly-cloudy', description: 'Polyvalent toute l\'année' }
        ]
      },
      {
        id: 'marque',
        label: 'Marque de pneus',
        type: 'tire-brand', // Sélecteur enrichi avec logos et prix
        required: true,
        helpText: 'Les marques les plus populaires',
        defaultValue: 'michelin' // Michelin par défaut (plus populaire)
      }
    ],
    
    // Gammes de prix générées dynamiquement selon réponses
    // (marque, saison, dimension, nombre de pneus)
    // Voir: mocks/serviceTiersOptions.ts
    pricingTiers: [],
    
    // Options supplémentaires
    options: [
      {
        id: 'equilibrage',
        name: 'Équilibrage des roues',
        description: 'Équilibrage précis pour éviter vibrations',
        price: 12,
        duration: 15,
        recommended: true
      },
      {
        id: 'geometrie',
        name: 'Géométrie',
        description: 'Contrôle et réglage pour éviter usure prématurée',
        price: 45,
        duration: 30,
        recommended: true
      },
      {
        id: 'permutation',
        name: 'Permutation pneus existants',
        description: 'Inversion avant/arrière pour usure homogène',
        price: 20,
        duration: 15
      }
    ],
    
    // Tableau comparatif
    comparisonTable: [
      { feature: 'Marques', budget: 'Adaptables', qualite: 'Michelin, Continental', performance: 'Premium Pilot Sport' },
      { feature: 'Technologie', budget: 'Standard', qualite: 'Renforcée', performance: 'RunFlat disponible' },
      { feature: 'Équilibrage', budget: 'Standard', qualite: 'Précis', performance: 'Haute précision' },
      { feature: 'Valve', budget: 'Standard', qualite: 'Neuve garantie', performance: 'TPMS compatible' },
      { feature: 'Performance freinage', budget: 'Correcte', qualite: 'Optimisée', performance: 'Excellente' },
      { feature: 'Durée de vie', budget: '30 000 km', qualite: '40 000 km', performance: '60 000 km' },
      { feature: 'Garantie usure', budget: false, qualite: true, performance: true }
    ]
  },
  {
    id: '21',
    slug: 'permutation-pneus',
    name: 'Permutation de pneus',
    description: 'Permutation des 4 pneus pour une usure uniforme',
    priceFrom: 39,
    duration: 30,
    category: 'pneus',
    imageUrl: '/images/services/permutation.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Permutation 4 roues', 'Contrôle pression', 'Main d\'œuvre'],
  },
  {
    id: '22',
    slug: 'equilibrage-roues',
    name: 'Équilibrage des roues',
    description: 'Équilibrage de 4 roues',
    priceFrom: 29,
    duration: 30,
    category: 'pneus',
    imageUrl: '/images/services/equilibrage.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Équilibrage 4 roues', 'Masses', 'Main d\'œuvre'],
  },
  // Distribution (5 services)
  {
    id: '30',
    slug: 'courroie-distribution',
    name: 'Courroie de distribution',
    description: 'Remplacement de la courroie de distribution et galet tendeur',
    priceFrom: 450,
    duration: 180,
    category: 'distribution',
    imageUrl: '/images/services/courroie.jpg',
    badges: ['Devis gratuit'],
    isInstantQuote: false,
    included: ['Courroie', 'Galets', 'Pompe à eau si nécessaire', 'Main d\'œuvre'],
  },
  {
    id: '31',
    slug: 'courroie-accessoires',
    name: 'Courroie d\'accessoires',
    description: 'Remplacement de la courroie d\'accessoires',
    priceFrom: 89,
    duration: 60,
    category: 'distribution',
    imageUrl: '/images/services/accessoires.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Courroie neuve', 'Contrôle galets', 'Main d\'œuvre'],
  },
  // Climatisation (5 services)
  {
    id: '40',
    slug: 'recharge-climatisation',
    name: 'Recharge climatisation',
    description: 'Recharge complète du système de climatisation',
    priceFrom: 79,
    duration: 45,
    category: 'climatisation',
    imageUrl: '/images/services/clim.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Gaz réfrigérant', 'Contrôle étanchéité', 'Main d\'œuvre'],
  },
  {
    id: '41',
    slug: 'desinfection-climatisation',
    name: 'Désinfection climatisation',
    description: 'Nettoyage et désinfection du circuit de climatisation',
    priceFrom: 49,
    duration: 30,
    category: 'climatisation',
    imageUrl: '/images/services/desinfection.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Produit désinfectant', 'Traitement complet', 'Main d\'œuvre'],
  },
  // Mécanique générale (15 services)
  {
    id: '50',
    slug: 'batterie',
    name: 'Remplacement batterie',
    description: 'Changement de la batterie avec test de l\'alternateur',
    priceFrom: 99,
    duration: 30,
    category: 'mecanique',
    imageUrl: '/images/services/batterie.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Batterie neuve', 'Test alternateur', 'Recyclage ancienne batterie'],
  },
  {
    id: '51',
    slug: 'amortisseurs-avant',
    name: 'Amortisseurs avant',
    description: 'Remplacement des 2 amortisseurs avant',
    priceFrom: 189,
    duration: 120,
    category: 'mecanique',
    imageUrl: '/images/services/amortisseurs.jpg',
    badges: ['Devis gratuit'],
    isInstantQuote: false,
    included: ['2 amortisseurs neufs', 'Kit de fixation', 'Main d\'œuvre'],
  },
  {
    id: '52',
    slug: 'echappement',
    name: 'Réparation échappement',
    description: 'Diagnostic et réparation du système d\'échappement',
    priceFrom: 120,
    duration: 90,
    category: 'mecanique',
    imageUrl: '/images/services/echappement.jpg',
    badges: ['Devis gratuit'],
    isInstantQuote: false,
    included: ['Diagnostic complet', 'Pièces selon diagnostic', 'Main d\'œuvre'],
  },
  {
    id: '53',
    slug: 'embrayage',
    name: 'Remplacement embrayage',
    description: 'Changement du kit embrayage complet',
    priceFrom: 490,
    duration: 240,
    category: 'mecanique',
    imageUrl: '/images/services/embrayage.jpg',
    badges: ['Devis gratuit'],
    isInstantQuote: false,
    included: ['Kit embrayage complet', 'Butée', 'Main d\'œuvre'],
  },
  {
    id: '54',
    slug: 'demarreur',
    name: 'Remplacement démarreur',
    description: 'Changement du démarreur',
    priceFrom: 149,
    duration: 90,
    category: 'mecanique',
    imageUrl: '/images/services/demarreur.jpg',
    badges: ['Devis gratuit'],
    isInstantQuote: false,
    included: ['Démarreur neuf ou échange standard', 'Main d\'œuvre'],
  },
  {
    id: '55',
    slug: 'alternateur',
    name: 'Remplacement alternateur',
    description: 'Changement de l\'alternateur',
    priceFrom: 189,
    duration: 120,
    category: 'mecanique',
    imageUrl: '/images/services/alternateur.jpg',
    badges: ['Devis gratuit'],
    isInstantQuote: false,
    included: ['Alternateur neuf ou échange standard', 'Main d\'œuvre'],
  },
  // Electricité (5 services)
  {
    id: '60',
    slug: 'diagnostic-electronique',
    name: 'Diagnostic électronique',
    description: 'Diagnostic complet avec valise multimarque',
    priceFrom: 49,
    duration: 45,
    category: 'electricite',
    imageUrl: '/images/services/diagnostic.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Diagnostic valise', 'Rapport détaillé', 'Conseils'],
    recommended: true,
  },
  {
    id: '61',
    slug: 'ampoules',
    name: 'Remplacement ampoules',
    description: 'Changement d\'ampoules (phares, clignotants, etc.)',
    priceFrom: 19,
    duration: 15,
    category: 'electricite',
    imageUrl: '/images/services/ampoules.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Ampoule(s)', 'Main d\'œuvre'],
  },
  // Diagnostic (3 services)
  {
    id: '70',
    slug: 'controle-technique',
    name: 'Préparation contrôle technique',
    description: 'Contrôle préventif avant passage au contrôle technique',
    priceFrom: 39,
    duration: 45,
    category: 'diagnostic',
    imageUrl: '/images/services/ct.jpg',
    badges: ['Prix instantané'],
    isInstantQuote: true,
    included: ['Contrôle 30 points', 'Liste des défauts', 'Conseils'],
    recommended: true,
  },
  {
    id: '71',
    slug: 'contre-visite',
    name: 'Réparations contre-visite',
    description: 'Réparation des défauts détectés au contrôle technique',
    priceFrom: 89,
    duration: 90,
    category: 'diagnostic',
    imageUrl: '/images/services/contre-visite.jpg',
    badges: ['Devis gratuit'],
    isInstantQuote: false,
    included: ['Réparations selon rapport CT', 'Pièces', 'Main d\'œuvre'],
  },
]

/**
 * Get service by ID
 */
export function getServiceById(id: string): Service | undefined {
  return mockServices.find(s => s.id === id)
}

/**
 * Get service by slug
 */
export function getServiceBySlug(slug: string): Service | undefined {
  return mockServices.find(s => s.slug === slug)
}

/**
 * Get services by category
 */
export function getServicesByCategory(category: string): Service[] {
  return mockServices.filter(s => s.category === category)
}

/**
 * Get recommended services
 */
export function getRecommendedServices(): Service[] {
  return mockServices.filter(s => s.recommended === true)
}




