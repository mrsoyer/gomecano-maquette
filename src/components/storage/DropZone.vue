<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  accept?: string
  multiple?: boolean
  maxSize?: number // en bytes
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/*',
  multiple: false,
  maxSize: 10 * 1024 * 1024, // 10MB
  disabled: false
})

const emit = defineEmits<{
  files: [files: File[]]
  error: [message: string]
}>()

const isDragging = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  if (!props.disabled) {
    isDragging.value = true
  }
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  if (props.disabled) return

  const files = event.dataTransfer?.files
  if (files) {
    processFiles(Array.from(files))
  }
}

function handleInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    processFiles(Array.from(input.files))
  }
  // Reset input pour permettre de re-sélectionner le même fichier
  input.value = ''
}

function processFiles(files: File[]) {
  const validFiles: File[] = []

  for (const file of files) {
    // Vérifier la taille
    if (file.size > props.maxSize) {
      emit('error', `${file.name} dépasse la taille maximale (${formatSize(props.maxSize)})`)
      continue
    }

    // Vérifier le type si spécifié
    if (props.accept && props.accept !== '*') {
      const acceptedTypes = props.accept.split(',').map(t => t.trim())
      const isValid = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''))
        }
        return file.type === type || file.name.endsWith(type)
      })

      if (!isValid) {
        emit('error', `${file.name} n'est pas un type de fichier accepté`)
        continue
      }
    }

    validFiles.push(file)

    if (!props.multiple) break
  }

  if (validFiles.length > 0) {
    emit('files', validFiles)
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function openFilePicker() {
  inputRef.value?.click()
}

defineExpose({ openFilePicker })
</script>

<template>
  <div
    class="drop-zone"
    :class="{
      'drop-zone--dragging': isDragging,
      'drop-zone--disabled': disabled
    }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="openFilePicker"
  >
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      class="drop-zone__input"
      @change="handleInputChange"
    />

    <slot>
      <div class="drop-zone__content">
        <svg
          class="drop-zone__icon"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p class="drop-zone__text">
          <span class="drop-zone__text--primary">Cliquez pour sélectionner</span>
          <span class="drop-zone__text--secondary">ou glissez-déposez vos fichiers</span>
        </p>
        <p class="drop-zone__hint">
          {{ accept === '*' ? 'Tous types' : accept }} - Max {{ formatSize(maxSize) }}
        </p>
      </div>
    </slot>
  </div>
</template>

<style scoped>
.drop-zone {
  @apply relative border-2 border-dashed border-gray-300 rounded-lg p-8;
  @apply cursor-pointer transition-colors duration-200;
  @apply hover:border-primary-400 hover:bg-primary-50;
}

.drop-zone--dragging {
  @apply border-primary-500 bg-primary-100;
}

.drop-zone--disabled {
  @apply opacity-50 cursor-not-allowed;
  @apply hover:border-gray-300 hover:bg-transparent;
}

.drop-zone__input {
  @apply sr-only;
}

.drop-zone__content {
  @apply flex flex-col items-center text-center;
}

.drop-zone__icon {
  @apply w-12 h-12 text-gray-400 mb-4;
}

.drop-zone--dragging .drop-zone__icon {
  @apply text-primary-500;
}

.drop-zone__text {
  @apply flex flex-col gap-1;
}

.drop-zone__text--primary {
  @apply text-sm font-medium text-gray-700;
}

.drop-zone__text--secondary {
  @apply text-sm text-gray-500;
}

.drop-zone__hint {
  @apply mt-2 text-xs text-gray-400;
}
</style>
