<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { VideoInspection } from '@/types/video'

interface Props {
  video: VideoInspection
}

defineProps<Props>()

const emit = defineEmits<{
  approve: []
  decline: []
}>()

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-5">
    <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <Icon icon="mdi:video" class="w-6 h-6 text-blue-primary" />
      Inspection vidéo
    </h3>

    <!-- Video Player -->
    <div class="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
      <iframe
        :src="video.videoUrl"
        class="w-full h-full"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </div>

    <!-- Video Info -->
    <div class="flex items-center gap-4 text-sm text-gray-600 mb-4">
      <span class="flex items-center gap-1">
        <Icon icon="mdi:clock" class="w-4 h-4" />
        {{ formatDuration(video.duration) }}
      </span>
      <span class="flex items-center gap-1">
        <Icon icon="mdi:calendar" class="w-4 h-4" />
        {{ new Date(video.recordedAt).toLocaleString('fr-FR') }}
      </span>
    </div>

    <!-- Mechanic Comments -->
    <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
      <div class="flex items-start gap-2">
        <Icon icon="mdi:comment-text" class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <div class="text-sm font-medium text-gray-900 mb-1">Commentaires du mécanicien</div>
          <p class="text-sm text-gray-700">{{ video.mechanicComments }}</p>
        </div>
      </div>
    </div>

    <!-- Approval Buttons -->
    <div v-if="video.userApproval === 'pending'" class="flex gap-3">
      <button
        @click="emit('decline')"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        <Icon icon="mdi:close-circle" class="w-5 h-5" />
        Refuser
      </button>
      <button
        @click="emit('approve')"
        class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
      >
        <Icon icon="mdi:check-circle" class="w-5 h-5" />
        Approuver
      </button>
    </div>

    <div v-else class="text-center py-2">
      <span
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium',
          video.userApproval === 'approved'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        ]"
      >
        {{ video.userApproval === 'approved' ? '✓ Approuvé' : '✗ Refusé' }}
      </span>
    </div>
  </div>
</template>
