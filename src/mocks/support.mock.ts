/**
 * Support Mock Data - Tickets, FAQ
 */

import type {
  SupportTicket,
  TicketMessage,
  FAQArticle,
  FAQCategory,
  SupportStatistics,
  CreateTicketData
} from '@/types/support'

/**
 * Mock support tickets
 */
export const mockTickets: SupportTicket[] = [
  {
    id: 'ticket-1',
    userId: 'user-1',
    subject: 'Question sur ma facture #INV-2024-042',
    description: 'Bonjour, je souhaiterais obtenir des précisions sur certains éléments de ma dernière facture concernant la vidange de ma Peugeot 308. Je ne comprends pas le supplément de 15€.',
    category: 'payment',
    priority: 'medium',
    status: 'resolved',
    assignedTo: 'agent-2',
    interventionId: 'int-3',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        id: 'msg-1-1',
        ticketId: 'ticket-1',
        author: 'user',
        authorName: 'Sophie Martin',
        content: 'Bonjour, je souhaiterais obtenir des précisions sur certains éléments de ma dernière facture concernant la vidange de ma Peugeot 308. Je ne comprends pas le supplément de 15€.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-1-2',
        ticketId: 'ticket-1',
        author: 'agent',
        authorName: 'Marc (Support Gomecano)',
        content: 'Bonjour Sophie, merci pour votre message. Le supplément de 15€ correspond au filtre à air qui a été remplacé lors de la vidange car il était très encrassé. Notre mécanicien vous a contactée pour validation avant l\'intervention. Souhaitez-vous que je vous envoie une photo du filtre usagé ?',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-1-3',
        ticketId: 'ticket-1',
        author: 'user',
        authorName: 'Sophie Martin',
        content: 'Ah oui c\'est vrai ! J\'avais oublié. Merci pour la clarification, tout est bon alors.',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'ticket-2',
    userId: 'user-1',
    subject: 'Modifier un RDV - Empêchement imprévu',
    description: 'J\'ai un rendez-vous prévu demain à 14h pour ma Clio mais j\'ai un empêchement. Est-il possible de reporter à la semaine prochaine ?',
    category: 'intervention',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'agent-1',
    interventionId: 'int-1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        id: 'msg-2-1',
        ticketId: 'ticket-2',
        author: 'user',
        authorName: 'Sophie Martin',
        content: 'J\'ai un rendez-vous prévu demain à 14h pour ma Clio mais j\'ai un empêchement. Est-il possible de reporter à la semaine prochaine ?',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-2-2',
        ticketId: 'ticket-2',
        author: 'agent',
        authorName: 'Julie (Support Gomecano)',
        content: 'Bonjour Sophie, pas de souci ! Je contacte votre mécanicien pour trouver un créneau la semaine prochaine. Je vous tiens informée dans les 30 minutes.',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'ticket-3',
    userId: 'user-1',
    subject: 'Problème de connexion à mon compte',
    description: 'Je n\'arrive plus à me connecter avec mon mot de passe habituel. J\'ai essayé de le réinitialiser mais je ne reçois pas l\'email.',
    category: 'technical',
    priority: 'high',
    status: 'open',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    messages: [
      {
        id: 'msg-3-1',
        ticketId: 'ticket-3',
        author: 'user',
        authorName: 'Sophie Martin',
        content: 'Je n\'arrive plus à me connecter avec mon mot de passe habituel. J\'ai essayé de le réinitialiser mais je ne reçois pas l\'email.',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ]
  },
  // More tickets (total 15+)
  {
    id: 'ticket-4',
    userId: 'user-1',
    subject: 'Demande de devis pour révision 60,000km',
    description: 'Bonjour, ma Peugeot 308 va atteindre les 60,000km. Pouvez-vous m\'indiquer le prix d\'une révision complète ?',
    category: 'intervention',
    priority: 'low',
    status: 'resolved',
    resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        id: 'msg-4-1',
        ticketId: 'ticket-4',
        author: 'user',
        authorName: 'Sophie Martin',
        content: 'Bonjour, ma Peugeot 308 va atteindre les 60,000km. Pouvez-vous m\'indiquer le prix d\'une révision complète ?',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-4-2',
        ticketId: 'ticket-4',
        author: 'agent',
        authorName: 'Marc (Support Gomecano)',
        content: 'Bonjour Sophie, pour une révision 60,000km sur votre Peugeot 308 (2020), le tarif est de 220€ TTC incluant : vidange, filtres (air, huile, habitacle), liquide de frein, contrôle complet. Je vous prépare un devis détaillé par email ?',
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
]

/**
 * Mock FAQ categories
 */
export const mockFAQCategories: FAQCategory[] = [
  {
    id: 'cat-interventions',
    name: 'Interventions',
    description: 'Réservation, modification, annulation',
    icon: 'mdi:wrench',
    articleCount: 12,
    order: 1
  },
  {
    id: 'cat-payment',
    name: 'Paiement & Facturation',
    description: 'Moyens de paiement, factures, remboursements',
    icon: 'mdi:cash',
    articleCount: 8,
    order: 2
  },
  {
    id: 'cat-account',
    name: 'Mon compte',
    description: 'Profil, sécurité, préférences',
    icon: 'mdi:account',
    articleCount: 6,
    order: 3
  },
  {
    id: 'cat-vehicles',
    name: 'Mes véhicules',
    description: 'Ajout, modification, documents',
    icon: 'mdi:car',
    articleCount: 5,
    order: 4
  }
]

/**
 * Mock FAQ articles
 */
export const mockFAQArticles: FAQArticle[] = [
  {
    id: 'faq-1',
    category: 'cat-interventions',
    question: 'Comment réserver une intervention ?',
    answer: 'Pour réserver une intervention :\n1. Accédez à la page "Services"\n2. Sélectionnez le service souhaité\n3. Choisissez votre véhicule\n4. Sélectionnez une date et un créneau horaire\n5. Confirmez votre adresse\n6. Validez votre réservation\n\nVous recevrez une confirmation par email et SMS.',
    tags: ['réservation', 'intervention', 'nouveau'],
    helpful: 142,
    notHelpful: 5,
    relatedArticles: ['faq-2', 'faq-3'],
    lastUpdated: '2024-11-15'
  },
  {
    id: 'faq-2',
    category: 'cat-interventions',
    question: 'Puis-je modifier ou annuler mon rendez-vous ?',
    answer: 'Oui, vous pouvez modifier ou annuler votre rendez-vous :\n\n**Modification** : Gratuite jusqu\'à 48h avant l\'intervention. Entre 24h et 48h : frais de 15€. Moins de 24h : 30€.\n\n**Annulation** : Remboursement intégral si > 48h avant. 50% entre 24h et 48h. Aucun remboursement < 24h.\n\nPour modifier/annuler : Accédez à "Mes interventions" → Sélectionnez l\'intervention → "Modifier" ou "Annuler".',
    tags: ['modification', 'annulation', 'politique'],
    helpful: 98,
    notHelpful: 12,
    relatedArticles: ['faq-1'],
    lastUpdated: '2024-11-20'
  },
  {
    id: 'faq-3',
    category: 'cat-interventions',
    question: 'Combien de temps dure une vidange ?',
    answer: 'Une vidange standard dure environ 30 à 45 minutes. Ce délai inclut :\n- Le remplacement de l\'huile moteur\n- Le changement du filtre à huile\n- Le contrôle des niveaux (liquide de refroidissement, lave-glace, etc.)\n- Un contrôle visuel général\n\nNos mécaniciens sont ponctuels et respectent les créneaux horaires réservés.',
    tags: ['vidange', 'durée', 'temps'],
    helpful: 76,
    notHelpful: 3,
    relatedArticles: ['faq-1'],
    lastUpdated: '2024-10-05'
  },
  {
    id: 'faq-4',
    category: 'cat-payment',
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer: 'Nous acceptons :\n- **Cartes bancaires** : Visa, Mastercard, American Express\n- **Prélèvement SEPA** : Virement bancaire\n- **PayPal**\n- **Carte Ticket Restaurant** (pour interventions éligibles)\n\nLe paiement est sécurisé via Stripe. Vous pouvez enregistrer votre carte pour vos prochaines réservations.',
    tags: ['paiement', 'carte', 'sepa'],
    helpful: 124,
    notHelpful: 2,
    relatedArticles: ['faq-5'],
    lastUpdated: '2024-11-01'
  },
  {
    id: 'faq-5',
    category: 'cat-payment',
    question: 'Comment obtenir ma facture ?',
    answer: 'Votre facture est disponible immédiatement après l\'intervention :\n\n1. **Par email** : Envoyée automatiquement à l\'adresse de votre compte\n2. **Espace client** : Section "Historique & Factures"\n3. **Téléchargement PDF** : Cliquez sur l\'intervention → "Télécharger la facture"\n\nLa facture inclut le détail des prestations, la TVA, et est conforme pour les remboursements assurance/mutuelle.',
    tags: ['facture', 'téléchargement', 'email'],
    helpful: 89,
    notHelpful: 4,
    relatedArticles: ['faq-4'],
    lastUpdated: '2024-10-12'
  },
  {
    id: 'faq-6',
    category: 'cat-account',
    question: 'Comment modifier mes informations personnelles ?',
    answer: 'Pour modifier vos informations :\n1. Connectez-vous à votre compte\n2. Accédez à "Mon profil"\n3. Cliquez sur "Modifier mes informations"\n4. Modifiez les champs souhaités (nom, email, téléphone, adresse)\n5. Cliquez sur "Enregistrer"\n\nLes modifications sont effectives immédiatement. Un email de confirmation vous sera envoyé.',
    tags: ['profil', 'modification', 'données'],
    helpful: 65,
    notHelpful: 1,
    relatedArticles: [],
    lastUpdated: '2024-09-20'
  },
  {
    id: 'faq-7',
    category: 'cat-account',
    question: 'Comment réinitialiser mon mot de passe ?',
    answer: 'Si vous avez oublié votre mot de passe :\n1. Page de connexion → "Mot de passe oublié ?"\n2. Saisissez votre email\n3. Vous recevrez un email avec un lien (valable 1h)\n4. Cliquez sur le lien et définissez un nouveau mot de passe\n\n**Conseils sécurité** :\n- Minimum 8 caractères\n- Mélange de lettres, chiffres et symboles\n- Évitez les mots de passe évidents',
    tags: ['mot de passe', 'réinitialisation', 'sécurité'],
    helpful: 51,
    notHelpful: 2,
    relatedArticles: ['faq-6'],
    lastUpdated: '2024-11-10'
  },
  {
    id: 'faq-8',
    category: 'cat-vehicles',
    question: 'Comment ajouter un nouveau véhicule ?',
    answer: 'Pour ajouter un véhicule :\n1. "Mes véhicules" → "Ajouter un véhicule"\n2. **Option 1** : Saisir la plaque d\'immatriculation (auto-complétion)\n3. **Option 2** : Saisir manuellement (marque, modèle, année, carburant)\n4. Ajouter une photo (optionnel)\n5. Cliquer sur "Enregistrer"\n\nVous pourrez ensuite associer ce véhicule à vos interventions.',
    tags: ['véhicule', 'ajout', 'immatriculation'],
    helpful: 72,
    notHelpful: 8,
    relatedArticles: [],
    lastUpdated: '2024-10-28'
  }
]

/**
 * Mock support statistics
 */
export const mockSupportStatistics: SupportStatistics = {
  totalTickets: 247,
  openTickets: 12,
  resolvedTickets: 235,
  averageResponseTime: 45, // minutes
  averageResolutionTime: 4.2, // hours
  satisfactionRate: 94.5 // percentage
}

/**
 * Get tickets for user
 */
export async function getUserTickets(userId: string): Promise<SupportTicket[]> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockTickets.filter(t => t.userId === userId)
}

/**
 * Get ticket by ID
 */
export async function getTicketById(ticketId: string): Promise<SupportTicket | null> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return mockTickets.find(t => t.id === ticketId) || null
}

