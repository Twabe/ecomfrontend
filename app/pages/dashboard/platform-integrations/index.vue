<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ $t('integrations.title') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {{ $t('integrations.subtitle') }}
      </p>
    </div>

    <!-- Active Integrations Section -->
    <div class="mb-10">
      <IntegrationsActiveIntegrationsList
        :integrations="platformIntegrations"
        @edit="handleEdit"
        @delete="handleDelete"
        @toggle="handleToggle"
        @view-webhook="handleViewWebhook"
      />
    </div>

    <!-- Add New Platform Section -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ $t('integrations.connectNew') }}
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {{ $t('integrations.connectNewDesc') }}
      </p>

      <IntegrationsPlatformGrid
        :platforms="allPlatforms"
        :connecting-platform="connectingPlatform"
        @select="handlePlatformSelect"
        @oauth-connect="handleOAuthConnect"
      />
    </div>

    <!-- Integration Wizard Modal (for webhook-based platforms) -->
    <IntegrationsIntegrationWizard
      v-model="showWizard"
      :platform="selectedPlatform"
      :integration="editingIntegration"
      :stores="stores"
      :users="users"
      @complete="handleWizardComplete"
    />

    <!-- Google Sheets Wizard Modal -->
    <IntegrationsGoogleSheetsWizard
      v-model="showSheetsWizard"
      :stores="stores"
      :users="users"
      @complete="handleWizardComplete"
    />

    <!-- Webhook URL Modal -->
    <TransitionRoot :show="showWebhookModal" as="template">
      <Dialog as="div" class="relative z-50" @close="showWebhookModal = false">
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
              <DialogPanel class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <LinkIcon class="w-5 h-5 text-primary-600" />
                  {{ $t('integrations.wizard.webhookUrl') }}
                </DialogTitle>

                <div class="space-y-4">
                  <!-- Webhook URL -->
                  <div>
                    <label class="label">{{ $t('integrations.wizard.webhookUrl') }}</label>
                    <div class="flex gap-2">
                      <input
                        :value="currentWebhookUrl"
                        type="text"
                        readonly
                        class="input flex-1 font-mono text-sm bg-gray-50 dark:bg-gray-700"
                      />
                      <button
                        type="button"
                        class="btn-primary flex-shrink-0"
                        @click="copyWebhookUrl"
                      >
                        <ClipboardDocumentIcon v-if="!webhookCopied" class="w-5 h-5" />
                        <CheckIcon v-else class="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <!-- Integration Info -->
                  <div v-if="viewingIntegration" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="flex items-center gap-3 mb-3">
                      <component
                        :is="getIntegrationIcon(viewingIntegration.type)"
                        class="w-8 h-8"
                        :style="{ color: getPlatformColor(viewingIntegration.type).color }"
                      />
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ viewingIntegration.name }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ getPlatformTypeName(viewingIntegration.type) }}</p>
                      </div>
                    </div>
                    <IntegrationsConnectionStatus
                      :status="getConnectionStatus(viewingIntegration)"
                      :last-synced-at="viewingIntegration.lastSyncedAt"
                    />
                  </div>
                </div>

                <div class="flex justify-end mt-6">
                  <button
                    type="button"
                    class="btn-secondary"
                    @click="showWebhookModal = false"
                  >
                    {{ $t('common.close') }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Delete Confirmation Modal -->
    <TransitionRoot :show="showDeleteModal" as="template">
      <Dialog as="div" class="relative z-50" @close="showDeleteModal = false">
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
              <DialogPanel class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                <div class="text-center">
                  <div class="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <ExclamationTriangleIcon class="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {{ $t('integrations.card.confirmDelete') }}
                  </DialogTitle>
                  <p class="text-gray-500 dark:text-gray-400 mb-6">
                    {{ $t('integrations.card.confirmDeleteDesc', { name: deletingIntegration?.name }) }}
                  </p>
                </div>

                <div class="flex gap-3">
                  <button
                    type="button"
                    class="btn-secondary flex-1"
                    @click="showDeleteModal = false"
                  >
                    {{ $t('common.cancel') }}
                  </button>
                  <button
                    type="button"
                    class="btn-danger flex-1"
                    :disabled="isDeleting"
                    @click="confirmDelete"
                  >
                    <span v-if="isDeleting" class="flex items-center gap-2">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      {{ $t('common.loading') }}
                    </span>
                    <span v-else>{{ $t('common.delete') }}</span>
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import {
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CloudIcon,
  ShoppingCartIcon,
  TableCellsIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  BoltIcon
} from '@heroicons/vue/24/outline'
import type { PlatformConfig } from '~/composables/usePlatformConfig'
import type { ConnectionStatusType } from '~/components/integrations/ConnectionStatus.vue'
import {
  usePlatformIntegrationsService,
  useStoresService,
  useUsersService,
  useYouCanIntegrationService,
  type PlatformIntegrationDto
} from '~/services'
import { PlatformType } from '~/types/platformintegration'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.PlatformIntegrations.View'
})

const { t } = useI18n()
const { success: showSuccess, error: showError } = useNotification()
const { getAllPlatforms, generateWebhookUrl, getPlatformColor, getPlatformConfig } = usePlatformConfig()

