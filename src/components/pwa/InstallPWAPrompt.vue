<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { usePWA } from '@/composables/usePWA'

const { install, dismissInstallPrompt } = usePWA()

async function handleInstall(): Promise<void> {
  await install()
}
</script>

<template>
  <div class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 animate-slide-up">
    <button
      @click="dismissInstallPrompt"
      class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
    >
      <Icon icon="mdi:close" class="w-5 h-5" />
    </button>

    <div class="flex items-start gap-3">
      <div class="w-12 h-12 rounded-lg bg-blue-primary flex items-center justify-center flex-shrink-0">
        <Icon icon="mdi:download" class="w-6 h-6 text-white" />
      </div>
      
      <div class="flex-1">
        <h3 class="text-base font-bold text-gray-900 mb-1">
          Installer Gomecano
        </h3>
        <p class="text-sm text-gray-600 mb-3">
          Accédez rapidement à vos interventions depuis votre écran d'accueil
        </p>
        
        <button
          @click="handleInstall"
          class="w-full px-4 py-2 bg-blue-primary text-white rounded-lg hover:bg-blue-dark transition-colors font-medium text-sm"
        >
          Installer l'application
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>

