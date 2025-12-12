import { ref } from 'vue'

/**
 * Composable to manage cart drawer state
 * Used for desktop cart panel that slides from the right
 * 
 * @returns Cart drawer state and methods
 */
export function useCartDrawer() {
  /**
   * Drawer open/closed state
   */
  const isDrawerOpen = ref(false)

  /**
   * Open drawer
   */
  function openDrawer() {
    isDrawerOpen.value = true
  }

  /**
   * Close drawer
   */
  function closeDrawer() {
    isDrawerOpen.value = false
  }

  /**
   * Toggle drawer
   */
  function toggleDrawer() {
    isDrawerOpen.value = !isDrawerOpen.value
  }

  return {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer
  }
}
