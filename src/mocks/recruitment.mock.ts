import type {
  RecruitmentBenefit,
  RecruitmentProcessStep,
  RecruitmentStats,
  RecruitmentAdvantage,
  RecruitmentJobOffer,
  RecruitmentContactInfo
} from '@/types/recruitment'

// ========================================
// 3 PILIERS - POURQUOI GOMECANO
// ========================================
export const recruitmentBenefits: RecruitmentBenefit[] = [
  {
    id: 'benefit-1',
    icon: 'mdi:chart-line',
    title: 'Croissance Assurée',
    subtitle: 'Développez votre clientèle sans prospection',
    description: 'En tant que mécanicien itinérant et véhiculé, vous avez un avantage unique : la capacité d\'aller là où se trouvent vos Clients. Le réseau GOMECANO vous connecte à un flux constant de Clients cherchant des services de mécanique, qu\'il s\'agisse de réparations d\'urgence sur le lieu de panne, de l\'entretien préventif à domicile, ou de l\'installation de pièces et d\'accessoires directement chez lui.',
    features: [
      'Flux constant de clients qualifiés',
      'Interventions d\'urgence sur lieu de panne',
      'Entretien préventif à domicile',
      'Flotte d\'entreprise',
      'Pas de prospection nécessaire',
      'Planning optimisé automatiquement'
    ]
  },
  {
    id: 'benefit-2',
    icon: 'mdi:star-check',
    title: 'Interventions de Qualité',
    subtitle: 'Rejoignez une équipe d\'experts reconnus',
    description: 'La qualité du service est une priorité pour GOMECANO. En tant que membre de notre réseau, vous faites partie d\'une équipe d\'experts dédiés à fournir des interventions de qualité supérieure directement chez les Clients. Nous comprenons que la confiance des Clients est essentielle pour votre succès, et c\'est pourquoi nous exigeons que nos membres maintiennent des normes élevées en matière de service.',
    features: [
      'Standards élevés de qualité',
      'Formation continue offerte',
      'Support technique dédié',
      'Avis clients positifs',
      'Réputation renforcée',
      'Fidélisation automatique'
    ]
  },
  {
    id: 'benefit-3',
    icon: 'mdi:lightning-bolt',
    title: 'Simplicité d\'Intégration',
    subtitle: 'Démarrez rapidement avec notre plateforme',
    description: 'Nous comprenons que votre temps est précieux en tant que mécanicien itinérant. C\'est pourquoi nous avons conçu un processus d\'adhésion simple et rapide, adapté à votre mode de fonctionnement itinérant. Vous pouvez vous inscrire en ligne en quelques minutes, et notre équipe examinera rapidement votre demande.',
    features: [
      'Inscription en ligne en 5 minutes',
      'Plateforme intuitive et mobile',
      'Calendrier de rendez-vous automatisé',
      'Facturation simplifiée',
      'Gestion des devis automatique',
      'Zéro administratif'
    ]
  }
]

