<script setup lang="ts">
interface Props {
  modelValue: string | number
  value: string | number
  label?: string
  name: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const handleChange = () => {
  emit('update:modelValue', props.value)
}
</script>

<template>
  <div class="flex items-center">
    <input
      type="radio"
      :name="props.name"
      :value="props.value"
      :checked="props.modelValue === props.value"
      :disabled="props.disabled"
      :class="[
        'h-4 w-4 border-gray-300 text-orange-primary',
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




