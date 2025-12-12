export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

export const mockFAQs: FAQ[] = [
  // Général (5 questions)
  {
    id: '1',
    question: 'Comment fonctionne Gomecano ?',
    answer: 'Gomecano est une plateforme qui met en relation des particuliers et des entreprises avec des mécaniciens professionnels qui se déplacent à domicile ou sur le lieu de travail. Vous réservez en ligne, le mécanicien vient chez vous avec son matériel et effectue l\'intervention sur place.',
    category: 'general',
  },
  {
    id: '2',
    question: 'Quels sont les avantages par rapport à un garage traditionnel ?',
    answer: 'Avec Gomecano, vous gagnez du temps (pas besoin de vous déplacer), les prix sont transparents et souvent plus compétitifs, et vous pouvez continuer vos activités pendant que votre véhicule est réparé à domicile.',
    category: 'general',
  },
  {
    id: '3',
    question: 'Dans quelles villes Gomecano est-il disponible ?',
    answer: 'Gomecano est disponible dans les principales villes de France : Paris, Lyon, Marseille, Toulouse, Nice, Nantes, Strasbourg, Bordeaux, Lille, Rennes et bien d\'autres. La liste des villes s\'agrandit régulièrement.',
    category: 'general',
  },
  {
    id: '4',
    question: 'Les mécaniciens sont-ils certifiés ?',
    answer: 'Oui, tous nos mécaniciens sont des professionnels certifiés avec minimum 5 ans d\'expérience. Ils sont vérifiés, assurés et formés régulièrement aux dernières technologies automobiles.',
    category: 'general',
  },
  {
    id: '5',
    question: 'Comment obtenir un devis ?',
    answer: 'Il suffit de renseigner votre véhicule (plaque d\'immatriculation ou modèle) et de sélectionner le service souhaité. Pour 80% des prestations, vous obtenez un prix instantané. Pour les autres, un devis gratuit vous est envoyé sous 24h.',
    category: 'general',
  },
  
  // Réservation (5 questions)
  {
    id: '10',
    question: 'Comment réserver une intervention ?',
    answer: 'La réservation se fait en ligne en 3 étapes : 1) Identifiez votre véhicule, 2) Choisissez votre service et votre créneau, 3) Payez en ligne de manière sécurisée. Vous recevez une confirmation immédiate par email et SMS.',
    category: 'reservation',
  },
  {
    id: '11',
    question: 'Puis-je annuler ou modifier mon rendez-vous ?',
    answer: 'Oui, vous pouvez modifier ou annuler votre rendez-vous gratuitement jusqu\'à 24h avant l\'intervention. Au-delà, des frais d\'annulation peuvent s\'appliquer.',
    category: 'reservation',
  },
  {
    id: '12',
    question: 'Quels créneaux horaires sont disponibles ?',
    answer: 'Nous proposons des créneaux de 8h à 20h du lundi au samedi, et de 9h à 18h le dimanche. Des interventions en urgence sous 2h sont également possibles selon disponibilité.',
    category: 'reservation',
  },
  {
    id: '13',
    question: 'Combien de temps à l\'avance dois-je réserver ?',
    answer: 'Nous recommandons de réserver au moins 48h à l\'avance pour garantir votre créneau préféré. Cependant, des interventions en urgence sont possibles selon la disponibilité des mécaniciens.',
    category: 'reservation',
  },
  {
    id: '14',
    question: 'Dois-je être présent pendant l\'intervention ?',
    answer: 'Votre présence n\'est pas obligatoire si vous avez un endroit sécurisé où laisser les clés. Cependant, nous recommandons d\'être présent au début et à la fin pour échanger avec le mécanicien.',
    category: 'reservation',
  },
  
  // Paiement (5 questions)
  {
    id: '20',
    question: 'Quand dois-je payer ?',
    answer: 'Le paiement se fait en ligne au moment de la réservation. Cela nous permet de garantir votre créneau et d\'assurer une intervention sans surprise financière.',
    category: 'paiement',
  },
  {
    id: '21',
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard, American Express) via notre système de paiement sécurisé Stripe. Le paiement en 3 fois est disponible à partir de 200€.',
    category: 'paiement',
  },
  {
    id: '22',
    question: 'Les prix incluent-ils les pièces ?',
    answer: 'Oui, nos prix affichés incluent toujours les pièces de qualité et la main d\'œuvre. Il n\'y a pas de frais cachés ni de supplément. Le prix affiché est le prix final.',
    category: 'paiement',
  },
  {
    id: '23',
    question: 'Puis-je obtenir une facture ?',
    answer: 'Oui, une facture vous est automatiquement envoyée par email après l\'intervention. Vous pouvez également la télécharger depuis votre espace client à tout moment.',
    category: 'paiement',
  },
  {
    id: '24',
    question: 'Y a-t-il des frais de déplacement ?',
    answer: 'Non, le déplacement du mécanicien est totalement gratuit. Le prix affiché inclut déjà tous les frais.',
    category: 'paiement',
  },
  
  // Garanties (3 questions)
  {
    id: '30',
    question: 'Quelle est la garantie sur les interventions ?',
    answer: 'Toutes nos interventions sont garanties 24 mois pièces et main d\'œuvre. Si un problème survient sur la prestation effectuée, nous intervenons gratuitement.',
    category: 'garanties',
  },
  {
    id: '31',
    question: 'Quelle qualité de pièces utilisez-vous ?',
    answer: 'Nous utilisons uniquement des pièces de qualité équivalente à l\'origine, issues de fabricants reconnus. Sur demande, des pièces d\'origine constructeur sont disponibles.',
    category: 'garanties',
  },
  {
    id: '32',
    question: 'Ma garantie constructeur est-elle préservée ?',
    answer: 'Oui, nos interventions respectent le cahier d\'entretien constructeur et préservent votre garantie constructeur, même sur véhicules neufs ou récents.',
    category: 'garanties',
  },
  
  // B2B (3 questions)
  {
    id: '40',
    question: 'Proposez-vous des offres pour les entreprises ?',
    answer: 'Oui, nous proposons des offres dédiées aux entreprises avec tarifs préférentiels, facturation centralisée, reporting détaillé et un interlocuteur dédié pour la gestion de votre flotte.',
    category: 'b2b',
  },
  {
    id: '41',
    question: 'Comment fonctionne l\'entretien de flotte ?',
    answer: 'Nos mécaniciens interviennent directement sur vos sites (entreprise, parking) pour minimiser l\'immobilisation des véhicules. Nous planifions les interventions selon vos contraintes et vous fournissons un suivi complet.',
    category: 'b2b',
  },
  {
    id: '42',
    question: 'Quelles économies puis-je réaliser avec Gomecano B2B ?',
    answer: 'En moyenne, nos clients B2B économisent 30% sur leurs coûts d\'entretien et réduisent de 90% le temps d\'immobilisation de leurs véhicules, ce qui représente un gain de productivité significatif.',
    category: 'b2b',
  },
]

export const getFAQsByCategory = (category: string) => {
  return mockFAQs.filter(f => f.category === category)
}






