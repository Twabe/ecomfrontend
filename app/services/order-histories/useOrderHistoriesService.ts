/**
 * Order Histories Service
 *
 * Read-only service - order histories are created automatically
 * by the system when order state changes, assignments, and other events occur.
 *
 * Provides full traceability of order lifecycle:
 * - State changes (confirmed, cancelled, delivered, etc.)
 * - Assignment events (created, taken, released, completed)
 * - Delivery assignments
 * - Stock operations
 * - COD collection
 */

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/vue-query'
import { customInstance } from '~/api/axios-instance'
import { queryKeys } from '../_base/queryKeys'
import type { PaginationInfo } from '../_base/types'

// ============================================
// TYPES - Define locally until API is regenerated
// ============================================

export interface OrderHistoryDto {
  id: string
  orderId: string
  state?: string
  comment?: string
  agentName?: string
  createdOn: string

  // Enhanced traceability fields
  previousState?: string
  phase?: string
  actionType: string
  userId?: string
  orderAssignmentId?: string
  serviceType?: string
  deliveryCompanyId?: string
  subDeliveryCompanyId?: string
  reasonId?: string
  orderPrice?: number
  codAmount?: number
  metadata?: string
}

export interface SearchOrderHistoriesRequest {
  orderId?: string
  userId?: string
  actionType?: string
  serviceType?: string
  phase?: string
  keyword?: string
  pageNumber: number
  pageSize: number
  orderBy?: string[]
}

// ============================================
// ACTION TYPE LABELS (French)
// ============================================

export const orderHistoryActionLabels: Record<string, { label: string; icon: string; color: string }> = {
  order_created: { label: 'Commande créée', icon: 'i-heroicons-plus-circle', color: 'green' },
  state_change: { label: 'Changement d\'état', icon: 'i-heroicons-arrows-right-left', color: 'blue' },
  phase_change: { label: 'Changement de phase', icon: 'i-heroicons-clock', color: 'purple' },
  assignment_created: { label: 'Assignation créée', icon: 'i-heroicons-user-plus', color: 'green' },
  assignment_taken: { label: 'Prise en charge', icon: 'i-heroicons-hand-raised', color: 'teal' },
  assignment_released: { label: 'Libéré', icon: 'i-heroicons-hand-raised', color: 'orange' },
  assignment_completed: { label: 'Terminé', icon: 'i-heroicons-check-circle', color: 'green' },
  assignment_reassigned: { label: 'Réassigné', icon: 'i-heroicons-arrow-path', color: 'amber' },
  delivery_assigned: { label: 'Livraison assignée', icon: 'i-heroicons-truck', color: 'indigo' },
  stock_deducted: { label: 'Stock déduit', icon: 'i-heroicons-minus-circle', color: 'red' },
  stock_restored: { label: 'Stock restauré', icon: 'i-heroicons-plus-circle', color: 'green' },
  cod_collected: { label: 'COD collecté', icon: 'i-heroicons-banknotes', color: 'green' },
  warning: { label: 'Avertissement', icon: 'i-heroicons-exclamation-triangle', color: 'orange' },
}

// ============================================
// SERVICE
// ============================================

