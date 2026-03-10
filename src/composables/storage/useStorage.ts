import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import type {
  BucketName,
  UploadOptions,
  UploadResult,
  DownloadOptions,
  ListOptions,
  FileInfo,
  ImageTransformOptions
} from '@/types/storage.types'
import { BUCKET_CONFIG } from '@/types/storage.types'

/**
 * Main composable for Supabase Storage management
 */
export function useStorage() {
  const uploading = ref(false)
  const downloading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  /**
   * Validates a file before upload
   */
  function validateFile(file: File, bucket: BucketName): { valid: boolean; error?: string } {
    const config = BUCKET_CONFIG[bucket]

    if (file.size > config.maxSize) {
      return {
        valid: false,
        error: `Fichier trop volumineux. Max: ${config.maxSize / 1024 / 1024}MB`
      }
    }

    if (!config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Type de fichier non autorisé. Types acceptés: ${config.allowedTypes.join(', ')}`
      }
    }

    return { valid: true }
  }

  /**
   * Uploads a file to a bucket
   */
  async function upload(options: UploadOptions): Promise<UploadResult> {
    const { bucket, path, file, onProgress, upsert = false } = options

    // Reset state
    uploading.value = true
    progress.value = 0
    error.value = null

    try {
      // Validation
      const validation = validateFile(file, bucket)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Upload
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL if bucket is public
      let publicUrl: string | undefined
      if (BUCKET_CONFIG[bucket].public) {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(path)
        publicUrl = urlData.publicUrl
      }

      progress.value = 100
      onProgress?.(100)

      return {
        success: true,
        path: data.path,
        publicUrl
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur upload'
      error.value = message
      return { success: false, error: message }
    } finally {
      uploading.value = false
    }
  }

  /**
   * Downloads a file (returns signed URL or blob)
   */
  async function download(options: DownloadOptions): Promise<string | Blob | null> {
    const { bucket, path, expiresIn = 3600 } = options

    downloading.value = true
    error.value = null

    try {
      // For public buckets, return public URL
      if (BUCKET_CONFIG[bucket].public) {
        const { data } = supabase.storage
          .from(bucket)
          .getPublicUrl(path)
        return data.publicUrl
      }

      // For private buckets, create signed URL
      const { data, error: downloadError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn)

      if (downloadError) {
        throw downloadError
      }

      return data.signedUrl
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur téléchargement'
      error.value = message
      return null
    } finally {
      downloading.value = false
    }
  }

  /**
   * Downloads a file as Blob
   */
  async function downloadBlob(bucket: BucketName, path: string): Promise<Blob | null> {
    downloading.value = true
    error.value = null

    try {
      const { data, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(path)

      if (downloadError) {
        throw downloadError
      }

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur téléchargement'
      error.value = message
      return null
    } finally {
      downloading.value = false
    }
  }

  /**
   * Removes a file
   */
  async function remove(bucket: BucketName, paths: string | string[]): Promise<boolean> {
    error.value = null

    try {
      const pathsArray = Array.isArray(paths) ? paths : [paths]

      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove(pathsArray)

      if (deleteError) {
        throw deleteError
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur suppression'
      error.value = message
      return false
    }
  }

  /**
   * Lists files in a folder
   */
  async function list(options: ListOptions): Promise<FileInfo[]> {
    const { bucket, folder, limit = 100, offset = 0 } = options

    error.value = null

    try {
      const { data, error: listError } = await supabase.storage
        .from(bucket)
        .list(folder, { limit, offset })

      if (listError) {
        throw listError
      }

      return (data || []).map(file => ({
        name: file.name,
        path: `${folder}/${file.name}`,
        size: file.metadata?.size || 0,
        mimeType: file.metadata?.mimetype || '',
        createdAt: new Date(file.created_at),
        updatedAt: new Date(file.updated_at)
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur listing'
      error.value = message
      return []
    }
  }

  /**
   * Generates a public URL with image transformations
   */
  function getTransformedUrl(
    bucket: BucketName,
    path: string,
    transform: ImageTransformOptions
  ): string {
    // Cast to satisfy Supabase's stricter TransformOptions type
    const supabaseTransform = {
      width: transform.width,
      height: transform.height,
      quality: transform.quality,
      resize: transform.resize,
      // Supabase only accepts 'origin' for format in its type definition
      ...(transform.format === 'origin' ? { format: 'origin' as const } : {})
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path, { transform: supabaseTransform })

    return data.publicUrl
  }

  /**
   * Copies a file
   */
  async function copy(
    bucket: BucketName,
    fromPath: string,
    toPath: string
  ): Promise<boolean> {
    error.value = null

    try {
      const { error: copyError } = await supabase.storage
        .from(bucket)
        .copy(fromPath, toPath)

      if (copyError) {
        throw copyError
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur copie'
      error.value = message
      return false
    }
  }

  /**
   * Moves a file
   */
  async function move(
    bucket: BucketName,
    fromPath: string,
    toPath: string
  ): Promise<boolean> {
    error.value = null

    try {
      const { error: moveError } = await supabase.storage
        .from(bucket)
        .move(fromPath, toPath)

      if (moveError) {
        throw moveError
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur déplacement'
      error.value = message
      return false
    }
  }

  return {
    // State
    uploading,
    downloading,
    progress,
    error,

    // Methods
    validateFile,
    upload,
    download,
    downloadBlob,
    remove,
    list,
    getTransformedUrl,
    copy,
    move
  }
}
