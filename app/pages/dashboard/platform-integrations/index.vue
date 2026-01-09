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

    <!-- Shopify Shop Domain Modal -->
    <TransitionRoot :show="showShopifyModal" as="template">
      <Dialog as="div" class="relative z-50" @close="showShopifyModal = false">
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
                  <ShoppingCartIcon class="w-6 h-6 text-green-600" />
                  {{ $t('integrations.shopify.connectTitle') }}
                </DialogTitle>

                <div class="space-y-4">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ $t('integrations.shopify.enterShopDomain') }}
                  </p>

                  <div>
                    <label class="label">{{ $t('integrations.shopify.shopDomain') }}</label>
                    <div class="flex">
                      <input
                        v-model="shopifyShopDomain"
                        type="text"
                        class="input flex-1 rounded-r-none"
                        placeholder="mystore"
                        @keyup.enter="confirmShopifyConnect"
                      />
                      <span class="inline-flex items-center px-3 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg text-sm text-gray-500 dark:text-gray-400">
                        .myshopify.com
                      </span>
                    </div>
                    <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {{ $t('integrations.shopify.shopDomainHint') }}
                    </p>
                  </div>

                  <!-- Setup Guide (Collapsible) -->
                  <details class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <summary class="px-4 py-3 cursor-pointer text-sm font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
                      <InformationCircleIcon class="w-5 h-5" />
                      {{ $t('integrations.shopify.setupGuide') }}
                    </summary>
                    <div class="px-4 pb-4 space-y-3 text-sm">
                      <p class="text-amber-700 dark:text-amber-300">
                        {{ $t('integrations.shopify.setupRequiredDesc') }}
                      </p>
                      <ol class="space-y-2 text-gray-600 dark:text-gray-300">
                        <li>
                          <span class="font-medium text-gray-900 dark:text-white">{{ $t('integrations.shopify.setupStep1') }}</span>
                          <p class="text-xs mt-0.5">{{ $t('integrations.shopify.setupStep1Desc') }}</p>
                        </li>
                        <li>
                          <span class="font-medium text-gray-900 dark:text-white">{{ $t('integrations.shopify.setupStep2') }}</span>
                          <p class="text-xs mt-0.5">{{ $t('integrations.shopify.setupStep2Desc') }}</p>
                        </li>
                        <li>
                          <span class="font-medium text-gray-900 dark:text-white">{{ $t('integrations.shopify.setupStep3') }}</span>
                          <p class="text-xs mt-0.5">{{ $t('integrations.shopify.setupStep3Desc') }}</p>
                        </li>
                        <li>
                          <span class="font-medium text-gray-900 dark:text-white">{{ $t('integrations.shopify.setupStep4') }}</span>
                          <p class="text-xs mt-0.5">{{ $t('integrations.shopify.setupStep4Desc') }}</p>
                        </li>
                        <li>
                          <span class="font-medium text-gray-900 dark:text-white">{{ $t('integrations.shopify.setupStep5') }}</span>
                          <p class="text-xs mt-0.5">{{ $t('integrations.shopify.setupStep5Desc') }}</p>
                        </li>
                      </ol>
                      <p class="text-xs text-amber-600 dark:text-amber-400 pt-2 border-t border-amber-200 dark:border-amber-700">
                        {{ $t('integrations.shopify.contactAdmin') }}
                      </p>
                    </div>
                  </details>
                </div>

                <div class="flex gap-3 mt-6">
                  <button
                    type="button"
                    class="btn-secondary flex-1"
                    @click="showShopifyModal = false"
                  >
                    {{ $t('common.cancel') }}
                  </button>
                  <button
                    type="button"
                    class="btn-primary flex-1"
                    :disabled="!shopifyShopDomain || isConnectingShopify"
                    @click="confirmShopifyConnect"
                  >
                    <span v-if="isConnectingShopify" class="flex items-center gap-2">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      {{ $t('common.loading') }}
                    </span>
                    <span v-else>{{ $t('integrations.shopify.connect') }}</span>
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
  useShopifyIntegrationService,
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
const shopifyService = useShopifyIntegrationService()

// Get all available platforms
const allPlatforms = computed(() => getAllPlatforms())

// Modal states
const showWizard = ref(false)
const showSheetsWizard = ref(false)
const showWebhookModal = ref(false)
const showDeleteModal = ref(false)
const showShopifyModal = ref(false)

// Shopify specific state
const shopifyShopDomain = ref('')
const isConnectingShopify = ref(false)

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

// Handle OAuth connect for platforms like YouCan and Shopify
const handleOAuthConnect = async (platform: PlatformConfig) => {
  // Get the first store as default (user can choose if they have multiple stores)
  const defaultStoreId = stores.value?.[0]?.id
  if (!defaultStoreId) {
    showError(t('integrations.oauthCallback.noStoreError'))
    return
  }

  if (platform.type === PlatformType.Shopify) {
    // Shopify requires shop domain - show modal to get it
    shopifyShopDomain.value = ''
    showShopifyModal.value = true
    return
  }

  connectingPlatform.value = platform.type as string
  try {
    // Get the runtime config for API base URL
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBaseUrl || 'http://ecombackend.ecom.astracaisse.com'

    let callbackUrl: string
    let connectUrl: string

    if (platform.type === PlatformType.YouCan) {
      // YouCan OAuth
      callbackUrl = `${window.location.origin}/oauth/youcan/callback`
      connectUrl = `${apiBase}/api/integrations/youcan/connect?storeId=${defaultStoreId}&redirectUrl=${encodeURIComponent(callbackUrl)}`
      console.log('[YouCan OAuth] Connect URL:', connectUrl)
    } else {
      // Fallback to regular wizard for non-OAuth platforms
      handlePlatformSelect(platform)
      connectingPlatform.value = null
      return
    }

    // Redirect to OAuth page
    window.location.href = connectUrl
  } catch (error) {
    console.error('Failed to initiate OAuth:', error)
    showError(t('integrations.oauthCallback.error'))
    connectingPlatform.value = null
  }
}

// Confirm Shopify connect with shop domain
const confirmShopifyConnect = async () => {
  if (!shopifyShopDomain.value) {
    showError(t('integrations.shopify.shopDomainRequired'))
    return
  }

  const defaultStoreId = stores.value?.[0]?.id
  if (!defaultStoreId) {
    showError(t('integrations.oauthCallback.noStoreError'))
    return
  }

  isConnectingShopify.value = true
  try {
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBaseUrl || 'http://ecombackend.ecom.astracaisse.com'

    // Normalize shop domain (add .myshopify.com if not present)
    let shop = shopifyShopDomain.value.trim().toLowerCase()
    if (!shop.includes('.')) {
      shop = `${shop}.myshopify.com`
    }

    const callbackUrl = `${window.location.origin}/oauth/shopify/callback`
    const connectUrl = `${apiBase}/api/integrations/shopify/connect?shop=${encodeURIComponent(shop)}&redirectUrl=${encodeURIComponent(callbackUrl)}`

    console.log('[Shopify OAuth] Shop:', shop)
    console.log('[Shopify OAuth] Connect URL:', connectUrl)

    // Close modal and redirect
    showShopifyModal.value = false
    window.location.href = connectUrl
  } catch (error) {
    console.error('Failed to initiate Shopify OAuth:', error)
    showError(t('integrations.oauthCallback.error'))
    isConnectingShopify.value = false
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
