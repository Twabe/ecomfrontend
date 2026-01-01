<script setup lang="ts">
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/vue'
import { ChevronUpDownIcon, CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'

interface Option {
  id: string
  name: string
  [key: string]: unknown
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  displayKey?: string
  valueKey?: string
}>(), {
  placeholder: '',
  disabled: false,
  required: false,
  displayKey: 'name',
  valueKey: 'id'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const query = ref('')

const selectedOption = computed(() => {
  return props.options.find(o => o[props.valueKey] === props.modelValue) || null
})

const filteredOptions = computed(() => {
  if (!query.value) return props.options.slice(0, 50) // Show first 50 when no search
  const searchTerm = query.value.toLowerCase().trim()
  return props.options
    .filter(o => {
      const displayValue = String(o[props.displayKey] || '').toLowerCase()
      return displayValue.includes(searchTerm)
    })
    .slice(0, 50) // Limit to 50 results for performance
})

const handleSelect = (option: Option | null) => {
  emit('update:modelValue', option ? String(option[props.valueKey]) : '')
}

const clearSelection = () => {
  emit('update:modelValue', '')
  query.value = ''
}
</script>

<template>
  <Combobox
    :model-value="selectedOption"
    @update:model-value="handleSelect"
    :disabled="disabled"
    nullable
  >
    <div class="relative">
      <div class="relative w-full">
        <ComboboxInput
          class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-16 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          :display-value="(option: Option | null) => option ? String(option[displayKey]) : ''"
          :placeholder="placeholder"
          @change="query = $event.target.value"
          :required="required && !modelValue"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          <button
            v-if="modelValue"
            type="button"
            class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            @click.stop="clearSelection"
          >
            <XMarkIcon class="h-4 w-4" />
          </button>
          <ComboboxButton class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <ChevronUpDownIcon class="h-5 w-5" />
          </ComboboxButton>
        </div>
      </div>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ComboboxOptions
          class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-gray-700"
        >
          <div
            v-if="filteredOptions.length === 0 && query !== ''"
            class="px-4 py-2 text-gray-500 dark:text-gray-400"
          >
            Aucun résultat trouvé
          </div>

          <ComboboxOption
            v-for="option in filteredOptions"
            :key="String(option[valueKey])"
            :value="option"
            v-slot="{ active, selected }"
          >
            <li
              class="relative cursor-pointer select-none py-2 pl-10 pr-4"
              :class="{
                'bg-primary-600 text-white': active,
                'text-gray-900 dark:text-white': !active
              }"
            >
              <span class="block truncate" :class="{ 'font-medium': selected }">
                {{ option[displayKey] }}
              </span>
              <span
                v-if="selected"
                class="absolute inset-y-0 left-0 flex items-center pl-3"
                :class="{ 'text-white': active, 'text-primary-600': !active }"
              >
                <CheckIcon class="h-5 w-5" />
              </span>
            </li>
          </ComboboxOption>
        </ComboboxOptions>
      </transition>
    </div>
  </Combobox>
</template>
