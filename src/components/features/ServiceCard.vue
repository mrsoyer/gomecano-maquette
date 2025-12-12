<script setup lang="ts">
import type { Service } from '@/types/service'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

interface Props {
  service: Service
}

defineProps<Props>()
const emit = defineEmits<{ select: [service: Service] }>()
</script>

<template>
  <Card :hover="true">
    <Badge v-if="service.isInstantQuote" variant="success" size="sm" class="mb-3">Prix instantané</Badge>
    <h3 class="text-xl font-semibold mb-2">{{ service.name }}</h3>
    <p class="text-gray-600 text-sm mb-4">{{ service.description }}</p>
    <div class="flex justify-between items-center">
      <span class="text-2xl font-bold text-orange-primary">{{ service.priceFrom }}€</span>
      <Button variant="primary" size="sm" @click="emit('select', service)">Choisir</Button>
    </div>
  </Card>
</template>






