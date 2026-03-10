export type BucketName =
  | 'avatars'
  | 'vehicles'
  | 'documents'
  | 'invoices'
  | 'certifications'
  | 'intervention-photos'
  | 'blog'
  | 'assets'

export interface UploadOptions {
  bucket: BucketName
  path: string
  file: File
  onProgress?: (progress: number) => void
  upsert?: boolean
}

export interface UploadResult {
  success: boolean
  path?: string
  publicUrl?: string
  error?: string
}

export interface FileInfo {
  name: string
  path: string
  size: number
  mimeType: string
  publicUrl?: string
  signedUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface StorageError {
  message: string
  code?: string
}

export interface DownloadOptions {
  bucket: BucketName
  path: string
  expiresIn?: number // seconds for signed URL
}

export interface ListOptions {
  bucket: BucketName
  folder: string
  limit?: number
  offset?: number
}

export interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'origin' | 'webp'
  resize?: 'cover' | 'contain' | 'fill'
}

export type DocumentType = 'invoice' | 'quote' | 'insurance' | 'registration' | 'maintenance' | 'other'

export interface UserDocument {
  path: string
  displayName: string
  type: DocumentType
  size: number
  mimeType: string
  createdAt: Date
  url?: string
}

export interface GalleryImage {
  url: string
  thumbnail?: string
  alt?: string
  path?: string
}

export interface BucketConfig {
  public: boolean
  maxSize: number
  allowedTypes: string[]
}

export const BUCKET_CONFIG: Record<BucketName, BucketConfig> = {
  avatars: {
    public: true,
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  },
  vehicles: {
    public: true,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  documents: {
    public: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
  invoices: {
    public: false,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf']
  },
  certifications: {
    public: false,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
  'intervention-photos': {
    public: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  blog: {
    public: true,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  },
  assets: {
    public: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
  }
}
