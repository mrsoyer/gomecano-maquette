<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col">
    <Header />

    <div class="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
      <RegisterForm />
    </div>

    <Footer />
  </div>
</template>
