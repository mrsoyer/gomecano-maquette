import { ref, watch, onMounted, onUnmounted, getCurrentInstance } from 'vue'

/**
 * Composable to use localStorage with reactive state
 * Automatically syncs with localStorage changes (cross-component reactivity)
 * Works both in component context and module-level (singleton pattern)
 * 
 * @param key - LocalStorage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns Reactive ref that syncs with localStorage
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  // Detect if we're in a component context
  const instance = getCurrentInstance()
  
  // Flag to prevent recursive updates
  let isUpdating = false

  // Read from localStorage
  function readValue(): T {
    try {
      const storedValue = localStorage.getItem(key)
      return storedValue ? JSON.parse(storedValue) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  }

  // Create reactive ref
  const value = ref<T>(readValue())

  // Watch for changes and update localStorage
  watch(
    value,
    (newValue) => {
      // Prevent recursive updates
      if (isUpdating) return

      try {
        if (newValue === null || newValue === undefined) {
          localStorage.removeItem(key)
        } else {
          localStorage.setItem(key, JSON.stringify(newValue))
        }
        // Dispatch custom event for same-window updates
        window.dispatchEvent(new CustomEvent('local-storage', { 
          detail: { key, value: newValue } 
        }))
      } catch (error) {
        console.warn(`Error writing to localStorage key "${key}":`, error)
      }
    },
    { deep: true }
  )

  // Listen for localStorage changes from same window (cross-component)
  function handleStorageChange(e: Event) {
    const customEvent = e as CustomEvent<{ key: string; value: T }>
    if (customEvent.detail.key === key) {
      // Set flag to prevent recursive updates
      isUpdating = true
      const newValue = readValue()
      
      // Only update if value actually changed (deep comparison)
      if (JSON.stringify(value.value) !== JSON.stringify(newValue)) {
        value.value = newValue
      }
      
      // Reset flag after a tick
      setTimeout(() => {
        isUpdating = false
      }, 0)
    }
  }

  // Listen for changes from other browser tabs
  function handleStorageEvent(e: StorageEvent) {
    if (e.key === key && e.storageArea === localStorage) {
      isUpdating = true
      const newValue = readValue()
      
      // Only update if value actually changed
      if (JSON.stringify(value.value) !== JSON.stringify(newValue)) {
        value.value = newValue
      }
      
      setTimeout(() => {
        isUpdating = false
      }, 0)
    }
  }

  // Setup listeners
  // If in component context: use lifecycle hooks
  // If module-level: attach immediately (won't be cleaned up, but that's OK for singletons)
  if (instance) {
    // In component context - use lifecycle hooks for proper cleanup
    onMounted(() => {
      window.addEventListener('local-storage', handleStorageChange)
      window.addEventListener('storage', handleStorageEvent)
    })

    onUnmounted(() => {
      window.removeEventListener('local-storage', handleStorageChange)
      window.removeEventListener('storage', handleStorageEvent)
    })
  } else {
    // Module-level (singleton) - attach immediately
    // These won't be cleaned up, but that's OK for global singletons
    window.addEventListener('local-storage', handleStorageChange)
    window.addEventListener('storage', handleStorageEvent)
  }

  return value
}

