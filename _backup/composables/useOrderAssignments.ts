import type {
  WorkerAssignmentDto,
  AssignOrderRequest,
  TakeAssignmentResponse,
  CompleteAssignmentRequest,
  CompleteAssignmentResponse,
  ReleaseAssignmentRequest,
  ReleaseAssignmentResponse,
  SelfAssignOrderRequest,
  SelfAssignOrderResponse,
  BulkAssignOrdersRequest,
  BulkAssignOrdersResponse,
  BulkReassignOrdersRequest,
  BulkReassignOrdersResponse,
  SupervisorAssignmentDto,
  ScheduleCallbackRequest,
  ScheduleCallbackResponse,
  CompleteSuiviRequest,
  CompleteSuiviResponse,
  CompleteQualityRequest,
  CompleteQualityResponse,
  CallbackFilter
} from '~/types/orderAssignment'
import type { Order } from '~/types/order'
import type { PaginatedResponse } from '~/types/api'

export const useOrderAssignments = () => {
  const api = useApi()
  const { success, error } = useNotification()

  // State
  const myPendingAssignments = useState<WorkerAssignmentDto[]>('myPendingAssignments', () => [])
  const myActiveAssignments = useState<WorkerAssignmentDto[]>('myActiveAssignments', () => [])
  const isLoading = useState<boolean>('orderAssignments-loading', () => false)

  // Get my pending assignments (assigned but not yet taken)
  const getMyPendingAssignments = async (serviceType?: string) => {
    isLoading.value = true
    try {
      const url = serviceType
        ? `/api/v1/orderassignments/my-pending?serviceType=${serviceType}`
        : '/api/v1/orderassignments/my-pending'
      const response = await api.get<WorkerAssignmentDto[]>(url)
      myPendingAssignments.value = response
      return response
    } catch (err) {
      error('Failed to load pending assignments')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get my active assignments (taken, currently working on)
  const getMyActiveAssignments = async (serviceType?: string) => {
    isLoading.value = true
    try {
      const url = serviceType
        ? `/api/v1/orderassignments/my-active?serviceType=${serviceType}`
        : '/api/v1/orderassignments/my-active'
      const response = await api.get<WorkerAssignmentDto[]>(url)
      myActiveAssignments.value = response
      return response
    } catch (err) {
      error('Failed to load active assignments')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get unassigned orders (Nouvelles)
  const getUnassignedOrders = async (params: {
    serviceType?: string
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.serviceType) queryParams.append('serviceType', params.serviceType)
      queryParams.append('pageNumber', String(params.pageNumber || 1))
      queryParams.append('pageSize', String(params.pageSize || 15))

      return await api.get<PaginatedResponse<Order>>(
        `/api/v1/orderassignments/unassigned?${queryParams.toString()}`
      )
    } catch (err) {
      error('Failed to load unassigned orders')
      throw err
    }
  }

  // Assign order to worker (supervisor action)
  const assignOrder = async (data: AssignOrderRequest) => {
    try {
      const id = await api.post<string>('/api/v1/orderassignments/assign', data)
      success('Order assigned successfully')
      return id
    } catch (err) {
      error('Failed to assign order')
      throw err
    }
  }

  // Take assignment (worker clicks "Prendre")
  const takeAssignment = async (assignmentId: string) => {
    try {
      const response = await api.post<TakeAssignmentResponse>(
        `/api/v1/orderassignments/${assignmentId}/take`
      )
      success('Assignment taken successfully')
      // Refresh lists
      await Promise.all([getMyPendingAssignments(), getMyActiveAssignments()])
      return response
    } catch (err) {
      error('Failed to take assignment')
      throw err
    }
  }

  // Complete assignment
  const completeAssignment = async (assignmentId: string, data: CompleteAssignmentRequest) => {
    try {
      const response = await api.post<CompleteAssignmentResponse>(
        `/api/v1/orderassignments/${assignmentId}/complete`,
        data
      )
      success('Assignment completed')
      await getMyActiveAssignments()
      return response
    } catch (err) {
      error('Failed to complete assignment')
      throw err
    }
  }

  // Release assignment back to queue
  const releaseAssignment = async (assignmentId: string, data?: ReleaseAssignmentRequest) => {
    try {
      const response = await api.post<ReleaseAssignmentResponse>(
        `/api/v1/orderassignments/${assignmentId}/release`,
        data || {}
      )
      success('Assignment released')
      await Promise.all([getMyPendingAssignments(), getMyActiveAssignments()])
      return response
    } catch (err) {
      error('Failed to release assignment')
      throw err
    }
  }

  // Self-assign an order (worker assigns to themselves)
  const selfAssignOrder = async (data: SelfAssignOrderRequest) => {
    try {
      const response = await api.post<SelfAssignOrderResponse>(
        '/api/v1/orderassignments/self-assign',
        data
      )
      success('Order self-assigned successfully')
      // Refresh pending assignments list
      await getMyPendingAssignments()
      return response
    } catch (err) {
      error('Failed to self-assign order')
      throw err
    }
  }

  // Bulk assign orders to a worker with multi-service chain (supervisor action)
  const bulkAssignOrders = async (data: BulkAssignOrdersRequest): Promise<BulkAssignOrdersResponse> => {
    try {
      const response = await api.post<BulkAssignOrdersResponse>(
        '/api/v1/orderassignments/bulk-assign',
        data
      )
      if (response.successfullyAssigned > 0) {
        success(`${response.successfullyAssigned} order(s) assigned successfully`)
      }
      if (response.failed > 0) {
        error(`${response.failed} order(s) failed to assign`)
      }
      return response
    } catch (err) {
      error('Failed to assign orders')
      throw err
    }
  }

  // Bulk reassign orders to a different worker (supervisor action)
  const bulkReassignOrders = async (data: BulkReassignOrdersRequest): Promise<BulkReassignOrdersResponse> => {
    try {
      const response = await api.post<BulkReassignOrdersResponse>(
        '/api/v1/orderassignments/bulk-reassign',
        data
      )
      if (response.successfullyReassigned > 0) {
        success(`${response.successfullyReassigned} order(s) reassigned successfully`)
      }
      if (response.failed > 0) {
        error(`${response.failed} order(s) failed to reassign`)
      }
      return response
    } catch (err) {
      error('Failed to reassign orders')
      throw err
    }
  }

  // Get active assignments for supervisor (orders with pending/taken assignments)
  const getActiveAssignmentsForSupervisor = async (params: {
    serviceType?: string
    limit?: number
  } = {}): Promise<SupervisorAssignmentDto[]> => {
    try {
      const queryParams = new URLSearchParams()
      if (params.serviceType) queryParams.append('serviceType', params.serviceType)
      if (params.limit) queryParams.append('limit', String(params.limit))

      return await api.get<SupervisorAssignmentDto[]>(
        `/api/v1/orderassignments/active-assignments?${queryParams.toString()}`
      )
    } catch (err) {
      error('Failed to load active assignments')
      throw err
    }
  }

  // ============================================
  // NEW: Service-specific methods
  // ============================================

  // Get my scheduled callbacks
  const getMyCallbacks = async (filter?: CallbackFilter): Promise<WorkerAssignmentDto[]> => {
    try {
      const url = filter
        ? `/api/v1/orderassignments/my-callbacks?filter=${filter}`
        : '/api/v1/orderassignments/my-callbacks'
      return await api.get<WorkerAssignmentDto[]>(url)
    } catch (err) {
      error('Failed to load callbacks')
      throw err
    }
  }

  // Schedule a callback for a confirmation assignment
  const scheduleCallback = async (assignmentId: string, data: ScheduleCallbackRequest): Promise<ScheduleCallbackResponse> => {
    try {
      const response = await api.post<ScheduleCallbackResponse>(
        `/api/v1/orderassignments/${assignmentId}/schedule-callback`,
        data
      )
      success('Callback scheduled')
      // Refresh active assignments to update callback info
      await getMyActiveAssignments('confirmation')
      return response
    } catch (err) {
      error('Failed to schedule callback')
      throw err
    }
  }

  // Complete a suivi (follow-up/tracking) assignment
  const completeSuiviAssignment = async (assignmentId: string, data: CompleteSuiviRequest): Promise<CompleteSuiviResponse> => {
    try {
      const response = await api.post<CompleteSuiviResponse>(
        `/api/v1/orderassignments/${assignmentId}/complete-suivi`,
        data
      )
      success(data.result === 'delivered' ? 'Livraison confirmée' : 'Suivi complété')
      await getMyActiveAssignments('suivi')
      return response
    } catch (err) {
      error('Failed to complete suivi')
      throw err
    }
  }

  // Complete a quality check assignment
  const completeQualityAssignment = async (assignmentId: string, data: CompleteQualityRequest): Promise<CompleteQualityResponse> => {
    try {
      const response = await api.post<CompleteQualityResponse>(
        `/api/v1/orderassignments/${assignmentId}/complete-quality`,
        data
      )
      success(data.approved ? 'Qualité approuvée' : 'Qualité rejetée')
      await getMyActiveAssignments('quality')
      return response
    } catch (err) {
      error('Failed to complete quality check')
      throw err
    }
  }

  return {
    myPendingAssignments: readonly(myPendingAssignments),
    myActiveAssignments: readonly(myActiveAssignments),
    isLoading: readonly(isLoading),
    getMyPendingAssignments,
    getMyActiveAssignments,
    getUnassignedOrders,
    assignOrder,
    takeAssignment,
    completeAssignment,
    releaseAssignment,
    selfAssignOrder,
    bulkAssignOrders,
    bulkReassignOrders,
    getActiveAssignmentsForSupervisor,
    // New service-specific methods
    getMyCallbacks,
    scheduleCallback,
    completeSuiviAssignment,
    completeQualityAssignment
  }
}
