<template>
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('autoAssignment.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">{{ $t('autoAssignment.description') }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="card p-8 text-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
      <p class="text-gray-500 dark:text-gray-400 mt-4">{{ $t('common.loading') }}...</p>
    </div>

    <!-- Settings Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- General Settings Card -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Cog6ToothIcon class="w-5 h-5 text-gray-500" />
          {{ $t('autoAssignment.general') }}
        </h2>

        <!-- Enable Auto-Assignment Toggle -->
        <SettingsToggle
          v-model="formData.isEnabled"
          :label="$t('autoAssignment.enabled')"
          :description="$t('autoAssignment.enabledDescription')"
          show-border
        />

        <!-- Strategy Selector -->
        <div class="py-4 border-b border-gray-200 dark:border-gray-700">
          <label class="label">{{ $t('autoAssignment.strategy') }}</label>
          <select v-model="formData.strategy" class="input mt-1">
            <option value="round_robin">{{ $t('autoAssignment.roundRobin') }}</option>
            <option value="least_loaded">{{ $t('autoAssignment.leastLoaded') }}</option>
            <option value="random">{{ $t('autoAssignment.random') }}</option>
            <option value="priority">{{ $t('autoAssignment.priority') }}</option>
          </select>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {{ getStrategyDescription(formData.strategy) }}
          </p>
        </div>

        <!-- Only Online Workers Toggle -->
        <SettingsToggle
          v-model="formData.onlyOnlineWorkers"
          :label="$t('autoAssignment.onlyOnlineWorkers')"
          :description="$t('autoAssignment.onlyOnlineWorkersDescription')"
          show-border
        />

        <!-- Allow Worker Self-Assign Toggle -->
        <SettingsToggle
          v-model="formData.allowWorkerSelfAssign"
          :label="$t('autoAssignment.allowSelfAssign')"
          :description="$t('autoAssignment.allowSelfAssignDescription')"
          show-border
        />

        <!-- Global Max Orders Per Worker -->
        <div class="py-4 border-b border-gray-200 dark:border-gray-700">
          <label class="label">{{ $t('autoAssignment.globalMaxOrders') }}</label>
          <input
            v-model.number="formData.globalMaxOrdersPerWorker"
            type="number"
            min="0"
            class="input mt-1 w-32"
            placeholder="0"
          />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ $t('autoAssignment.globalMaxOrdersDescription') }}</p>
        </div>

        <!-- Assignment Timeout -->
        <div class="py-4">
          <label class="label">{{ $t('autoAssignment.timeout') }}</label>
          <input
            v-model.number="formData.assignmentTimeoutMinutes"
            type="number"
            min="0"
            class="input mt-1 w-32"
            placeholder="0"
          />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ $t('autoAssignment.timeoutDescription') }}</p>
        </div>
      </div>

      <!-- Confirmation Service Card -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <PhoneIcon class="w-5 h-5 text-green-500" />
          {{ $t('autoAssignment.confirmationService') }}
        </h2>

        <!-- Auto-assign Confirmation Toggle -->
        <SettingsToggle
          v-model="formData.autoAssignConfirmation"
          :label="$t('autoAssignment.autoAssignConfirmation')"
          :description="$t('autoAssignment.autoAssignConfirmationDescription')"
          show-border
        />
      </div>

      <!-- Callback Settings Card -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <PhoneArrowUpRightIcon class="w-5 h-5 text-purple-500" />
          {{ $t('autoAssignment.callbackSettings') }}
        </h2>

        <!-- Max Callback Attempts -->
        <div class="py-4 border-b border-gray-200 dark:border-gray-700">
          <label class="label">{{ $t('autoAssignment.maxCallbackAttempts') }}</label>
          <input
            v-model.number="formData.maxCallbackAttempts"
            type="number"
            min="1"
            max="10"
            class="input mt-1 w-32"
            placeholder="5"
          />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ $t('autoAssignment.maxCallbackAttemptsDescription') }}</p>
        </div>

        <!-- Callback Reminder Minutes -->
        <div class="py-4 border-b border-gray-200 dark:border-gray-700">
          <label class="label">{{ $t('autoAssignment.callbackReminderMinutes') }}</label>
          <input
            v-model.number="formData.callbackReminderMinutes"
            type="number"
            min="0"
            class="input mt-1 w-32"
            placeholder="60"
          />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ $t('autoAssignment.callbackReminderMinutesDescription') }}</p>
        </div>

        <!-- Auto-Cancel Unreachable Toggle -->
        <SettingsToggle
          v-model="formData.autoCancelUnreachable"
          :label="$t('autoAssignment.autoCancelUnreachable')"
          :description="$t('autoAssignment.autoCancelUnreachableDescription')"
        />
      </div>

      <!-- Quality Control Settings Card -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ShieldCheckIcon class="w-5 h-5 text-blue-500" />
          {{ $t('autoAssignment.qualitySettings') }}
        </h2>

        <!-- Enable Quality Check Toggle -->
        <SettingsToggle
          v-model="formData.enableQualityCheck"
          :label="$t('autoAssignment.enableQualityCheck')"
          :description="$t('autoAssignment.enableQualityCheckDescription')"
          show-border
        />

        <!-- Quality-specific settings (only shown when quality is enabled) -->
        <template v-if="formData.enableQualityCheck">
          <!-- Auto-assign Quality Toggle -->
          <SettingsToggle
            v-model="formData.autoAssignQuality"
            :label="$t('autoAssignment.autoAssignQuality')"
            :description="$t('autoAssignment.autoAssignQualityDescription')"
            show-border
          />

          <!-- Quality Pass Threshold -->
          <div class="py-4 border-b border-gray-200 dark:border-gray-700">
            <label class="label">{{ $t('autoAssignment.qualityPassThreshold') }}</label>
            <div class="flex items-center gap-4 mt-1">
              <input
                v-model.number="formData.qualityPassThreshold"
                type="range"
                min="0"
                max="100"
                step="5"
                class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span class="text-lg font-semibold text-primary-600 dark:text-primary-400 min-w-[4rem] text-right">
                {{ formData.qualityPassThreshold }}%
              </span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ $t('autoAssignment.qualityPassThresholdDescription') }}</p>
          </div>

          <!-- Return Rejected to Same Confirmateur Toggle -->
          <SettingsToggle
            v-model="formData.returnRejectedToSameConfirmateur"
            :label="$t('autoAssignment.returnRejectedToSame')"
            :description="$t('autoAssignment.returnRejectedToSameDescription')"
          />
        </template>
      </div>

      <!-- Suivi Settings Card -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TruckIcon class="w-5 h-5 text-orange-500" />
          {{ $t('autoAssignment.suiviSettings') }}
        </h2>

        <!-- Auto-assign Suivi Toggle -->
        <SettingsToggle
          v-model="formData.autoAssignSuivi"
          :label="$t('autoAssignment.autoAssignSuivi')"
          :description="$t('autoAssignment.autoAssignSuiviDescription')"
          show-border
        />

        <!-- Auto-assign Suivi After Confirm Toggle -->
        <SettingsToggle
          v-model="formData.autoAssignSuiviAfterConfirm"
          :label="$t('autoAssignment.autoAssignSuiviAfterConfirm')"
          :description="$t('autoAssignment.autoAssignSuiviAfterConfirmDescription')"
          show-border
        />

        <!-- Suivi to Same Worker Toggle -->
        <SettingsToggle
          v-model="formData.suiviToSameWorker"
          :label="$t('autoAssignment.suiviToSameWorker')"
          :description="$t('autoAssignment.suiviToSameWorkerDescription')"
          show-border
        />

        <!-- Return to Confirmation Mode -->
        <div class="py-4 border-b border-gray-200 dark:border-gray-700">
          <label class="label">{{ $t('autoAssignment.returnToConfirmationMode') }}</label>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">{{ $t('autoAssignment.returnToConfirmationModeDescription') }}</p>
          <div class="space-y-3">
            <!-- Same Worker Option -->
            <label class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" :class="{ 'ring-2 ring-primary-500 border-primary-500': formData.returnToConfirmationMode === 'same_worker' }">
              <input
                v-model="formData.returnToConfirmationMode"
                type="radio"
                value="same_worker"
                class="mt-1"
              />
              <div>
                <span class="font-medium text-gray-900 dark:text-white">{{ $t('autoAssignment.returnToConfirmationSameWorker') }}</span>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('autoAssignment.returnToConfirmationSameWorkerDescription') }}</p>
              </div>
            </label>
            <!-- Open (Queue) Option -->
            <label class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" :class="{ 'ring-2 ring-primary-500 border-primary-500': formData.returnToConfirmationMode === 'open' }">
              <input
                v-model="formData.returnToConfirmationMode"
                type="radio"
                value="open"
                class="mt-1"
              />
              <div>
                <span class="font-medium text-gray-900 dark:text-white">{{ $t('autoAssignment.returnToConfirmationOpen') }}</span>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('autoAssignment.returnToConfirmationOpenDescription') }}</p>
              </div>
            </label>
            <!-- Choose Option -->
            <label class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" :class="{ 'ring-2 ring-primary-500 border-primary-500': formData.returnToConfirmationMode === 'choose' }">
              <input
                v-model="formData.returnToConfirmationMode"
                type="radio"
                value="choose"
                class="mt-1"
              />
              <div>
                <span class="font-medium text-gray-900 dark:text-white">{{ $t('autoAssignment.returnToConfirmationChoose') }}</span>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('autoAssignment.returnToConfirmationChooseDescription') }}</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Default Suivi Priority -->
        <div class="py-4">
          <label class="label">{{ $t('autoAssignment.defaultSuiviPriority') }}</label>
          <div class="flex items-center gap-4 mt-1">
            <input
              v-model.number="formData.defaultSuiviPriority"
              type="range"
              min="1"
              max="10"
              class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span class="text-lg font-semibold text-primary-600 dark:text-primary-400 min-w-[2rem] text-right">
              {{ formData.defaultSuiviPriority }}
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ $t('autoAssignment.defaultSuiviPriorityDescription') }}</p>
        </div>
      </div>

      <!-- Integrations Card -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <LinkIcon class="w-5 h-5 text-gray-500" />
          {{ $t('autoAssignment.integrations') }}
        </h2>

        <!-- Enable WhatsApp Integration Toggle -->
        <SettingsToggle
          v-model="formData.enableWhatsAppIntegration"
          :label="$t('autoAssignment.enableWhatsApp')"
          :description="$t('autoAssignment.enableWhatsAppDescription')"
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
  Cog6ToothIcon,
  PhoneIcon,
  PhoneArrowUpRightIcon,
  ShieldCheckIcon,
  TruckIcon,
  LinkIcon
} from '@heroicons/vue/24/outline'
import { useAutoAssignmentSettingsService, type AutoAssignmentSettingsDto } from '~/services'

