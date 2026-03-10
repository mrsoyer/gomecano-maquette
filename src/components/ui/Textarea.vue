<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  rows?: number
  error?: string
  label?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  rows: 4,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full">
    <label v-if="props.label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ props.label }}
      <span v-if="props.required" class="text-red-500">*</span>
    </label>
    <textarea
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :rows="props.rows"
      :required="props.required"
      :class="[
        'input-base resize-none',
        { 'border-red-500 focus:ring-red-500': props.error },
        { 'opacity-50 cursor-not-allowed': props.disabled }
      ]"
      @input="handleInput"
    />
    <p v-if="props.error" class="mt-1 text-sm text-red-500">
      {{ props.error }}
    </p>
  </div>
</template>




