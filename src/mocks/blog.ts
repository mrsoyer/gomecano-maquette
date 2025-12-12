export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  imageUrl: string
  category: string
  publishedAt: string
  author: {
    name: string
    avatar: string
  }
  readTime: number
}

export const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'quand-faire-vidange',
    title: 'Quand faire sa vidange moteur ?',
    excerpt: 'Découvrez à quelle fréquence effectuer la vidange de votre véhicule selon son utilisation et le type d\'huile utilisé.',
    content: 'La vidange est un entretien essentiel...',
    imageUrl: '/images/blog/vidange.jpg',
    category: 'Entretien',
    publishedAt: '2024-11-25',
    author: { name: 'Marc Dupont', avatar: '' },
    readTime: 5,
  },
  {
    id: '2',
    slug: 'economiser-entretien-auto',
    title: '10 astuces pour économiser sur l\'entretien auto',
    excerpt: 'Des conseils pratiques pour réduire vos frais d\'entretien tout en gardant votre véhicule en parfait état.',
    content: 'L\'entretien automobile peut peser lourd...',
    imageUrl: '/images/blog/economies.jpg',
    category: 'Conseils',
    publishedAt: '2024-11-20',
    author: { name: 'Sophie Martin', avatar: '' },
    readTime: 7,
  },
  {
    id: '3',
    slug: 'signes-plaquettes-usees',
    title: 'Comment savoir si vos plaquettes de frein sont usées ?',
    excerpt: 'Les signes qui ne trompent pas pour identifier l\'usure de vos plaquettes de frein.',
    content: 'Les freins sont essentiels à votre sécurité...',
    imageUrl: '/images/blog/freins.jpg',
    category: 'Sécurité',
    publishedAt: '2024-11-18',
    author: { name: 'Pierre Laurent', avatar: '' },
    readTime: 6,
  },
  {
    id: '4',
    slug: 'preparer-controle-technique',
    title: 'Comment préparer son contrôle technique ?',
    excerpt: 'Les vérifications à effectuer avant de passer le contrôle technique pour éviter la contre-visite.',
    content: 'Le contrôle technique est obligatoire...',
    imageUrl: '/images/blog/ct.jpg',
    category: 'Réglementation',
    publishedAt: '2024-11-15',
    author: { name: 'Julie Bernard', avatar: '' },
    readTime: 8,
  },
  {
    id: '5',
    slug: 'entretien-hiver',
    title: 'Préparer sa voiture pour l\'hiver',
    excerpt: 'Les points essentiels à vérifier sur votre véhicule avant l\'arrivée du froid.',
    content: 'L\'hiver met votre véhicule à rude épreuve...',
    imageUrl: '/images/blog/hiver.jpg',
    category: 'Saisonnier',
    publishedAt: '2024-11-10',
    author: { name: 'Thomas Garcia', avatar: '' },
    readTime: 6,
  },
  {
    id: '6',
    slug: 'courroie-distribution-quand',
    title: 'Quand changer la courroie de distribution ?',
    excerpt: 'Tout ce qu\'il faut savoir sur le remplacement de la courroie de distribution.',
    content: 'La courroie de distribution est cruciale...',
    imageUrl: '/images/blog/courroie.jpg',
    category: 'Entretien',
    publishedAt: '2024-11-05',
    author: { name: 'Alexandre Rousseau', avatar: '' },
    readTime: 7,
  },
  {
    id: '7',
    slug: 'batterie-morte-que-faire',
    title: 'Batterie à plat : que faire ?',
    excerpt: 'Les solutions pour redémarrer votre véhicule et les signes d\'une batterie en fin de vie.',
    content: 'Une batterie à plat peut arriver...',
    imageUrl: '/images/blog/batterie.jpg',
    category: 'Dépannage',
    publishedAt: '2024-11-01',
    author: { name: 'Céline Petit', avatar: '' },
    readTime: 5,
  },
  {
    id: '8',
    slug: 'voyants-tableau-bord',
    title: 'Comprendre les voyants du tableau de bord',
    excerpt: 'Guide complet des voyants lumineux et leur signification.',
    content: 'Les voyants du tableau de bord...',
    imageUrl: '/images/blog/voyants.jpg',
    category: 'Diagnostic',
    publishedAt: '2024-10-28',
    author: { name: 'Nathalie Moreau', avatar: '' },
    readTime: 10,
  },
  {
    id: '9',
    slug: 'pneus-hiver-obligatoires',
    title: 'Pneus hiver : ce qu\'il faut savoir',
    excerpt: 'Réglementation, avantages et conseils pour choisir vos pneus hiver.',
    content: 'Les pneus hiver sont désormais...',
    imageUrl: '/images/blog/pneus-hiver.jpg',
    category: 'Saisonnier',
    publishedAt: '2024-10-25',
    author: { name: 'François Leroy', avatar: '' },
    readTime: 6,
  },
  {
    id: '10',
    slug: 'climatisation-recharger',
    title: 'Quand recharger la climatisation de sa voiture ?',
    excerpt: 'Les signes d\'une climatisation à recharger et le processus de recharge.',
    content: 'La climatisation de votre voiture...',
    imageUrl: '/images/blog/clim.jpg',
    category: 'Entretien',
    publishedAt: '2024-10-20',
    author: { name: 'Caroline Fontaine', avatar: '' },
    readTime: 5,
  },
]

export const getBlogPostBySlug = (slug: string) => {
  return mockBlogPosts.find(p => p.slug === slug)
}

export const getBlogPostsByCategory = (category: string) => {
  return mockBlogPosts.filter(p => p.category === category)
}






