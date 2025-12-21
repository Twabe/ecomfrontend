<template>
  <TransitionRoot :show="modelValue" as="template">
    <Dialog as="div" class="relative z-50" @close="handleClose">
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
            <DialogPanel class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl">
              <!-- Header -->
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center"
                      :style="{ backgroundColor: platform?.bgColor }"
                    >
                      <component
                        :is="platformIcon"
                        class="w-5 h-5"
                        :style="{ color: platform?.color }"
                      />
                    </div>
                    <div>
                      <span>{{ isEditing ? $t('integrations.wizard.editTitle') : $t('integrations.wizard.title') }}</span>
                      <p class="text-sm font-normal text-gray-500 dark:text-gray-400">{{ platform?.name }}</p>
                    </div>
                  </DialogTitle>
                  <button
                    type="button"
                    class="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    @click="handleClose"
                  >
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                </div>

                <!-- Stepper -->
                <div class="mt-6">
                  <div class="flex items-center justify-between">
                    <template v-for="(step, index) in steps" :key="step.key">
                      <!-- Step Circle -->
                      <div class="flex items-center">
                        <div
                          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200"
                          :class="getStepClasses(index + 1)"
                        >
                          <CheckIcon v-if="currentStep > index + 1" class="w-4 h-4" />
                          <span v-else>{{ index + 1 }}</span>
                        </div>
                        <span
                          class="ms-2 text-sm font-medium hidden sm:block"
                          :class="currentStep >= index + 1 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'"
                        >
                          {{ $t(step.label) }}
                        </span>
                      </div>

                      <!-- Connector Line -->
                      <div
                        v-if="index < steps.length - 1"
                        class="flex-1 h-0.5 mx-2 sm:mx-4"
                        :class="currentStep > index + 1 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
                      />
                    </template>
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div class="px-6 py-6 min-h-[400px]">
                <!-- Loading State -->
                <div v-if="isLoading" class="flex items-center justify-center h-64">
                  <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
                    <p class="mt-4 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
                  </div>
                </div>

                <!-- Step 1: Configuration -->
                <IntegrationsStepsStepConfig
                  v-else-if="currentStep === 1"
                  v-model="configData"
                  :platform="platform!"
                  :stores="stores"
                  :users="users"
                />

                <!-- Step 2: Webhook URL -->
                <IntegrationsStepsStepWebhook
                  v-else-if="currentStep === 2"
                  :webhook-url="webhookUrl"
                  :platform-name="platform?.name || ''"
                />

                <!-- Step 3: Instructions -->
                <IntegrationsStepsStepInstructions
                  v-else-if="currentStep === 3"
                  :platform="platform!"
                />

                <!-- Step 4: Verify -->
                <IntegrationsStepsStepVerify
                  v-else-if="currentStep === 4"
                  :platform-name="platform?.name || ''"
                  :status="connectionStatus"
                  :is-checking="isCheckingConnection"
                  :last-synced-at="integration?.lastSyncedAt"
                  :help-url="platform?.helpUrl"
                  @verify="checkConnection"
                  @update:confirmed="handleConfirmedChange"
                />
              </div>

              <!-- Footer -->
              <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <button
                    v-if="currentStep > 1 && !isLoading"
                    type="button"
                    class="btn-secondary flex items-center gap-2"
                    @click="previousStep"
                  >
                    <ChevronLeftIcon class="w-4 h-4 rtl:rotate-180" />
                    {{ $t('common.previous') }}
                  </button>
                </div>

                <div class="flex items-center gap-3">
                  <!-- Skip Button (Step 4 only) -->
                  <button
                    v-if="currentStep === 4 && !isLoading"
                    type="button"
                    class="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    @click="handleComplete"
                  >
                    {{ $t('integrations.wizard.skip') }}
                  </button>

                  <!-- Main Action Button -->
                  <button
                    type="button"
                    class="btn-primary flex items-center gap-2"
                    :disabled="!canProceed || isLoading || isSaving"
                    @click="handleNextOrComplete"
                  >
                    <span v-if="isSaving" class="flex items-center gap-2">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      {{ $t('common.loading') }}
                    </span>
                    <template v-else-if="currentStep === steps.length">
                      <CheckIcon class="w-4 h-4" />
                      {{ $t('integrations.wizard.complete') }}
                    </template>
                    <template v-else>
                      {{ $t('common.next') }}
                      <ChevronRightIcon class="w-4 h-4 rtl:rotate-180" />
                    </template>
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import {
  XMarkIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudIcon,
  ShoppingCartIcon,
  TableCellsIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  BoltIcon
} from '@heroicons/vue/24/outline'
import type { PlatformConfig } from '~/composables/usePlatformConfig'
import type { StepConfigData } from './steps/StepConfig.vue'
import type { ConnectionStatusType } from './ConnectionStatus.vue'
import type { PlatformIntegrationDto, StoreDto, UserDetailsDto } from '~/api/generated/models'
import { PlatformType } from '~/types/platformintegration'
import { usePlatformIntegrationsService } from '~/services'

