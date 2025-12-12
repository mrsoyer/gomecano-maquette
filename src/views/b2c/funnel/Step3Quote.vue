<script setup lang="ts">
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
</script>

<template>
  <Card>
    <h1 class="text-3xl font-bold mb-6">Votre devis</h1>
    <div class="space-y-4 mb-6">
      <div class="flex justify-between">
        <span>Vidange moteur</span>
        <span class="font-bold">89€</span>
      </div>
      <div class="border-t pt-4 flex justify-between text-xl font-bold">
        <span>Total</span>
        <span class="text-orange-primary">89€</span>
      </div>
    </div>
    <Button variant="primary" size="lg" class="w-full" @click="router.push('/reserver/rdv')">
      Continuer
    </Button>
  </Card>
</template>






