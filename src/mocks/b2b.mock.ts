/**
 * B2B Mock Data - Données mockées pour la page Entreprises
 */

import type { B2BClient, ProcessStep, B2BService, FaqItem } from '@/types/b2b'

/**
 * Clients B2B de référence
 */
export const b2bClients: B2BClient[] = [
  { name: 'La Poste', emoji: '📮', logo: '/images/Logo_B2B_Carrousel_laposte_gomecano.png' },
  { name: 'Office National des Forêts', emoji: '🪖', logo: '/images/Logo_B2B_Carrousel_onf_gomecano.png' },
  { name: 'E.Leclerc Location', emoji: '🚗', logo: '/images/Logo_B2B_Carrousel_eleclerc_location_gomecano.png' },
  { name: 'KILOW', emoji: '⚡', logo: '/images/Logo_B2B_Carrousel_kilow_gomecano.png' },
  { name: 'Opteven', emoji: '🏭', logo: '/images/Logo_B2B_Carrousel_opteven_gomecano.png' },
  { name: 'MOKE', emoji: '🏎️', logo: '/images/Logo_B2B_Carrousel_moke_gomecano.png' },
  { name: 'RentaCar', emoji: '🔑', logo: '/images/Logo_B2B_Carrousel_rentacar_gomecano.png' },
  { name: 'ADA', emoji: '🚗', logo: '/images/Logo_B2B_Carrousel_ada_gomecano.png' },
  { name: 'Ayvens', emoji: '🚙', logo: '/images/Logo_B2B_Carrousel_ayvens_gomecano.png' },
  { name: 'SIXT', emoji: '🚕', logo: '/images/Logo_B2B_Carrousel_sixt_gomecano.png' },
  { name: 'Proclair', emoji: '🌱', logo: '/images/Logo_B2B_Carrousel_proclair_gomecano.png' },
  { name: 'FATEC', emoji: '⚙️', logo: '/images/Logo_B2B_Carrousel_fatec_gomecano.png' },
]

/**
 * Étapes du processus de fonctionnement (optimisées conversion)
 */
export const processSteps: ProcessStep[] = [
  {
    emoji: '🚀',
    icon: 'mdi:car-wrench',
    title: 'Zéro immobilisation',
    items: [
      'Intervention directement sur site',
      'Vos équipes restent productives',
      'Plus de détours en garage'
    ]
  },
  {
    emoji: '⚡',
    icon: 'mdi:clock-fast',
    title: 'Réactivité garantie',
    items: [
      'Intervention sous 24h maximum',
      'Mécaniciens certifiés et équipés',
      'Disponibles 6j/7 partout en France'
    ]
  },
  {
    emoji: '💰',
    icon: 'mdi:chart-line-variant',
    title: 'Économies réelles',
    items: [
      'Tarifs négociés jusqu\'à -30%',
      'Garanties constructeur maintenues',
      'Facturation transparente et simplifiée'
    ]
  }
]

/**
 * Services B2B sur site
 */
export const b2bServices: B2BService[] = [
  {
    id: 1,
    emoji: '🔧',
    icon: 'mdi:tire',
    iconColor: 'text-green-primary',
    name: 'Pneumatiques sur site',
    description: 'Montage et équilibrage de pneumatiques sur site'
  },
  {
    id: 2,
    emoji: '🛠️',
    icon: 'mdi:wrench',
    iconColor: 'text-blue-primary',
    name: 'Révisions / Entretien sur site',
    description: 'Entretien complet selon préconisations constructeur'
  },
  {
    id: 3,
    emoji: '🛑',
    icon: 'mdi:car-brake-alert',
    iconColor: 'text-green-primary',
    name: 'Freinage sur site',
    description: 'Diagnostic et réparation système de freinage'
  },
  {
    id: 4,
    emoji: '🔋',
    icon: 'mdi:battery-charging',
    iconColor: 'text-blue-primary',
    name: 'Changement de batterie sur site',
    description: 'Remplacement batterie avec diagnostic électrique'
  },
  {
    id: 5,
    emoji: '⚡',
    icon: 'mdi:flash',
    iconColor: 'text-green-primary',
    name: 'Diagnostic électrique sur site',
    description: 'Diagnostic complet système électrique et électronique'
  },
  {
    id: 6,
    emoji: '🔍',
    icon: 'mdi:magnify',
    iconColor: 'text-green-primary',
    name: 'Inspection de véhicule sur site',
    description: 'Inspection et rapport de situation sur un véhicule'
  },
  {
    id: 7,
    emoji: '🔄',
    icon: 'mdi:circle-double',
    iconColor: 'text-blue-primary',
    name: 'Rachat de pneus',
    description: 'Achat / Revente en gros de pneumatiques'
  },
  {
    id: 8,
    emoji: '📊',
    icon: 'mdi:map-marker-path',
    iconColor: 'text-green-primary',
    name: 'Suivi en temps réel',
    description: 'Alerte et suivi de l\'état et de la position de votre flotte'
  }
]

/**
 * Questions fréquentes B2B
 */
export const b2bFaqs: FaqItem[] = [
  {
    question: 'Quels types de véhicules pouvez-vous entretenir ?',
    answer: 'Nous intervenons sur tous types de véhicules légers et utilitaires (thermiques, hybrides, électriques) de toutes marques.'
  },
  {
    question: 'Quel est le délai d\'intervention ?',
    answer: 'Nous proposons une intervention sous 24h sur votre site ou chez vos collaborateurs.'
  },
  {
    question: 'Quelle garantie proposez-vous ?',
    answer: 'Toutes nos interventions sont garanties 12 mois ou 15 000 kilomètres pièces et main d\'œuvre. En cas de problème lié à notre intervention, nous ré-intervenons pour vérifier l\'intervention et établir si les pièces détachées ou la pose doivent être prises en garantie.'
  },
  {
    question: 'Les garanties Constructeur sont-elles préservées ?',
    answer: 'Oui, toutes nos interventions respectent les préconisations constructeur et préservent vos garanties.'
  },
  {
    question: 'Proposez-vous des contrats d\'entretien flotte ?',
    answer: 'Oui, nous proposons des contrats avec prix négociés et forfaits adaptés à la taille de votre flotte.'
  },
  {
    question: 'Quelle est votre zone d\'intervention ?',
    answer: 'Notre réseau couvre l\'ensemble du territoire français. Contactez-nous pour vérifier la disponibilité dans votre zone.'
  }
]
