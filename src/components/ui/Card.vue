<script setup lang="ts">
interface Props {
  hover?: boolean
  padding?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hover: false,
  padding: true,
})
</script>

<template>
  <div
    :class="[
      'card',
      { 'hover:shadow-lg transition-shadow cursor-pointer': props.hover },
      { 'p-0': !props.padding }
    ]"
  >
    <div v-if="$slots.header" class="border-b border-gray-200 pb-4 mb-4">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="border-t border-gray-200 pt-4 mt-4">
      <slot name="footer" />
    </div>
  </div>
</template>




