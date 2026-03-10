<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'white'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'primary',
})

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
}

const variantClasses = {
  primary: 'border-orange-primary border-t-transparent',
  white: 'border-white border-t-transparent',
}
</script>

<template>
  <div class="flex items-center justify-center">
    <div
      :class="[
        'rounded-full animate-spin',
        sizeClasses[props.size],
        variantClasses[props.variant]
      ]"
    />
  </div>
</template>




