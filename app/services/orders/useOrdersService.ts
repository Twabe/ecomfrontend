/**
 * Orders Service
 *
 * Most complex service - 20+ endpoints including:
 * - CRUD operations
 * - Confirm, Cancel, Deliver, Return
 * - Bulk operations
 * - Status changes
 * - Worker/Supervisor workflow operations
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { createEntityService } from '../_base/createEntityService'
import {
  ordersSearch,
  ordersGet,
  ordersGetNewOrders,
  ordersGetConfirmationOrders,
  ordersGetReadyForDelivery,
  ordersGetPendingConfirmations,
  ordersGetByCodes,
  useOrdersCreate,
  useOrdersUpdate,
  useOrdersDelete,
  useOrdersConfirm,
  useOrdersCancel,
  useOrdersMarkAsDelivered,
  useOrdersMarkAsReturned,
  useOrdersBulkUpdateState,
  useOrdersBulkDelete,
  useOrdersBulkMoveToShipping,
  useOrdersGrab,
  useOrdersRelease,
  useOrdersBulkGrab,
  useOrdersGetMyOrders,
  useOrdersGetAvailableForGrabbing,
  useOrdersReassign,
  useOrdersAddOrderItem,
  useOrdersUpdateOrderItem,
  useOrdersRemoveOrderItem,
  useOrdersExport,
  ordersAssignDeliveryCompany,
} from '~/api/generated/endpoints/orders/orders'
import type {
  OrderDto,
  SearchOrdersRequest,
  CreateOrderRequest,
  UpdateOrderRequest,
  ConfirmOrderRequest,
  ConfirmOrderResponse,
  CancelOrderWithReasonRequest,
  CancelOrderWithReasonResponse,
  MarkOrdersAsDeliveredRequest,
  MarkOrdersAsDeliveredResponse,
  MarkOrdersAsReturnedRequest,
  MarkOrdersAsReturnedResponse,
  BulkUpdateOrderStateRequest,
  BulkMoveToShippingRequest,
  GetNewOrdersRequest,
  GetOrdersReadyForDeliveryRequest,
  GetPendingConfirmationsRequest,
  GetOrdersByCodesRequest,
  OrdersGetConfirmationOrdersParams,
  ConfirmationOrderDto,
  AddOrderItemRequest,
  UpdateOrderItemRequest,
  RemoveOrderItemRequest,
  GrabOrderRequest,
  ReleaseOrderRequest,
  BulkGrabOrdersRequest,
  BulkGrabOrdersResponse,
  GetWorkerOrdersRequest,
  GetAvailableOrdersForGrabbingRequest,
  ReassignOrdersRequest,
  ReassignOrdersResponse,
} from '~/api/generated/models'

// Types for quality orders query (until swagger regenerated)
export interface GetQualityOrdersParams {
  AssignmentStatus?: string
  Limit?: number
}

// Types for suivi orders query
export interface GetSuiviOrdersParams {
  AssignmentStatus?: string
  WorkerId?: string
  Limit?: number
}

// Types for bulk assign delivery company
export interface BulkAssignDeliveryCompanyRequest {
  orderIds: string[]
  deliveryCompanyId: string
}

// Types for provider labels
export interface GetBulkProviderLabelsRequest {
  orderIds: string[]
}

export interface BulkLabelResult {
  orderId: string
  orderCode: string
  trackingCode?: string
  success: boolean
  error?: string
  providerName?: string
}

export interface LabelData {
  orderId: string
  orderCode: string
  trackingCode?: string
  pdfContent: string // Base64 encoded
  fileName: string
}

export interface GetBulkProviderLabelsResponse {
  totalRequested: number
  successCount: number
  failedCount: number
  noProviderCount: number
  noTrackingCodeCount: number
  results: BulkLabelResult[]
  labels: LabelData[]
}

// Types for archive orders
export interface ArchiveOrdersRequest {
  orderIds: string[]
  comment?: string
}

export interface ArchiveOrdersResponse {
  totalOrders: number
  successfullyArchived: number
  failed: number
  errors: string[]
  archivedOrderCodes: string[]
}

// Types for unarchive orders
export interface UnarchiveOrdersRequest {
  orderIds: string[]
  comment?: string
}

export interface UnarchiveOrdersResponse {
  totalOrders: number
  successfullyUnarchived: number
  failed: number
  errors: string[]
  unarchivedOrderCodes: string[]
}

export interface BulkAssignDeliveryCompanyResponse {
  totalOrders: number
  successfullyAssigned: number
  failed: number
  errors: string[]
  assignedItems: BulkAssignDeliveryItem[]
}

export interface BulkAssignDeliveryItem {
  orderId: string
  orderCode: string
  success: boolean
  error?: string
}

// Types for Ready for Delivery with worker assignments
export interface OrderAssignmentSummaryDto {
  assignmentId: string
  serviceType: string
  status: string
  workerId: string
  workerName: string
  completedAt?: string
  takenAt?: string
}

export interface ReadyForDeliveryOrderDto {
  id: string
  code: string
  items: Array<{
    id: string
    productId?: string
    productName?: string
    quantity: number
    unitPrice: number
  }>
  fullName: string
  phone: string
  address?: string
  cityId?: string
  cityName?: string
  price: number
  deliveryCompanyId?: string
  deliveryCompanyName?: string
  storeId?: string
  storeName?: string
  createdOn: string
  dateValidated?: string
  // Worker assignments
  assignments: OrderAssignmentSummaryDto[]
  confirmedByWorkerName?: string
  confirmedByWorkerId?: string
  suiviWorkerName?: string
  suiviWorkerId?: string
  qualityWorkerName?: string
  qualityWorkerId?: string
}

// Base entity service for standard CRUD operations
export const useOrdersService = createEntityService<
  OrderDto,
  SearchOrdersRequest,
  CreateOrderRequest,
  UpdateOrderRequest
>({
  entityName: 'orders',
  searchFn: ordersSearch,
  useCreate: useOrdersCreate,
  useUpdate: useOrdersUpdate,
  useDelete: useOrdersDelete,
  staleTime: 15 * 1000, // 15 seconds - orders need fresher data
  gcTime: 5 * 60 * 1000,
  refetchOnWindowFocus: true,
})

/**
 * Extended Orders Service with workflow methods
 * Use this for supervisor/worker pages that need additional operations
 */
