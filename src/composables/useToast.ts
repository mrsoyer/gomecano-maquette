import { ref } from 'vue'

/**
 * Toast interface
 */
export interface Toast {
  id: string
  message: string
  variant: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

/**
 * Global toast state (shared across all components)
 */
const toasts = ref<Toast[]>([])

/**
 * Composable to manage toast notifications globally
 * 
 * @returns Toast state and methods
 */
export function useToast() {
  /**
   * Show a toast notification
   * 
   * @param message - Message to display
   * @param variant - Type of toast (success, error, warning, info)
   * @param duration - Duration in ms (0 = no auto-dismiss)
   * @returns Toast ID
   */
  function showToast(
    message: string,
    variant: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 3000
  ): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const toast: Toast = {
      id,
      message,
      variant,
      duration
    }
    
    toasts.value.push(toast)
    
    // Auto-remove after duration (if > 0)
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }

  /**
   * Remove a specific toast
   * 
   * @param id - Toast ID to remove
   */
  function removeToast(id: string): void {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * Clear all toasts
   */
  function clearToasts(): void {
    toasts.value = []
  }

  return {
    toasts,
    showToast,
    removeToast,
    clearToasts
  }
}
