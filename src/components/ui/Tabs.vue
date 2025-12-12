<script setup lang="ts">
import { ref } from 'vue'

interface Tab {
  id: string
  label: string
}

interface Props {
  tabs: Tab[]
  defaultTab?: string
}

const props = withDefaults(defineProps<Props>(), {})

const activeTab = ref(props.defaultTab || props.tabs[0]?.id)

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId
}
</script>

<template>
  <div>
    <!-- Tab Headers -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in props.tabs"
          :key="tab.id"
          type="button"
          :class="[
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === tab.id
              ? 'border-orange-primary text-orange-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
          @click="setActiveTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>
    
    <!-- Tab Content -->
    <div class="py-4">
      <slot :active-tab="activeTab" />
    </div>
  </div>
</template>




