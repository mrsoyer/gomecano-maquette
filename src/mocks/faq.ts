export interface FaqItem {
  id: string
  question: string
  answer: string
  category: 'prix' | 'zone' | 'process' | 'garantie' | 'securite'
}

export const mockFaq: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Combien coûte une vidange complète ?',
    answer: 'Le prix d\'une vidange complète varie entre 89€ et 150€ selon votre véhicule (marque, modèle, type de motorisation). Ce tarif inclut la main d\'œuvre, l\'huile moteur (5W30, 5W40, etc.) et le filtre à huile. Vous obtenez un devis précis en 30 secondes en renseignant votre plaque d\'immatriculation.',
    category: 'prix'
  },
  {
    id: 'faq-2',
    question: 'Intervenez-vous partout en France ?',
    answer: 'Gomecano est disponible dans plus de 150 villes en France : Paris, Lyon, Marseille, Toulouse, Bordeaux, Lille, Nice, Nantes, Strasbourg, et bien d\'autres. Vérifiez la disponibilité dans votre ville en renseignant votre code postal lors de la réservation.',
    category: 'zone'
  },
  {
    id: 'faq-3',
    question: 'Comment se passe le paiement ?',
    answer: 'Le paiement s\'effectue en ligne de manière sécurisée par carte bancaire après validation de votre réservation. Aucun paiement en espèces n\'est demandé au mécanicien. Vous recevez une facture détaillée par email.',
    category: 'prix'
  },
  {
    id: 'faq-4',
    question: 'Quelle garantie sur les réparations ?',
    answer: 'Toutes nos interventions sont garanties 1 an, pièces et main d\'œuvre. Si un problème survient sur une pièce changée ou une réparation effectuée, nous intervenons gratuitement. Les pièces utilisées sont de qualité constructeur ou équivalent certifié.',
    category: 'garantie'
  },
  {
    id: 'faq-5',
    question: 'Puis-je annuler ou modifier mon RDV ?',
    answer: 'Vous pouvez annuler ou modifier votre rendez-vous gratuitement jusqu\'à 24h avant l\'intervention. Au-delà de ce délai, des frais d\'annulation de 30€ peuvent s\'appliquer pour compenser le déplacement du mécanicien.',
    category: 'process'
  },
  {
    id: 'faq-6',
    question: 'Les mécaniciens sont-ils certifiés ?',
    answer: 'Tous nos mécaniciens sont des professionnels certifiés avec minimum 5 ans d\'expérience. Ils disposent d\'une assurance professionnelle RC Pro et sont régulièrement évalués par nos clients (note moyenne 4,9/5).',
    category: 'securite'
  },
  {
    id: 'faq-7',
    question: 'Combien de temps dure une intervention ?',
    answer: 'La durée varie selon le type d\'intervention : 30-45min pour une vidange, 1h-1h30 pour un changement de plaquettes de freins, 2h-3h pour une révision complète. Le temps exact vous est indiqué lors de la réservation.',
    category: 'process'
  },
  {
    id: 'faq-8',
    question: 'Que dois-je préparer pour l\'intervention ?',
    answer: 'Rien de spécial ! Assurez-vous simplement que votre véhicule soit accessible et stationné dans un endroit sécurisé (parking, rue, garage). Le mécanicien arrive avec tout son matériel et ses outils professionnels.',
    category: 'process'
  },
  {
    id: 'faq-9',
    question: 'Utilisez-vous des pièces d\'origine ?',
    answer: 'Nous utilisons des pièces de qualité constructeur ou équivalent certifié (marques de référence comme Bosch, Mann, Valeo). Vous pouvez également demander des pièces d\'origine constructeur avec supplément de prix.',
    category: 'garantie'
  },
  {
    id: 'faq-10',
    question: 'Mon carnet d\'entretien sera-t-il tamponné ?',
    answer: 'Oui, absolument ! Chaque intervention est consignée dans votre carnet d\'entretien avec tampon et signature du mécanicien. Vous conservez ainsi votre garantie constructeur.',
    category: 'garantie'
  },
  {
    id: 'faq-11',
    question: 'Puis-je assister à l\'intervention ?',
    answer: 'Oui, vous êtes libre d\'assister ou non à l\'intervention. Beaucoup de nos clients en profitent pour poser des questions au mécanicien sur l\'état de leur véhicule. C\'est aussi possible de vaquer à vos occupations pendant ce temps.',
    category: 'process'
  },
  {
    id: 'faq-12',
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Toutes vos données personnelles sont cryptées et sécurisées selon les normes RGPD. Nous ne partageons jamais vos informations avec des tiers. Votre carte bancaire est traitée via un système de paiement sécurisé certifié PCI-DSS.',
    category: 'securite'
  }
]

export function getFaqByCategory(category: FaqItem['category']): FaqItem[] {
  return mockFaq.filter(faq => faq.category === category)
}