const props = defineProps<{
  modelValue: boolean
  platform: PlatformConfig | null
  integration?: PlatformIntegrationDto | null
  stores: StoreDto[]
  users: UserDetailsDto[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'complete', integration: PlatformIntegrationDto): void
}>()

const { t } = useI18n()
const { generateWebhookUrl } = usePlatformConfig()
const { success: showSuccess, error: showError } = useNotification()
const platformIntegrationsService = usePlatformIntegrationsService()

// State
const currentStep = ref(1)
const isLoading = ref(false)
const isSaving = ref(false)
const isCheckingConnection = ref(false)
const connectionStatus = ref<ConnectionStatusType>('pending')
const isConfirmed = ref(false)
const integration = ref<PlatformIntegrationDto | null>(null)
const webhookUrl = ref('')

// Steps configuration
const steps = [
  { key: 'config', label: 'integrations.wizard.stepConfig' },
  { key: 'webhook', label: 'integrations.wizard.stepWebhook' },
  { key: 'instructions', label: 'integrations.wizard.stepInstructions' },
  { key: 'verify', label: 'integrations.wizard.stepVerify' }
]

// Form data
const configData = ref<StepConfigData>({
  name: '',
  defaultStoreId: null,
  defaultMediaBuyerId: null,
  canOpen: true,
  trackStock: false,
  enableRamassage: false
})

// Computed
const isEditing = computed(() => !!props.integration)

const platformIcon = computed(() => {
  switch (props.platform?.icon) {
    case 'youcan':
      return ShoppingCartIcon
    case 'shopify':
      return ShoppingCartIcon
    case 'woocommerce':
      return GlobeAltIcon
    case 'lightfunnels':
      return RocketLaunchIcon
    case 'storeep':
      return CloudIcon
    case 'sheets':
      return TableCellsIcon
    default:
      return BoltIcon
  }
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return configData.value.name.trim().length > 0
    case 2:
      return true
    case 3:
      return true
    case 4:
      return isConfirmed.value || connectionStatus.value === 'connected'
    default:
      return true
  }
})

