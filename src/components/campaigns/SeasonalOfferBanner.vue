<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Campaign } from '@/mocks/campaigns.mock'

interface Props {
  campaign: Campaign
}

defineProps<Props>()
</script>

<template>
  <div class="bg-gradient-to-r from-orange-primary to-orange-hover text-white rounded-lg p-4 mb-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold mb-1">
          {{ campaign.title }}
        </h3>
        <p class="text-sm opacity-90">
          {{ campaign.description }}
        </p>
      </div>
      <div class="text-3xl font-bold">
        -{{ campaign.discount }}%
      </div>
    </div>
  </div>
</template>
