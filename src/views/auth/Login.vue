<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
    <Header />

    <div class="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
      <LoginForm />
    </div>

    <Footer />
  </div>
</template>
