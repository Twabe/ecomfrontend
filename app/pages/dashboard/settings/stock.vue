<template>
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('stockSettings.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">{{ $t('stockSettings.description') }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="card p-8 text-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
      <p class="text-gray-500 dark:text-gray-400 mt-4">{{ $t('common.loading') }}...</p>
    </div>

    <!-- Settings Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Stock Deduction Card -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ArrowTrendingDownIcon class="w-5 h-5 text-red-500" />
          {{ $t('stockSettings.deduction') }}
        </h2>

        <!-- Stock Deduction Timing -->
        <div class="py-4 border-b border-gray-200 dark:border-gray-700">
          <label class="label">{{ $t('stockSettings.deductionTiming') }}</label>
          <select v-model="formData.stockDeductionTiming" class="input mt-1">
            <option value="on_confirm">{{ $t('stockSettings.onConfirm') }}</option>
            <option value="on_delivery_note">{{ $t('stockSettings.onDeliveryNote') }}</option>
            <option value="manual">{{ $t('stockSettings.manual') }}</option>
          </select>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {{ getDeductionTimingDescription(formData.stockDeductionTiming) }}
          </p>
        </div>

        <!-- Block on Insufficient Stock Toggle -->
        <SettingsToggle
          v-model="formData.blockConfirmOnInsufficientStock"
          :label="$t('stockSettings.blockOnInsufficient')"
          :description="$t('stockSettings.blockOnInsufficientDescription')"
          show-border
        />

        <!-- Show Stock Warning Toggle -->
        <SettingsToggle
          v-model="formData.showStockWarningOnOrder"
          :label="$t('stockSettings.showWarning')"
          :description="$t('stockSettings.showWarningDescription')"
          show-border
        />

        <!-- Low Stock Threshold -->
        <div class="py-4">
          <label class="label">{{ $t('stockSettings.lowStockThreshold') }}</label>
          <input
            v-model.number="formData.lowStockThreshold"
            type="number"
            min="0"
            class="input mt-1 w-32"
            placeholder="10"
          />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ $t('stockSettings.lowStockThresholdDescription') }}</p>
        </div>
      </div>

      <!-- Stock Restoration Card -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ArrowPathIcon class="w-5 h-5 text-green-500" />
          {{ $t('stockSettings.restoration') }}
        </h2>

        <!-- Restoration on Cancel -->
        <div class="py-4 border-b border-gray-200 dark:border-gray-700">
          <label class="label">{{ $t('stockSettings.restorationOnCancel') }}</label>
          <select v-model="formData.stockRestorationOnCancel" class="input mt-1">
            <option value="auto">{{ $t('stockSettings.auto') }}</option>
            <option value="ask">{{ $t('stockSettings.ask') }}</option>
            <option value="never">{{ $t('stockSettings.never') }}</option>
          </select>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {{ getRestorationDescription(formData.stockRestorationOnCancel) }}
          </p>
        </div>

        <!-- Restoration on Return -->
        <div class="py-4">
          <label class="label">{{ $t('stockSettings.restorationOnReturn') }}</label>
          <select v-model="formData.stockRestorationOnReturn" class="input mt-1">
            <option value="auto">{{ $t('stockSettings.auto') }}</option>
            <option value="ask">{{ $t('stockSettings.ask') }}</option>
            <option value="never">{{ $t('stockSettings.never') }}</option>
          </select>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {{ getRestorationDescription(formData.stockRestorationOnReturn) }}
          </p>
        </div>
      </div>

      <!-- Cancel Restrictions Card -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <XCircleIcon class="w-5 h-5 text-orange-500" />
          {{ $t('stockSettings.cancelRestrictions') }}
        </h2>

        <!-- Allow Cancel from Delivered -->
        <SettingsToggle
          v-model="formData.allowCancelFromDelivered"
          :label="$t('stockSettings.allowCancelFromDelivered')"
          :description="$t('stockSettings.allowCancelFromDeliveredDescription')"
          show-border
        />

        <!-- Allow Cancel from Returned -->
        <SettingsToggle
          v-model="formData.allowCancelFromReturned"
          :label="$t('stockSettings.allowCancelFromReturned')"
          :description="$t('stockSettings.allowCancelFromReturnedDescription')"
        />
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end gap-3">
        <button type="button" class="btn-secondary" @click="resetForm">
          {{ $t('common.cancel') }}
        </button>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="flex items-center gap-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {{ $t('common.saving') }}...
          </span>
          <span v-else>{{ $t('common.save') }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'
import { useStockSettingsService, type StockSettingsDto } from '~/services'

type DeductionTiming = 'on_confirm' | 'on_delivery_note' | 'manual'
type RestorationOption = 'auto' | 'ask' | 'never'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.StockSettings.View'
})

const { t } = useI18n()
const { settings, isLoading, update, isUpdating } = useStockSettingsService()

// Form state
const formData = ref({
  id: '',
  stockDeductionTiming: 'on_confirm' as DeductionTiming,
  stockRestorationOnCancel: 'auto' as RestorationOption,
  stockRestorationOnReturn: 'auto' as RestorationOption,
  allowCancelFromDelivered: true,
  allowCancelFromReturned: true,
  blockConfirmOnInsufficientStock: true,
  showStockWarningOnOrder: true,
  lowStockThreshold: 10
})

// Deduction timing descriptions
const getDeductionTimingDescription = (timing: DeductionTiming): string => {
  const descriptions: Record<DeductionTiming, string> = {
    on_confirm: t('stockSettings.onConfirmDescription'),
    on_delivery_note: t('stockSettings.onDeliveryNoteDescription'),
    manual: t('stockSettings.manualDescription')
  }
  return descriptions[timing] || ''
}

// Restoration descriptions
const getRestorationDescription = (option: RestorationOption): string => {
  const descriptions: Record<RestorationOption, string> = {
    auto: t('stockSettings.autoDescription'),
    ask: t('stockSettings.askDescription'),
    never: t('stockSettings.neverDescription')
  }
  return descriptions[option] || ''
}

// Sync form with settings when loaded
const syncFormWithSettings = () => {
  if (settings.value) {
    formData.value = {
      id: settings.value.id,
      stockDeductionTiming: settings.value.stockDeductionTiming ?? 'on_confirm',
      stockRestorationOnCancel: settings.value.stockRestorationOnCancel ?? 'auto',
      stockRestorationOnReturn: settings.value.stockRestorationOnReturn ?? 'auto',
      allowCancelFromDelivered: settings.value.allowCancelFromDelivered ?? true,
      allowCancelFromReturned: settings.value.allowCancelFromReturned ?? true,
      blockConfirmOnInsufficientStock: settings.value.blockConfirmOnInsufficientStock ?? true,
      showStockWarningOnOrder: settings.value.showStockWarningOnOrder ?? true,
      lowStockThreshold: settings.value.lowStockThreshold ?? 10
    }
  }
}

// Watch for settings changes
watch(settings, syncFormWithSettings, { immediate: true })

// Reset form to original values
const resetForm = () => {
  syncFormWithSettings()
}

// Submit form
const handleSubmit = async () => {
  try {
    await update(formData.value)
  } catch {
    // Error handled by service
  }
}

// Alias for template compatibility
const isSubmitting = isUpdating
</script>
