import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { mockServices } from '@/mocks/services'
import type { ServiceCategory } from '@/types/service'

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  label: string
  path: string
}

/**
 * Category labels for breadcrumbs
 */
const categoryLabels: Record<ServiceCategory, string> = {
  entretien: 'Entretien',
  freinage: 'Freinage',
  pneus: 'Pneumatiques',
  distribution: 'Distribution',
  climatisation: 'Climatisation',
  mecanique: 'Mécanique',
  electricite: 'Électricité',
  carrosserie: 'Carrosserie',
  diagnostic: 'Diagnostic',
}

/**
 * Composable to generate dynamic breadcrumbs based on current route
 * 
 * @returns Breadcrumbs array
 */
export function useBreadcrumbs() {
  const route = useRoute()

  /**
   * Generate breadcrumbs based on current route
   */
  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const crumbs: BreadcrumbItem[] = []

    // Home
    if (route.path === '/') {
      return [{ label: 'Accueil', path: '/' }]
    }

    // Services list
    if (route.name === 'services') {
      return [
        { label: 'Accueil', path: '/' },
        { label: 'Services', path: '/services' }
      ]
    }

    // Service detail (booking-v2)
    if (route.name === 'booking-v2-service-detail') {
      const serviceId = route.params.serviceId as string
      const service = mockServices.find(s => s.slug === serviceId)

      crumbs.push({ label: 'Accueil', path: '/' })
      crumbs.push({ label: 'Services', path: '/services' })

      if (service) {
        // Add category
        crumbs.push({
          label: categoryLabels[service.category],
          path: `/services?category=${service.category}`
        })
        // Add service
        crumbs.push({
          label: service.name,
          path: route.path
        })
      }

      return crumbs
    }

    // Devis page
    if (route.name === 'devis') {
      return [
        { label: 'Accueil', path: '/' },
        { label: 'Services', path: '/services' },
        { label: 'Mon devis', path: '/devis' }
      ]
    }

    // Collecte/Restitution
    if (route.name === 'booking-v2-collecte') {
      return [
        { label: 'Accueil', path: '/' },
        { label: 'Services', path: '/services' },
        { label: 'Mon devis', path: '/devis' },
        { label: 'Collecte & Restitution', path: '/collecte-restitution' }
      ]
    }

    // Confirmation
    if (route.name === 'booking-v2-confirmation') {
      return [
        { label: 'Accueil', path: '/' },
        { label: 'Services', path: '/services' },
        { label: 'Mon devis', path: '/devis' },
        { label: 'Confirmation', path: '/confirmation' }
      ]
    }

    // Default: just current page
    return [
      { label: 'Accueil', path: '/' },
      { label: route.name?.toString() || 'Page', path: route.path }
    ]
  })

  return {
    breadcrumbs
  }
}
