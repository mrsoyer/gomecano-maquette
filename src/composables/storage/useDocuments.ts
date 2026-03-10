import { ref } from 'vue'
import { useStorage } from './useStorage'
import { useAuth } from '@/composables/useAuth'
import type { UploadResult, DocumentType, UserDocument } from '@/types/storage.types'

/**
 * Composable for private documents management
 */
export function useDocuments() {
  const { upload, download, downloadBlob, remove, list, uploading, downloading, error } = useStorage()
  const { user } = useAuth()

  const documents = ref<UserDocument[]>([])
  const loading = ref(false)

  /**
   * Uploads a document
   */
  async function uploadDocument(
    file: File,
    type: DocumentType,
    customName?: string
  ): Promise<UploadResult> {
    if (!user.value?.id) {
      return { success: false, error: 'Utilisateur non connecté' }
    }

    const ext = file.name.split('.').pop()
    const name = customName || file.name.replace(`.${ext}`, '')
    const timestamp = Date.now()
    const path = `${user.value.id}/${type}/${name}-${timestamp}.${ext}`

    const result = await upload({
      bucket: 'documents',
      path,
      file
    })

    if (result.success) {
      await loadDocuments()
    }

    return result
  }

  /**
   * Gets document URL (returns signed URL)
   */
  async function getDocumentUrl(path: string, expiresIn = 3600): Promise<string | null> {
    const url = await download({
      bucket: 'documents',
      path,
      expiresIn
    })

    return typeof url === 'string' ? url : null
  }

  /**
   * Downloads a document as file
   */
  async function downloadDocument(path: string, filename: string): Promise<void> {
    const blob = await downloadBlob('documents', path)

    if (blob) {
      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  /**
   * Removes a document
   */
  async function removeDocument(path: string): Promise<boolean> {
    const success = await remove('documents', path)

    if (success) {
      documents.value = documents.value.filter(d => d.path !== path)
    }

    return success
  }

  /**
   * Loads all user documents
   */
  async function loadDocuments(type?: DocumentType): Promise<void> {
    if (!user.value?.id) return

    loading.value = true

    try {
      const folder = type ? `${user.value.id}/${type}` : user.value.id
      const files = await list({
        bucket: 'documents',
        folder
      })

      documents.value = files.map(file => ({
        ...file,
        type: extractDocumentType(file.path),
        displayName: extractDisplayName(file.name)
      }))
    } finally {
      loading.value = false
    }
  }

  /**
   * Extracts document type from path
   */
  function extractDocumentType(path: string): DocumentType {
    const types: DocumentType[] = ['invoice', 'quote', 'insurance', 'registration', 'maintenance']

    for (const type of types) {
      if (path.includes(`/${type}/`)) {
        return type
      }
    }

    return 'other'
  }

  /**
   * Extracts display name from filename
   */
  function extractDisplayName(filename: string): string {
    // Remove timestamp and extension
    return filename.replace(/-\d+\.\w+$/, '').replace(/\.\w+$/, '')
  }

  /**
   * Filters documents by type
   */
  function getDocumentsByType(type: DocumentType): UserDocument[] {
    return documents.value.filter(d => d.type === type)
  }

  return {
    // State
    documents,
    loading,
    uploading,
    downloading,
    error,

    // Methods
    uploadDocument,
    getDocumentUrl,
    downloadDocument,
    removeDocument,
    loadDocuments,
    getDocumentsByType
  }
}
