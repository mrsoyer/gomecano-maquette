import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Lazy loading des vues pour optimisation
const routes: RouteRecordRaw[] = [
  // === Auth Routes ===
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/Login.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/Register.vue'),
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/auth/ForgotPassword.vue'),
  },

  // === B2C Routes ===
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/b2c/Home.vue'),
  },
  {
    path: '/services',
    name: 'services',
    component: () => import('@/views/b2c/Services.vue'),
  },
  {
    path: '/services/:slug',
    name: 'service-detail-old',
    redirect: to => {
      // Redirect to new service detail route (booking-v2)
      return { name: 'booking-v2-service-detail', params: { serviceId: to.params.slug } }
    }
  },
  {
    path: '/devis',
    name: 'devis',
    component: () => import('@/views/b2c/Devis.vue'),
  },
  {
    path: '/reserver',
    name: 'booking',
    component: () => import('@/views/b2c/funnel/BookingFunnel.vue'),
    children: [
      {
        path: 'vehicule',
        name: 'booking-vehicle',
        component: () => import('@/views/b2c/funnel/Step1Vehicle.vue'),
      },
      {
        path: 'service',
        name: 'booking-service',
        component: () => import('@/views/b2c/funnel/Step2Service.vue'),
      },
      {
        path: 'devis',
        name: 'booking-quote',
        component: () => import('@/views/b2c/funnel/Step3Quote.vue'),
      },
      {
        path: 'rdv',
        name: 'booking-appointment',
        component: () => import('@/views/b2c/funnel/Step4Appointment.vue'),
      },
      {
        path: 'paiement',
        name: 'booking-payment',
        component: () => import('@/views/b2c/funnel/Step5Payment.vue'),
      },
    ],
  },
  {
    path: '/mon-compte',
    name: 'account',
    component: () => import('@/views/b2c/Account.vue'),
  },

  // === Account Routes (B2C) ===
  {
    path: '/account',
    redirect: '/account/dashboard'
  },
  {
    path: '/account/dashboard',
    name: 'account-dashboard',
    component: () => import('@/views/b2c/account/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/interventions/:id',
    name: 'intervention-detail',
    component: () => import('@/views/b2c/account/InterventionDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/vehicles',
    name: 'account-vehicles',
    component: () => import('@/views/b2c/account/Vehicles.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/vehicles/:id',
    name: 'vehicle-detail',
    component: () => import('@/views/b2c/account/VehicleDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/history',
    name: 'account-history',
    component: () => import('@/views/b2c/account/History.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/profile',
    name: 'account-profile',
    component: () => import('@/views/b2c/account/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/settings',
    name: 'account-settings',
    component: () => import('@/views/b2c/account/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/payments',
    name: 'account-payments',
    component: () => import('@/views/b2c/account/Payments.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/notifications',
    name: 'account-notifications',
    component: () => import('@/views/b2c/account/Notifications.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/loyalty',
    name: 'account-loyalty',
    component: () => import('@/views/b2c/account/Loyalty.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/documents',
    name: 'account-documents',
    component: () => import('@/views/b2c/account/Documents.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/support',
    name: 'account-support',
    component: () => import('@/views/b2c/account/Support.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/subscription',
    name: 'account-subscription',
    component: () => import('@/views/b2c/account/Subscription.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/emergency',
    name: 'account-emergency',
    component: () => import('@/views/b2c/account/Emergency.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/account/family',
    name: 'account-family',
    component: () => import('@/views/b2c/account/Family.vue'),
    meta: { requiresAuth: true }
  },

  // === Nouveau parcours booking (Fixter-style) ===
  {
    path: '/service/:serviceId',
    name: 'booking-v2-service-detail',
    component: () => import('@/views/b2c/booking-v2/ServiceDetail.vue'),
  },
  {
    path: '/collecte-restitution',
    name: 'booking-v2-collecte',
    component: () => import('@/views/b2c/booking-v2/CollecteRestitution.vue'),
  },
  {
    path: '/confirmation',
    name: 'booking-v2-confirmation',
    component: () => import('@/views/b2c/booking-v2/Confirmation.vue'),
  },
  {
    path: '/payment',
    name: 'booking-v2-payment',
    component: () => import('@/views/b2c/booking-v2/Payment.vue'),
  },
  {
    path: '/success',
    name: 'booking-v2-success',
    component: () => import('@/views/b2c/booking-v2/Success.vue'),
  },
  
  // === B2B Routes ===
  {
    path: '/entreprises',
    name: 'b2b-home',
    component: () => import('@/views/b2b/Home.vue'),
  },
  {
    path: '/entreprises/simulateur',
    name: 'b2b-simulator',
    component: () => import('@/views/b2b/Simulator.vue'),
  },
  {
    path: '/entreprises/contact',
    name: 'b2b-contact',
    component: () => import('@/views/b2b/Contact.vue'),
  },
  {
    path: '/entreprises/dashboard',
    name: 'b2b-dashboard',
    component: () => import('@/views/b2b/Dashboard.vue'),
  },

  // === Account Routes (B2B) ===
  {
    path: '/account/fleet/dashboard',
    name: 'fleet-dashboard',
    component: () => import('@/views/b2b/account/FleetDashboard.vue'),
    meta: { requiresAuth: true, requiresB2B: true }
  },
  {
    path: '/account/fleet/users',
    name: 'fleet-users',
    component: () => import('@/views/b2b/account/Users.vue'),
    meta: { requiresAuth: true, requiresB2B: true }
  },
  {
    path: '/account/fleet/sites',
    name: 'fleet-sites',
    component: () => import('@/views/b2b/account/Sites.vue'),
    meta: { requiresAuth: true, requiresB2B: true }
  },
  {
    path: '/account/fleet/sites/:id',
    name: 'fleet-site-detail',
    component: () => import('@/views/b2b/account/SiteDetail.vue'),
    meta: { requiresAuth: true, requiresB2B: true }
  },
  
  // === Recruitment Routes ===
  {
    path: '/devenir-mecanicien',
    name: 'recruitment-home',
    component: () => import('@/views/recruitment/Home.vue'),
  },
  {
    path: '/devenir-mecanicien/simulateur',
    name: 'recruitment-simulator',
    component: () => import('@/views/recruitment/Simulator.vue'),
  },
  {
    path: '/devenir-mecanicien/candidature',
    name: 'recruitment-apply',
    component: () => import('@/views/recruitment/Apply.vue'),
  },
  
  // === Institutional Routes ===
  {
    path: '/a-propos',
    name: 'about',
    component: () => import('@/views/institutional/About.vue'),
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/institutional/Contact.vue'),
  },
  {
    path: '/blog',
    name: 'blog',
    component: () => import('@/views/institutional/Blog.vue'),
  },
  {
    path: '/blog/:slug',
    name: 'blog-post',
    component: () => import('@/views/institutional/BlogPost.vue'),
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('@/views/institutional/FAQ.vue'),
  },
  {
    path: '/mentions-legales',
    name: 'legal-mentions',
    component: () => import('@/views/institutional/legal/Mentions.vue'),
  },
  {
    path: '/cgu',
    name: 'legal-cgu',
    component: () => import('@/views/institutional/legal/CGU.vue'),
  },
  {
    path: '/cgv',
    name: 'legal-cgv',
    component: () => import('@/views/institutional/legal/CGV.vue'),
  },
  {
    path: '/confidentialite',
    name: 'legal-privacy',
    component: () => import('@/views/institutional/legal/Privacy.vue'),
  },
  {
    path: '/cookies',
    name: 'legal-cookies',
    component: () => import('@/views/institutional/legal/Cookies.vue'),
  },
  
  // === 404 ===
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation guard for authentication (mock)
router.beforeEach((to, from, next) => {
  // This will be imported dynamically to avoid circular dependency
  if (to.meta.requiresAuth) {
    // In production: check real auth state
    // For mock: auto-login is handled in each page's onMounted
    next()
  } else {
    next()
  }
})

export default router

