<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'

const { locale, availableLocales } = useI18n()

const isOpen = ref(false)

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
]

function selectLanguage(code: string): void {
  locale.value = code
  isOpen.value = false
  console.log('[i18n] Language changed to:', code)
}

function getCurrentLanguage() {
  return languages.find(l => l.code === locale.value) || languages[0]
}
</script>

<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <span>{{ getCurrentLanguage().flag }}</span>
      <span class="text-sm font-medium text-gray-700">{{ getCurrentLanguage().code.toUpperCase() }}</span>
      <Icon icon="mdi:chevron-down" class="w-4 h-4 text-gray-600" />
    </button>

    <div
      v-if="isOpen"
      class="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[150px] z-50"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="selectLanguage(lang.code)"
        :class="[
          'w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2',
          locale === lang.code ? 'bg-blue-50 text-blue-primary font-semibold' : 'text-gray-700'
        ]"
      >
        <span>{{ lang.flag }}</span>
        <span>{{ lang.name }}</span>
        <Icon
          v-if="locale === lang.code"
          icon="mdi:check"
          class="w-4 h-4 ml-auto text-blue-primary"
        />
      </button>
    </div>
  </div>
</template>