// Methods
const getStepClasses = (step: number) => {
  if (currentStep.value > step) {
    return 'bg-primary-500 text-white'
  } else if (currentStep.value === step) {
    return 'bg-primary-500 text-white ring-4 ring-primary-100 dark:ring-primary-900/30'
  }
  return 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const nextStep = () => {
  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}

const handleNextOrComplete = async () => {
  if (currentStep.value === 1) {
    await createOrUpdateIntegration()
  } else if (currentStep.value === steps.length) {
    await handleComplete()
  } else {
    nextStep()
  }
}

const createOrUpdateIntegration = async () => {
  if (!props.platform) return

  isSaving.value = true
  try {
    if (isEditing.value && props.integration) {
      // Update existing integration
      await platformIntegrationsService.update(props.integration.id!, {
        name: configData.value.name,
        defaultStoreId: configData.value.defaultStoreId,
        defaultMediaBuyerId: configData.value.defaultMediaBuyerId,
        canOpen: configData.value.canOpen,
        trackStock: configData.value.trackStock,
        enableRamassage: configData.value.enableRamassage
      })
      integration.value = {
        ...props.integration,
        name: configData.value.name,
        defaultStoreId: configData.value.defaultStoreId,
        defaultMediaBuyerId: configData.value.defaultMediaBuyerId,
        canOpen: configData.value.canOpen,
        trackStock: configData.value.trackStock,
        enableRamassage: configData.value.enableRamassage
      }
    } else {
      // Create new integration
      const platformType = props.platform.type === 'googleSheets'
        ? PlatformType.YouCan // fallback for sheets, handled differently
        : props.platform.type as PlatformType

      const id = await platformIntegrationsService.create({
        name: configData.value.name,
        type: platformType,
        defaultStoreId: configData.value.defaultStoreId,
        defaultMediaBuyerId: configData.value.defaultMediaBuyerId,
        canOpen: configData.value.canOpen,
        trackStock: configData.value.trackStock,
        enableRamassage: configData.value.enableRamassage,
        isActive: false
      })
      integration.value = {
        id,
        name: configData.value.name,
        type: platformType,
        defaultStoreId: configData.value.defaultStoreId,
        defaultMediaBuyerId: configData.value.defaultMediaBuyerId,
        canOpen: configData.value.canOpen,
        trackStock: configData.value.trackStock,
        enableRamassage: configData.value.enableRamassage,
        isActive: false
      }
    }

    // Generate webhook URL
    if (integration.value?.id) {
      webhookUrl.value = generateWebhookUrl(integration.value.id)
    }

    nextStep()
  } catch (error) {
    console.error('Failed to create/update integration:', error)
    showError(t('integrations.wizard.saveFailed'))
  } finally {
    isSaving.value = false
  }
}

const checkConnection = async () => {
  if (!integration.value?.id) return

  isCheckingConnection.value = true
  connectionStatus.value = 'pending'

  try {
    // TODO: Call API to verify connection
    // For now, simulate a check
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Check if we have lastSyncedAt (indicates webhook was received)
    if (integration.value.lastSyncedAt) {
      connectionStatus.value = 'connected'
    } else {
      connectionStatus.value = 'pending'
    }
  } catch (error) {
    console.error('Failed to check connection:', error)
    connectionStatus.value = 'error'
  } finally {
    isCheckingConnection.value = false
  }
}

const handleConfirmedChange = (value: boolean) => {
  isConfirmed.value = value
}

const handleComplete = async () => {
  if (!integration.value?.id) return

  isSaving.value = true
  try {
    // Activate the integration
    await platformIntegrationsService.toggle(integration.value.id)
    integration.value.isActive = true

    showSuccess(t('integrations.wizard.completeSuccess'))

    emit('complete', integration.value)
    handleClose()
  } catch (error) {
    console.error('Failed to complete integration:', error)
    showError(t('integrations.wizard.completeFailed'))
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const resetWizard = () => {
  currentStep.value = 1
  isLoading.value = false
  isSaving.value = false
  isCheckingConnection.value = false
  connectionStatus.value = 'pending'
  isConfirmed.value = false
  integration.value = null
  webhookUrl.value = ''
  configData.value = {
    name: '',
    defaultStoreId: null,
    defaultMediaBuyerId: null,
    canOpen: true,
    trackStock: false,
    enableRamassage: false
  }
}

// Watch for modal open/close
watch(() => props.modelValue, (open) => {
  if (open) {
    if (props.integration) {
      // Edit mode - populate from existing
      integration.value = props.integration
      configData.value = {
        name: props.integration.name || '',
        defaultStoreId: props.integration.defaultStoreId || null,
        defaultMediaBuyerId: props.integration.defaultMediaBuyerId || null,
        canOpen: props.integration.canOpen ?? true,
        trackStock: props.integration.trackStock ?? false,
        enableRamassage: props.integration.enableRamassage ?? false
      }
      if (props.integration.id) {
        webhookUrl.value = generateWebhookUrl(props.integration.id)
      }
      connectionStatus.value = props.integration.isActive ? 'connected' : 'pending'
    } else {
      resetWizard()
    }
  }
})

// Watch for platform change
watch(() => props.platform, () => {
  if (props.modelValue && !props.integration) {
    resetWizard()
  }
})
</script>
