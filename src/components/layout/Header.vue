<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import TopBar from './TopBar.vue'
import Navigation from './Navigation.vue'
import MobileMenu from './MobileMenu.vue'
import CartDrawer from '@/components/cart/CartDrawer.vue'
import BookingAccordionModal from '@/components/booking/BookingAccordionModal.vue'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher.vue'
import { useBookingContext } from '@/composables/useBookingContext'
import { useScrollDirection } from '@/composables/useScrollDirection'
import { useUserStore } from '@/stores/user.store'

const router = useRouter()
const userStore = useUserStore()
const { isContextModalOpen, preSelectedStep, closeContextModal, openContextModal } = useBookingContext()

// Scroll detection with 80px threshold
const { scrollDirection, isScrolled } = useScrollDirection(80)

const isMobileMenuOpen = ref(false)
const isAccountDropdownOpen = ref(false)

/**
 * Toggle mobile menu
 */
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

/**
 * Handle vehicle modal open from mobile menu
 */
function handleOpenVehicleModal() {
  isMobileMenuOpen.value = false
  openContextModal()
}

/**
 * Handle city modal open from mobile menu
 */
function handleOpenCityModal() {
  isMobileMenuOpen.value = false
  openContextModal()
}

/**
 * Toggle account dropdown
 */
function toggleAccountDropdown(): void {
  isAccountDropdownOpen.value = !isAccountDropdownOpen.value
}

/**
 * Go to account dashboard
 */
function goToAccount(): void {
  if (userStore.isB2B) {
    router.push('/account/fleet/dashboard')
  } else {
    router.push('/account/dashboard')
  }
  isAccountDropdownOpen.value = false
}

/**
 * Logout (mock)
 */
