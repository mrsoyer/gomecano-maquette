/**
 * Video Inspection Mock Data
 */

import type { VideoInspection } from '@/types/video'

export const mockVideoInspections: VideoInspection[] = [
  {
    id: 'video-1',
    interventionId: 'int-1',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://via.placeholder.com/640x360/2f6883/ffffff?text=Video+Inspection',
    duration: 180,
    recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    mechanicComments: 'Inspection visuelle des freins. Plaquettes à 40% d\'usure. Recommandation de remplacement dans 3 mois.',
    userApproval: 'pending'
  }
]

export async function getVideoInspection(interventionId: string): Promise<VideoInspection | null> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockVideoInspections.find(v => v.interventionId === interventionId) || null
}

export async function approveVideo(videoId: string, status: 'approved' | 'declined'): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 400))
  const video = mockVideoInspections.find(v => v.id === videoId)
  if (video) {
    video.userApproval = status
    video.approvedAt = new Date().toISOString()
  }
}
