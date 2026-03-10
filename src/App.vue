<script setup lang="ts">
import { onMounted } from 'vue'
import { useCartStore } from '@/stores/cart.store'
import { useToast } from '@/composables/useToast'
import Toast from '@/components/ui/Toast.vue'

const cartStore = useCartStore()
const { toasts, showToast, removeToast } = useToast()

/**
 * Setup Pinia $subscribe for analytics
 */
onMounted(() => {
  // Analytics tracking on cart updates
  cartStore.$subscribe((mutation, state) => {
    console.log('Cart updated:', {
      total: state.total,
      items: state.serviceCount
    })
    
    // Google Analytics (if configured)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cart_updated', {
        cart_value: state.total,
        items_count: state.serviceCount
      })
    }
  })

  // Toast notifications on cart actions
  cartStore.$onAction(({ name, after, onError }) => {
    after(() => {
      if (name === 'addService') {
        showToast('✓ Service ajouté au devis', 'success')
      }
      if (name === 'removeService') {
        showToast('Service retiré du devis', 'info')
      }
      if (name === 'clearCart') {
        showToast('Devis vidé', 'warning')
      }
    })
    
    onError((error) => {
      console.error('Cart action error:', error)
      showToast('Erreur lors de l\'opération', 'error')
    })
  })
})
</script>

<template>
  <div id="app" class="min-h-screen bg-white">
    <RouterView />
    
    <!-- Toast notifications container -->
    <div class="fixed top-4 right-4 z-[10000] space-y-2">
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :message="toast.message"
        :variant="toast.variant"
        :duration="0"
        @close="removeToast(toast.id)"
      />
    </div>
  </div>
</template>

<style>
/* Styles globaux déjà dans main.css */
</style>
