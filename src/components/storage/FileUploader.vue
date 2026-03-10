<script setup lang="ts">
import { ref, computed } from 'vue'
import DropZone from './DropZone.vue'
import type { BucketName } from '@/types/storage.types'

interface Props {
  bucket: BucketName
  folder: string
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  showPreview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/*',
  multiple: true,
  maxSize: 5 * 1024 * 1024,
  maxFiles: 10,
  showPreview: true
})

const emit = defineEmits<{
  uploaded: [paths: string[]]
  error: [message: string]
}>()

interface PendingFile {
  file: File
  preview?: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  path?: string
}

const uploading = ref(false)
const pendingFiles = ref<PendingFile[]>([])

const canAddMore = computed(() => {
  return props.multiple && pendingFiles.value.length < props.maxFiles
})

function handleFiles(files: File[]) {
  const remaining = props.maxFiles - pendingFiles.value.length

  for (const file of files.slice(0, remaining)) {
    const pending: PendingFile = {
      file,
      progress: 0,
      status: 'pending'
    }

    // Créer preview pour les images
    if (props.showPreview && file.type.startsWith('image/')) {
      pending.preview = URL.createObjectURL(file)
    }

    pendingFiles.value.push(pending)
  }
}

function handleError(message: string) {
  emit('error', message)
}

function removeFile(index: number) {
  const file = pendingFiles.value[index]
  if (file.preview) {
    URL.revokeObjectURL(file.preview)
  }
  pendingFiles.value.splice(index, 1)
}

/**
 * Upload all pending files
 * Note: Requires useStorage composable to be implemented
 */
async function uploadAll() {
  const uploadedPaths: string[] = []
  uploading.value = true

  for (let i = 0; i < pendingFiles.value.length; i++) {
    const pending = pendingFiles.value[i]
    if (pending.status !== 'pending') continue

    pending.status = 'uploading'

    try {
      const ext = pending.file.name.split('.').pop()
      const timestamp = Date.now()
      const safeName = pending.file.name
        .replace(`.${ext}`, '')
        .replace(/[^a-zA-Z0-9-_]/g, '_')
      const path = `${props.folder}/${safeName}-${timestamp}.${ext}`

      // Simulate upload progress for now
      // TODO: Replace with actual useStorage composable when available
      for (let progress = 0; progress <= 100; progress += 20) {
        pending.progress = progress
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      pending.status = 'success'
      pending.path = path
      uploadedPaths.push(path)
    } catch (err) {
      pending.status = 'error'
      pending.error = err instanceof Error ? err.message : 'Upload failed'
    }
  }

  uploading.value = false

  if (uploadedPaths.length > 0) {
    emit('uploaded', uploadedPaths)
  }
}

function clearCompleted() {
  pendingFiles.value = pendingFiles.value.filter(f => f.status !== 'success')
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

defineExpose({ uploadAll, clearCompleted })
</script>

<template>
  <div class="file-uploader">
    <!-- Drop Zone -->
    <DropZone
      v-if="canAddMore || pendingFiles.length === 0"
      :accept="accept"
      :multiple="multiple"
      :max-size="maxSize"
      :disabled="uploading"
      @files="handleFiles"
      @error="handleError"
    />

    <!-- File List -->
    <div v-if="pendingFiles.length > 0" class="file-uploader__list">
      <div
        v-for="(file, index) in pendingFiles"
        :key="index"
        class="file-uploader__item"
        :class="`file-uploader__item--${file.status}`"
      >
        <!-- Preview -->
        <div v-if="file.preview" class="file-uploader__preview">
          <img :src="file.preview" :alt="file.file.name" />
        </div>
        <div v-else class="file-uploader__icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <!-- Info -->
        <div class="file-uploader__info">
          <p class="file-uploader__name">{{ file.file.name }}</p>
          <p class="file-uploader__size">{{ formatSize(file.file.size) }}</p>

          <!-- Progress Bar -->
          <div v-if="file.status === 'uploading'" class="file-uploader__progress">
            <div
              class="file-uploader__progress-bar"
              :style="{ width: `${file.progress}%` }"
            />
          </div>

          <!-- Error -->
          <p v-if="file.error" class="file-uploader__error">{{ file.error }}</p>
        </div>

        <!-- Status Icon -->
        <div class="file-uploader__status">
          <svg v-if="file.status === 'success'" class="text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else-if="file.status === 'error'" class="text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <button
            v-else-if="file.status === 'pending'"
            class="file-uploader__remove"
            @click="removeFile(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="pendingFiles.length > 0" class="file-uploader__actions">
      <button
        class="btn btn--primary"
        :disabled="uploading || pendingFiles.every(f => f.status !== 'pending')"
        @click="uploadAll"
      >
        {{ uploading ? 'Upload en cours...' : 'Uploader' }}
      </button>
      <button
        v-if="pendingFiles.some(f => f.status === 'success')"
        class="btn btn--secondary"
        @click="clearCompleted"
      >
        Effacer terminés
      </button>
    </div>
  </div>
</template>

<style scoped>
.file-uploader {
  @apply space-y-4;
}

.file-uploader__list {
  @apply space-y-2;
}

.file-uploader__item {
  @apply flex items-center gap-4 p-3 bg-gray-50 rounded-lg;
}

.file-uploader__item--success {
  @apply bg-green-50;
}

.file-uploader__item--error {
  @apply bg-red-50;
}

.file-uploader__preview {
  @apply w-12 h-12 rounded overflow-hidden flex-shrink-0;
}

.file-uploader__preview img {
  @apply w-full h-full object-cover;
}

.file-uploader__icon {
  @apply w-12 h-12 flex items-center justify-center bg-gray-200 rounded flex-shrink-0;
}

.file-uploader__icon svg {
  @apply w-6 h-6 text-gray-500;
}

.file-uploader__info {
  @apply flex-1 min-w-0;
}

.file-uploader__name {
  @apply text-sm font-medium text-gray-900 truncate;
}

.file-uploader__size {
  @apply text-xs text-gray-500;
}

.file-uploader__progress {
  @apply mt-2 h-1 bg-gray-200 rounded-full overflow-hidden;
}

.file-uploader__progress-bar {
  @apply h-full bg-primary-500 transition-all duration-200;
}

.file-uploader__error {
  @apply text-xs text-red-600 mt-1;
}

.file-uploader__status {
  @apply flex-shrink-0;
}

.file-uploader__status svg {
  @apply w-5 h-5;
}

.file-uploader__remove {
  @apply p-1 hover:bg-gray-200 rounded;
}

.file-uploader__remove svg {
  @apply w-4 h-4 text-gray-500;
}

.file-uploader__actions {
  @apply flex gap-2;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium text-sm transition-colors;
}

.btn--primary {
  @apply bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50;
}

.btn--secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}
</style>