// Services
const {
  items: platformIntegrations,
  remove: deletePlatformIntegration,
  toggle,
  refetch
} = usePlatformIntegrationsService()

const { items: stores } = useStoresService()
const { users } = useUsersService()
const youCanService = useYouCanIntegrationService()

// Get all available platforms
const allPlatforms = computed(() => getAllPlatforms())

// Modal states
const showWizard = ref(false)
const showSheetsWizard = ref(false)
const showWebhookModal = ref(false)
const showDeleteModal = ref(false)

// Current data
const selectedPlatform = ref<PlatformConfig | null>(null)
const editingIntegration = ref<PlatformIntegrationDto | null>(null)
const viewingIntegration = ref<PlatformIntegrationDto | null>(null)
const deletingIntegration = ref<PlatformIntegrationDto | null>(null)
const currentWebhookUrl = ref('')
const webhookCopied = ref(false)
const isDeleting = ref(false)
const connectingPlatform = ref<string | null>(null)

// Methods
const handlePlatformSelect = (platform: PlatformConfig) => {
  selectedPlatform.value = platform

  if (platform.isScriptBased) {
    // Open Google Sheets wizard
    showSheetsWizard.value = true
  } else {
    // Open regular webhook wizard
    editingIntegration.value = null
    showWizard.value = true
  }
}

// Handle OAuth connect for platforms like YouCan
const handleOAuthConnect = async (platform: PlatformConfig) => {
  if (platform.type !== PlatformType.YouCan) {
    // Fallback to regular wizard for non-OAuth platforms
    handlePlatformSelect(platform)
    return
  }

  // Get the first store as default (user can choose if they have multiple stores)
  const defaultStoreId = stores.value?.[0]?.id
  if (!defaultStoreId) {
    showError(t('integrations.oauthCallback.noStoreError'))
    return
  }

  connectingPlatform.value = platform.type
  try {
    // Get the runtime config for API base URL
    const config = useRuntimeConfig()
    // Use production URL as fallback since runtime config may not be available at build time
    const apiBase = config.public.apiBaseUrl || 'http://ecombackend.ecom.astracaisse.com'

    // Build the OAuth connect URL with proper redirect
    const callbackUrl = `${window.location.origin}/oauth/youcan/callback`
    const connectUrl = `${apiBase}/api/integrations/youcan/connect?storeId=${defaultStoreId}&redirectUrl=${encodeURIComponent(callbackUrl)}`

    console.log('[YouCan OAuth] API Base:', apiBase)
    console.log('[YouCan OAuth] Connect URL:', connectUrl)

    // Redirect to YouCan OAuth page
    window.location.href = connectUrl
  } catch (error) {
    console.error('Failed to initiate OAuth:', error)
    showError(t('integrations.oauthCallback.error'))
    connectingPlatform.value = null
  }
}

const handleEdit = (integration: PlatformIntegrationDto) => {
  const config = getPlatformConfig(integration.type as PlatformType)
  if (config) {
    selectedPlatform.value = config
    editingIntegration.value = integration
    showWizard.value = true
  }
}

const handleDelete = (integration: PlatformIntegrationDto) => {
  deletingIntegration.value = integration
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deletingIntegration.value?.id) return

  isDeleting.value = true
  try {
    await deletePlatformIntegration(deletingIntegration.value.id)
    showSuccess(t('messages.deleteSuccess'))
    showDeleteModal.value = false
    deletingIntegration.value = null
  } catch (error) {
    console.error('Failed to delete integration:', error)
    showError(t('messages.error'))
  } finally {
    isDeleting.value = false
  }
}

const handleToggle = async (integration: PlatformIntegrationDto) => {
  if (!integration.id) return

  try {
    await toggle(integration.id)
    showSuccess(t('messages.updateSuccess'))
  } catch (error) {
    console.error('Failed to toggle integration:', error)
    showError(t('messages.error'))
  }
}

const handleViewWebhook = (integration: PlatformIntegrationDto) => {
  viewingIntegration.value = integration
  if (integration.id) {
    currentWebhookUrl.value = generateWebhookUrl(integration.id)
  }
  showWebhookModal.value = true
}

const copyWebhookUrl = async () => {
  try {
    await navigator.clipboard.writeText(currentWebhookUrl.value)
    webhookCopied.value = true
    setTimeout(() => {
      webhookCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const handleWizardComplete = (integration: PlatformIntegrationDto) => {
  refetch()
  showSuccess(t('integrations.wizard.completeSuccess'))
}

const getConnectionStatus = (integration: PlatformIntegrationDto): ConnectionStatusType => {
  if (!integration.isActive) {
    return 'disconnected'
  }
  if (integration.lastSyncedAt) {
    return 'connected'
  }
  return 'pending'
}

const getPlatformTypeName = (type: PlatformType): string => {
  const config = getPlatformConfig(type)
  return config?.name || 'Unknown'
}

const getIntegrationIcon = (type: PlatformType) => {
  const config = getPlatformConfig(type)
  switch (config?.icon) {
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
}
</script>
