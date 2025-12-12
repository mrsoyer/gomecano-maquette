import { watch, onMounted, type Ref } from 'vue'

/**
 * Auto-save composable with debounced localStorage persistence
 * 
 * Features:
 * - Automatic save to localStorage on data changes (debounced)
 * - Automatic load from localStorage on mount
 * - Manual save/load/clear methods
 * 
 * @param key - localStorage key
 * @param data - Reactive ref to auto-save
 * @param debounceMs - Debounce delay in milliseconds (default: 1000ms)
 * 
 * @example
 * ```vue
 * <script setup>
 * const userForm = ref({ name: '', email: '' })
 * const { clear } = useAutoSave('booking_userForm', userForm, 1000)
 * 
 * // Auto-saves to localStorage every time userForm changes (debounced 1s)
 * // Auto-loads from localStorage on component mount
 * </script>
 * ```
 */
export function useAutoSave<T>(
  key: string,
  data: Ref<T>,
  debounceMs: number = 1000
) {
  let timeoutId: NodeJS.Timeout | null = null
  
  /**
   * Save data to localStorage
   */
  function save(): void {
    try {
      localStorage.setItem(key, JSON.stringify(data.value))
      console.log(`[Auto-save] Saved: ${key}`)
    } catch (error) {
      console.error(`[Auto-save] Error saving ${key}:`, error)
    }
  }
  
  /**
   * Load data from localStorage
   * 
   * @returns true if data was loaded, false otherwise
   */
  function load(): boolean {
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        data.value = JSON.parse(saved)
        console.log(`[Auto-save] Loaded: ${key}`)
        return true
      }
    } catch (error) {
      console.error(`[Auto-save] Error loading ${key}:`, error)
    }
    return false
  }
  
  /**
   * Clear data from localStorage
   */
  function clear(): void {
    try {
      localStorage.removeItem(key)
      console.log(`[Auto-save] Cleared: ${key}`)
    } catch (error) {
      console.error(`[Auto-save] Error clearing ${key}:`, error)
    }
  }
  
  /**
   * Check if data exists in localStorage
   */
  function has(): boolean {
    return localStorage.getItem(key) !== null
  }
  
  // Watch for changes and debounce save
  watch(data, () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(save, debounceMs)
  }, { deep: true })
  
  // Load on mount
  onMounted(() => {
    load()
  })
  
  return { 
    save,    // Manual save
    load,    // Manual load
    clear,   // Clear localStorage
    has      // Check if exists
  }
}
