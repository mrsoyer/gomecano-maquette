<script setup lang="ts">
import { useBreadcrumbs } from '@/composables/useBreadcrumbs'

/**
 * Get breadcrumbs from composable
 */
const { breadcrumbs } = useBreadcrumbs()
</script>

<template>
  <nav v-if="breadcrumbs.length > 1" class="mb-2 md:mb-3 overflow-x-auto scrollbar-hide">
    <ol class="flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap">
      <li
        v-for="(crumb, index) in breadcrumbs"
        :key="crumb.path"
        class="flex items-center gap-1 md:gap-2 flex-shrink-0"
      >
        <!-- Breadcrumb link (all except last) -->
        <router-link
          v-if="index < breadcrumbs.length - 1"
          :to="crumb.path"
          class="text-orange-primary hover:text-orange-hover font-medium transition-colors max-w-[100px] md:max-w-none truncate"
        >
          {{ crumb.label }}
        </router-link>

        <!-- Current page (last item) -->
        <span
          v-else
          class="text-gray-600 font-medium max-w-[150px] md:max-w-none truncate"
        >
          {{ crumb.label }}
        </span>

        <!-- Separator (not after last item) -->
        <svg
          v-if="index < breadcrumbs.length - 1"
          class="w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
/* Hide scrollbar but keep scroll functionality */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>
