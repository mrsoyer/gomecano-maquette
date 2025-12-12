<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { mockServices } from '@/mocks'
import type { Service } from '@/types/service'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import ServiceCard from '@/components/features/ServiceCard.vue'

const router = useRouter()
const selectedService = ref<Service | null>(null)

const selectService = (service: Service) => {
  selectedService.value = service
  router.push('/reserver/devis')
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Choisissez votre service</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ServiceCard
        v-for="service in mockServices.slice(0, 6)"
        :key="service.id"
        :service="service"
        @select="selectService"
      />
    </div>
  </div>
</template>






