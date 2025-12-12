<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Container from '@/components/layout/Container.vue'
</script>

<template>
  <section class="py-12 md:py-16 bg-white">
    <Container>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Bloc 1 : Gratuit -->
        <div class="group text-center p-6 rounded-2xl border-2 border-gray-100 hover:border-orange-primary transition-all duration-300 hover:shadow-xl">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-light flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon icon="mdi:gift" class="w-12 h-12 text-orange-primary" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Devis gratuit</h3>
          <p class="text-gray-600">Sans engagement, réponse en 30 secondes</p>
        </div>
        
        <!-- Bloc 2 : Rapide -->
        <div class="group text-center p-6 rounded-2xl border-2 border-gray-100 hover:border-orange-primary transition-all duration-300 hover:shadow-xl">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-light flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon icon="mdi:lightning-bolt" class="w-12 h-12 text-orange-primary" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Intervention rapide</h3>
          <p class="text-gray-600">RDV sous 48h partout en France</p>
        </div>
        
        <!-- Bloc 3 : Garanti -->
        <div class="group text-center p-6 rounded-2xl border-2 border-gray-100 hover:border-orange-primary transition-all duration-300 hover:shadow-xl">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-green-pale flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon icon="mdi:check-circle" class="w-12 h-12 text-green-primary" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Garantie 1 an</h3>
          <p class="text-gray-600">Pièces et main d'œuvre garanties</p>
        </div>
      </div>
    </Container>
  </section>
</template>




