import type { FAQCategory } from '@/types/composables.types'

/**
 * Mock FAQ Categories with items
 * Used when Supabase RPC functions are not available
 */
export const mockFaqCategories: FAQCategory[] = [
  {
    id: '1',
    name: 'Réservation',
    slug: 'reservation',
    icon: 'mdi:calendar',
    displayOrder: 1,
    items: [
      {
        id: 'faq-1',
        categoryId: '1',
        question: 'Comment réserver une intervention ?',
        answer: 'Vous pouvez réserver en quelques clics en renseignant votre plaque d\'immatriculation, en choisissant le service souhaité et en sélectionnant un créneau horaire. Vous recevrez une confirmation immédiate par email et SMS.',
        displayOrder: 1,
        helpfulCount: 45,
        notHelpfulCount: 2
      },
      {
        id: 'faq-2',
        categoryId: '1',
        question: 'Puis-je annuler ou modifier mon rendez-vous ?',
        answer: 'Oui, vous pouvez annuler ou modifier votre rendez-vous jusqu\'à 24h avant l\'intervention sans frais. Au-delà, des frais d\'annulation de 39€ pourront s\'appliquer.',
        displayOrder: 2,
        helpfulCount: 38,
        notHelpfulCount: 1
      },
      {
        id: 'faq-3',
        categoryId: '1',
        question: 'Combien de temps à l\'avance dois-je réserver ?',
        answer: 'Vous pouvez réserver le jour même selon les disponibilités. Pour être sûr d\'avoir le créneau souhaité, nous recommandons de réserver 48h à l\'avance.',
        displayOrder: 3,
        helpfulCount: 32,
        notHelpfulCount: 3
      }
    ]
  },
  {
    id: '2',
    name: 'Services',
    slug: 'services',
    icon: 'mdi:wrench',
    displayOrder: 2,
    items: [
      {
        id: 'faq-4',
        categoryId: '2',
        question: 'Quels services proposez-vous ?',
        answer: 'Nous proposons plus de 30 services : vidange, révision, freins, pneus, climatisation, diagnostic, batterie, distribution, embrayage, amortisseurs, géométrie, et bien plus. Consultez notre catalogue pour voir tous nos services.',
        displayOrder: 1,
        helpfulCount: 56,
        notHelpfulCount: 1
      },
      {
        id: 'faq-5',
        categoryId: '2',
        question: 'Les pièces sont-elles incluses dans le prix ?',
        answer: 'Oui, tous nos tarifs incluent les pièces nécessaires et la main d\'œuvre. Nous utilisons des pièces de qualité équivalente constructeur avec garantie 12 mois ou 15 000 kilomètres.',
        displayOrder: 2,
        helpfulCount: 67,
        notHelpfulCount: 2
      },
      {
        id: 'faq-6',
        categoryId: '2',
        question: 'Puis-je avoir un devis avant l\'intervention ?',
        answer: 'Absolument ! Nous vous proposons un devis gratuit instantané pour la plupart des services. Pour les interventions plus complexes, notre mécanicien établira un devis détaillé avant de commencer.',
        displayOrder: 3,
        helpfulCount: 51,
        notHelpfulCount: 1
      }
    ]
  },
  {
    id: '3',
    name: 'Paiement',
    slug: 'paiement',
    icon: 'mdi:credit-card',
    displayOrder: 3,
    items: [
      {
        id: 'faq-7',
        categoryId: '3',
        question: 'Quels moyens de paiement acceptez-vous ?',
        answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard, American Express). Le paiement se fait avant l\'intervention, afin de confirmer votre créneau auprès du Gomécanicien.',
        displayOrder: 1,
        helpfulCount: 41,
        notHelpfulCount: 2
      },
      {
        id: 'faq-8',
        categoryId: '3',
        question: 'Proposez-vous un paiement en plusieurs fois ?',
        answer: 'Oui, pour les interventions supérieures à 100€, vous pouvez opter pour un paiement en 2, 3 ou 4 fois via notre partenaire de paiement ALMA.',
        displayOrder: 2,
        helpfulCount: 44,
        notHelpfulCount: 1
      },
      {
        id: 'faq-9',
        categoryId: '3',
        question: 'Puis-je obtenir une facture ?',
        answer: 'Oui, vous recevez automatiquement une facture détaillée par email après chaque intervention. Elle est également disponible dans votre espace client.',
        displayOrder: 3,
        helpfulCount: 39,
        notHelpfulCount: 0
      }
    ]
  },
  {
    id: '4',
    name: 'Garanties',
    slug: 'garanties',
    icon: 'mdi:shield-check',
    displayOrder: 4,
    items: [
      {
        id: 'faq-10',
        categoryId: '4',
        question: 'Quelle garantie proposez-vous ?',
        answer: 'Toutes nos interventions sont garanties 12 mois ou 15 000 kilomètres pièces et main d\'œuvre. En cas de problème lié à notre intervention, nous ré-intervenons pour vérifier l\'intervention et établir sur les pièces détachées ou la pose doivent être prises en garantie.',
        displayOrder: 1,
        helpfulCount: 63,
        notHelpfulCount: 1
      },
      {
        id: 'faq-11',
        categoryId: '4',
        question: 'La garantie Constructeur est-elle préservée ?',
        answer: 'Oui, nos interventions respectent les préconisations Constructeur et préservent votre garantie. Nous tamponnerons votre carnet d\'entretien.',
        displayOrder: 2,
        helpfulCount: 58,
        notHelpfulCount: 2
      },
      {
        id: 'faq-12',
        categoryId: '4',
        question: 'Que se passe-t-il en cas de problème après l\'intervention ?',
        answer: 'Si vous rencontrez un problème lié à notre intervention, contactez-nous immédiatement. Nous interviendrons dans les 48h pour résoudre le problème sans frais supplémentaires.',
        displayOrder: 3,
        helpfulCount: 47,
        notHelpfulCount: 1
      }
    ]
  }
]

/**
 * Get all FAQ categories with items
 */
export function getMockFaqCategories(): FAQCategory[] {
  return mockFaqCategories
}

/**
 * Get FAQ items by category
 */
export function getMockFaqItemsByCategory(categoryId: string) {
  const category = mockFaqCategories.find(cat => cat.id === categoryId)
  return category?.items || []
}
