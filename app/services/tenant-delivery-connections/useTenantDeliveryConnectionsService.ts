/**
 * Tenant Delivery Connections Service
 *
 * Manages tenant's connections to delivery providers.
 * Provides CRUD operations plus test, sync, and activate/deactivate actions.
 */

import { computed, ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import {
  useTenantDeliveryConnectionsGetAll,
  useTenantDeliveryConnectionsGet,
  useTenantDeliveryConnectionsConnect,
  useTenantDeliveryConnectionsUpdate,
  useTenantDeliveryConnectionsDisconnect,
  useTenantDeliveryConnectionsActivate,
  useTenantDeliveryConnectionsDeactivate,
  useTenantDeliveryConnectionsTest,
  useTenantDeliveryConnectionsSync,
  getTenantDeliveryConnectionsGetAllQueryKey,
} from '~/api/generated/endpoints/tenant-delivery-connections/tenant-delivery-connections'
import type {
  TenantDeliveryConnectionDto,
  ConnectDeliveryProviderRequest,
  UpdateDeliveryConnectionRequest,
  TestConnectionResponse,
  SyncConnectionResponse,
} from '~/api/generated/models'

export function useTenantDeliveryConnectionsService() {
  const queryClient = useQueryClient()

  // Filter params
  const storeId = ref<string | undefined>(undefined)
  const isActiveFilter = ref<boolean | undefined>(undefined)

  // Get all connections query
  const connectionsQuery = useTenantDeliveryConnectionsGetAll(
    computed(() => ({
      storeId: storeId.value,
      isActive: isActiveFilter.value,
    })),
    {
      query: {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
      },
    }
  )

  // Computed values
  const connections = computed(() => connectionsQuery.data.value ?? [])
  const activeConnections = computed(() => connections.value.filter(c => c.isActive))
  const inactiveConnections = computed(() => connections.value.filter(c => !c.isActive))
  const isLoading = computed(() => connectionsQuery.isLoading.value)
  const isFetching = computed(() => connectionsQuery.isFetching.value)

  // Mutations
  const connectMutation = useTenantDeliveryConnectionsConnect()
  const updateMutation = useTenantDeliveryConnectionsUpdate()
  const disconnectMutation = useTenantDeliveryConnectionsDisconnect()
  const activateMutation = useTenantDeliveryConnectionsActivate()
  const deactivateMutation = useTenantDeliveryConnectionsDeactivate()
  const testMutation = useTenantDeliveryConnectionsTest()
  const syncMutation = useTenantDeliveryConnectionsSync()

  // Loading states
  const isConnecting = computed(() => connectMutation.isPending.value)
  const isUpdating = computed(() => updateMutation.isPending.value)
  const isDisconnecting = computed(() => disconnectMutation.isPending.value)
  const isActivating = computed(() => activateMutation.isPending.value)
  const isDeactivating = computed(() => deactivateMutation.isPending.value)
  const isTesting = computed(() => testMutation.isPending.value)
  const isSyncing = computed(() => syncMutation.isPending.value)
  const isMutating = computed(() =>
    isConnecting.value ||
    isUpdating.value ||
    isDisconnecting.value ||
    isActivating.value ||
    isDeactivating.value ||
    isTesting.value ||
    isSyncing.value
  )

  // Get single connection by ID
  const getById = (id: string) => {
    return useTenantDeliveryConnectionsGet(id, {
      query: {
        staleTime: 30 * 1000,
        enabled: computed(() => !!id),
      },
    })
  }

  // Find connection from cached list
  const findById = (id: string): TenantDeliveryConnectionDto | undefined => {
    return connections.value.find(c => c.id === id)
  }

  // Find connection by template ID
  const findByTemplateId = (templateId: string): TenantDeliveryConnectionDto | undefined => {
    return connections.value.find(c => c.templateId === templateId)
  }

  // Check if connected to a template
  const isConnectedTo = (templateId: string): boolean => {
    return connections.value.some(c => c.templateId === templateId)
  }

  // CRUD Operations
  const connect = async (data: ConnectDeliveryProviderRequest): Promise<string> => {
    const result = await connectMutation.mutateAsync({ data })
    invalidate()
    return result
  }

  const update = async (id: string, data: UpdateDeliveryConnectionRequest): Promise<string> => {
    const result = await updateMutation.mutateAsync({ id, data: { ...data, id } })
    invalidate()
    return result
  }

  const disconnect = async (id: string): Promise<string> => {
    const result = await disconnectMutation.mutateAsync({ id })
    invalidate()
    return result
  }

  // Actions
  const activate = async (id: string): Promise<string> => {
    const result = await activateMutation.mutateAsync({ id })
    invalidate()
    return result
  }

  const deactivate = async (id: string): Promise<string> => {
    const result = await deactivateMutation.mutateAsync({ id })
    invalidate()
    return result
  }

  const test = async (id: string): Promise<TestConnectionResponse> => {
    const result = await testMutation.mutateAsync({ id })
    // Also invalidate to refresh lastTestedAt
    invalidate()
    return result
  }

  const sync = async (id: string): Promise<SyncConnectionResponse> => {
    const result = await syncMutation.mutateAsync({ id })
    return result
  }

  // Filters
  const setStoreFilter = (value: string | undefined) => {
    storeId.value = value
  }

  const setActiveFilter = (value: boolean | undefined) => {
    isActiveFilter.value = value
  }

  const resetFilters = () => {
    storeId.value = undefined
    isActiveFilter.value = undefined
  }

  // Cache management
  const invalidate = () => {
    // Use Orval-generated query key to ensure proper cache invalidation
    // Orval key: ['api','v1','tenantdeliveryconnections', ...]
    queryClient.invalidateQueries({ queryKey: getTenantDeliveryConnectionsGetAllQueryKey() })
  }

  const refetch = () => {
    return connectionsQuery.refetch()
  }

  return {
    // Data
    connections,
    activeConnections,
    inactiveConnections,

    // Loading states
    isLoading,
    isFetching,
    isMutating,
    isConnecting,
    isUpdating,
    isDisconnecting,
    isActivating,
    isDeactivating,
    isTesting,
    isSyncing,

    // Single item
    getById,
    findById,
    findByTemplateId,
    isConnectedTo,

    // CRUD
    connect,
    update,
    disconnect,

    // Actions
    activate,
    deactivate,
    test,
    sync,

    // Filters
    storeId,
    isActiveFilter,
    setStoreFilter,
    setActiveFilter,
    resetFilters,

    // Cache management
    invalidate,
    refetch,
  }
}

export type {
  TenantDeliveryConnectionDto,
  ConnectDeliveryProviderRequest,
  UpdateDeliveryConnectionRequest,
  TestConnectionResponse,
  SyncConnectionResponse,
}
