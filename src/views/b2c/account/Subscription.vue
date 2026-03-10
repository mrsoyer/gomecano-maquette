<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useSubscription } from '@/composables/useSubscription'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import type { SubscriptionPlan } from '@/types/subscription'

const userStore = useUserStore()
const { plans, userSubscription, isLoading, fetchSubscription, upgrade } = useSubscription('user-1')

const showUpgradeModal = ref(false)
const selectedPlan = ref<SubscriptionPlan | null>(null)
const billingPeriod = ref<'monthly' | 'yearly'>('monthly')

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-1')
  }
  await fetchSubscription()
})

const currentPlanData = computed(() => {
  if (!userSubscription.value) return null
  return plans.value.find(p => p.tier === userSubscription.value!.currentPlan)
})

function getPrice(plan: SubscriptionPlan): number {
  return billingPeriod.value === 'yearly' ? plan.yearlyPrice : plan.price
}

function openUpgradeModal(plan: SubscriptionPlan): void {
  selectedPlan.value = plan
  showUpgradeModal.value = true
}

async function confirmUpgrade(): Promise<void> {
  if (!selectedPlan.value || selectedPlan.value.tier === 'free') return
  
  try {
    await upgrade(selectedPlan.value.tier as 'premium' | 'platinum')
    showUpgradeModal.value = false
    window.alert(`✓ Vous êtes maintenant abonné ${selectedPlan.value.name} !`)
  } catch (err) {
    window.alert('❌ Erreur lors de la mise à niveau')
  }
}

function getPlanColor(tier: string): string {
  switch (tier) {
    case 'free': return 'border-gray-300'
    case 'premium': return 'border-blue-500'
    case 'platinum': return 'border-orange-primary'
    default: return 'border-gray-300'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-8">
      <h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
        Abonnement
      </h1>
      <p class="text-gray-600 mb-4 md:mb-8">
        Choisissez le plan qui vous convient
      </p>

      <!-- Current Plan -->
      <div v-if="currentPlanData" class="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-4 md:mb-8">
        <div class="flex items-center gap-3">
          <Icon icon="mdi:crown" class="w-5 h-5 md:w-6 md:h-6 text-blue-primary" />
          <div>
            <div class="font-semibold text-gray-900">
              Plan actuel : {{ currentPlanData.name }}
            </div>
            <div class="text-sm text-gray-600">
              {{ currentPlanData.price === 0 ? 'Gratuit' : `${currentPlanData.price}€/mois` }}
            </div>
          </div>
        </div>
      </div>

      <!-- Billing Period Toggle -->
      <div class="flex justify-center mb-4 md:mb-8">
        <div class="bg-white border border-gray-300 rounded-lg p-1 inline-flex">
          <button
            @click="billingPeriod = 'monthly'"
            :class="[
              'px-6 py-2 rounded-md transition-colors font-medium text-sm',
              billingPeriod === 'monthly'
                ? 'bg-blue-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            Mensuel
          </button>
          <button
            @click="billingPeriod = 'yearly'"
            :class="[
              'px-6 py-2 rounded-md transition-colors font-medium text-sm',
              billingPeriod === 'yearly'
                ? 'bg-blue-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            Annuel
            <span class="ml-1 text-xs text-green-500">-17%</span>
          </button>
        </div>
      </div>

      <!-- Plans Grid -->
      <div class="grid md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-8">
        <div
          v-for="plan in plans"
          :key="plan.id"
          :class="[
            'bg-white rounded-lg border-2 p-4 md:p-6 relative',
            getPlanColor(plan.tier),
            plan.popular ? 'shadow-xl scale-105' : 'shadow-sm'
          ]"
        >
          <!-- Popular Badge -->
          <div
            v-if="plan.popular"
            class="absolute top-0 right-6 -translate-y-1/2 bg-orange-primary text-white px-4 py-1 rounded-full text-sm font-semibold"
          >
            Populaire
          </div>

          <!-- Plan Header -->
          <div class="text-center mb-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">
              {{ plan.name }}
            </h3>
            <div class="text-4xl font-bold text-gray-900 mb-1">
              {{ getPrice(plan) }}€
            </div>
            <div class="text-sm text-gray-600">
              {{ billingPeriod === 'yearly' ? 'par an' : 'par mois' }}
            </div>
          </div>

          <!-- Features -->
          <ul class="space-y-3 mb-6">
            <li
              v-for="(feature, index) in plan.features"
              :key="index"
              class="flex items-start gap-2 text-sm text-gray-700"
            >
              <Icon icon="mdi:check-circle" class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{{ feature }}</span>
            </li>
          </ul>

          <!-- CTA Button -->
          <button
            v-if="currentPlanData?.tier !== plan.tier"
            @click="openUpgradeModal(plan)"
            :class="[
              'w-full py-3 rounded-lg font-semibold transition-colors',
              plan.popular
                ? 'bg-orange-primary text-white hover:bg-orange-hover'
                : 'bg-blue-primary text-white hover:bg-blue-dark'
            ]"
          >
            {{ plan.tier === 'free' ? 'Plan actuel' : 'Choisir ce plan' }}
          </button>
          <div
            v-else
            class="w-full py-3 text-center text-sm font-medium text-gray-600 bg-gray-100 rounded-lg"
          >
            Plan actuel
          </div>
        </div>
      </div>

      <!-- Upgrade Modal -->
      <div
        v-if="showUpgradeModal && selectedPlan"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showUpgradeModal = false"
      >
        <div class="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 class="text-xl font-bold text-gray-900 mb-4">
            Confirmer l'abonnement
          </h3>
          
          <p class="text-gray-700 mb-6">
            Vous allez passer au plan <strong>{{ selectedPlan.name }}</strong> pour
            <strong>{{ getPrice(selectedPlan) }}€</strong>
            {{ billingPeriod === 'yearly' ? 'par an' : 'par mois' }}.
          </p>

          <div class="flex gap-3">
            <button
              @click="showUpgradeModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              @click="confirmUpgrade"
              :disabled="isLoading"
              class="flex-1 px-4 py-2 bg-blue-primary text-white rounded-lg hover:bg-blue-dark disabled:opacity-50 transition-colors"
            >
              {{ isLoading ? 'Chargement...' : 'Confirmer' }}
            </button>
          </div>
        </div>
      </div>
    </Container>

    <Footer />
  </div>
</template>
