import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable to detect scroll direction and position
 * 
 * @param threshold - Minimum scroll distance before direction changes (default: 100)
 * @returns Scroll direction ('up' | 'down'), isScrolled flag, and scroll position
 */
export function useScrollDirection(threshold = 100) {
  const scrollDirection = ref<'up' | 'down'>('up')
  const isScrolled = ref(false)
  const scrollY = ref(0)
  
  let lastScrollY = 0
  let ticking = false

  /**
   * Handle scroll event with requestAnimationFrame optimization
   */
  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        scrollY.value = currentScrollY
        
        // Determine if scrolled from top
        isScrolled.value = currentScrollY > 20
        
        // Determine scroll direction
        if (currentScrollY > lastScrollY && currentScrollY > threshold) {
          scrollDirection.value = 'down'
        } else if (currentScrollY < lastScrollY) {
          scrollDirection.value = 'up'
        }
        
        lastScrollY = currentScrollY
        ticking = false
      })
      
      ticking = true
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    scrollDirection,
    isScrolled,
    scrollY
  }
}


