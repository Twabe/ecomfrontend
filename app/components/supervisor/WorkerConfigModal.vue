<template>
  <TransitionRoot :show="modelValue" as="template">
    <Dialog as="div" class="relative z-50" @close="emit('update:modelValue', false)">
      <TransitionChild
        enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Cog6ToothIcon class="w-5 h-5 text-primary-600" />
                {{ isEdit ? $t('supervisor.editWorkerConfig') : $t('supervisor.createWorkerConfig') }}
              </DialogTitle>

              <form @submit.prevent="handleSubmit">
                <!-- User Info (read-only) -->
                <div v-if="selectedUser" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span class="text-primary-600 dark:text-primary-400 font-medium">
                        {{ getUserInitials(selectedUser) }}
                      </span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ getUserDisplayName(selectedUser) }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ selectedUser.email }}</p>
                    </div>
                  </div>
                </div>

                <!-- User selection for create mode -->
                <div v-else-if="!isEdit" class="mb-4">
                  <label class="label">{{ $t('supervisor.selectUser') }} *</label>
                  <select v-model="form.userId" class="input" required>
                    <option value="">{{ $t('common.select') }}...</option>
                    <option
                      v-for="user in availableUsers"
                      :key="user.id"
                      :value="user.id"
                    >
                      {{ getUserDisplayName(user) }} ({{ user.email }})
                    </option>
                  </select>
                </div>

                <!-- Services Section -->
                <div class="mb-4">
                  <label class="label mb-2">{{ $t('supervisor.services') }}</label>
                  <div class="space-y-2">
                    <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        v-model="form.canDoConfirmation"
                        type="checkbox"
                        class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ $t('worker.confirmation') }}
                        </span>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('supervisor.canDoConfirmationDesc') }}
                        </p>
                      </div>
                    </label>

                    <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        v-model="form.canDoSuivi"
                        type="checkbox"
                        class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ $t('worker.suivi') }}
                        </span>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('supervisor.canDoSuiviDesc') }}
                        </p>
                      </div>
                    </label>

                    <!-- Quality option only shown if EnableQualityCheck is true in settings -->
                    <label v-if="isQualityEnabled" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        v-model="form.canDoQuality"
                        type="checkbox"
                        class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ $t('worker.quality') }}
                        </span>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('supervisor.canDoQualityDesc') }}
                        </p>
                      </div>
                    </label>

                    <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        v-model="form.canDoCallback"
                        type="checkbox"
                        class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ $t('worker.callbacks') }}
                        </span>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('supervisor.canDoCallbackDesc') }}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Priority Section -->
                <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label class="label mb-3">{{ $t('supervisor.priority') }}</label>
                  <input
                    v-model.number="form.autoAssignPriority"
                    type="number"
                    min="1"
                    max="1000"
                    class="input"
                    placeholder="100"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {{ $t('supervisor.priorityHint') }}
                  </p>
                </div>

                <!-- Commission Section (only shown if canDoConfirmation is enabled) -->
                <div v-if="form.canDoConfirmation" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <label class="label mb-3 flex items-center gap-2">
                    <BanknotesIcon class="w-4 h-4 text-blue-600" />
                    {{ $t('supervisor.commission') }}
                  </label>

                  <!-- Commission Type Selection -->
                  <div class="flex gap-4 mb-3">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="form.confirmationCommissionType"
                        type="radio"
                        value="fixed"
                        class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span class="text-sm text-gray-700 dark:text-gray-300">
                        {{ $t('supervisor.fixedPerOrder') }}
                      </span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="form.confirmationCommissionType"
                        type="radio"
                        value="percentage"
                        class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span class="text-sm text-gray-700 dark:text-gray-300">
                        {{ $t('supervisor.percentage') }}
                      </span>
                    </label>
                  </div>

                  <!-- Commission Value Input -->
                  <div class="relative">
                    <input
                      v-model.number="form.confirmationCommissionValue"
                      type="number"
                      min="0"
                      :max="form.confirmationCommissionType === 'percentage' ? 100 : undefined"
                      step="0.01"
                      class="input pr-12"
                      placeholder="0"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                      {{ form.confirmationCommissionType === 'fixed' ? 'MAD' : '%' }}
                    </span>
                  </div>

                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {{ form.confirmationCommissionType === 'fixed'
                        ? $t('supervisor.fixedCommissionHint')
                        : $t('supervisor.percentageCommissionHint') }}
                  </p>
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    class="btn-secondary"
                    @click="emit('update:modelValue', false)"
                  >
                    {{ $t('common.cancel') }}
                  </button>
                  <button
                    type="submit"
                    class="btn-primary"
                    :disabled="isSubmitting || (!isEdit && !form.userId)"
                  >
                    <span v-if="isSubmitting" class="flex items-center gap-2">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {{ $t('common.loading') }}
                    </span>
                    <span v-else>{{ $t('common.save') }}</span>
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { Cog6ToothIcon, BanknotesIcon } from '@heroicons/vue/24/outline'
import { useWorkerServiceConfigsService, useAutoAssignmentSettingsService, type WorkerServiceConfigDto, type CreateWorkerConfigRequest, type UpdateWorkerConfigRequest, type UserDetailsDto } from '~/services'

