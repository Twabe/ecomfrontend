/**
 * Order Assignments Service
 *
 * Complex service for worker assignment management
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  orderAssignmentsGetUnassigned,
  orderAssignmentsGetActiveAssignments,
  orderAssignmentsGetMyPending,
  orderAssignmentsGetMyActive,
  orderAssignmentsGetMyCallbacks,
  useOrderAssignmentsAssign,
  useOrderAssignmentsBulkAssign,
  useOrderAssignmentsBulkReassign,
  useOrderAssignmentsSelfAssign,
  useOrderAssignmentsTake,
  useOrderAssignmentsComplete,
  useOrderAssignmentsCompleteSuivi,
  useOrderAssignmentsCompleteQuality,
  useOrderAssignmentsRelease,
  useOrderAssignmentsScheduleCallback,
} from '~/api/generated/endpoints/order-assignments/order-assignments'
import type {
  OrderAssignmentsGetUnassignedParams,
  OrderAssignmentsGetActiveAssignmentsParams,
  OrderAssignmentsGetMyPendingParams,
  OrderAssignmentsGetMyActiveParams,
  OrderAssignmentsGetMyCallbacksParams,
  AssignOrderRequest,
  BulkAssignOrdersRequest,
  BulkReassignOrdersRequest,
  SelfAssignOrderRequest,
  CompleteAssignmentRequest,
  CompleteSuiviAssignmentRequest,
  CompleteQualityAssignmentRequest,
  ReleaseAssignmentRequest,
  ScheduleCallbackRequest,
  WorkerAssignmentDto,
  SupervisorAssignmentDto,
} from '~/api/generated/models'

// Type for supervisor callback view (from GetAllCallbacksRequest)
export interface SupervisorCallbackDto {
  assignmentId: string
  orderId: string
  orderCode: string
  customerName: string
  customerPhone: string
  cityName?: string
  orderPrice: number
  workerId: string
  workerName: string
  callbackScheduledAt: string
  callbackAttemptNumber: number
  isCallbackOverdue: boolean
  notes?: string
}

// Type for batch worker stats (from GetWorkersStatsRequest)
export interface WorkerStatsSummary {
  workerId: string
  workerName: string
  workerEmail?: string
  isOnline: boolean
  autoAssignPriority: number
  canDoConfirmation: boolean
  canDoSuivi: boolean
  canDoQuality: boolean
  canDoCallback: boolean
  pendingCount: number
  activeCount: number
  callbacksCount: number
  completedTodayCount: number
  confirmedTodayCount: number
  deliveredTodayCount: number
  cancelledTodayCount: number
  returnedTodayCount: number
  noResponseTodayCount: number
  confirmationRate: number
  lastActivityAt?: string
}

export interface OverallStats {
  totalPending: number
  totalActive: number
  totalCallbacks: number
  totalCompletedToday: number
  totalConfirmedToday: number
  totalDeliveredToday: number
  totalReturnedToday: number
  onlineWorkersCount: number
  totalWorkersCount: number
}

export interface WorkersStatsResponse {
  workers: WorkerStatsSummary[]
  overall: OverallStats
}

// Types for bulk complete suivi
export interface BulkCompleteSuiviAssignmentsRequest {
  assignmentIds: string[]
  trackingStateId: string
  result: 'delivered' | 'returned' | 'refused'
  notes?: string
}

export interface BulkCompleteSuiviItem {
  assignmentId: string
  orderId: string
  orderCode: string
  success: boolean
  error?: string
  codAmountCollected?: number
}

export interface BulkCompleteSuiviAssignmentsResponse {
  totalAssignments: number
  successfullyCompleted: number
  failed: number
  errors: string[]
  completedItems: BulkCompleteSuiviItem[]
  totalCodCollected: number
}

export function useOrderAssignmentsService() {
  const queryClient = useQueryClient()

  // Query Keys
  const keys = {
    all: ['order-assignments'] as const,
    unassigned: (params?: OrderAssignmentsGetUnassignedParams) => [...keys.all, 'unassigned', params] as const,
    active: (params?: OrderAssignmentsGetActiveAssignmentsParams) => [...keys.all, 'active', params] as const,
    myPending: (params?: OrderAssignmentsGetMyPendingParams) => [...keys.all, 'my-pending', params] as const,
    myActive: (params?: OrderAssignmentsGetMyActiveParams) => [...keys.all, 'my-active', params] as const,
    myCallbacks: (params?: OrderAssignmentsGetMyCallbacksParams) => [...keys.all, 'my-callbacks', params] as const,
    myStats: (serviceType?: string) => [...keys.all, 'my-stats', serviceType] as const,
    allCallbacks: (filter?: string) => [...keys.all, 'all-callbacks', filter] as const,
    workersStats: (onlyOnline?: boolean, serviceType?: string) => [...keys.all, 'workers-stats', onlyOnline, serviceType] as const,
  }

  // Mutations
  const assignMutation = useOrderAssignmentsAssign()
  const bulkAssignMutation = useOrderAssignmentsBulkAssign()
  const bulkReassignMutation = useOrderAssignmentsBulkReassign()
  const selfAssignMutation = useOrderAssignmentsSelfAssign()
  const takeMutation = useOrderAssignmentsTake()
  const completeMutation = useOrderAssignmentsComplete()
  const completeSuiviMutation = useOrderAssignmentsCompleteSuivi()
  const completeQualityMutation = useOrderAssignmentsCompleteQuality()
  const releaseMutation = useOrderAssignmentsRelease()
  const scheduleCallbackMutation = useOrderAssignmentsScheduleCallback()

  // Invalidation helpers
  const invalidateAll = () => queryClient.invalidateQueries({ queryKey: keys.all })

  // Targeted invalidation for worker self-assign
  // Only invalidates queries that are actually affected
  const invalidateAfterSelfAssign = () => {
    // Worker's pending assignments (new assignment appears)
    queryClient.invalidateQueries({ queryKey: ['order-assignments', 'my-pending'] })
    // Orders available for grabbing (grabbed order disappears)
    queryClient.invalidateQueries({ queryKey: ['orders', 'available-for-grabbing'] })
    // Worker stats
    queryClient.invalidateQueries({ queryKey: ['order-assignments', 'my-stats'] })
    // Worker config - use correct key (currentAssignmentCount changes)
    queryClient.invalidateQueries({ queryKey: ['workerServiceConfigs', 'myConfig'] })
  }

  // Targeted invalidation for take action
  const invalidateAfterTake = () => {
    queryClient.invalidateQueries({ queryKey: ['order-assignments', 'my-pending'] })
    queryClient.invalidateQueries({ queryKey: ['order-assignments', 'my-active'] })
  }

  // Query Hooks
  const useUnassignedOrders = (params?: Ref<OrderAssignmentsGetUnassignedParams>) => {
    return useQuery({
      queryKey: computed(() => keys.unassigned(params?.value)),
      queryFn: () => orderAssignmentsGetUnassigned(params?.value),
      staleTime: 10 * 1000, // 10 seconds - needs to be fresh
      refetchInterval: 30 * 1000, // Auto-refresh every 30s
    })
  }

  const useActiveAssignments = (params?: Ref<OrderAssignmentsGetActiveAssignmentsParams>) => {
    return useQuery({
      queryKey: computed(() => keys.active(params?.value)),
      queryFn: () => orderAssignmentsGetActiveAssignments(params?.value),
      staleTime: 10 * 1000,
      refetchInterval: 15 * 1000, // Supervisor view needs to be very fresh
    })
  }

  const useMyPendingAssignments = (params?: Ref<OrderAssignmentsGetMyPendingParams>) => {
    return useQuery({
      queryKey: computed(() => keys.myPending(params?.value)),
      queryFn: () => orderAssignmentsGetMyPending(params?.value),
      staleTime: 10 * 1000,
      refetchInterval: 30 * 1000,
    })
  }

  const useMyActiveAssignments = (params?: Ref<OrderAssignmentsGetMyActiveParams>) => {
    return useQuery({
      queryKey: computed(() => keys.myActive(params?.value)),
      queryFn: () => orderAssignmentsGetMyActive(params?.value),
      staleTime: 10 * 1000,
      refetchInterval: 30 * 1000,
    })
  }

  const useMyCallbacks = (params?: Ref<OrderAssignmentsGetMyCallbacksParams>) => {
    return useQuery({
      queryKey: computed(() => keys.myCallbacks(params?.value)),
      queryFn: () => orderAssignmentsGetMyCallbacks(params?.value),
      staleTime: 30 * 1000,
      refetchInterval: 60 * 1000,
    })
  }

  // Supervisor: all callbacks across all workers
  const useAllCallbacks = (filter?: Ref<string | undefined>) => {
    const api = useApi()
    return useQuery({
      queryKey: computed(() => keys.allCallbacks(filter?.value)),
      queryFn: async () => {
        const params = filter?.value ? `?filter=${filter.value}` : ''
        return api.get<SupervisorCallbackDto[]>(`/api/v1/orderassignments/all-callbacks${params}`)
      },
      staleTime: 30 * 1000,
      refetchInterval: 60 * 1000,
    })
  }

  // Worker stats query (for dashboard counters)
  const useMyStats = (serviceType?: Ref<string | undefined>) => {
    const api = useApi()
    return useQuery({
      queryKey: computed(() => keys.myStats(serviceType?.value)),
      queryFn: async () => {
        const params = serviceType?.value ? `?serviceType=${serviceType.value}` : ''
        return api.get<{
          pendingCount: number
          activeCount: number
          completedTodayCount: number
          deliveredTodayCount: number
          returnedTodayCount: number
          issuesCount: number
        }>(`/api/v1/orderassignments/my-stats${params}`)
      },
      staleTime: 30 * 1000,
      refetchInterval: 60 * 1000,
    })
  }

  // Supervisor: batch worker stats for all workers
  const useWorkersStats = (options?: { onlyOnline?: Ref<boolean>, serviceType?: Ref<string | undefined> }) => {
    const api = useApi()
    return useQuery({
      queryKey: computed(() => keys.workersStats(options?.onlyOnline?.value, options?.serviceType?.value)),
      queryFn: async () => {
        const params = new URLSearchParams()
        if (options?.onlyOnline?.value) params.append('onlyOnline', 'true')
        if (options?.serviceType?.value) params.append('serviceType', options.serviceType.value)
        const queryString = params.toString()
        return api.get<WorkersStatsResponse>(`/api/v1/orderassignments/workers-stats${queryString ? '?' + queryString : ''}`)
      },
      staleTime: 30 * 1000,
      refetchInterval: 30 * 1000, // Refresh every 30s for supervisor view
    })
  }

  // Actions
  const assign = async (data: AssignOrderRequest) => {
    const result = await assignMutation.mutateAsync({ data })
    invalidateAll()
    return result
  }

  const bulkAssign = async (data: BulkAssignOrdersRequest) => {
    const result = await bulkAssignMutation.mutateAsync({ data })
    invalidateAll()
    return result
  }

  const bulkReassign = async (data: BulkReassignOrdersRequest) => {
    const result = await bulkReassignMutation.mutateAsync({ data })
    invalidateAll()
    return result
  }

  const selfAssign = async (data: SelfAssignOrderRequest) => {
    const result = await selfAssignMutation.mutateAsync({ data })
    // Use targeted invalidation to reduce API calls
    invalidateAfterSelfAssign()
    return result
  }

  const take = async (id: string) => {
    const result = await takeMutation.mutateAsync({ id })
    // Use targeted invalidation - only pending and active queries affected
    invalidateAfterTake()
    return result
  }

  const complete = async (id: string, data: CompleteAssignmentRequest) => {
    const result = await completeMutation.mutateAsync({ id, data })
    invalidateAll()
    return result
  }

  const completeSuivi = async (id: string, data: Omit<CompleteSuiviAssignmentRequest, 'assignmentId'>) => {
    // Add assignmentId to the request body (required by backend)
    const requestData: CompleteSuiviAssignmentRequest = {
      ...data,
      assignmentId: id
    }
    console.log('[OrderAssignmentsService] completeSuivi - URL id:', id)
    console.log('[OrderAssignmentsService] completeSuivi - Request body:', JSON.stringify(requestData, null, 2))
    const result = await completeSuiviMutation.mutateAsync({ id, data: requestData })
    invalidateAll()
    return result
  }

  const completeQuality = async (id: string, data: CompleteQualityAssignmentRequest) => {
    const result = await completeQualityMutation.mutateAsync({ id, data })
    invalidateAll()
    return result
  }

  const release = async (id: string, data: ReleaseAssignmentRequest) => {
    const result = await releaseMutation.mutateAsync({ id, data })
    invalidateAll()
    return result
  }

  const scheduleCallback = async (id: string, data: ScheduleCallbackRequest) => {
    const result = await scheduleCallbackMutation.mutateAsync({ id, data })
    invalidateAll()
    return result
  }

  // Bulk complete suivi (using direct API call until generated types are available)
  const bulkCompleteSuivi = async (data: BulkCompleteSuiviAssignmentsRequest) => {
    const api = useApi()
    const result = await api.post<BulkCompleteSuiviAssignmentsResponse>(
      '/api/v1/orderassignments/bulk-complete-suivi',
      data
    )
    invalidateAll()
    return result
  }

  // Mutation states
  const isMutating = computed(() =>
    assignMutation.isPending.value ||
    bulkAssignMutation.isPending.value ||
    bulkReassignMutation.isPending.value ||
    selfAssignMutation.isPending.value ||
    takeMutation.isPending.value ||
    completeMutation.isPending.value ||
    completeSuiviMutation.isPending.value ||
    completeQualityMutation.isPending.value ||
    releaseMutation.isPending.value ||
    scheduleCallbackMutation.isPending.value
  )

  return {
    // Query hooks
    useUnassignedOrders,
    useActiveAssignments,
    useMyPendingAssignments,
    useMyActiveAssignments,
    useMyCallbacks,
    useAllCallbacks,
    useMyStats,
    useWorkersStats,

    // Actions
    assign,
    bulkAssign,
    bulkReassign,
    selfAssign,
    take,
    complete,
    completeSuivi,
    completeQuality,
    release,
    scheduleCallback,
    bulkCompleteSuivi,

    // State
    isMutating,
    invalidateAll,
  }
}

export type {
  WorkerAssignmentDto,
  SupervisorAssignmentDto,
  AssignOrderRequest,
  CompleteAssignmentRequest,
  WorkerStatsSummary,
  OverallStats,
  WorkersStatsResponse,
  BulkCompleteSuiviAssignmentsRequest,
  BulkCompleteSuiviAssignmentsResponse,
  BulkCompleteSuiviItem
}