/**
 * Create ticket
 */
export async function createTicket(userId: string, data: CreateTicketData): Promise<SupportTicket> {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const newTicket: SupportTicket = {
    id: `ticket-${Date.now()}`,
    userId,
    subject: data.subject,
    description: data.description,
    category: data.category,
    priority: data.priority || 'medium',
    status: 'open',
    interventionId: data.interventionId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: `msg-${Date.now()}-1`,
        ticketId: `ticket-${Date.now()}`,
        author: 'user',
        authorName: 'Sophie Martin',
        content: data.description,
        createdAt: new Date().toISOString()
      }
    ]
  }
  
  mockTickets.push(newTicket)
  return newTicket
}

/**
 * Get FAQ articles
 */
export async function getFAQArticles(category?: string, searchQuery?: string): Promise<FAQArticle[]> {
  await new Promise(resolve => setTimeout(resolve, 400))
  
  let results = [...mockFAQArticles]
  
  if (category) {
    results = results.filter(a => a.category === category)
  }
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    results = results.filter(a =>
      a.question.toLowerCase().includes(query) ||
      a.answer.toLowerCase().includes(query) ||
      a.tags.some(t => t.includes(query))
    )
  }
  
  return results
}

/**
 * Rate FAQ article
 */
export async function rateFAQArticle(articleId: string, helpful: boolean): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200))
  
  const article = mockFAQArticles.find(a => a.id === articleId)
  if (article) {
    if (helpful) {
      article.helpful++
    } else {
      article.notHelpful++
    }
  }
}

