<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t('deliveryProviders.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('deliveryProviders.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        <p class="mt-4 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
      </div>
    </div>

    <template v-else>
      <!-- Connected Providers Section -->
      <section v-if="connectedProviders.length > 0">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ $t('deliveryProviders.yourConnections') }}
          <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({{ connectedProviders.length }})
          </span>
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <DeliveryProvidersProviderCard
            v-for="item in connectedProviders"
            :key="item.connection.id"
            :template="item.template"
            :connection="item.connection"
            :is-loading="isMutating"
            @manage="openManageDialog"
          />
        </div>
      </section>

      <!-- Available Providers Section -->
      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ $t('deliveryProviders.availableProviders') }}
          <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({{ availableProviders.length }})
          </span>
        </h2>

        <!-- Empty State -->
        <div v-if="availableProviders.length === 0" class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <TruckIcon class="w-12 h-12 text-gray-400 mx-auto" />
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {{ $t('deliveryProviders.allConnected') }}
          </h3>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {{ $t('deliveryProviders.allConnectedDesc') }}
          </p>
        </div>

        <!-- Provider Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <DeliveryProvidersProviderCard
            v-for="template in availableProviders"
            :key="template.id"
            :template="template"
            :is-loading="isConnecting"
            @connect="openConnectDialog"
          />
        </div>
      </section>
    </template>

    <!-- Connect Dialog -->
    <DeliveryProvidersConnectProviderDialog
      v-model="showConnectDialog"
      :template="selectedTemplate"
      :stores="stores"
      :is-connecting="isConnecting"
      @connect="handleConnect"
    />

    <!-- Manage Dialog -->
    <DeliveryProvidersManageConnectionDialog
      ref="manageDialogRef"
      v-model="showManageDialog"
      :connection="selectedConnection"
      :is-testing="isTesting"
      :is-syncing="isSyncing"
      :is-toggling="isActivating || isDeactivating"
      :is-disconnecting="isDisconnecting"
      @test="handleTest"
      @sync="handleSync"
      @activate="handleActivate"
      @deactivate="handleDeactivate"
      @disconnect="handleDisconnect"
    />
  </div>
</template>

<script setup lang="ts">
import { TruckIcon } from '@heroicons/vue/24/outline'
import {
  useDeliveryProviderTemplatesService,
  useTenantDeliveryConnectionsService,
  useStoresService,
  type DeliveryProviderTemplateDto,
  type TenantDeliveryConnectionDto,
  type ConnectDeliveryProviderRequest,
} from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.TenantDeliveryConnections.View',
})

const { notify } = useNotification()

// Services
const templatesService = useDeliveryProviderTemplatesService()
const connectionsService = useTenantDeliveryConnectionsService()
const storesService = useStoresService()

// Data
const { templates, isLoading: isLoadingTemplates } = templatesService
const {
  connections,
  isLoading: isLoadingConnections,
  isConnecting,
  isTesting,
  isSyncing,
  isActivating,
  isDeactivating,
  isDisconnecting,
  isMutating,
  connect,
  test,
  sync,
  activate,
  deactivate,
  disconnect,
} = connectionsService
const { items: stores } = storesService

// Combined loading
const isLoading = computed(() => isLoadingTemplates.value || isLoadingConnections.value)

// Dialog states
const showConnectDialog = ref(false)
const showManageDialog = ref(false)
const selectedTemplate = ref<DeliveryProviderTemplateDto | undefined>()
const selectedConnection = ref<TenantDeliveryConnectionDto | undefined>()
const manageDialogRef = ref<InstanceType<typeof import('~/components/delivery-providers/ManageConnectionDialog.vue').default> | null>(null)

// Computed: providers with their connections
const connectedProviders = computed(() => {
  return connections.value
    .map(connection => {
      const template = templates.value.find(t => t.id === connection.templateId)
      return template ? { template, connection } : null
    })
    .filter((item): item is { template: DeliveryProviderTemplateDto; connection: TenantDeliveryConnectionDto } => item !== null)
    .sort((a, b) => {
      // Active first, then by name
      if (a.connection.isActive !== b.connection.isActive) {
        return a.connection.isActive ? -1 : 1
      }
      return (a.template.name || '').localeCompare(b.template.name || '')
    })
})

// Computed: templates not yet connected
const availableProviders = computed(() => {
  const connectedIds = new Set(connections.value.map(c => c.templateId))
  return templates.value
    .filter(t => t.isActive && !connectedIds.has(t.id))
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
})

// Dialog handlers
const openConnectDialog = (template: DeliveryProviderTemplateDto) => {
  selectedTemplate.value = template
  showConnectDialog.value = true
}

const openManageDialog = (connection: TenantDeliveryConnectionDto) => {
  selectedConnection.value = connection
  showManageDialog.value = true
}

// Action handlers
const handleConnect = async (data: ConnectDeliveryProviderRequest) => {
  try {
    await connect(data)
    showConnectDialog.value = false
    notify.success('Connected successfully!')
  } catch (error: any) {
    notify.error(error.message || 'Failed to connect')
  }
}

const handleTest = async (id: string) => {
  try {
    const result = await test(id)
    manageDialogRef.value?.setTestResult(result)
    if (result.success) {
      notify.success('Connection test successful!')
    } else {
      notify.error(result.message || 'Connection test failed')
    }
  } catch (error: any) {
    notify.error(error.message || 'Test failed')
  }
}

const handleSync = async (id: string) => {
  try {
    const result = await sync(id)
    manageDialogRef.value?.setSyncResult(result)
    notify.success(`Synced ${result.ordersUpdated || 0} orders`)
  } catch (error: any) {
    notify.error(error.message || 'Sync failed')
  }
}

const handleActivate = async (id: string) => {
  try {
    await activate(id)
    // Update selected connection
    selectedConnection.value = connections.value.find(c => c.id === id)
    notify.success('Connection activated')
  } catch (error: any) {
    notify.error(error.message || 'Failed to activate')
  }
}

const handleDeactivate = async (id: string) => {
  try {
    await deactivate(id)
    // Update selected connection
    selectedConnection.value = connections.value.find(c => c.id === id)
    notify.success('Connection deactivated')
  } catch (error: any) {
    notify.error(error.message || 'Failed to deactivate')
  }
}

const handleDisconnect = async (id: string) => {
  try {
    await disconnect(id)
    showManageDialog.value = false
    notify.success('Disconnected successfully')
  } catch (error: any) {
    notify.error(error.message || 'Failed to disconnect')
  }
}
</script>
