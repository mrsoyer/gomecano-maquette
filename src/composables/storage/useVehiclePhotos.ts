import { ref } from 'vue'
import { useStorage } from './useStorage'
import { useAuth } from '@/composables/useAuth'
import type { UploadResult, FileInfo } from '@/types/storage.types'

export type VehiclePhotoType = 'main' | 'front' | 'back' | 'left' | 'right' | 'interior' | 'other'

export interface VehiclePhoto {
  type: VehiclePhotoType
  url: string
  path: string
}

/**
 * Composable for vehicle photos management
 *
 * @param vehicleId - The vehicle ID to manage photos for
 */
export function useVehiclePhotos(vehicleId: string) {
  const { upload, remove, list, getTransformedUrl, uploading, error } = useStorage()
  const { user } = useAuth()

  const photos = ref<VehiclePhoto[]>([])
  const loading = ref(false)

  /**
   * Base path for vehicle photos
   */
  function getBasePath(): string {
    return `${user.value?.id}/${vehicleId}`
  }

  /**
   * Uploads a vehicle photo
   */
  async function uploadPhoto(
    file: File,
    type: VehiclePhotoType = 'other'
  ): Promise<UploadResult> {
    if (!user.value?.id) {
      return { success: false, error: 'Utilisateur non connecté' }
    }

    const ext = file.name.split('.').pop()
    const timestamp = type === 'other' ? `-${Date.now()}` : ''
    const path = `${getBasePath()}/${type}${timestamp}.${ext}`

    const result = await upload({
      bucket: 'vehicles',
      path,
      file,
      upsert: type !== 'other' // Upsert for fixed types
    })

    if (result.success) {
      await loadPhotos()
    }

    return result
  }

  /**
   * Removes a photo
   */
  async function removePhoto(path: string): Promise<boolean> {
    const success = await remove('vehicles', path)

    if (success) {
      photos.value = photos.value.filter(p => p.path !== path)
    }

    return success
  }

  /**
   * Loads all photos for the vehicle
   */
  async function loadPhotos(): Promise<void> {
    if (!user.value?.id) return

    loading.value = true

    try {
      const files = await list({
        bucket: 'vehicles',
        folder: getBasePath()
      })

      photos.value = files.map(file => {
        const type = extractPhotoType(file.name)
        return {
          type,
          path: file.path,
          url: getTransformedUrl('vehicles', file.path, {
            width: 800,
            format: 'webp'
          })
        }
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Extracts photo type from filename
   */
  function extractPhotoType(filename: string): VehiclePhotoType {
    const types: VehiclePhotoType[] = ['main', 'front', 'back', 'left', 'right', 'interior']

    for (const type of types) {
      if (filename.startsWith(type)) {
        return type
      }
    }

    return 'other'
  }

  /**
   * Gets the main photo
   */
  function getMainPhoto(): VehiclePhoto | undefined {
    return photos.value.find(p => p.type === 'main')
  }

  /**
   * Gets the main photo URL with transformation
   */
  function getMainPhotoUrl(size: 'thumbnail' | 'medium' | 'large' = 'medium'): string | null {
    const main = getMainPhoto()
    if (!main) return null

    const sizes = {
      thumbnail: { width: 150, height: 100 },
      medium: { width: 400, height: 267 },
      large: { width: 800, height: 533 }
    }

    return getTransformedUrl('vehicles', main.path, {
      ...sizes[size],
      resize: 'cover',
      format: 'webp'
    })
  }

  return {
    // State
    photos,
    loading,
    uploading,
    error,

    // Methods
    uploadPhoto,
    removePhoto,
    loadPhotos,
    getMainPhoto,
    getMainPhotoUrl
  }
}
