<template>
  <div
    :class="[
      'flex items-center justify-between py-4',
      showBorder ? 'border-b border-gray-200 dark:border-gray-700' : ''
    ]"
  >
    <div>
      <p class="font-medium text-gray-900 dark:text-white">{{ label }}</p>
      <p v-if="description" class="text-sm text-gray-500 dark:text-gray-400">{{ description }}</p>
    </div>
    <button
      type="button"
      @click="toggle"
      :class="[
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        modelValue ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
      ]"
    >
      <span
        :class="[
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          modelValue ? 'translate-x-5' : 'translate-x-0'
        ]"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  label: string
  description?: string
  showBorder?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>
