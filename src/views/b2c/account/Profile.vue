<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user.store'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import ProfileEditForm from '@/components/profile/ProfileEditForm.vue'
import ChangePasswordForm from '@/components/profile/ChangePasswordForm.vue'
import AddressBookManager from '@/components/profile/AddressBookManager.vue'

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
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Mon profil</h1>
        <p class="text-sm md:text-base text-gray-600">Gérez vos informations personnelles et préférences</p>
      </div>

      <div class="grid lg:grid-cols-2 gap-4 md:gap-6">
        <div class="space-y-4 md:space-y-6">
          <ProfileEditForm />
          <ChangePasswordForm />
        </div>
        <div>
          <AddressBookManager />
        </div>
      </div>
    </Container>

    <Footer />
  </div>
</template>
