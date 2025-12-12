<script setup lang="ts">
import { ref } from 'vue'
import { mockFaq } from '@/mocks/faq'
import Container from '@/components/layout/Container.vue'

const openFaqId = ref<string | null>(null)

const toggleFaq = (id: string) => {
  openFaqId.value = openFaqId.value === id ? null : id
}
</script>

<template>
  <section class="py-16 md:py-24 bg-gray-50">
    <Container>
      <div class="text-center mb-12">
        <span class="text-sm uppercase tracking-wide text-orange-primary font-bold mb-2 block">
          FAQ
        </span>
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Questions fréquentes
        </h2>
        <div class="h-1 w-20 bg-gradient-to-r from-orange-primary to-orange-hover mx-auto"></div>
      </div>
      
      <div class="max-w-3xl mx-auto space-y-4">
        <div
          v-for="faq in mockFaq"
          :key="faq.id"
          class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-orange-primary/30 transition-colors"
        >
          <button
            @click="toggleFaq(faq.id)"
            class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-orange-50 transition-colors group"
          >
            <span class="font-semibold text-gray-900 pr-8">{{ faq.question }}</span>
            <span 
              class="text-orange-primary text-2xl transition-transform duration-300 flex-shrink-0"
              :class="{ 'rotate-180': openFaqId === faq.id }"
            >
              ▼
            </span>
          </button>
          
          <Transition name="accordion">
            <div v-if="openFaqId === faq.id" class="px-6 pb-4">
              <p class="text-gray-600 leading-relaxed">{{ faq.answer }}</p>
            </div>
          </Transition>
        </div>
      </div>
    </Container>
  </section>
</template>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>






