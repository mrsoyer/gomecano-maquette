<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  size?: 'small' | 'medium' | 'large'
  editable?: boolean
  initialUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  editable: true,
  initialUrl: ''
})

const emit = defineEmits<{
  uploaded: [url: string]
  removed: []
  error: [message: string]
}>()

const avatarUrl = ref<string | null>(props.initialUrl || null)
const uploading = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const showMenu = ref(false)

const sizeClasses = {
  small: 'w-12 h-12',
  medium: 'w-24 h-24',
  large: 'w-32 h-32'
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Valider le type
  if (!file.type.startsWith('image/')) {
    emit('error', 'Veuillez sélectionner une image')
    return
  }

  // Valider la taille (2MB)
  if (file.size > 2 * 1024 * 1024) {
    emit('error', 'L\'image ne doit pas dépasser 2MB')
    return
  }

  uploading.value = true

  try {
    // Create local preview
    const previewUrl = URL.createObjectURL(file)
    avatarUrl.value = previewUrl

    // TODO: Replace with actual useAvatarUpload composable when available
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('uploaded', previewUrl)
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Upload failed')
  } finally {
    uploading.value = false
  }

  input.value = ''
  showMenu.value = false
}

async function handleRemove() {
  uploading.value = true

  try {
    // TODO: Replace with actual removeAvatar when composable available
    await new Promise(resolve => setTimeout(resolve, 500))
    avatarUrl.value = null
    emit('removed')
  } catch (err) {
    emit('error', err instanceof Error ? err.message : 'Remove failed')
  } finally {
    uploading.value = false
  }

  showMenu.value = false
}

function openFilePicker() {
  inputRef.value?.click()
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.avatar-uploader__menu') && !target.closest('.avatar-uploader__edit')) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="avatar-uploader" :class="sizeClasses[size]">
    <!-- Avatar Image -->
    <div class="avatar-uploader__image">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        alt="Avatar"
        class="avatar-uploader__img"
      />
      <div v-else class="avatar-uploader__placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>

      <!-- Loading Overlay -->
      <div v-if="uploading" class="avatar-uploader__loading">
        <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    </div>

    <!-- Edit Button -->
    <button
      v-if="editable && !uploading"
      class="avatar-uploader__edit"
      @click.stop="showMenu = !showMenu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Menu -->
    <div v-if="showMenu" class="avatar-uploader__menu">
      <button @click="openFilePicker">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Changer la photo
      </button>
      <button v-if="avatarUrl" class="text-red-600" @click="handleRemove">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Supprimer
      </button>
    </div>

    <!-- Hidden Input -->
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      class="sr-only"
      @change="handleFileChange"
    />
  </div>
</template>

<style scoped>
.avatar-uploader {
  @apply relative;
}

.avatar-uploader__image {
  @apply w-full h-full rounded-full overflow-hidden bg-gray-200;
}

.avatar-uploader__img {
  @apply w-full h-full object-cover;
}

.avatar-uploader__placeholder {
  @apply w-full h-full flex items-center justify-center;
}

.avatar-uploader__placeholder svg {
  @apply w-1/2 h-1/2 text-gray-400;
}

.avatar-uploader__loading {
  @apply absolute inset-0 flex items-center justify-center bg-black/50 rounded-full;
}

.avatar-uploader__loading svg {
  @apply w-6 h-6 text-white;
}

.avatar-uploader__edit {
  @apply absolute bottom-0 right-0 p-1.5 bg-primary-600 text-white rounded-full;
  @apply hover:bg-primary-700 transition-colors;
}

.avatar-uploader__edit svg {
  @apply w-4 h-4;
}

.avatar-uploader__menu {
  @apply absolute top-full left-0 mt-2 py-1 bg-white rounded-lg shadow-lg border z-10;
  @apply min-w-[180px];
}

.avatar-uploader__menu button {
  @apply w-full px-4 py-2 text-sm text-left flex items-center gap-2;
  @apply hover:bg-gray-100 transition-colors;
}

.avatar-uploader__menu svg {
  @apply w-4 h-4;
}
</style>
