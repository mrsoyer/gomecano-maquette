<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  referralCode: string
  referralsCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  copy: [code: string]
}>()

const copied = ref(false)

/**
 * Copy referral code to clipboard
 */
async function handleCopy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.referralCode)
    copied.value = true
    emit('copy', props.referralCode)
    
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

/**
 * Share referral code
 */
function handleShare(): void {
  const text = `Rejoins Gomecano avec mon code parrain ${props.referralCode} et profite de -20€ sur ta première intervention ! 🚗`
  const url = `https://gomecano.fr?ref=${props.referralCode}`
  
  if (navigator.share) {
    navigator.share({
      title: 'Parrainage Gomecano',
      text,
      url
    }).catch(() => {
      // User cancelled share
    })
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(`${text}\n${url}`)
    alert('Lien de parrainage copié !')
  }
}
</script>

<template>
  <div class="p-4 md:p-5 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg">
    <div class="flex items-start gap-4">
      <!-- Icon -->
      <div class="flex-shrink-0 w-12 h-12 bg-green-primary rounded-lg flex items-center justify-center">
        <Icon icon="mdi:account-multiple-plus" class="w-6 h-6 text-white" />
      </div>

      <!-- Content -->
      <div class="flex-1">
        <h3 class="text-lg font-bold text-gray-900 mb-1">
          Parrainage
        </h3>
        <p class="text-sm text-gray-600 mb-3">
          Partagez votre code et gagnez <span class="font-bold text-green-primary">100 points</span> 
          par filleul inscrit. Votre filleul reçoit <span class="font-bold text-blue-primary">-20€</span> !
        </p>

        <!-- Referral code -->
        <div class="flex items-center gap-2 mb-3">
          <div class="flex-1 flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
            <Icon icon="mdi:ticket-percent" class="w-5 h-5 text-green-primary" />
            <code class="flex-1 text-lg font-mono font-bold text-gray-900">
              {{ referralCode }}
            </code>
          </div>

          <button
            type="button"
            class="px-4 py-2 bg-blue-primary text-white rounded-lg hover:bg-blue-dark transition-colors"
            @click="handleCopy"
          >
            <Icon :icon="copied ? 'mdi:check' : 'mdi:content-copy'" class="w-5 h-5" />
          </button>
        </div>

        <!-- Stats and share -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <Icon icon="mdi:account-check" class="w-4 h-4 text-green-primary" />
            <span class="text-gray-600">
              <span class="font-bold text-gray-900">{{ referralsCount }}</span> filleul{{ referralsCount > 1 ? 's' : '' }}
            </span>
          </div>

          <button
            type="button"
            class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-primary border border-blue-primary rounded-lg hover:bg-blue-pale transition-colors"
            @click="handleShare"
          >
            <Icon icon="mdi:share-variant" class="w-4 h-4" />
            Partager
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