export function useOrdersWorkflowService() {
  const queryClient = useQueryClient()
  const { success, error } = useNotification()

  // Query Keys
  const keys = {
    all: ['orders'] as const,
    newOrders: (params?: GetNewOrdersRequest) => [...keys.all, 'new-orders', params] as const,
    confirmationOrders: (params?: OrdersGetConfirmationOrdersParams) => [...keys.all, 'confirmation-orders', params] as const,
    qualityOrders: (params?: GetQualityOrdersParams) => [...keys.all, 'quality-orders', params] as const,
    suiviOrders: (params?: GetSuiviOrdersParams) => [...keys.all, 'suivi-orders', params] as const,
    readyForDelivery: (params?: GetOrdersReadyForDeliveryRequest) => [...keys.all, 'ready-for-delivery', params] as const,
    pendingConfirmations: (params?: GetPendingConfirmationsRequest) => [...keys.all, 'pending-confirmations', params] as const,
    availableForGrabbing: (params?: GetAvailableOrdersForGrabbingRequest) => [...keys.all, 'available-for-grabbing', params] as const,
    detail: (id: string) => [...keys.all, 'detail', id] as const,
  }

  // Mutations
  const confirmMutation = useOrdersConfirm()
  const cancelMutation = useOrdersCancel()
  const markDeliveredMutation = useOrdersMarkAsDelivered()
  const markReturnedMutation = useOrdersMarkAsReturned()
  const bulkUpdateStateMutation = useOrdersBulkUpdateState()
  const bulkDeleteMutation = useOrdersBulkDelete()
  const bulkMoveToShippingMutation = useOrdersBulkMoveToShipping()
  const grabMutation = useOrdersGrab()
  const releaseMutation = useOrdersRelease()
  const bulkGrabMutation = useOrdersBulkGrab()
  const myOrdersMutation = useOrdersGetMyOrders()
  const availableForGrabbingMutation = useOrdersGetAvailableForGrabbing()
  const reassignMutation = useOrdersReassign()
  const addItemMutation = useOrdersAddOrderItem()
  const updateItemMutation = useOrdersUpdateOrderItem()
  const removeItemMutation = useOrdersRemoveOrderItem()
  const exportMutation = useOrdersExport()

  // Invalidation
  const invalidateAll = () => queryClient.invalidateQueries({ queryKey: keys.all })

  // ============================================
  // Query Hooks (with caching)
  // ============================================

  /**
   * Get new orders awaiting initial processing
   * Used by supervisor to see orders that need assignment
   */
  const useNewOrders = (params?: Ref<GetNewOrdersRequest>) => {
    return useQuery({
      queryKey: computed(() => keys.newOrders(params?.value)),
      queryFn: () => ordersGetNewOrders(params?.value || {}),
      staleTime: 10 * 1000,
      refetchInterval: 30 * 1000, // Auto-refresh
    })
  }

  /**
   * Get confirmation orders with assignment status
   * Used by supervisor to see orders in confirmation phase
   */
  const useConfirmationOrders = (params?: Ref<OrdersGetConfirmationOrdersParams>) => {
    return useQuery({
      queryKey: computed(() => keys.confirmationOrders(params?.value)),
      queryFn: () => ordersGetConfirmationOrders(params?.value),
      staleTime: 10 * 1000,
      refetchInterval: 30 * 1000,
    })
  }

  /**
   * Get quality orders with assignment status
   * Used by supervisor to see orders in quality phase
   */
  const useQualityOrders = (params?: Ref<GetQualityOrdersParams>) => {
    const api = useApi()
    return useQuery({
      queryKey: computed(() => keys.qualityOrders(params?.value)),
      queryFn: async () => {
        const queryParams = new URLSearchParams()
        if (params?.value?.AssignmentStatus) queryParams.set('AssignmentStatus', params.value.AssignmentStatus)
        if (params?.value?.Limit) queryParams.set('Limit', params.value.Limit.toString())
        const url = `/api/v1/orders/quality-orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`
        return api.get<ConfirmationOrderDto[]>(url)
      },
      staleTime: 10 * 1000,
      refetchInterval: 30 * 1000,
    })
  }

  /**
   * Get suivi orders with assignment status
   * Used by supervisor to see orders in suivi phase
   */
  const useSuiviOrders = (params?: Ref<GetSuiviOrdersParams>) => {
    const api = useApi()
    return useQuery({
      queryKey: computed(() => keys.suiviOrders(params?.value)),
      queryFn: async () => {
        const queryParams = new URLSearchParams()
        if (params?.value?.AssignmentStatus) queryParams.set('AssignmentStatus', params.value.AssignmentStatus)
        if (params?.value?.WorkerId) queryParams.set('WorkerId', params.value.WorkerId)
        if (params?.value?.Limit) queryParams.set('Limit', params.value.Limit.toString())
        const url = `/api/v1/orders/suivi-orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`
        return api.get<ConfirmationOrderDto[]>(url)
      },
      staleTime: 10 * 1000,
      refetchInterval: 30 * 1000,
    })
  }

  /**
   * Get orders ready for delivery
   * Used by supervisor to see orders ready to ship
   */
  const useReadyForDelivery = (params?: Ref<GetOrdersReadyForDeliveryRequest>) => {
    return useQuery({
      queryKey: computed(() => keys.readyForDelivery(params?.value)),
      queryFn: () => ordersGetReadyForDelivery(params?.value || {}),
      staleTime: 10 * 1000,
      refetchInterval: 30 * 1000,
    })
  }

  /**
   * Get orders pending confirmation
   */
  const usePendingConfirmations = (params?: Ref<GetPendingConfirmationsRequest>) => {
    return useQuery({
      queryKey: computed(() => keys.pendingConfirmations(params?.value)),
      queryFn: () => ordersGetPendingConfirmations(params?.value || {}),
      staleTime: 10 * 1000,
      refetchInterval: 30 * 1000,
    })
  }

  /**
   * Get single order by ID
   */
  const useOrder = (id: Ref<string>) => {
    return useQuery({
      queryKey: computed(() => keys.detail(id.value)),
      queryFn: () => ordersGet(id.value),
      enabled: computed(() => !!id.value),
      staleTime: 30 * 1000,
    })
  }

  /**
   * Get orders available for self-assign (grabbing)
   * Used by workers with SelfAssign permission
   */
  const useAvailableForGrabbing = (params?: Ref<GetAvailableOrdersForGrabbingRequest>, enabled?: Ref<boolean>) => {
    return useQuery({
      queryKey: computed(() => keys.availableForGrabbing(params?.value)),
      queryFn: () => availableForGrabbingMutation.mutateAsync({ data: params?.value || { pageNumber: 1, pageSize: 50 } }),
      enabled: enabled ?? ref(true),
      staleTime: 10 * 1000, // 10 seconds - needs to be fresh
      refetchInterval: 15 * 1000, // Auto-refresh every 15s for real-time updates
    })
  }

  // ============================================
  // Direct API calls (for mutations that return data)
  // ============================================

  /**
   * Get new orders (non-reactive, for one-time fetch)
   */
  const getNewOrders = async (params: GetNewOrdersRequest = {}): Promise<OrderDto[]> => {
    return ordersGetNewOrders(params)
  }

  /**
   * Get confirmation orders (non-reactive, for one-time fetch)
   */
  const getConfirmationOrders = async (params: OrdersGetConfirmationOrdersParams = {}): Promise<ConfirmationOrderDto[]> => {
    return ordersGetConfirmationOrders(params)
  }

  /**
   * Get quality orders (non-reactive, for one-time fetch)
   */
  const getQualityOrders = async (params: GetQualityOrdersParams = {}): Promise<ConfirmationOrderDto[]> => {
    const api = useApi()
    const queryParams = new URLSearchParams()
    if (params.AssignmentStatus) queryParams.set('AssignmentStatus', params.AssignmentStatus)
    if (params.Limit) queryParams.set('Limit', params.Limit.toString())
    const url = `/api/v1/orders/quality-orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    return api.get<ConfirmationOrderDto[]>(url)
  }

  /**
   * Get suivi orders (non-reactive, for one-time fetch)
   */
  const getSuiviOrders = async (params: GetSuiviOrdersParams = {}): Promise<ConfirmationOrderDto[]> => {
    const api = useApi()
    const queryParams = new URLSearchParams()
    if (params.AssignmentStatus) queryParams.set('AssignmentStatus', params.AssignmentStatus)
    if (params.WorkerId) queryParams.set('WorkerId', params.WorkerId)
    if (params.Limit) queryParams.set('Limit', params.Limit.toString())
    const url = `/api/v1/orders/suivi-orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    return api.get<ConfirmationOrderDto[]>(url)
  }

  /**
   * Get orders ready for delivery (non-reactive, for one-time fetch)
   * Returns enriched DTOs with worker assignment info
   */
  const getReadyForDelivery = async (params: GetOrdersReadyForDeliveryRequest = {}): Promise<ReadyForDeliveryOrderDto[]> => {
    // Cast needed until swagger is regenerated
    return ordersGetReadyForDelivery(params) as Promise<ReadyForDeliveryOrderDto[]>
  }

  /**
   * Get orders by codes
   */
  const getOrdersByCodes = async (codes: string[]): Promise<OrderDto[]> => {
    return ordersGetByCodes({ codes })
  }

  /**
   * Get single order
   */
  const getOrder = async (id: string): Promise<OrderDto> => {
    return ordersGet(id)
  }

  // ============================================
  // Workflow Actions (with auto-invalidation)
  // ============================================

  /**
   * Confirm an order
   */
  const confirmOrder = async (data: ConfirmOrderRequest): Promise<ConfirmOrderResponse> => {
    const result = await confirmMutation.mutateAsync({ data })
    success('Order confirmed successfully')
    invalidateAll()
    return result
  }

  /**
   * Cancel an order with reason
   */
  const cancelOrder = async (data: CancelOrderWithReasonRequest): Promise<CancelOrderWithReasonResponse> => {
    const result = await cancelMutation.mutateAsync({ data })
    success('Order cancelled successfully')
    invalidateAll()
    return result
  }

  /**
   * Mark orders as delivered
   */
  const markAsDelivered = async (data: MarkOrdersAsDeliveredRequest): Promise<MarkOrdersAsDeliveredResponse> => {
    const result = await markDeliveredMutation.mutateAsync({ data })
    if (result.successfullyMarked && result.successfullyMarked > 0) {
      success(`${result.successfullyMarked} order(s) marked as delivered`)
    }
    if (result.failed && result.failed > 0) {
      error(`${result.failed} order(s) failed to update`)
    }
    invalidateAll()
    return result
  }

  /**
   * Mark orders as returned
   */
  const markAsReturned = async (data: MarkOrdersAsReturnedRequest): Promise<MarkOrdersAsReturnedResponse> => {
    const result = await markReturnedMutation.mutateAsync({ data })
    if (result.successfullyMarked && result.successfullyMarked > 0) {
      success(`${result.successfullyMarked} order(s) marked as returned`)
    }
    if (result.failed && result.failed > 0) {
      error(`${result.failed} order(s) failed to update`)
    }
    invalidateAll()
    return result
  }

  /**
   * Bulk update order state
   */
  const bulkUpdateState = async (data: BulkUpdateOrderStateRequest) => {
    const result = await bulkUpdateStateMutation.mutateAsync({ data })
    success('Orders updated successfully')
    invalidateAll()
    return result
  }

  /**
   * Bulk delete orders
   */
  const bulkDelete = async (orderIds: string[]) => {
    const result = await bulkDeleteMutation.mutateAsync({ data: { orderIds } })
    success('Orders deleted successfully')
    invalidateAll()
    return result
  }

  /**
   * Bulk move to shipping
   */
  const bulkMoveToShipping = async (data: BulkMoveToShippingRequest) => {
    const result = await bulkMoveToShippingMutation.mutateAsync({ data })
    success('Orders moved to shipping')
    invalidateAll()
    return result
  }

  // ============================================
  // Worker Operations
  // ============================================

  /**
   * Grab an order for processing
   */
  const grabOrder = async (data: GrabOrderRequest) => {
    const result = await grabMutation.mutateAsync({ data })
    success('Order grabbed successfully')
    invalidateAll()
    return result
  }

  /**
   * Release an order back to pool
   */
  const releaseOrder = async (data: ReleaseOrderRequest) => {
    const result = await releaseMutation.mutateAsync({ data })
    success('Order released successfully')
    invalidateAll()
    return result
  }

  /**
   * Bulk grab orders
   */
  const bulkGrabOrders = async (data: BulkGrabOrdersRequest): Promise<BulkGrabOrdersResponse> => {
    const result = await bulkGrabMutation.mutateAsync({ data })
    if (result.successfullyGrabbed && result.successfullyGrabbed > 0) {
      success(`${result.successfullyGrabbed} order(s) grabbed successfully`)
    }
    if (result.failed && result.failed > 0) {
      error(`${result.failed} order(s) failed to grab`)
    }
    invalidateAll()
    return result
  }

  /**
   * Get worker's own orders
   */
  const getMyOrders = async (data: GetWorkerOrdersRequest) => {
    return myOrdersMutation.mutateAsync({ data })
  }

  /**
   * Get orders available for grabbing
   */
  const getAvailableForGrabbing = async (data: GetAvailableOrdersForGrabbingRequest) => {
    return availableForGrabbingMutation.mutateAsync({ data })
  }

  /**
   * Reassign orders to different worker
   */
  const reassignOrders = async (data: ReassignOrdersRequest): Promise<ReassignOrdersResponse> => {
    const result = await reassignMutation.mutateAsync({ data })
    if (result.successfullyReassigned && result.successfullyReassigned > 0) {
      success(`${result.successfullyReassigned} order(s) reassigned successfully`)
    }
    if (result.failed && result.failed > 0) {
      error(`${result.failed} order(s) failed to reassign`)
    }
    invalidateAll()
    return result
  }

  /**
   * Assign delivery company to an order (for Suivi agents)
   * This follows industry standard COD workflow: Confirmation Agent only verifies customer,
   * Suivi Agent assigns delivery company.
   * Returns the result with trackingCode and sendToProviderSuccess for UI feedback.
   */
  const assignDeliveryCompany = async (data: { orderId: string; deliveryCompanyId: string }) => {
    const result = await ordersAssignDeliveryCompany(data)
    // Show success only if no tracking info (Manual providers)
    // If tracking info available, caller will show specific message
    if (!result.sendToProviderSuccess && !result.sendToProviderError) {
      success('Delivery company assigned successfully')
    }
    invalidateAll()
    return result
  }

  /**
   * Bulk assign delivery company to multiple orders at once
   * Used by Suivi agents to assign delivery company to all selected orders
   */
  const bulkAssignDeliveryCompany = async (data: BulkAssignDeliveryCompanyRequest): Promise<BulkAssignDeliveryCompanyResponse> => {
    const api = useApi()
    const result = await api.post<BulkAssignDeliveryCompanyResponse>(
      '/api/v1/orders/bulk-assign-delivery-company',
      data
    )
    if (result.successfullyAssigned > 0) {
      success(`${result.successfullyAssigned} order(s) assigned to delivery company`)
    }
    if (result.failed > 0) {
      error(`${result.failed} order(s) failed to assign`)
    }
    invalidateAll()
    return result
  }

  // ============================================
  // Order Item Management
  // ============================================

  /**
   * Add item to order
   */
  const addOrderItem = async (orderId: string, data: AddOrderItemRequest) => {
    const result = await addItemMutation.mutateAsync({ orderId, data })
    success('Item added successfully')
    invalidateAll()
    return result
  }

  /**
   * Update order item
   */
  const updateOrderItem = async (orderId: string, itemId: string, data: UpdateOrderItemRequest) => {
    const result = await updateItemMutation.mutateAsync({ orderId, itemId, data })
    success('Item updated successfully')
    invalidateAll()
    return result
  }

  /**
   * Remove order item
   */
  const removeOrderItem = async (orderId: string, itemId: string, data: RemoveOrderItemRequest) => {
    const result = await removeItemMutation.mutateAsync({ orderId, itemId, data })
    success('Item removed successfully')
    invalidateAll()
    return result
  }

  /**
   * Export orders to Excel
   */
  const exportOrders = async (orderIds: string[]) => {
    return exportMutation.mutateAsync({ data: { orderIds } })
  }

  // ============================================
  // Archive Operations
  // ============================================

  /**
   * Archive orders
   */
  const archiveOrders = async (data: ArchiveOrdersRequest): Promise<ArchiveOrdersResponse> => {
    const api = useApi()
    const result = await api.post<ArchiveOrdersResponse>(
      '/api/v1/orders/archive',
      data
    )
    if (result.successfullyArchived > 0) {
      success(`${result.successfullyArchived} order(s) archived successfully`)
    }
    if (result.failed > 0) {
      error(`${result.failed} order(s) failed to archive`)
    }
    invalidateAll()
    return result
  }

  /**
   * Unarchive orders
   */
  const unarchiveOrders = async (data: UnarchiveOrdersRequest): Promise<UnarchiveOrdersResponse> => {
    const api = useApi()
    const result = await api.post<UnarchiveOrdersResponse>(
      '/api/v1/orders/unarchive',
      data
    )
    if (result.successfullyUnarchived > 0) {
      success(`${result.successfullyUnarchived} order(s) unarchived successfully`)
    }
    if (result.failed > 0) {
      error(`${result.failed} order(s) failed to unarchive`)
    }
    invalidateAll()
    return result
  }

  // ============================================
  // Provider Label Operations
  // ============================================

  /**
   * Get provider label for a single order
   * Returns the PDF as a Blob or null if not available
   */
  const getProviderLabel = async (orderId: string): Promise<Blob | null> => {
    const api = useApi()
    try {
      const response = await fetch(`/api/v1/orders/${orderId}/provider-label`, {
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
        },
      })

      if (response.status === 404) {
        // Provider doesn't support labels
        return null
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch label')
      }

      return await response.blob()
    }
    catch (err: any) {
      console.error('Provider label error:', err)
      throw err
    }
  }

  /**
   * Get provider labels for multiple orders
   * Returns summary with individual label results
   */
  const getBulkProviderLabels = async (data: GetBulkProviderLabelsRequest): Promise<GetBulkProviderLabelsResponse> => {
    const api = useApi()
    return api.post<GetBulkProviderLabelsResponse>(
      '/api/v1/orders/bulk-provider-labels',
      data
    )
  }

  /**
   * Open provider label in new tab for printing
   */
  const printProviderLabel = async (orderId: string): Promise<boolean> => {
    try {
      const blob = await getProviderLabel(orderId)
      if (blob) {
        const url = URL.createObjectURL(blob)
        const printWindow = window.open(url, '_blank')
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print()
          }
        }
        return true
      }
      return false
    }
    catch (err) {
      error('Failed to fetch provider label')
      return false
    }
  }

  // Mutation loading states
  const isMutating = computed(() =>
    confirmMutation.isPending.value ||
    cancelMutation.isPending.value ||
    markDeliveredMutation.isPending.value ||
    markReturnedMutation.isPending.value ||
    bulkUpdateStateMutation.isPending.value ||
    bulkDeleteMutation.isPending.value ||
    bulkMoveToShippingMutation.isPending.value ||
    grabMutation.isPending.value ||
    releaseMutation.isPending.value ||
    bulkGrabMutation.isPending.value ||
    reassignMutation.isPending.value
  )

  return {
    // Query hooks (reactive)
    useNewOrders,
    useConfirmationOrders,
    useQualityOrders,
    useSuiviOrders,
    useReadyForDelivery,
    usePendingConfirmations,
    useAvailableForGrabbing,
    useOrder,

    // Direct API calls (non-reactive)
    getNewOrders,
    getConfirmationOrders,
    getQualityOrders,
    getSuiviOrders,
    getReadyForDelivery,
    getOrdersByCodes,
    getOrder,

    // Workflow actions
    confirmOrder,
    cancelOrder,
    markAsDelivered,
    markAsReturned,
    bulkUpdateState,
    bulkDelete,
    bulkMoveToShipping,

    // Worker operations
    grabOrder,
    releaseOrder,
    bulkGrabOrders,
    getMyOrders,
    getAvailableForGrabbing,
    reassignOrders,
    assignDeliveryCompany,
    bulkAssignDeliveryCompany,

    // Order item management
    addOrderItem,
    updateOrderItem,
    removeOrderItem,
    exportOrders,

    // Archive operations
    archiveOrders,
    unarchiveOrders,

    // Provider label operations
    getProviderLabel,
    getBulkProviderLabels,
    printProviderLabel,

    // State
    isMutating,
    invalidateAll,
  }
}

// Extended request type with workerId filter (until swagger regenerated)
export interface GetOrdersReadyForDeliveryRequestExtended extends GetOrdersReadyForDeliveryRequest {
  workerId?: string
}

// Re-export types for convenience
export type {
  OrderDto,
  CreateOrderRequest,
  UpdateOrderRequest,
  ConfirmOrderRequest,
  ConfirmOrderResponse,
  CancelOrderWithReasonRequest,
  CancelOrderWithReasonResponse,
  ConfirmationOrderDto,
  GetNewOrdersRequest,
  OrdersGetConfirmationOrdersParams,
  GetQualityOrdersParams,
  GetSuiviOrdersParams,
  AddOrderItemRequest,
  UpdateOrderItemRequest,
  RemoveOrderItemRequest,
  ReadyForDeliveryOrderDto,
  OrderAssignmentSummaryDto,
  GetOrdersReadyForDeliveryRequestExtended,
  GetBulkProviderLabelsRequest,
  GetBulkProviderLabelsResponse,
  BulkLabelResult,
  LabelData,
}