// ========================================
// 5 ÉTAPES - COMMENT ÇA MARCHE
// ========================================
export const recruitmentProcessSteps: RecruitmentProcessStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    title: 'Inscription',
    icon: 'mdi:clipboard-edit',
    description: 'Le processus d\'inscription à GOMECANO est rapide et transparent. Vous pouvez vous inscrire en ligne en quelques minutes. Nous vous demanderons des informations de base sur votre entreprise et votre expérience en tant que mécanicien itinérant.',
    details: [
      'Formulaire en ligne simple (5 minutes)',
      'Informations de base sur votre entreprise',
      'Votre expérience de mécanicien itinérant',
      'Vérification des critères de qualité',
      'Standards élevés maintenus'
    ],
    duration: '5 minutes'
  },
  {
    id: 'step-2',
    stepNumber: 2,
    title: 'Validation',
    icon: 'mdi:check-circle',
    description: 'Une fois votre demande approuvée, vous recevrez un accès complet à notre plateforme en ligne. C\'est là que l\'aventure commence. Vous pourrez parcourir les demandes de Clients, examiner les détails des missions et choisir celles qui correspondent à vos compétences et à votre disponibilité.',
    details: [
      'Examen de votre demande (24-48h)',
      'Accès à la plateforme complète',
      'Parcourir les demandes de Clients',
      'Choisir missions selon vos compétences',
      'Contrôle total de votre planning'
    ],
    duration: '24-48h'
  },
  {
    id: 'step-3',
    stepNumber: 3,
    title: 'Prestation de Service',
    icon: 'mdi:tools',
    description: 'Une fois que vous avez accepté une mission, c\'est à vous de briller. Rendez-vous sur le lieu de l\'intervention avec tous les outils et équipements nécessaires, prêt à résoudre le problème du Client. Que ce soit un diagnostic, une réparation, un entretien ou une installation, votre expertise en mécanique est mise en avant.',
    details: [
      'Acceptez les missions qui vous conviennent',
      'Rendez-vous sur le lieu d\'intervention',
      'Diagnostic, réparation, entretien',
      'Service directement chez le Client',
      'Construisez une relation de confiance'
    ],
    duration: '1-3h par intervention'
  },
  {
    id: 'step-4',
    stepNumber: 4,
    title: 'Paiement Rapide',
    icon: 'mdi:cash-multiple',
    description: 'Nous comprenons que la stabilité financière est essentielle pour votre entreprise. C\'est pourquoi nous traitons rapidement les paiements de nos Clients. Dès que la mission est terminée et que le Client est satisfait, nous lançons le processus de paiement hebdomadaire.',
    details: [
      'Paiement hebdomadaire garanti',
      'Traitement automatique post-intervention',
      'Suivi des revenus en temps réel',
      'Comptabilité simplifiée',
      'Zéro retard de paiement'
    ],
    duration: 'Hebdomadaire'
  },
  {
    id: 'step-5',
    stepNumber: 5,
    title: 'Satisfaction Client',
    icon: 'mdi:star',
    description: 'GOMECANO met l\'accent sur la satisfaction du Client. Votre succès est étroitement lié à la satisfaction de vos Clients. Les retours positifs et les recommandations renforcent votre réputation au sein du réseau, ce qui signifie plus de Clients et plus d\'opportunités.',
    details: [
      'Système d\'avis et évaluations',
      'Retours visibles pour nouveaux Clients',
      'Renforcement de votre crédibilité',
      'Plus de Clients automatiquement',
      'Développement de votre activité'
    ]
  }
]

// ========================================
// STATISTIQUES CLÉS
// ========================================
export const recruitmentStats: RecruitmentStats[] = [
  {
    id: 'stat-1',
    label: 'Revenus moyens',
    value: '3200',
    suffix: '€/mois',
    icon: 'mdi:cash'
  },
  {
    id: 'stat-2',
    label: 'Heures de travail',
    value: '20',
    suffix: 'h/semaine',
    icon: 'mdi:clock-outline'
  },
  {
    id: 'stat-3',
    label: 'Mécaniciens actifs',
    value: '150',
    suffix: '+',
    icon: 'mdi:account-group'
  },
  {
    id: 'stat-4',
    label: 'Satisfaction mécaniciens',
    value: '4.8',
    suffix: '/5',
    icon: 'mdi:star'
  },
  {
    id: 'stat-5',
    label: 'Interventions mensuelles',
    value: '2500',
    suffix: '+',
    icon: 'mdi:wrench'
  },
  {
    id: 'stat-6',
    label: 'Gain vs salarié',
    value: 'x3',
    suffix: '',
    icon: 'mdi:trending-up'
  }
]