const props = defineProps<{
  modelValue: boolean
  config?: WorkerServiceConfigDto | null
  users: UserDetailsDto[]
  configuredUserIds: string[]
  preselectedUser?: UserDetailsDto | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', config: WorkerServiceConfigDto): void
  (e: 'updated', config: WorkerServiceConfigDto): void
}>()

const workerConfigsService = useWorkerServiceConfigsService()
const autoAssignmentSettingsService = useAutoAssignmentSettingsService()

// Check if Quality is enabled in auto-assignment settings
const isQualityEnabled = computed(() => autoAssignmentSettingsService.settings.value?.enableQualityCheck ?? false)

// Helper functions for user display
const getUserDisplayName = (user: UserDetailsDto) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  if (user.firstName) return user.firstName
  if (user.lastName) return user.lastName
  return user.userName || user.email
}

const getUserInitials = (user: UserDetailsDto) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
  }
  if (user.firstName) return user.firstName.charAt(0)
  if (user.lastName) return user.lastName.charAt(0)
  if (user.userName) return user.userName.charAt(0).toUpperCase()
  return user.email.charAt(0).toUpperCase()
}

// Computed
const isEdit = computed(() => !!props.config)

const selectedUser = computed(() => {
  // If preselected user is provided (from "Configurer" button), use it
  if (props.preselectedUser) {
    return props.preselectedUser
  }
  // If in edit mode, find user by config userId
  if (isEdit.value && props.config) {
    return props.users.find(u => u.id === props.config?.userId)
  }
  return null
})

const availableUsers = computed(() => {
  return props.users.filter(u => !props.configuredUserIds.includes(u.id))
})

// Form state
const form = ref({
  userId: '',
  canDoConfirmation: true,
  canDoSuivi: false,
  canDoQuality: false,
  canDoCallback: false,
  autoAssignPriority: 100,
  confirmationCommissionType: 'fixed' as 'fixed' | 'percentage',
  confirmationCommissionValue: 0
})

const isSubmitting = ref(false)

// Reset form when modal opens or config changes
watch(() => [props.modelValue, props.config, props.preselectedUser], ([open, config, preselectedUser]) => {
  if (open) {
    if (config) {
      // Edit mode - populate from existing config
      form.value = {
        userId: (config as WorkerServiceConfigDto).userId ?? '',
        canDoConfirmation: (config as WorkerServiceConfigDto).canDoConfirmation ?? true,
        canDoSuivi: (config as WorkerServiceConfigDto).canDoSuivi ?? false,
        canDoQuality: (config as WorkerServiceConfigDto).canDoQuality ?? false,
        canDoCallback: (config as WorkerServiceConfigDto).canDoCallback ?? false,
        autoAssignPriority: (config as WorkerServiceConfigDto).autoAssignPriority ?? 100,
        confirmationCommissionType: ((config as WorkerServiceConfigDto).confirmationCommissionType as 'fixed' | 'percentage') ?? 'fixed',
        confirmationCommissionValue: (config as WorkerServiceConfigDto).confirmationCommissionValue ?? 0
      }
    } else {
      // Create mode - reset to defaults, but set userId if preselected
      form.value = {
        userId: (preselectedUser as UserDetailsDto | null)?.id || '',
        canDoConfirmation: true,
        canDoSuivi: false,
        canDoQuality: false,
        canDoCallback: false,
        autoAssignPriority: 100,
        confirmationCommissionType: 'fixed',
        confirmationCommissionValue: 0
      }
    }
  }
}, { immediate: true })

// Handle form submission
const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    if (isEdit.value && props.config) {
      // Update existing config
      const updateRequest: UpdateWorkerConfigRequest = {
        canDoConfirmation: form.value.canDoConfirmation,
        canDoSuivi: form.value.canDoSuivi,
        canDoQuality: form.value.canDoQuality,
        canDoCallback: form.value.canDoCallback,
        autoAssignPriority: form.value.autoAssignPriority,
        confirmationCommissionType: form.value.confirmationCommissionType,
        confirmationCommissionValue: form.value.confirmationCommissionValue
      }
      await workerConfigsService.update(props.config.id!, updateRequest)
      // Emit the updated config (can be constructed from form data for immediate UI update)
      emit('updated', { ...props.config, ...updateRequest } as WorkerServiceConfigDto)
    } else {
      // Create new config
      const createRequest: CreateWorkerConfigRequest = {
        userId: form.value.userId,
        canDoConfirmation: form.value.canDoConfirmation,
        canDoSuivi: form.value.canDoSuivi,
        canDoQuality: form.value.canDoQuality,
        canDoCallback: form.value.canDoCallback,
        autoAssignPriority: form.value.autoAssignPriority,
        confirmationCommissionType: form.value.confirmationCommissionType,
        confirmationCommissionValue: form.value.confirmationCommissionValue
      }
      const configId = await workerConfigsService.create(createRequest)
      // Emit the created config (construct from form data + returned id)
      emit('created', { id: configId, ...createRequest } as WorkerServiceConfigDto)
    }
    emit('update:modelValue', false)
  } finally {
    isSubmitting.value = false
  }
}
</script>