// Assignment strategy type from the generated API
type AssignmentStrategy = 'round_robin' | 'least_loaded' | 'random' | 'priority'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.AutoAssignmentSettings.View'
})

const { t } = useI18n()
const { settings, isLoading, update, isUpdating } = useAutoAssignmentSettingsService()

// Return to confirmation mode type
type ReturnToConfirmationMode = 'same_worker' | 'open' | 'choose'

// Form state with all settings fields
const formData = ref({
  // General
  isEnabled: false,
  strategy: 'round_robin' as AssignmentStrategy,
  onlyOnlineWorkers: true,
  allowWorkerSelfAssign: true,
  assignmentTimeoutMinutes: 0,
  globalMaxOrdersPerWorker: 0,
  // Confirmation
  autoAssignConfirmation: true,
  // Callback
  maxCallbackAttempts: 5,
  callbackReminderMinutes: 60,
  autoCancelUnreachable: false,
  // Quality
  enableQualityCheck: false,
  autoAssignQuality: false,
  qualityPassThreshold: 80,
  returnRejectedToSameConfirmateur: true,
  // Suivi
  autoAssignSuivi: false,
  autoAssignSuiviAfterConfirm: true,
  suiviToSameWorker: true,
  defaultSuiviPriority: 5,
  returnToConfirmationMode: 'same_worker' as ReturnToConfirmationMode,
  // Integrations
  enableWhatsAppIntegration: true
})

