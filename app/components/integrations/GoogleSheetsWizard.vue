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
                      style="background-color: #E8F5E9"
                    >
                      <TableCellsIcon class="w-5 h-5" style="color: #0F9D58" />
                    </div>
                    <div>
                      <span>{{ $t('integrations.wizard.sheetsTitle') }}</span>
                      <p class="text-sm font-normal text-gray-500 dark:text-gray-400">Google Sheets</p>
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
                <div v-else-if="currentStep === 1" class="space-y-6">
                  <!-- Platform Header -->
                  <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div
                      class="w-12 h-12 rounded-xl flex items-center justify-center"
                      style="background-color: #E8F5E9"
                    >
                      <TableCellsIcon class="w-6 h-6" style="color: #0F9D58" />
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900 dark:text-white">Google Sheets</h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('integrations.platforms.sheets.desc') }}</p>
                    </div>
                  </div>

                  <!-- Form -->
                  <div class="space-y-4">
                    <!-- Integration Name -->
                    <div>
                      <label class="label">{{ $t('integrations.wizard.name') }} *</label>
                      <input
                        v-model="configData.name"
                        type="text"
                        class="input"
                        :placeholder="$t('integrations.wizard.sheetsNamePlaceholder')"
                        required
                      />
                    </div>

                    <!-- Default Store -->
                    <div>
                      <label class="label">{{ $t('integrations.wizard.store') }}</label>
                      <select v-model="configData.defaultStoreId" class="input">
                        <option :value="null">{{ $t('common.select') }}...</option>
                        <option v-for="store in stores" :key="store.id" :value="store.id">
                          {{ store.name }}
                        </option>
                      </select>
                    </div>

                    <!-- Default Media Buyer -->
                    <div>
                      <label class="label">{{ $t('integrations.wizard.mediaBuyer') }}</label>
                      <select v-model="configData.defaultMediaBuyerId" class="input">
                        <option :value="null">{{ $t('common.none') }}</option>
                        <option v-for="user in users" :key="user.id" :value="user.id">
                          {{ user.firstName }} {{ user.lastName }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Step 2: Script -->
                <div v-else-if="currentStep === 2" class="space-y-6">
                  <!-- Header -->
                  <div class="text-center">
                    <div class="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CodeBracketIcon class="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      {{ $t('integrations.wizard.sheetsScript') }}
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {{ $t('integrations.wizard.sheetsScriptDesc') }}
                    </p>
                  </div>

                  <!-- Script Code Box -->
                  <div class="relative">
                    <div class="p-4 bg-gray-900 dark:bg-gray-950 rounded-lg border border-gray-700 overflow-hidden">
                      <div class="flex items-center justify-between mb-3 pb-3 border-b border-gray-700">
                        <span class="text-xs font-mono text-gray-400">Apps Script</span>
                        <button
                          type="button"
                          class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200"
                          :class="copied
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'"
                          @click="copyScript"
                        >
                          <span v-if="copied" class="flex items-center gap-1">
                            <CheckIcon class="w-4 h-4" />
                            {{ $t('integrations.wizard.copied') }}
                          </span>
                          <span v-else class="flex items-center gap-1">
                            <ClipboardDocumentIcon class="w-4 h-4" />
                            {{ $t('integrations.wizard.copy') }}
                          </span>
                        </button>
                      </div>
                      <pre class="text-xs font-mono text-gray-300 overflow-x-auto max-h-64 whitespace-pre-wrap">{{ scriptCode }}</pre>
                    </div>
                  </div>

                  <!-- Info Box -->
                  <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div class="flex gap-3">
                      <InformationCircleIcon class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200">
                          {{ $t('integrations.wizard.sheetsNote') }}
                        </h4>
                        <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          {{ $t('integrations.wizard.sheetsNoteDesc') }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Step 3: Instructions -->
                <div v-else-if="currentStep === 3" class="space-y-6">
                  <!-- Header -->
                  <div class="text-center">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      {{ $t('integrations.wizard.sheetsInstructions') }}
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {{ $t('integrations.wizard.sheetsInstructionsDesc') }}
                    </p>
                  </div>

                  <!-- Instructions List -->
                  <div class="space-y-4">
                    <div
                      v-for="(instruction, index) in sheetsInstructions"
                      :key="index"
                      class="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div class="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-semibold text-sm">
                        {{ index + 1 }}
                      </div>
                      <div class="flex-1">
                        <h4 class="font-medium text-gray-900 dark:text-white">
                          {{ $t(instruction.title) }}
                        </h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {{ $t(instruction.description) }}
                        </p>
                        <a
                          v-if="instruction.link"
                          :href="instruction.link.url"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="inline-flex items-center gap-1 mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          <ArrowTopRightOnSquareIcon class="w-4 h-4" />
                          {{ instruction.link.label }}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Step 4: Verify -->
                <IntegrationsStepsStepVerify
                  v-else-if="currentStep === 4"
                  platform-name="Google Sheets"
                  :status="connectionStatus"
                  :is-checking="isCheckingConnection"
                  :last-synced-at="integration?.lastSyncedAt"
                  help-url="https://developers.google.com/apps-script"
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
  TableCellsIcon,
  CodeBracketIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'
import type { ConnectionStatusType } from './ConnectionStatus.vue'
import type { PlatformIntegrationDto, StoreDto, UserDetailsDto } from '~/api/generated/models'
import { PlatformType } from '~/types/platformintegration'
import { usePlatformIntegrationsService } from '~/services'

const props = defineProps<{
  modelValue: boolean
  stores: StoreDto[]
  users: UserDetailsDto[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'complete', integration: PlatformIntegrationDto): void
}>()

const { t } = useI18n()
const { generateGoogleSheetsScript } = usePlatformConfig()
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
const copied = ref(false)

// Steps configuration
const steps = [
  { key: 'config', label: 'integrations.wizard.stepConfig' },
  { key: 'script', label: 'integrations.wizard.stepScript' },
  { key: 'instructions', label: 'integrations.wizard.stepInstructions' },
  { key: 'verify', label: 'integrations.wizard.stepVerify' }
]

// Google Sheets specific instructions
const sheetsInstructions = [
  {
    title: 'integrations.instructions.sheets.step1',
    description: 'integrations.instructions.sheets.step1Desc',
    link: { url: 'https://sheets.google.com', label: 'Google Sheets' }
  },
  {
    title: 'integrations.instructions.sheets.step2',
    description: 'integrations.instructions.sheets.step2Desc'
  },
  {
    title: 'integrations.instructions.sheets.step3',
    description: 'integrations.instructions.sheets.step3Desc'
  },
  {
    title: 'integrations.instructions.sheets.step4',
    description: 'integrations.instructions.sheets.step4Desc'
  },
  {
    title: 'integrations.instructions.sheets.step5',
    description: 'integrations.instructions.sheets.step5Desc'
  },
  {
    title: 'integrations.instructions.sheets.step6',
    description: 'integrations.instructions.sheets.step6Desc'
  }
]

// Form data
const configData = ref({
  name: '',
  defaultStoreId: null as string | null,
  defaultMediaBuyerId: null as string | null
})

// Computed
const scriptCode = computed(() => {
  if (integration.value?.id) {
    return generateGoogleSheetsScript(integration.value.id)
  }
  return '// Script will be generated after configuration...'
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
    await createIntegration()
  } else if (currentStep.value === steps.length) {
    await handleComplete()
  } else {
    nextStep()
  }
}

const createIntegration = async () => {
  isSaving.value = true
  try {
    // Create new integration with YouCan type (backend will handle sheets differently)
    const id = await platformIntegrationsService.create({
      name: configData.value.name,
      type: PlatformType.YouCan, // Using YouCan as fallback, ideally would have separate type
      defaultStoreId: configData.value.defaultStoreId,
      defaultMediaBuyerId: configData.value.defaultMediaBuyerId,
      canOpen: true,
      trackStock: false,
      enableRamassage: false,
      isActive: false
    })

    integration.value = {
      id,
      name: configData.value.name,
      type: PlatformType.YouCan,
      defaultStoreId: configData.value.defaultStoreId,
      defaultMediaBuyerId: configData.value.defaultMediaBuyerId,
      canOpen: true,
      trackStock: false,
      enableRamassage: false,
      isActive: false
    }

    nextStep()
  } catch (error) {
    console.error('Failed to create integration:', error)
    showError(t('integrations.wizard.saveFailed'))
  } finally {
    isSaving.value = false
  }
}

const copyScript = async () => {
  try {
    await navigator.clipboard.writeText(scriptCode.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy script:', err)
  }
}

const checkConnection = async () => {
  if (!integration.value?.id) return

  isCheckingConnection.value = true
  connectionStatus.value = 'pending'

  try {
    // Simulate connection check
    await new Promise(resolve => setTimeout(resolve, 2000))

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
  copied.value = false
  configData.value = {
    name: '',
    defaultStoreId: null,
    defaultMediaBuyerId: null
  }
}

// Watch for modal open/close
watch(() => props.modelValue, (open) => {
  if (open) {
    resetWizard()
  }
})
</script>