export function useOrderHistoriesService(options: {
  initialParams?: Partial<SearchOrderHistoriesRequest>
  enabled?: boolean
} = {}) {
  const queryClient = useQueryClient()
  const keys = queryKeys.orderHistories

  // Default search params
  const searchParams = ref<SearchOrderHistoriesRequest>({
    pageNumber: 1,
    pageSize: 50,
    orderBy: ['CreatedOn descending'],
    ...options.initialParams,
  } as SearchOrderHistoriesRequest)

  const queryKey = computed(() => keys.list(toRaw(searchParams.value)))

  // Search function using customInstance
  const searchFn = async (params: SearchOrderHistoriesRequest) => {
    return await customInstance<{
      data: OrderHistoryDto[]
      currentPage: number
      totalPages: number
      totalCount: number
      pageSize: number
      hasPreviousPage: boolean
      hasNextPage: boolean
    }>({
      url: '/api/v1/orderhistories/search',
      method: 'POST',
      data: params,
    })
  }

  // Main search query with caching
  const query = useQuery({
    queryKey,
    queryFn: () => searchFn(searchParams.value),
    staleTime: 15 * 1000, // 15 seconds - history updates frequently
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  })

  // Computed
  const items = computed<OrderHistoryDto[]>(() => query.data.value?.data ?? [])
  const pagination = computed<PaginationInfo>(() => ({
    currentPage: query.data.value?.currentPage ?? 1,
    totalPages: query.data.value?.totalPages ?? 1,
    totalCount: query.data.value?.totalCount ?? 0,
    pageSize: query.data.value?.pageSize ?? 50,
    hasPreviousPage: query.data.value?.hasPreviousPage ?? false,
    hasNextPage: query.data.value?.hasNextPage ?? false,
  }))
  const isLoading = computed(() => query.isLoading.value)
  const isFetching = computed(() => query.isFetching.value)

  // Param setters
  const setPage = (page: number) => {
    searchParams.value = { ...searchParams.value, pageNumber: page }
  }

  const setPageSize = (size: number) => {
    searchParams.value = { ...searchParams.value, pageSize: size, pageNumber: 1 }
  }

  const setOrderId = (orderId: string | undefined) => {
    searchParams.value = { ...searchParams.value, orderId, pageNumber: 1 }
  }

  const setActionType = (actionType: string | undefined) => {
    searchParams.value = { ...searchParams.value, actionType, pageNumber: 1 }
  }

  const setServiceType = (serviceType: string | undefined) => {
    searchParams.value = { ...searchParams.value, serviceType, pageNumber: 1 }
  }

  const setFilters = (filters: Partial<SearchOrderHistoriesRequest>) => {
    searchParams.value = { ...searchParams.value, ...filters, pageNumber: 1 }
  }

  const resetParams = () => {
    searchParams.value = {
      pageNumber: 1,
      pageSize: 50,
      orderBy: ['CreatedOn descending'],
      ...options.initialParams,
    } as SearchOrderHistoriesRequest
  }

  // Cache invalidation
  const invalidate = () => queryClient.invalidateQueries({ queryKey: keys.all() })
  const refetch = () => query.refetch()

  // Get history by order ID (convenience method)
  const getByOrderId = (orderId: Ref<string | undefined>) => {
    return useQuery({
      queryKey: computed(() => ['orderHistories', 'byOrder', unref(orderId)] as const),
      queryFn: async () => {
        const id = unref(orderId)
        if (!id) return []
        return await customInstance<OrderHistoryDto[]>({
          url: `/api/v1/orderhistories/by-order/${id}`,
          method: 'GET',
        })
      },
      enabled: computed(() => !!unref(orderId)),
      staleTime: 15 * 1000,
    })
  }

  // Get history by user ID (all actions performed by a user)
  const getByUserId = (userId: Ref<string | undefined>) => {
    return useQuery({
      queryKey: computed(() => ['orderHistories', 'byUser', unref(userId)] as const),
      queryFn: async () => {
        const id = unref(userId)
        if (!id) return []
        return await customInstance<OrderHistoryDto[]>({
          url: `/api/v1/orderhistories/by-user/${id}`,
          method: 'GET',
        })
      },
      enabled: computed(() => !!unref(userId)),
      staleTime: 15 * 1000,
    })
  }

  // Helper to get label for action type
  const getActionLabel = (actionType: string) => {
    return orderHistoryActionLabels[actionType] ?? {
      label: actionType,
      icon: 'i-heroicons-question-mark-circle',
      color: 'gray',
    }
  }

  // Helper to parse metadata JSON
  const parseMetadata = <T = Record<string, unknown>>(metadata?: string): T | null => {
    if (!metadata) return null
    try {
      return JSON.parse(metadata) as T
    } catch {
      return null
    }
  }

  return {
    // Data
    items,
    pagination,
    data: computed(() => query.data.value),

    // Loading states
    isLoading,
    isFetching,

    // Search params
    searchParams,
    setPage,
    setPageSize,
    setOrderId,
    setActionType,
    setServiceType,
    setFilters,
    resetParams,

    // Queries
    getByOrderId,
    getByUserId,

    // Cache
    invalidate,
    refetch,

    // Helpers
    getActionLabel,
    parseMetadata,
    actionLabels: orderHistoryActionLabels,
  }
}