// Strategy descriptions
const getStrategyDescription = (strategy: AssignmentStrategy): string => {
  const descriptions: Record<AssignmentStrategy, string> = {
    round_robin: t('autoAssignment.roundRobinDescription'),
    least_loaded: t('autoAssignment.leastLoadedDescription'),
    random: t('autoAssignment.randomDescription'),
    priority: t('autoAssignment.priorityDescription')
  }
  return descriptions[strategy] || ''
}

// Sync form with settings when loaded
const syncFormWithSettings = () => {
  if (settings.value) {
    formData.value = {
      // General
      isEnabled: settings.value.isEnabled ?? false,
      strategy: (settings.value.strategy as AssignmentStrategy) ?? 'round_robin',
      onlyOnlineWorkers: settings.value.onlyOnlineWorkers ?? true,
      allowWorkerSelfAssign: settings.value.allowWorkerSelfAssign ?? true,
      assignmentTimeoutMinutes: settings.value.assignmentTimeoutMinutes ?? 0,
      globalMaxOrdersPerWorker: settings.value.globalMaxOrdersPerWorker ?? 0,
      // Confirmation
      autoAssignConfirmation: settings.value.autoAssignConfirmation ?? true,
      // Callback
      maxCallbackAttempts: settings.value.maxCallbackAttempts ?? 5,
      callbackReminderMinutes: settings.value.callbackReminderMinutes ?? 60,
      autoCancelUnreachable: settings.value.autoCancelUnreachable ?? false,
      // Quality
      enableQualityCheck: settings.value.enableQualityCheck ?? false,
      autoAssignQuality: settings.value.autoAssignQuality ?? false,
      qualityPassThreshold: settings.value.qualityPassThreshold ?? 80,
      returnRejectedToSameConfirmateur: settings.value.returnRejectedToSameConfirmateur ?? true,
      // Suivi
      autoAssignSuivi: settings.value.autoAssignSuivi ?? false,
      autoAssignSuiviAfterConfirm: settings.value.autoAssignSuiviAfterConfirm ?? true,
      suiviToSameWorker: settings.value.suiviToSameWorker ?? true,
      defaultSuiviPriority: settings.value.defaultSuiviPriority ?? 5,
      returnToConfirmationMode: (settings.value.returnToConfirmationMode as ReturnToConfirmationMode) ?? 'same_worker',
      // Integrations
      enableWhatsAppIntegration: settings.value.enableWhatsAppIntegration ?? true
    }
  }
}

// Watch for settings changes (Vue Query auto-fetches)
watch(settings, syncFormWithSettings, { immediate: true })

// Reset form to original values
const resetForm = () => {
  syncFormWithSettings()
}

// Notification composable
const notification = useNotification()

// Submit form
const handleSubmit = async () => {
  try {
    await update(formData.value as any)
    notification.success(t('autoAssignment.saveSuccess'))
  } catch (error: any) {
    notification.error(error?.message || t('autoAssignment.saveError'))
  }
}

// Alias for template compatibility
const isSubmitting = isUpdating
</script>
