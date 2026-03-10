<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  title: string
  url: string
}

const props = defineProps<Props>()

function shareWhatsApp(): void {
  window.open(`https://wa.me/?text=${encodeURIComponent(props.title + ' ' + props.url)}`, '_blank')
}

function shareEmail(): void {
  window.location.href = `mailto:?subject=${encodeURIComponent(props.title)}&body=${encodeURIComponent(props.url)}`
}

function copyLink(): void {
  navigator.clipboard.writeText(props.url)
  window.alert('✓ Lien copié !')
}
</script>

<template>
  <div class="flex gap-2">
    <button
      @click="shareWhatsApp"
      class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      title="WhatsApp"
    >
      <Icon icon="mdi:whatsapp" class="w-5 h-5" />
    </button>
    <button
      @click="shareEmail"
      class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      title="Email"
    >
      <Icon icon="mdi:email" class="w-5 h-5" />
    </button>
    <button
      @click="copyLink"
      class="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
      title="Copier"
    >
      <Icon icon="mdi:content-copy" class="w-5 h-5" />
    </button>
  </div>
</template>
