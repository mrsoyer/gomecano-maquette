<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const plate = ref('')

const handleSubmit = () => {
  if (plate.value) {
    router.push('/reserver/service')
  }
}
</script>

<template>
  <Card>
    <h1 class="text-3xl font-bold mb-6">Identifiez votre véhicule</h1>
    <form @submit.prevent="handleSubmit">
      <Input
        v-model="plate"
        label="Plaque d'immatriculation"
        placeholder="AB-123-CD"
        required
        class="mb-6"
      />
      <Button type="submit" variant="primary" size="lg" class="w-full">
        Continuer
      </Button>
    </form>
  </Card>
</template>






