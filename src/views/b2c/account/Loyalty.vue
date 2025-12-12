<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useLoyaltyStore } from '@/stores/loyalty.store'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import TierProgressCard from '@/components/loyalty/TierProgressCard.vue'
import RewardCard from '@/components/loyalty/RewardCard.vue'
import MissionCard from '@/components/loyalty/MissionCard.vue'
import BadgeCard from '@/components/loyalty/BadgeCard.vue'
import ReferralCodeWidget from '@/components/loyalty/ReferralCodeWidget.vue'

const router = useRouter()
const userStore = useUserStore()
const loyaltyStore = useLoyaltyStore()

// State
const activeTab = ref<'rewards' | 'missions' | 'badges'>('rewards')

// Auto-login user for demo
onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-1')
  }
  if (userStore.user) {
    await loyaltyStore.fetchLoyaltyData(userStore.user.id)
  }
})

// Computed
const availableRewards = computed(() => {
  return loyaltyStore.rewards.filter(r => !r.claimed && r.pointsRequired <= loyaltyStore.points)
})

const lockedRewards = computed(() => {
  return loyaltyStore.rewards.filter(r => !r.claimed && r.pointsRequired > loyaltyStore.points)
})

const activeMissions = computed(() => {
  return loyaltyStore.missions.filter(m => !m.completed)
})

const completedMissions = computed(() => {
  return loyaltyStore.missions.filter(m => m.completed)
})

/**
 * Claim reward
 */
function handleClaimReward(rewardId: string): void {
  loyaltyStore.claimReward(rewardId)
}

/**
 * Copy referral code
 */
