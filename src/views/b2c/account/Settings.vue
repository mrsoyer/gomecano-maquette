<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user.store'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import NotificationPreferences from '@/components/profile/NotificationPreferences.vue'

const userStore = useUserStore()

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-1')
  }
  if (userStore.user) {
    await userStore.fetchUserData()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-6">
      <div class="mb-4 md:mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
        <p class="text-sm md:text-base text-gray-600">Configurez vos préférences et options de confidentialité</p>
      </div>

      <div class="max-w-2xl">
        <NotificationPreferences />
      </div>
    </Container>

    <Footer />
  </div>
</template>
