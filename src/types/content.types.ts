/**
 * Content Types
 * Types métier pour le contenu statique et dynamique
 */

// Blog
export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage?: string
  category: BlogCategory
  author: BlogAuthor
  tags: string[]
  publishedAt: string
  readingTime: number
  viewCount: number
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  color?: string
}

export interface BlogAuthor {
  id: string
  name: string
  slug: string
  avatarUrl?: string
  bio?: string
}

export interface BlogListParams {
  category?: string
  tag?: string
  search?: string
  page?: number
  limit?: number
}

export interface BlogListResponse {
  posts: BlogPost[]
  total: number
  page: number
  totalPages: number
}

// FAQ
export interface FAQCategory {
  id: string
  name: string
  slug: string
  icon?: string
  items: FAQItem[]
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  isFeatured: boolean
  helpfulCount: number
  notHelpfulCount: number
}

// Testimonials
export interface Testimonial {
  id: string
  type: 'b2c' | 'b2b' | 'mechanic'
  authorName: string
  authorRole?: string
  authorCompany?: string
  authorAvatar?: string
  rating: number
  content: string
  isFeatured: boolean
}

// Legal pages
export interface LegalPage {
  type: LegalPageType
  title: string
  content: string
  version: number
  updatedAt: string
}

export type LegalPageType =
  | 'cgu'
  | 'cgv'
  | 'privacy'
  | 'cookies'
  | 'mentions'

// Contact
export interface ContactForm {
  type: ContactType
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
}

export type ContactType =
  | 'general'
  | 'support'
  | 'partnership'
  | 'press'

export interface B2BContactForm {
  companyName: string
  contactName: string
  email: string
  phone?: string
  fleetSize: number
  message?: string
  source?: string
}

// Service descriptions for static pages
export interface ServiceDescription {
  id: string
  slug: string
  name: string
  shortDescription: string
  longDescription: string
  benefits: string[]
  includedItems: string[]
  excludedItems?: string[]
  faqs: FAQItem[]
  relatedServices: string[]
  seoTitle: string
  seoDescription: string
}

// Homepage content
export interface HomepageContent {
  hero: HeroSection
  stats: StatItem[]
  howItWorks: HowItWorksStep[]
  advantages: AdvantageItem[]
  testimonials: Testimonial[]
}

export interface HeroSection {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  backgroundImage?: string
}

export interface StatItem {
  label: string
  value: string
  icon?: string
}

export interface HowItWorksStep {
  step: number
  title: string
  description: string
  icon: string
}

export interface AdvantageItem {
  title: string
  description: string
  icon: string
}
