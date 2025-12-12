import { ref } from 'vue'
import { useCartStore } from '@/stores/cart.store'
import type { SavedBookingData, BookingUserInfo } from '@/types/booking'

/**
 * Save for later composable - Send email with resume link
 * 
 * Features:
 * - Generate unique token for saved booking
 * - Save booking data to localStorage
 * - Simulate email sending (in production: real email via API)
 * - Resume booking from token
 * 
 * @returns Methods and state for save-for-later functionality
 * 
 * @example
 * ```vue
 * <script setup>
 * const { saveAndSendEmail, isLoading, error } = useSaveForLater()
 * 
 * async function handleSave() {
 *   await saveAndSendEmail('user@example.com', userInfo)
 * }
 * </script>
 * ```
 */
export function useSaveForLater() {
  const cartStore = useCartStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastSavedToken = ref<string | null>(null)
  
  /**
   * Save booking and send email with resume link
   * 
   * @param email - User email to send the link
   * @param userInfo - Optional partial user info already filled
   * @returns Generated token
   */
  async function saveAndSendEmail(
    email: string, 
    userInfo?: Partial<BookingUserInfo>
  ): Promise<string | null> {
    isLoading.value = true
    error.value = null
    
    try {
      // Validate email
      if (!email || !email.includes('@')) {
        throw new Error('Email invalide')
      }
      
      // Validate required booking data
      if (!cartStore.services || cartStore.services.length === 0) {
        throw new Error('Aucun service sélectionné')
      }
      
      if (!cartStore.location) {
        throw new Error('Adresse d\'intervention manquante')
      }
      
      if (!cartStore.collectDateTime) {
        throw new Error('Créneaux horaires manquants')
      }
      
      // Generate unique token
      const token = generateToken()
      
      // Create saved booking data
      const savedData: SavedBookingData = {
        token,
        email,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 7 days
        services: cartStore.services,
        location: cartStore.location,
        collectDateTime: cartStore.collectDateTime,
        userInfo: userInfo || {}
      }
      
      // Save to localStorage (persistent with token)
      localStorage.setItem(`booking_${token}`, JSON.stringify(savedData))
      
      // In production: Send email via API
      // await supabase.functions.invoke('send-booking-resume-email', {
      //   body: { email, token, savedData }
      // })
      
      // For maquette: Simulate email sending
      console.log('═══════════════════════════════════════════════')
      console.log('📧 EMAIL SIMULÉ - Continuer plus tard')
      console.log('═══════════════════════════════════════════════')
      console.log('Destinataire:', email)
      console.log('Lien de reprise:', `${window.location.origin}/confirmation?token=${token}`)
      console.log('Services:', savedData.services.map(s => s.name).join(', '))
      console.log('Total:', cartStore.total, '€')
      console.log('Expire le:', new Date(savedData.expiresAt).toLocaleDateString('fr-FR'))
      console.log('═══════════════════════════════════════════════')
      
      lastSavedToken.value = token
      
      return token
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      console.error('[Save for later] Error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Load saved booking from token (from URL param or localStorage)
   * 
   * @param token - Unique booking token
   * @returns Saved booking data or null if not found/expired
   */
  function loadFromToken(token: string): SavedBookingData | null {
    try {
      const saved = localStorage.getItem(`booking_${token}`)
      if (!saved) {
        error.value = 'Réservation non trouvée ou expirée'
        return null
      }
      
      const data: SavedBookingData = JSON.parse(saved)
      
      // Check if expired
      const expiresAt = new Date(data.expiresAt)
      if (expiresAt < new Date()) {
        error.value = 'Le lien a expiré (validité: 7 jours)'
        localStorage.removeItem(`booking_${token}`)
        return null
      }
      
      console.log('[Save for later] Loaded booking from token:', token)
      return data
    } catch (err) {
      error.value = 'Erreur lors du chargement de la réservation'
      console.error('[Save for later] Load error:', err)
      return null
    }
  }
  
  /**
   * Generate unique token for saved booking
   * 
   * @returns Unique token string
   */
  function generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
  }
  
  return { 
    saveAndSendEmail, 
    loadFromToken,
    isLoading, 
    error,
    lastSavedToken
  }
}
