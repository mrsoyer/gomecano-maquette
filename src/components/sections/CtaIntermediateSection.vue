<script setup lang="ts">
import Container from '@/components/layout/Container.vue'

const scrollToForm = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <section class="py-16 md:py-20 bg-white border-y border-gray-200">
    <Container>
      <div class="text-center max-w-2xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Prêt à économiser sur votre entretien auto ?
        </h2>
        
        <button
          @click="scrollToForm"
          class="inline-flex items-center gap-3 px-12 py-6 bg-orange-primary hover:bg-orange-hover text-white font-bold text-xl rounded-full shadow-2xl hover:shadow-orange-500/50 hover:-translate-y-1 transition-all duration-300 group"
        >
          <span>Obtenir mon devis gratuit</span>
          <span class="text-2xl group-hover:translate-x-2 transition-transform">→</span>
        </button>
        
        <div class="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-gray-700">
          <span class="flex items-center gap-2">
            <span class="text-orange-primary text-xl">✓</span>
            <strong>Gratuit</strong> et sans engagement
          </span>
          <span class="flex items-center gap-2">
            <span class="text-orange-primary text-xl">✓</span>
            Réponse en <strong>30 secondes</strong>
          </span>
          <span class="flex items-center gap-2">
            <span class="text-orange-primary text-xl">✓</span>
            <strong>Garantie 1 an</strong>
          </span>
        </div>
      </div>
    </Container>
  </section>
</template>

