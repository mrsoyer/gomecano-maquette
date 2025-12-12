<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const address = ref('')
const date = ref('')
</script>

<template>
  <Card>
    <h1 class="text-3xl font-bold mb-6">Choisissez votre créneau</h1>
    <form @submit.prevent="router.push('/reserver/paiement')">
      <Input v-model="address" label="Adresse" placeholder="15 rue de la Paix" required class="mb-4" />
      <Input v-model="date" label="Date" type="text" placeholder="05/12/2024 à 10h00" required class="mb-6" />
      <Button type="submit" variant="primary" size="lg" class="w-full">
        Continuer
      </Button>
    </form>
  </Card>
</template>