function handleCopyReferral(code: string): void {
  navigator.clipboard.writeText(code)
  alert('Code de parrainage copié !')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-6">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm mb-4">
        <router-link
          to="/account/dashboard"
          class="text-gray-600 hover:text-blue-primary transition-colors"
        >
          Mon compte
        </router-link>
        <Icon icon="mdi:chevron-right" class="w-4 h-4 text-gray-400" />
        <span class="text-gray-900 font-medium">Programme de fidélité</span>
      </nav>

      <!-- Header -->
      <div class="mb-4 md:mb-6">
        <h1 class="text-2xl font-bold text-gray-900 md:text-3xl">
          Programme de fidélité
        </h1>
        <p class="mt-1 text-sm text-gray-600 md:text-base">
          Gagnez des points et profitez de récompenses exclusives
        </p>
      </div>

      <!-- Tier Progress -->
      <TierProgressCard
        :current-points="loyaltyStore.points"
        :current-tier="loyaltyStore.currentTier"
        :next-tier="loyaltyStore.nextTier"
        :points-to-next="loyaltyStore.pointsToNextTier"
        class="mb-4 md:mb-6"
      />

      <!-- Referral Widget -->
      <ReferralCodeWidget
        :referral-code="loyaltyStore.referralCode"
        :referrals-count="loyaltyStore.referralsCount"
        @copy="handleCopyReferral"
        class="mb-4 md:mb-6"
      />

      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-4">
        <nav class="flex gap-4 md:gap-6">
          <button
            type="button"
            :class="[
              'pb-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'rewards'
                ? 'border-blue-primary text-blue-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            ]"
            @click="activeTab = 'rewards'"
          >
            Récompenses ({{ availableRewards.length }})
          </button>
          <button
            type="button"
            :class="[
              'pb-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'missions'
                ? 'border-blue-primary text-blue-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            ]"
            @click="activeTab = 'missions'"
          >
            Missions ({{ activeMissions.length }})
          </button>
          <button
            type="button"
            :class="[
              'pb-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'badges'
                ? 'border-blue-primary text-blue-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            ]"
            @click="activeTab = 'badges'"
          >
            Badges ({{ loyaltyStore.badges.filter(b => b.unlocked).length }})
          </button>
        </nav>
      </div>

      <!-- Rewards Tab -->
      <div v-if="activeTab === 'rewards'">
        <!-- Available Rewards -->
        <div v-if="availableRewards.length > 0" class="mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="mdi:gift" class="w-5 h-5 text-green-primary" />
            Récompenses disponibles
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <RewardCard
              v-for="reward in availableRewards"
              :key="reward.id"
              :reward="reward"
              :user-points="loyaltyStore.points"
              @claim="handleClaimReward"
            />
          </div>
        </div>

        <!-- Locked Rewards -->
        <div v-if="lockedRewards.length > 0">
          <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="mdi:lock" class="w-5 h-5 text-gray-400" />
            Récompenses verrouillées
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <RewardCard
              v-for="reward in lockedRewards"
              :key="reward.id"
              :reward="reward"
              :user-points="loyaltyStore.points"
              @claim="handleClaimReward"
            />
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="availableRewards.length === 0 && lockedRewards.length === 0" class="p-8 text-center bg-white border border-gray-200 rounded-lg">
          <Icon icon="mdi:gift-outline" class="w-12 h-12 mx-auto text-gray-400 md:w-16 md:h-16" />
          <h3 class="mt-4 text-lg font-medium text-gray-900">
            Aucune récompense disponible
          </h3>
          <p class="mt-2 text-sm text-gray-600">
            Complétez des missions pour gagner des points et débloquer des récompenses.
          </p>
        </div>
      </div>

      <!-- Missions Tab -->
      <div v-if="activeTab === 'missions'">
        <!-- Active Missions -->
        <div v-if="activeMissions.length > 0" class="mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="mdi:target" class="w-5 h-5 text-orange-primary" />
            Missions en cours
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <MissionCard
              v-for="mission in activeMissions"
              :key="mission.id"
              :mission="mission"
            />
          </div>
        </div>

        <!-- Completed Missions -->
        <div v-if="completedMissions.length > 0">
          <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="mdi:check-circle" class="w-5 h-5 text-green-primary" />
            Missions complétées
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <MissionCard
              v-for="mission in completedMissions"
              :key="mission.id"
              :mission="mission"
            />
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="activeMissions.length === 0 && completedMissions.length === 0" class="p-8 text-center bg-white border border-gray-200 rounded-lg">
          <Icon icon="mdi:clipboard-check-outline" class="w-12 h-12 mx-auto text-gray-400 md:w-16 md:h-16" />
          <h3 class="mt-4 text-lg font-medium text-gray-900">
            Aucune mission disponible
          </h3>
          <p class="mt-2 text-sm text-gray-600">
            Les missions vous permettent de gagner des points rapidement.
          </p>
        </div>
      </div>

      <!-- Badges Tab -->
      <div v-if="activeTab === 'badges'">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          <BadgeCard
            v-for="badge in loyaltyStore.badges"
            :key="badge.id"
            :badge="badge"
          />
        </div>

        <!-- Empty state -->
        <div v-if="loyaltyStore.badges.length === 0" class="p-8 text-center bg-white border border-gray-200 rounded-lg">
          <Icon icon="mdi:trophy-outline" class="w-12 h-12 mx-auto text-gray-400 md:w-16 md:h-16" />
          <h3 class="mt-4 text-lg font-medium text-gray-900">
            Aucun badge
          </h3>
          <p class="mt-2 text-sm text-gray-600">
            Débloquez des badges en utilisant nos services régulièrement.
          </p>
        </div>
      </div>

      <!-- Info banner -->
      <div class="mt-6 flex items-start gap-3 p-4 bg-blue-pale rounded-lg">
        <Icon icon="mdi:information" class="flex-shrink-0 w-5 h-5 text-blue-primary" />
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">
            Comment gagner plus de points ?
          </p>
          <ul class="mt-2 text-xs text-gray-600 space-y-1">
            <li>• Réservez des interventions (50 points par intervention)</li>
            <li>• Parrainez vos proches (100 points par filleul)</li>
            <li>• Complétez des missions spéciales</li>
            <li>• Laissez des avis après vos interventions (20 points)</li>
          </ul>
        </div>
      </div>
    </Container>

    <Footer />
  </div>
</template>