// ========================================
// AVANTAGES LISTE
// ========================================
export const recruitmentAdvantages: RecruitmentAdvantage[] = [
  {
    id: 'adv-1',
    text: 'Flexibilité totale sur vos horaires',
    icon: 'mdi:clock-check'
  },
  {
    id: 'adv-2',
    text: 'Clients fournis automatiquement',
    icon: 'mdi:account-multiple'
  },
  {
    id: 'adv-3',
    text: 'Zéro frais administratifs',
    icon: 'mdi:file-document-remove'
  },
  {
    id: 'adv-4',
    text: 'Paiement hebdomadaire garanti',
    icon: 'mdi:calendar-check'
  },
  {
    id: 'adv-5',
    text: 'Support technique 7j/7',
    icon: 'mdi:headset'
  },
  {
    id: 'adv-6',
    text: 'Plateforme mobile intuitive',
    icon: 'mdi:cellphone'
  },
  {
    id: 'adv-7',
    text: 'Formation continue offerte',
    icon: 'mdi:school'
  },
  {
    id: 'adv-8',
    text: 'Assurance professionnelle incluse',
    icon: 'mdi:shield-check'
  }
]

// ========================================
// OFFRES D'EMPLOI
// ========================================
export const recruitmentJobOffers: RecruitmentJobOffer[] = [
  {
    id: 'job-1',
    title: 'Mécanicien Itinérant - Île-de-France',
    location: 'Paris et région parisienne',
    contractType: 'freelance',
    salary: {
      min: 2500,
      max: 4500,
      frequency: 'month'
    },
    requirements: [
      'CAP/BEP Mécanique automobile',
      'Minimum 2 ans d\'expérience',
      'Véhicule utilitaire personnel',
      'Outillage professionnel complet',
      'Permis B valide'
    ],
    benefits: [
      'Flexibilité totale',
      'Paiement hebdomadaire',
      'Support technique',
      'Formation continue',
      'Assurance incluse'
    ],
    isActive: true
  },
  {
    id: 'job-2',
    title: 'Mécanicien Itinérant - Lyon et Rhône',
    location: 'Lyon, Villeurbanne, Vénissieux',
    contractType: 'micro-entreprise',
    salary: {
      min: 2000,
      max: 4000,
      frequency: 'month'
    },
    requirements: [
      'Formation mécanique automobile',
      'Expérience minimum 1 an',
      'Véhiculé avec outillage',
      'Autonomie et rigueur'
    ],
    benefits: [
      'Missions garanties',
      'Planning flexible',
      'Support administratif',
      'Paiement rapide'
    ],
    isActive: true
  },
  {
    id: 'job-3',
    title: 'Mécanicien Itinérant - Marseille',
    location: 'Marseille et Bouches-du-Rhône',
    contractType: 'freelance',
    salary: {
      min: 2200,
      max: 3800,
      frequency: 'month'
    },
    requirements: [
      'Diplôme mécanique',
      'Expérience terrain',
      'Véhicule + outils',
      'Sens du service client'
    ],
    benefits: [
      'Clientèle fournie',
      'Horaires libres',
      'Rémunération attractive',
      'Formation continue'
    ],
    isActive: true
  }
]

// ========================================
// CONTACT RECRUTEMENT
// ========================================
export const recruitmentContactInfo: RecruitmentContactInfo = {
  phone: '09 78 46 68 57',
  email: 'info@gomecano.com',
  formUrl: '/devenir-mecanicien-partenariat-gomecano/candidature',
  availability: 'Lundi - Vendredi : 9h - 18h'
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get active job offers only
 */
export function getActiveJobOffers(): RecruitmentJobOffer[] {
  return recruitmentJobOffers.filter(job => job.isActive)
}

/**
 * Get job offers by location
 */
export function getJobOffersByLocation(location: string): RecruitmentJobOffer[] {
  return recruitmentJobOffers.filter(job => 
    job.location.toLowerCase().includes(location.toLowerCase())
  )
}

/**
 * Get benefits by category
 */
export function getBenefitByTitle(title: string): RecruitmentBenefit | undefined {
  return recruitmentBenefits.find(benefit => 
    benefit.title.toLowerCase().includes(title.toLowerCase())
  )
}

/**
 * Get process step by number
 */
export function getProcessStepByNumber(stepNumber: number): RecruitmentProcessStep | undefined {
  return recruitmentProcessSteps.find(step => step.stepNumber === stepNumber)
}

/**
 * Get stats for hero display (top 3)
 */
export function getHeroStats(): RecruitmentStats[] {
  return recruitmentStats.slice(0, 3)
}
