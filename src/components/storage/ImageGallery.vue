<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { GalleryImage } from '@/types/storage.types'

interface Props {
  images: GalleryImage[]
  editable?: boolean
  columns?: number
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
  columns: 3
})

const emit = defineEmits<{
  delete: [path: string]
  select: [image: GalleryImage]
}>()

const lightboxOpen = ref(false)
const currentIndex = ref(0)

function openLightbox(index: number) {
  currentIndex.value = index
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

function nextImage() {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

function prevImage() {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

function handleDelete(path: string, event: Event) {
  event.stopPropagation()
  emit('delete', path)
}

function handleKeydown(event: KeyboardEvent) {
  if (!lightboxOpen.value) return

  switch (event.key) {
    case 'Escape':
      closeLightbox()
      break
    case 'ArrowRight':
      nextImage()
      break
    case 'ArrowLeft':
      prevImage()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="image-gallery" tabindex="0">
    <!-- Grid -->
    <div
      class="image-gallery__grid"
      :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }"
    >
      <div
        v-for="(image, index) in images"
        :key="index"
        class="image-gallery__item"
        @click="openLightbox(index)"
      >
        <img
          :src="image.thumbnail || image.url"
          :alt="image.alt || `Image ${index + 1}`"
          class="image-gallery__img"
        />

        <!-- Delete Button -->
        <button
          v-if="editable && image.path"
          class="image-gallery__delete"
          @click="handleDelete(image.path, $event)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="lightboxOpen" class="image-gallery__lightbox" @click="closeLightbox">
        <button class="image-gallery__close" @click="closeLightbox">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button v-if="images.length > 1" class="image-gallery__nav image-gallery__nav--prev" @click.stop="prevImage">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <img
          :src="images[currentIndex].url"
          :alt="images[currentIndex].alt || `Image ${currentIndex + 1}`"
          class="image-gallery__lightbox-img"
          @click.stop
        />

        <button v-if="images.length > 1" class="image-gallery__nav image-gallery__nav--next" @click.stop="nextImage">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div class="image-gallery__counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.image-gallery__grid {
  @apply grid gap-2;
}

.image-gallery__item {
  @apply relative aspect-square overflow-hidden rounded-lg cursor-pointer;
  @apply hover:opacity-90 transition-opacity;
}

.image-gallery__img {
  @apply w-full h-full object-cover;
}

.image-gallery__delete {
  @apply absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full;
  @apply opacity-0 hover:bg-red-600 transition-all;
}

.image-gallery__item:hover .image-gallery__delete {
  @apply opacity-100;
}

.image-gallery__delete svg {
  @apply w-4 h-4;
}

.image-gallery__lightbox {
  @apply fixed inset-0 z-50 bg-black/90 flex items-center justify-center;
}

.image-gallery__lightbox-img {
  @apply max-w-[90vw] max-h-[90vh] object-contain;
}

.image-gallery__close {
  @apply absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full;
}

.image-gallery__close svg {
  @apply w-6 h-6;
}

.image-gallery__nav {
  @apply absolute top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/10 rounded-full;
}

.image-gallery__nav--prev {
  @apply left-4;
}

.image-gallery__nav--next {
  @apply right-4;
}

.image-gallery__nav svg {
  @apply w-8 h-8;
}

.image-gallery__counter {
  @apply absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full;
}
</style>
