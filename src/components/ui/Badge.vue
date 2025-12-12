<script setup lang="ts">
interface Props {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'default'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
})

const variantClasses = {
  primary: 'bg-blue-primary/10 text-blue-primary border border-blue-primary/20',
  success: 'bg-green-pale text-green-dark',
  warning: 'bg-orange-light text-orange-dark',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-pale text-blue-dark',
  default: 'bg-gray-100 text-gray-700',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-sm',
      variantClasses[props.variant],
      sizeClasses[props.size]
    ]"
  >
    <slot />
  </span>
</template>

