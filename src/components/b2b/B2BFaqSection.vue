<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import Container from '@/components/layout/Container.vue'
import { b2bFaqs } from '@/mocks/b2b.mock'

const openIndex = ref<number | null>(null)

function toggleFaq(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <section class="bg-white py-16">
    <Container>
      <h2 class="text-4xl md:text-5xl font-bold text-center mb-12 text-green-primary">
        Questions fréquentes
      </h2>
      
      <div class="max-w-3xl mx-auto space-y-4">
        <div v-for="(faq, index) in b2bFaqs" :key="index"
             class="border border-gray-200 rounded-lg overflow-hidden">
          <button @click="toggleFaq(index)"
                  class="w-full px-6 py-4 text-left flex justify-between items-center
                         hover:bg-gray-50 transition"
                  :aria-expanded="openIndex === index">
            <span class="font-bold text-lg">{{ faq.question }}</span>
            <Icon :icon="openIndex === index ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
                  class="text-2xl text-gray-400 flex-shrink-0 ml-4" />
          </button>
          
          <div v-show="openIndex === index" 
               class="px-6 pb-4 text-gray-600 bg-gray-50">
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </Container>
  </section>
</template>
