<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<template>
  <div class="flex items-center">
    <input
      type="checkbox"
      :checked="props.modelValue"
      :disabled="props.disabled"
      :class="[
        'h-4 w-4 rounded border-gray-300 text-orange-primary',
        'focus:ring-2 focus:ring-orange-primary focus:ring-offset-2',
        { 'opacity-50 cursor-not-allowed': props.disabled }
      ]"
      @change="handleChange"
    />
    <label v-if="props.label" class="ml-2 text-sm text-gray-700">
      {{ props.label }}
    </label>
  </div>
</template>




