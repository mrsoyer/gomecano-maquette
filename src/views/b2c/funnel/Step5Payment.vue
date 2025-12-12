<script setup lang="ts">
import { ref } from 'vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const cardNumber = ref('')
const showSuccess = ref(false)

const handlePayment = () => {
  showSuccess.value = true
}
</script>

<template>
  <Card>
    <div v-if="!showSuccess">
      <h1 class="text-3xl font-bold mb-6">Paiement sécurisé</h1>
      <form @submit.prevent="handlePayment">
        <Input v-model="cardNumber" label="Numéro de carte" placeholder="1234 5678 9012 3456" required class="mb-6" />
        <div class="flex justify-between items-center mb-6">
          <span class="font-bold">Total:</span>
          <span class="text-2xl font-bold text-orange-primary">89€</span>
        </div>
        <Button type="submit" variant="primary" size="lg" class="w-full">
          Payer et confirmer
        </Button>
      </form>
    </div>
    <div v-else class="text-center py-12">
      <div class="text-6xl mb-4">✅</div>
      <h2 class="text-3xl font-bold text-green-primary mb-4">Réservation confirmée !</h2>
      <p class="text-gray-600">Vous recevrez un email de confirmation</p>
    </div>
  </Card>
</template>






