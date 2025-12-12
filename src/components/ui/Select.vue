<script setup lang="ts">
interface Option {
  value: string | number
  label: string
}

interface Props {
  modelValue: string | number
  options: Option[]
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full">
    <label v-if="props.label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ props.label }}
      <span v-if="props.required" class="text-red-500">*</span>
    </label>
    <select
      :value="props.modelValue"
      :disabled="props.disabled"
      :required="props.required"
      :class="[
        'input-base',
        { 'border-red-500 focus:ring-red-500': props.error },
        { 'opacity-50 cursor-not-allowed': props.disabled }
      ]"
      @change="handleChange"
    >
      <option value="" disabled>{{ props.placeholder || 'Sélectionnez une option' }}</option>
      <option v-for="option in props.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <p v-if="props.error" class="mt-1 text-sm text-red-500">
      {{ props.error }}
    </p>
  </div>
</template>




