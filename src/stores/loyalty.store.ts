import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Tier {
  id: string
  name: string
  color: string
  minPoints: number
}

export interface Reward {
  id: string
  title: string
  description: string
  pointsRequired: number
  value: number
  type: 'discount' | 'free_service' | 'gift'
  expiresAt?: string
  claimed: boolean
}

export interface Mission {
  id: string
  title: string
  description: string
  points: number
  progress: number
  target: number
  completed: boolean
  type: 'booking' | 'review' | 'referral' | 'profile'
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

/**
 * Loyalty store - Manages loyalty program
 */
export const useLoyaltyStore = defineStore('loyalty', () => {
  // State
  const points = ref(450)
  const referralCode = ref('THOMAS2024')
  const referralsCount = ref(3)
  const rewards = ref<Reward[]>([])
  const missions = ref<Mission[]>([])
  const badges = ref<Badge[]>([])
  const isLoading = ref(false)

  // Tiers
  const tiers: Tier[] = [
    { id: 'bronze', name: 'Bronze', color: 'bronze', minPoints: 0 },
    { id: 'silver', name: 'Silver', color: 'silver', minPoints: 500 },
    { id: 'gold', name: 'Gold', color: 'gold', minPoints: 1000 },
    { id: 'platinum', name: 'Platinum', color: 'platinum', minPoints: 2000 }
  ]

  // Getters
  const currentTier = computed(() => {
    return tiers.reduce((current, tier) => {
      return points.value >= tier.minPoints ? tier : current
    }, tiers[0])
  })

  const nextTier = computed(() => {
    const currentIndex = tiers.findIndex(t => t.id === currentTier.value.id)
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null
  })

  const pointsToNextTier = computed(() => {
    if (!nextTier.value) return 0
    return nextTier.value.minPoints - points.value
  })

  /**
   * Fetch loyalty data for user
   */
  async function fetchLoyaltyData(userId: string): Promise<void> {
    isLoading.value = true
    try {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mock rewards
      rewards.value = [
        {
          id: 'reward-1',
          title: 'Réduction 10€',
          description: 'Utilisable sur votre prochaine intervention',
          pointsRequired: 200,
          value: 10,
          type: 'discount',
          claimed: false
        },
        {
          id: 'reward-2',
          title: 'Réduction 20€',
          description: 'Utilisable sur votre prochaine intervention',
          pointsRequired: 400,
          value: 20,
          type: 'discount',
          claimed: false
        },
        {
          id: 'reward-3',
          title: 'Vidange gratuite',
          description: 'Une vidange complète offerte',
          pointsRequired: 800,
          value: 80,
          type: 'free_service',
          claimed: false
        },
        {
          id: 'reward-4',
          title: 'Kit entretien',
          description: 'Kit complet pour entretenir votre véhicule',
          pointsRequired: 600,
          value: 50,
          type: 'gift',
          claimed: false
        }
      ]

      // Mock missions
      missions.value = [
        {
          id: 'mission-1',
          title: 'Première intervention',
          description: 'Réservez votre première intervention',
          points: 50,
          progress: 1,
          target: 1,
          completed: true,
          type: 'booking'
        },
        {
          id: 'mission-2',
          title: 'Fidèle client',
          description: 'Réalisez 5 interventions',
          points: 100,
          progress: 3,
          target: 5,
          completed: false,
          type: 'booking'
        },
        {
          id: 'mission-3',
          title: 'Partagez votre expérience',
          description: 'Laissez 3 avis après vos interventions',
          points: 75,
          progress: 1,
          target: 3,
          completed: false,
          type: 'review'
        },
        {
          id: 'mission-4',
          title: 'Parrainage',
          description: 'Parrainez 3 amis',
          points: 300,
          progress: 3,
          target: 3,
          completed: true,
          type: 'referral'
        },
        {
          id: 'mission-5',
          title: 'Profil complet',
          description: 'Complétez toutes les informations de votre profil',
          points: 30,
          progress: 4,
          target: 5,
          completed: false,
          type: 'profile'
        }
      ]

      // Mock badges
      badges.value = [
        {
          id: 'badge-1',
          name: 'Nouveau membre',
          description: 'Inscription au programme',
          icon: 'mdi:account-star',
          unlocked: true,
          unlockedAt: '2024-01-15',
          rarity: 'common'
        },
        {
          id: 'badge-2',
          name: 'Premier pas',
          description: 'Première intervention réalisée',
          icon: 'mdi:star',
          unlocked: true,
          unlockedAt: '2024-02-10',
          rarity: 'common'
        },
        {
          id: 'badge-3',
          name: 'Fidèle',
          description: '5 interventions réalisées',
          icon: 'mdi:medal',
          unlocked: false,
          rarity: 'rare'
        },
        {
          id: 'badge-4',
          name: 'Ambassadeur',
          description: '3 parrainages réussis',
          icon: 'mdi:account-multiple-check',
          unlocked: true,
          unlockedAt: '2024-03-15',
          rarity: 'epic'
        },
        {
          id: 'badge-5',
          name: 'Expert',
          description: '10 interventions réalisées',
          icon: 'mdi:trophy',
          unlocked: false,
          rarity: 'epic'
        },
        {
          id: 'badge-6',
          name: 'Légende',
          description: 'Niveau Platinum atteint',
          icon: 'mdi:crown',
          unlocked: false,
          rarity: 'legendary'
        }
      ]
    } catch (error) {
      console.error('Error fetching loyalty data:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Claim a reward
   */
  function claimReward(rewardId: string): void {
    const reward = rewards.value.find(r => r.id === rewardId)
    if (reward && points.value >= reward.pointsRequired && !reward.claimed) {
      reward.claimed = true
      points.value -= reward.pointsRequired
    }
  }

  /**
   * Add points (when completing actions)
   */
  function addPoints(amount: number): void {
    points.value += amount
  }

  /**
   * Complete a mission
   */
  function completeMission(missionId: string): void {
    const mission = missions.value.find(m => m.id === missionId)
    if (mission && !mission.completed) {
      mission.completed = true
      mission.progress = mission.target
      addPoints(mission.points)
    }
  }

  /**
   * Unlock a badge
   */
  function unlockBadge(badgeId: string): void {
    const badge = badges.value.find(b => b.id === badgeId)
    if (badge && !badge.unlocked) {
      badge.unlocked = true
      badge.unlockedAt = new Date().toISOString()
    }
  }

  return {
    // State
    points,
    referralCode,
    referralsCount,
    rewards,
    missions,
    badges,
    isLoading,
    // Getters
    currentTier,
    nextTier,
    pointsToNextTier,
    // Actions
    fetchLoyaltyData,
    claimReward,
    addPoints,
    completeMission,
    unlockBadge
  }
})
