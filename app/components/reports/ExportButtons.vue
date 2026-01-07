<script setup lang="ts">
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

interface Props {
  isExporting?: boolean
}

interface Emits {
  (e: 'exportPdf'): void
  (e: 'exportExcel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

onClickOutside(dropdownRef, () => {
  isOpen.value = false
})

const handleExportPdf = () => {
  emit('exportPdf')
  isOpen.value = false
}

const handleExportExcel = () => {
  emit('exportExcel')
  isOpen.value = false
}
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      type="button"
      :disabled="isExporting"
      class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      @click="isOpen = !isOpen"
    >
      <ArrowDownTrayIcon v-if="!isExporting" class="h-5 w-5" />
      <svg
        v-else
        class="h-5 w-5 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {{ t('reports.export') }}
    </button>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700"
      >
        <div class="py-1">
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            @click="handleExportPdf"
          >
            <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM8.5 13h1a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5zm3 0h1.5a1.5 1.5 0 0 1 0 3H12v1a.5.5 0 0 1-1 0v-3.5a.5.5 0 0 1 .5-.5zm4.5 0h2a.5.5 0 0 1 0 1h-1.5v1h1a.5.5 0 0 1 0 1h-1v1.5a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5z"/>
            </svg>
            {{ t('reports.exportPdf') }}
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            @click="handleExportExcel"
          >
            <svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM8 13h2v2H8v-2zm0 4h2v2H8v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
            </svg>
            {{ t('reports.exportExcel') }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
