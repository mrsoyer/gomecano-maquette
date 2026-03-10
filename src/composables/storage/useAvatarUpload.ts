import { ref, computed } from 'vue'
import { useStorage } from './useStorage'
import { useAuth } from '@/composables/useAuth'
import type { UploadResult } from '@/types/storage.types'

/**
 * Specialized composable for avatar management
 */
export function useAvatarUpload() {
  const { upload, remove, list, getTransformedUrl, uploading, error } = useStorage()
  const { user } = useAuth()

  const avatarUrl = ref<string | null>(null)

  /**
   * Avatar path for current user
   */
  const avatarPath = computed(() => {
    if (!user.value?.id) return null
    return `${user.value.id}/avatar`
  })

  /**
   * Uploads a new avatar
   */
  async function uploadAvatar(file: File): Promise<UploadResult> {
    if (!user.value?.id) {
      return { success: false, error: 'Utilisateur non connecté' }
    }

    // Generate unique name with extension
    const ext = file.name.split('.').pop()
    const path = `${user.value.id}/avatar.${ext}`

    const result = await upload({
      bucket: 'avatars',
      path,
      file,
      upsert: true
    })

    if (result.success && result.publicUrl) {
      avatarUrl.value = result.publicUrl
    }

    return result
  }

  /**
   * Removes current avatar
   */
  async function removeAvatar(): Promise<boolean> {
    if (!user.value?.id) return false

    // List files in user's avatar folder
    const files = await list({
      bucket: 'avatars',
      folder: user.value.id
    })

    if (files.length === 0) return true

    const paths = files.map(f => f.path)
    const success = await remove('avatars', paths)

    if (success) {
      avatarUrl.value = null
    }

    return success
  }

  /**
   * Gets avatar URL with transformation
   */
  function getAvatarUrl(
    userId: string,
    size: 'small' | 'medium' | 'large' = 'medium'
  ): string {
    const sizes = {
      small: { width: 40, height: 40 },
      medium: { width: 100, height: 100 },
      large: { width: 200, height: 200 }
    }

    return getTransformedUrl('avatars', `${userId}/avatar`, {
      ...sizes[size],
      resize: 'cover',
      format: 'webp'
    })
  }

  /**
   * Loads current user's avatar
   */
  async function loadCurrentAvatar(): Promise<void> {
    if (!user.value?.id) return

    const files = await list({
      bucket: 'avatars',
      folder: user.value.id
    })

    if (files.length > 0) {
      avatarUrl.value = getAvatarUrl(user.value.id)
    }
  }

  return {
    // State
    avatarUrl,
    avatarPath,
    uploading,
    error,

    // Methods
    uploadAvatar,
    removeAvatar,
    getAvatarUrl,
    loadCurrentAvatar
  }
}
