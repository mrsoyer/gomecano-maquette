/**
 * Composable to track mouse position with smooth delay
 * Creates a flashlight/spotlight effect following the cursor
 */

import { ref, onMounted, onUnmounted } from 'vue'

export function useMousePosition(smoothness = 0.1) {
  const x = ref(0)
  const y = ref(0)
  const targetX = ref(0)
  const targetY = ref(0)

  let animationFrameId: number

  // Linear interpolation for smooth movement
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor
  }

  // Update target position on mouse move
  const updateMousePosition = (event: MouseEvent) => {
    targetX.value = event.clientX
    targetY.value = event.clientY
  }

  // Animate position with smooth delay
  const animate = () => {
    x.value = lerp(x.value, targetX.value, smoothness)
    y.value = lerp(y.value, targetY.value, smoothness)
    
    animationFrameId = requestAnimationFrame(animate)
  }

  onMounted(() => {
    window.addEventListener('mousemove', updateMousePosition)
    animate()
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', updateMousePosition)
    cancelAnimationFrame(animationFrameId)
  })

  return { x, y }
}






