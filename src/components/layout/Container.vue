<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'xl',
  padding: true,
})

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
}
</script>

<template>
  <div
    :class="[
      'mx-auto',
      sizeClasses[props.size],
      { 'px-4 sm:px-6 lg:px-8': props.padding }
    ]"
  >
    <slot />
  </div>
</template>




