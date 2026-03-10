<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Container from '@/components/layout/Container.vue'
import Card from '@/components/ui/Card.vue'
import { b2bServices } from '@/mocks/b2b.mock'
</script>

<template>
  <section class="bg-blue-pale py-16">
    <Container>
      <h2 class="text-4xl md:text-5xl font-bold text-center mb-12 text-green-primary">
        Nos prestations sur site
      </h2>

      <!-- Grid: 2 services + image sur la 1re ligne, 3 services sur la 2e ligne, 3 services sur la 3e ligne -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Ligne 1 : prestations 1 et 2 -->
        <Card
          v-for="service in b2bServices.slice(0, 2)"
          :key="service.id"
          class="bg-white hover:shadow-lg transition-shadow flex flex-col"
        >
          <div class="flex items-center gap-3 mb-2">
            <Icon :icon="service.icon" :class="service.iconColor" class="w-8 h-8 flex-shrink-0" />
            <h3 class="text-xl font-bold">{{ service.name }}</h3>
          </div>
          <p class="text-gray-600 text-sm md:text-base w-full text-center">{{ service.description }}</p>
        </Card>

        <!-- Carte visuelle Camion (image pleine carte) -->
        <div class="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden aspect-[4/3] flex">
          <img
            src="/images/camionnette_gomecano_flottes_automobiles.jpg"
            alt="Camionnette GOMECANO pour interventions sur flottes automobiles"
            class="w-full h-full object-cover object-center"
          />
        </div>

        <!-- Ligne 2 : prestations 3, 4 et 5 -->
        <Card
          v-for="service in b2bServices.slice(2, 5)"
          :key="service.id"
          class="bg-white hover:shadow-lg transition-shadow flex flex-col"
        >
          <div class="flex items-center gap-3 mb-2">
            <Icon :icon="service.icon" :class="service.iconColor" class="w-8 h-8 flex-shrink-0" />
            <h3 class="text-xl font-bold">{{ service.name }}</h3>
          </div>
          <p class="text-gray-600 text-sm md:text-base w-full text-center">{{ service.description }}</p>
        </Card>

        <!-- Ligne 3 : prestations 6, 7 et 8 -->
        <Card
          v-for="(service, index) in b2bServices.slice(5, 8)"
          :key="service.id"
          :class="[
            'bg-white hover:shadow-lg transition-shadow flex flex-col',
            { 'md:col-span-2 md:max-w-md md:mx-auto lg:col-span-1 lg:max-w-none': index === 2 }
          ]"
        >
          <div class="flex items-center gap-3 mb-2">
            <Icon :icon="service.icon" :class="service.iconColor" class="w-8 h-8 flex-shrink-0" />
            <h3 class="text-xl font-bold">{{ service.name }}</h3>
          </div>
          <p class="text-gray-600 text-sm md:text-base w-full text-center">{{ service.description }}</p>
        </Card>
      </div>
    </Container>
  </section>
</template>