function logout(): void {
  userStore.logout()
  router.push('/')
  isAccountDropdownOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white">
    <!-- TopBar : Disparaît au scroll down UNIQUEMENT sur mobile, toujours visible desktop -->
    <div class="hidden lg:block">
      <!-- Desktop : Toujours visible -->
      <TopBar />
    </div>
    <Transition name="topbar-slide" class="lg:hidden">
      <!-- Mobile : Disparaît au scroll down -->
      <TopBar v-if="scrollDirection === 'up' || !isScrolled" />
    </Transition>
    
    <!-- Main header : Hauteur fixe, se plaque en haut au scroll -->
    <div
      class="h-16 lg:h-20 transition-shadow duration-300"
      :class="{
        'shadow-lg border-b border-gray-200': isScrolled,
        'border-b border-gray-100': !isScrolled
      }"
    >
      <div class="max-w-7xl mx-auto px-2 sm:px-4 h-full">
        <div class="relative flex items-center h-full gap-2 sm:gap-4">
          <!-- Logo : Taille fixe, ne change jamais -->
          <div class="flex-shrink-0 relative z-10">
            <RouterLink 
              to="/" 
              class="flex items-center group"
              aria-label="Gomecano - Accueil"
            >
              <img 
                src="/images/gomecano-logo-horizontal.png" 
                alt="Gomecano - Garage à domicile, réparation auto chez vous"
                class="w-auto h-4 sm:h-6 md:h-7 lg:h-8 transition-opacity duration-300 group-hover:opacity-80"
                loading="eager"
                fetchpriority="high"
                width="2048"
                height="270"
              />
            </RouterLink>
          </div>
          
          <!-- Desktop Navigation (Centre - centré entre logo et bouton) -->
          <div class="hidden lg:flex flex-1 justify-center items-center relative z-10">
            <Navigation />
          </div>
          
          <!-- CTA Button + Account + Mobile Menu (Droite) -->
          <div class="flex justify-end items-center gap-2 sm:gap-4 flex-shrink-0 relative z-10 ml-auto">
            <!-- Language Switcher (Desktop) -->
            <div class="hidden lg:block">
              <LanguageSwitcher />
            </div>

            <!-- Account Button (Desktop only) -->
            <div v-if="userStore.isAuthenticated" class="hidden lg:block relative">
              <button
                @click="toggleAccountDropdown"
                class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-primary hover:bg-blue-50 rounded-lg transition-all"
              >
                <Icon icon="mdi:account-circle" class="w-5 h-5" />
                <span>{{ userStore.userFirstName }}</span>
                <Icon icon="mdi:chevron-down" class="w-4 h-4" />
              </button>

              <!-- Dropdown Menu -->
              <Transition name="dropdown">
                <div
                  v-if="isAccountDropdownOpen"
                  @click.stop
                  class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2"
                >
                  <button
                    @click="goToAccount"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:view-dashboard" class="w-4 h-4" />
                    <span>{{ userStore.isB2B ? 'Dashboard Flotte' : 'Mon Dashboard' }}</span>
                  </button>
                  <button
                    v-if="!userStore.isB2B"
                    @click="router.push('/account/vehicles'); isAccountDropdownOpen = false"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:car" class="w-4 h-4" />
                    <span>Mes véhicules</span>
                  </button>
                  <button
                    v-if="!userStore.isB2B"
                    @click="router.push('/account/history'); isAccountDropdownOpen = false"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:history" class="w-4 h-4" />
                    <span>Historique</span>
                  </button>
                  <button
                    v-if="userStore.isB2B"
                    @click="router.push('/account/fleet/users'); isAccountDropdownOpen = false"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:account-multiple" class="w-4 h-4" />
                    <span>Utilisateurs</span>
                  </button>
                  <button
                    v-if="userStore.isB2B"
                    @click="router.push('/account/fleet/sites'); isAccountDropdownOpen = false"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:office-building" class="w-4 h-4" />
                    <span>Sites</span>
                  </button>
                  <div class="my-1 h-px bg-gray-200"></div>
                  <button
                    @click="router.push('/account/profile'); isAccountDropdownOpen = false"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:account-edit" class="w-4 h-4" />
                    <span>Mon profil</span>
                  </button>
                  <button
                    @click="router.push('/account/payments'); isAccountDropdownOpen = false"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:credit-card" class="w-4 h-4" />
                    <span>Paiements</span>
                  </button>
                  <button
                    @click="router.push('/account/notifications'); isAccountDropdownOpen = false"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:bell" class="w-4 h-4" />
                    <span>Notifications</span>
                    <span class="ml-auto px-2 py-0.5 text-xs font-medium bg-orange-primary text-white rounded-full">
                      55
                    </span>
                  </button>
                  <button
                    @click="router.push('/account/loyalty'); isAccountDropdownOpen = false"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:star" class="w-4 h-4" />
                    <span>Fidélité</span>
                  </button>
                  <button
                    @click="router.push('/account/documents'); isAccountDropdownOpen = false"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:file-document-multiple" class="w-4 h-4" />
                    <span>Documents</span>
                  </button>
                  <button
                    @click="router.push('/account/support'); isAccountDropdownOpen = false"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:headset" class="w-4 h-4" />
                    <span>Support</span>
                  </button>
                  <button
                    @click="router.push('/account/subscription'); isAccountDropdownOpen = false"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:crown" class="w-4 h-4" />
                    <span>Abonnement</span>
                  </button>
                  <button
                    @click="router.push('/account/emergency'); isAccountDropdownOpen = false"
                    class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-all flex items-center gap-2 font-semibold"
                  >
                    <Icon icon="mdi:alert-octagon" class="w-4 h-4" />
                    <span>SOS Urgence</span>
                  </button>
                  <button
                    @click="router.push('/account/family'); isAccountDropdownOpen = false"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:account-group" class="w-4 h-4" />
                    <span>Famille</span>
                  </button>
                  <button
                    @click="router.push('/account/settings'); isAccountDropdownOpen = false"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-primary transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:cog" class="w-4 h-4" />
                    <span>Paramètres</span>
                  </button>
                  <div class="my-1 h-px bg-gray-200"></div>
                  <button
                    @click="logout"
                    class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:logout" class="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </Transition>
            </div>

            <button
              class="hidden lg:inline-flex items-center gap-2 px-5 py-2 bg-orange-primary hover:bg-orange-hover text-white font-semibold text-sm rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 group focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 whitespace-nowrap flex-shrink-0"
            >
              <span>Obtenir un devis</span>
              <span class="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
            </button>
            
            <!-- Mobile Menu Button -->
            <button
              type="button"
              aria-label="Menu principal"
              :aria-expanded="isMobileMenuOpen"
              class="lg:hidden p-2 text-gray-600 hover:text-blue-primary transition-colors focus:outline-none focus:ring-2 focus:ring-green-primary rounded-lg"
              @click="toggleMobileMenu"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  v-if="!isMobileMenuOpen"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Cart Drawer (desktop only) -->
    <CartDrawer />
  </header>
  
  <!-- Mobile Menu Fullscreen -->
  <MobileMenu 
    :is-open="isMobileMenuOpen"
    @close="isMobileMenuOpen = false"
    @open-vehicle-modal="handleOpenVehicleModal"
    @open-city-modal="handleOpenCityModal"
  />
  
  <!-- Booking Context Modal (global) -->
  <BookingAccordionModal
    :isOpen="isContextModalOpen"
    :preSelectedStep="preSelectedStep || undefined"
    @close="closeContextModal"
  />
</template>

<style scoped>
/* Transition TopBar slide up/down */
.topbar-slide-enter-active,
.topbar-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.topbar-slide-enter-from,
.topbar-slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>

