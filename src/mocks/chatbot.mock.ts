/**
 * Chatbot Mock Data - NLP patterns, responses
 */

import type { ChatbotPattern, ChatbotIntent, ChatbotMessage } from '@/types/support'

/**
 * Mock chatbot NLP patterns
 */
export const mockChatbotPatterns: ChatbotPattern[] = [
  {
    intent: 'greeting',
    patterns: [
      /^(bonjour|salut|hello|hey|bonsoir|coucou)/i,
      /^(salutations|yo)/i
    ],
    responses: [
      'Bonjour ! Je suis l\'assistant virtuel Gomecano. Comment puis-je vous aider aujourd\'hui ?',
      'Salut ! Ravi de vous aider. Que puis-je faire pour vous ?',
      'Bonjour et bienvenue ! Je peux vous renseigner sur nos services, vos interventions ou toute autre question.'
    ],
    followUpQuestions: [
      'Réserver une intervention',
      'Suivre mon rendez-vous',
      'Obtenir un devis',
      'Contacter un conseiller'
    ]
  },
  {
    intent: 'booking_inquiry',
    patterns: [
      /(réserver|prendre|fixer|planifier).*(rendez-vous|rdv|intervention|visite)/i,
      /(comment|puis-je|veux|voudrais).*(réserver|booking|book)/i,
      /^(réservation|booking)/i
    ],
    responses: [
      'Pour réserver une intervention, c\'est très simple ! Cliquez sur "Réserver" ci-dessous ou rendez-vous sur notre page Services. Quel type d\'intervention vous intéresse ?',
      'Je peux vous aider à réserver. De quel service avez-vous besoin ? Vidange, freins, révision, diagnostic...'
    ],
    followUpQuestions: [
      'Vidange',
      'Freins',
      'Révision complète',
      'Diagnostic',
      'Autre service'
    ],
    requiresContext: false
  },
  {
    intent: 'price_inquiry',
    patterns: [
      /(prix|tarif|coût|combien).*(vidange|freins|révision|diagnostic)/i,
      /(devis|estimation).*(gratuit|prix)/i,
      /^(combien|quel prix)/i
    ],
    responses: [
      'Nos tarifs varient selon le véhicule et le service. Pour une estimation précise, je vous invite à faire un devis gratuit en ligne. Quel service vous intéresse ?',
      'Je peux vous donner une fourchette de prix :\n- Vidange : 70-120€\n- Freins : 150-300€\n- Révision : 180-350€\n\nPour un devis précis, indiquez-moi votre véhicule !'
    ],
    followUpQuestions: [
      'Faire un devis',
      'Voir les services',
      'Parler à un conseiller'
    ]
  },
  {
    intent: 'intervention_status',
    patterns: [
      /(où en est|statut|suivi).*(intervention|rendez-vous|rdv)/i,
      /(mon|ma).*(intervention|commande|réservation)/i,
      /^(suivi|status|état)/i
    ],
    responses: [
      'Je consulte votre dernière intervention... Votre intervention est confirmée pour demain à 14h. Le mécanicien arrivera à l\'adresse indiquée.',
      'Votre intervention est en cours ! Le mécanicien est sur place depuis 10 minutes. Vous recevrez une notification à la fin.'
    ],
    requiresContext: true
  },
  {
    intent: 'cancel_booking',
    patterns: [
      /(annuler|supprimer|effacer).*(intervention|rendez-vous|rdv|réservation)/i,
      /(ne (peux|peut) (plus|pas)|empêchement)/i,
      /^(annulation|cancel)/i
    ],
    responses: [
      'Je comprends que vous souhaitez annuler votre intervention. Pour connaître les conditions d\'annulation et procéder, cliquez sur "Annuler mon RDV" ci-dessous.',
      'Annulation d\'intervention : \n- > 48h avant : remboursement intégral\n- 24-48h : 50% remboursé\n- < 24h : non remboursable\n\nSouhaitez-vous continuer ?'
    ],
    followUpQuestions: [
      'Annuler mon RDV',
      'Reporter mon RDV',
      'Contacter le support'
    ],
    requiresContext: true
  },
  {
    intent: 'reschedule_booking',
    patterns: [
      /(reporter|décaler|changer|modifier).*(date|heure|jour|rendez-vous|rdv)/i,
      /(changer|modification).*(créneau|horaire)/i,
      /^(report|modif)/i
    ],
    responses: [
      'Vous souhaitez reporter votre intervention ? Pas de problème ! Les modifications sont gratuites jusqu\'à 48h avant le RDV. Cliquez sur "Modifier mon RDV".',
      'Je peux vous aider à changer la date. Votre intervention actuelle est prévue le [DATE]. Souhaitez-vous voir les créneaux disponibles ?'
    ],
    followUpQuestions: [
      'Voir les créneaux',
      'Reporter la semaine prochaine',
      'Annuler plutôt'
    ],
    requiresContext: true
  },
  {
    intent: 'payment_question',
    patterns: [
      /(paiement|payer|régler|facture)/i,
      /(moyens|méthode|carte).*(paiement|pay)/i,
      /(prix|coût|montant).*(total|final)/i
    ],
    responses: [
      'Nous acceptons les cartes bancaires (Visa, Mastercard, Amex), SEPA et PayPal. Le paiement est sécurisé via Stripe. Vous pouvez enregistrer votre carte pour plus de facilité.',
      'Votre facture sera disponible immédiatement après l\'intervention dans votre espace client, section "Historique & Factures". Vous la recevrez aussi par email.'
    ],
    followUpQuestions: [
      'Enregistrer une carte',
      'Voir mes factures',
      'Modes de paiement acceptés'
    ]
  },
  {
    intent: 'technical_support',
    patterns: [
      /(problème|bug|erreur|dysfonctionnement)/i,
      /(ne fonctionne pas|marche pas|crash)/i,
      /(aide|assistance).*(technique|tech)/i
    ],
    responses: [
      'Je comprends que vous rencontrez un problème technique. Pouvez-vous me préciser : \n- Sur quelle page ?\n- Quel est le message d\'erreur ?\n- Depuis quand ?\n\nJe vais créer un ticket pour notre équipe support.'
    ],
    followUpQuestions: [
      'Créer un ticket',
      'Parler à un technicien',
      'Consulter la FAQ'
    ]
  },
  {
    intent: 'general_question',
    patterns: [
      /(comment|pourquoi|quand|où|qui)/i,
      /(expliquer|information|renseignement)/i,
      /(besoin|aide|question)/i
    ],
    responses: [
      'Je suis là pour répondre à vos questions ! Pouvez-vous préciser votre demande ? Je peux vous aider sur :\n- Nos services\n- Vos interventions\n- Votre compte\n- Les paiements',
      'Quelle est votre question ? Je peux vous renseigner sur tous nos services et fonctionnalités.'
    ],
    followUpQuestions: [
      'Services proposés',
      'Mon compte',
      'Mes interventions',
      'Consulter la FAQ'
    ]
  },
  {
    intent: 'faq',
    patterns: [
      /^(faq|aide|help|questions)/i,
      /(questions|réponses).*(fréquentes|courantes)/i
    ],
    responses: [
      'Notre FAQ contient de nombreuses réponses ! Voici les sujets principaux :\n- Interventions (réservation, modification)\n- Paiement & facturation\n- Mon compte\n- Mes véhicules\n\nQuel sujet vous intéresse ?'
    ],
    followUpQuestions: [
      'Interventions',
      'Paiement',
      'Mon compte',
      'Véhicules'
    ]
  },
  {
    intent: 'goodbye',
    patterns: [
      /^(au revoir|bye|à bientôt|ciao|à plus|salut)/i,
      /^(merci|ok|c'est bon|parfait).*(bye|au revoir)?$/i
    ],
    responses: [
      'Au revoir ! N\'hésitez pas à revenir si vous avez d\'autres questions. Bonne journée !',
      'Merci d\'avoir utilisé notre assistant. À très bientôt sur Gomecano !',
      'C\'était un plaisir de vous aider. Bonne route et à bientôt !'
    ]
  }
]

/**
 * Match user message to intent using NLP patterns
 */
export function matchIntent(message: string): ChatbotIntent {
  const normalizedMessage = message.trim().toLowerCase()
  
  for (const pattern of mockChatbotPatterns) {
    for (const regex of pattern.patterns) {
      if (regex.test(normalizedMessage)) {
        return pattern.intent
      }
    }
  }
  
  return 'unknown'
}

/**
 * Get response for intent
 */
export function getResponseForIntent(intent: ChatbotIntent): string {
  const pattern = mockChatbotPatterns.find(p => p.intent === intent)
  
  if (!pattern || pattern.responses.length === 0) {
    return 'Je ne suis pas sûr de comprendre. Pouvez-vous reformuler votre question ou choisir une option ci-dessous ?'
  }
  
  // Random response from patterns
  const randomIndex = Math.floor(Math.random() * pattern.responses.length)
  return pattern.responses[randomIndex]
}

/**
 * Get follow-up questions for intent
 */
export function getFollowUpQuestions(intent: ChatbotIntent): string[] {
  const pattern = mockChatbotPatterns.find(p => p.intent === intent)
  return pattern?.followUpQuestions || []
}

/**
 * Generate chatbot response
 */
export async function generateChatbotResponse(
  userMessage: string,
  conversationContext?: Record<string, any>
): Promise<ChatbotMessage> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
  
  const intent = matchIntent(userMessage)
  const response = getResponseForIntent(intent)
  const suggestions = getFollowUpQuestions(intent)
  
  return {
    id: `bot-${Date.now()}`,
    author: 'bot',
    content: response,
    timestamp: new Date().toISOString(),
    suggestions: suggestions.length > 0 ? suggestions : undefined
  }
}

/**
 * Get quick start suggestions
 */
export function getQuickStartSuggestions(): string[] {
  return [
    'Réserver une intervention',
    'Suivre mon rendez-vous',
    'Obtenir un devis',
    'Modifier mon RDV',
    'Questions fréquentes'
  ]
}

