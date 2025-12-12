/**
 * Video Inspection Types
 */

export type VideoApprovalStatus = 'pending' | 'approved' | 'declined'

export interface VideoInspection {
  id: string
  interventionId: string
  videoUrl: string
  thumbnailUrl: string
  duration: number // seconds
  recordedAt: string
  mechanicComments: string
  userApproval?: VideoApprovalStatus
  approvedAt?: string
}

export interface ApprovalRequest {
  videoId: string
  status: VideoApprovalStatus
  userComments?: string
  approvedAt: string
}

