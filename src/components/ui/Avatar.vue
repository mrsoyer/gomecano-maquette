<script setup lang="ts">
interface Props {
  src?: string
  alt?: string
  initials?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  alt: 'Avatar',
})

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}
</script>

<template>
  <div
    :class="[
      'inline-flex items-center justify-center rounded-full overflow-hidden',
      'bg-gray-200 text-gray-600 font-medium',
      sizeClasses[props.size]
    ]"
  >
    <img
      v-if="props.src"
      :src="props.src"
      :alt="props.alt"
      class="h-full w-full object-cover"
    />
    <span v-else-if="props.initials">
      {{ props.initials }}
    </span>
    <svg v-else class="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
    </svg>
  </div>
</template>




