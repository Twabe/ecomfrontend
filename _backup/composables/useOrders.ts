import type {
  Order,
  OrderItem,
  CreateOrderRequest,
  UpdateOrderRequest,
  AddOrderItemRequest,
  UpdateOrderItemRequest,
  ConfirmOrderRequest,
  CancelOrderRequest,
  MarkOrdersAsDeliveredRequest,
  MarkOrdersAsReturnedRequest,
  BulkUpdateStateRequest,
  GrabOrderResponse,
  ReleaseOrderResponse,
  BulkGrabOrdersResponse,
  ReassignOrdersResponse,
  ConfirmationOrderDto
} from '~/types/order'
import type { PaginatedResponse } from '~/types/api'

export const useOrders = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const orders = useState<Order[]>('orders', () => [])
  const isLoading = useState<boolean>('orders-loading', () => false)
  const pagination = useState('orders-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search orders
  const searchOrders = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
    deliveryCompanyId?: string
    workerId?: string
    moderatorId?: string
    mediaBuyerId?: string
    storeId?: string
    sourceId?: string
    cityId?: string
    reasonId?: string
    extraTagId?: string
    state?: string
    phase?: string
    isInvoiced?: boolean
    isInvoicedMediaBuyer?: boolean
    isArchived?: boolean
  } = {}) => {
    isLoading.value = true
    try {
      const body: Record<string, unknown> = {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['CreatedOn desc']
      }

      // Add direct filter parameters
      if (params.deliveryCompanyId) body.deliveryCompanyId = params.deliveryCompanyId
      if (params.workerId) body.workerId = params.workerId
      if (params.moderatorId) body.moderatorId = params.moderatorId
      if (params.mediaBuyerId) body.mediaBuyerId = params.mediaBuyerId
      if (params.storeId) body.storeId = params.storeId
      if (params.sourceId) body.sourceId = params.sourceId
      if (params.cityId) body.cityId = params.cityId
      if (params.reasonId) body.reasonId = params.reasonId
      if (params.extraTagId) body.extraTagId = params.extraTagId
      if (params.state) body.state = params.state
      if (params.phase) body.phase = params.phase
      if (params.isInvoiced !== undefined) body.isInvoiced = params.isInvoiced
      if (params.isInvoicedMediaBuyer !== undefined) body.isInvoicedMediaBuyer = params.isInvoicedMediaBuyer
      if (params.isArchived !== undefined) body.isArchived = params.isArchived

      const response = await api.post<PaginatedResponse<Order>>('/api/v1/orders/search', body)

      orders.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load orders')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single order
  const getOrder = async (id: string) => {
    try {
      return await api.get<Order>(`/api/v1/orders/${id}`)
    } catch (err) {
      error('Failed to load order')
      throw err
    }
  }

  // Create order
  const createOrder = async (data: CreateOrderRequest) => {
    // Debug: log the data being sent
    console.log('[DEBUG] Creating order with data:', JSON.stringify(data, null, 2))

    const id = await api.post<string>('/api/v1/orders', data)
    success('Order created successfully')
    await searchOrders({ pageNumber: pagination.value.currentPage })
    return id
    // Note: Error handling is done by useApi - no need to catch here
  }

  // Update order
  const updateOrder = async (id: string, data: UpdateOrderRequest) => {
    // Debug: log the data being sent
    console.log('[DEBUG] Updating order with data:', JSON.stringify({ id, ...data }, null, 2))

    await api.put(`/api/v1/orders/${id}`, data)
    success('Order updated successfully')
    await searchOrders({ pageNumber: pagination.value.currentPage })
    // Note: Error handling is done by useApi - no need to catch here
  }

  // Delete order
  const deleteOrder = async (id: string) => {
    try {
      await api.delete(`/api/v1/orders/${id}`)
      success('Order deleted successfully')
      await searchOrders({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete order')
      throw err
    }
  }

  // Confirm order
  const confirmOrder = async (data: ConfirmOrderRequest) => {
    try {
      const response = await api.post<{ orderId: string; orderCode: string; state: string; phase: string }>(
        '/api/v1/orders/confirm',
        data
      )
      success('Order confirmed successfully')
      await searchOrders({ pageNumber: pagination.value.currentPage })
      return response
    } catch (err) {
      error('Failed to confirm order')
      throw err
    }
  }

  // Cancel order
  const cancelOrder = async (data: CancelOrderRequest) => {
    try {
      const response = await api.post<{ orderId: string; orderCode: string; state: string; cancellationReason: string }>(
        '/api/v1/orders/cancel',
        data
      )
      success('Order cancelled successfully')
      await searchOrders({ pageNumber: pagination.value.currentPage })
      return response
    } catch (err) {
      error('Failed to cancel order')
      throw err
    }
  }

  // Mark orders as delivered
  const markAsDelivered = async (data: MarkOrdersAsDeliveredRequest) => {
    try {
      const response = await api.post<{
        totalOrders: number
        successfullyMarked: number
        failed: number
        errors: string[]
        deliveredOrderCodes: string[]
      }>('/api/v1/orders/mark-delivered', data)

      if (response.successfullyMarked > 0) {
        success(`${response.successfullyMarked} order(s) marked as delivered`)
      }
      if (response.failed > 0) {
        error(`${response.failed} order(s) failed to update`)
      }

      await searchOrders({ pageNumber: pagination.value.currentPage })
      return response
    } catch (err) {
      error('Failed to mark orders as delivered')
      throw err
    }
  }

  // Mark orders as returned
  const markAsReturned = async (data: MarkOrdersAsReturnedRequest) => {
    try {
      const response = await api.post<{
        totalOrders: number
        successfullyMarked: number
        failed: number
        errors: string[]
        returnedOrderCodes: string[]
      }>('/api/v1/orders/mark-returned', data)

      if (response.successfullyMarked > 0) {
        success(`${response.successfullyMarked} order(s) marked as returned`)
      }
      if (response.failed > 0) {
        error(`${response.failed} order(s) failed to update`)
      }

      await searchOrders({ pageNumber: pagination.value.currentPage })
      return response
    } catch (err) {
      error('Failed to mark orders as returned')
      throw err
    }
  }

  // Bulk update state
  const bulkUpdateState = async (data: BulkUpdateStateRequest) => {
    try {
      await api.post('/api/v1/orders/bulk-update-state', data)
      success('Orders updated successfully')
      await searchOrders({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update orders')
      throw err
    }
  }

  // Bulk delete
  const bulkDelete = async (orderIds: string[]) => {
    try {
      await api.post('/api/v1/orders/bulk-delete', { orderIds })
      success('Orders deleted successfully')
      await searchOrders({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete orders')
      throw err
    }
  }

  // Bulk move to shipping
  const bulkMoveToShipping = async (orderIds: string[], subDeliveryCompanyId?: string) => {
    try {
      await api.post('/api/v1/orders/bulk-move-to-shipping', { orderIds, subDeliveryCompanyId })
      success('Orders moved to shipping')
      await searchOrders({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to move orders to shipping')
      throw err
    }
  }

  // Export orders
  const exportOrders = async (params: Record<string, unknown> = {}) => {
    try {
      return await api.post<Blob>('/api/v1/orders/export', params)
    } catch (err) {
      error('Failed to export orders')
      throw err
    }
  }

  // ==================== Order Item Management ====================

  // Add item to order - returns the new item's GUID
  const addOrderItem = async (orderId: string, data: AddOrderItemRequest): Promise<string> => {
    // Backend requires orderId in the body as well as the URL
    const itemId = await api.post<string>(`/api/v1/orders/${orderId}/items`, {
      orderId,
      productId: data.productId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      discountAmount: data.discountAmount,
      discountReason: data.discountReason,
      note: data.note
    })
    success('Item added successfully')
    return itemId
    // Error handling is done by useApi - no need to catch and show duplicate error
  }

  // Update order item - returns the item's GUID
  const updateOrderItem = async (orderId: string, itemId: string, data: UpdateOrderItemRequest): Promise<string> => {
    // Backend requires orderId and orderItemId in the body as well as the URL
    const result = await api.put<string>(`/api/v1/orders/${orderId}/items/${itemId}`, {
      orderId,
      orderItemId: itemId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      discountAmount: data.discountAmount,
      discountReason: data.discountReason,
      note: data.note
    })
    success('Item updated successfully')
    return result
    // Error handling is done by useApi - no need to catch and show duplicate error
  }

  // Remove order item
  const removeOrderItem = async (orderId: string, itemId: string): Promise<string> => {
    // Backend expects a body with orderId and orderItemId for DELETE
    const result = await api.request<string>(`/api/v1/orders/${orderId}/items/${itemId}`, 'DELETE', {
      body: {
        orderId,
        orderItemId: itemId
      }
    })
    success('Item removed successfully')
    return result
    // Error handling is done by useApi - no need to catch and show duplicate error
  }

  // ==================== Worker Operations ====================

  // Grab order - Worker takes ownership of an order
  const grabOrder = async (orderId: string, workerId: string): Promise<GrabOrderResponse> => {
    try {
      const response = await api.post<GrabOrderResponse>('/api/v1/orders/grab', { orderId, workerId })
      success('Order grabbed successfully')
      return response
    } catch (err) {
      error('Failed to grab order')
      throw err
    }
  }

  // Release order - Worker releases an order back to the pool
  const releaseOrder = async (orderId: string): Promise<ReleaseOrderResponse> => {
    try {
      const response = await api.post<ReleaseOrderResponse>('/api/v1/orders/release', { orderId })
      success('Order released successfully')
      return response
    } catch (err) {
      error('Failed to release order')
      throw err
    }
  }

  // Bulk grab orders - Worker grabs multiple orders at once
  const bulkGrabOrders = async (orderIds: string[], workerId: string): Promise<BulkGrabOrdersResponse> => {
    try {
      const response = await api.post<BulkGrabOrdersResponse>('/api/v1/orders/bulk-grab', { orderIds, workerId })
      if (response.successfullyGrabbed > 0) {
        success(`${response.successfullyGrabbed} order(s) grabbed successfully`)
      }
      if (response.failed > 0) {
        error(`${response.failed} order(s) failed to grab`)
      }
      return response
    } catch (err) {
      error('Failed to grab orders')
      throw err
    }
  }

  // Get my orders - Worker's assigned orders
  const getMyOrders = async (params: {
    pageNumber?: number
    pageSize?: number
    state?: string
    phase?: string
    workerId?: string
  } = {}): Promise<PaginatedResponse<Order>> => {
    try {
      // workerId is required by the backend validator
      if (!params.workerId) {
        console.warn('getMyOrders: workerId is required')
        return {
          data: [],
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          pageSize: params.pageSize || 20,
          hasPreviousPage: false,
          hasNextPage: false
        }
      }

      // Build request body matching the pattern of other search endpoints
      const requestBody: Record<string, unknown> = {
        keyword: '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 20,
        orderBy: ['CreatedOn desc'],
        workerId: params.workerId
      }
      if (params.state) requestBody.state = params.state
      if (params.phase) requestBody.phase = params.phase

      const response = await api.post<PaginatedResponse<Order>>('/api/v1/orders/my-orders', requestBody)
      return response
    } catch (err: unknown) {
      // Return empty result on error to prevent UI crashes
      console.warn('My-orders API error:', err)
      return {
        data: [],
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        pageSize: params.pageSize || 20,
        hasPreviousPage: false,
        hasNextPage: false
      }
    }
  }

  // Get available orders for grabbing
  const getAvailableForGrabbing = async (params: {
    pageNumber?: number
    pageSize?: number
    state?: string
    cityId?: string
    storeId?: string
  } = {}): Promise<PaginatedResponse<Order>> => {
    try {
      // Build request body matching the pattern of other search endpoints
      const requestBody: Record<string, unknown> = {
        keyword: '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 20,
        orderBy: ['CreatedOn asc']
      }
      // Add optional params if they have values
      if (params.state) requestBody.state = params.state
      if (params.cityId) requestBody.cityId = params.cityId
      if (params.storeId) requestBody.storeId = params.storeId

      const response = await api.post<PaginatedResponse<Order>>('/api/v1/orders/available-for-grabbing', requestBody)
      return response
    } catch (err: unknown) {
      // Return empty result on error to prevent UI crashes
      console.warn('Available-for-grabbing API error:', err)
      return {
        data: [],
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        pageSize: params.pageSize || 20,
        hasPreviousPage: false,
        hasNextPage: false
      }
    }
  }

  // Reassign orders - Supervisor reassigns orders to another worker
  const reassignOrders = async (orderIds: string[], newWorkerId: string, comment?: string): Promise<ReassignOrdersResponse> => {
    try {
      const response = await api.post<ReassignOrdersResponse>('/api/v1/orders/reassign', {
        orderIds,
        newWorkerId,
        comment
      })
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

  // Get pending confirmations - Orders needing confirmation (returns array, not paginated)
  const getPendingConfirmations = async (params: {
    workerId?: string
    cityId?: string
    createdFrom?: string
    createdTo?: string
    limit?: number
  } = {}): Promise<Order[]> => {
    try {
      // Build request body, filtering out undefined values
      const requestBody: Record<string, unknown> = {}
      if (params.workerId) requestBody.workerId = params.workerId
      if (params.cityId) requestBody.cityId = params.cityId
      if (params.createdFrom) requestBody.createdFrom = params.createdFrom
      if (params.createdTo) requestBody.createdTo = params.createdTo
      if (params.limit) requestBody.limit = params.limit

      const response = await api.post<Order[]>('/api/v1/orders/pending-confirmations', requestBody)
      return response
    } catch (err) {
      error('Failed to load pending confirmations')
      throw err
    }
  }

  // Get orders ready for delivery (returns array, not paginated)
  const getReadyForDelivery = async (params: {
    deliveryCompanyId?: string
    subDeliveryCompanyId?: string
    cityId?: string
    shippingDateFrom?: string
    shippingDateTo?: string
    limit?: number
  } = {}): Promise<Order[]> => {
    try {
      // Build request body, filtering out undefined values
      const requestBody: Record<string, unknown> = {}
      if (params.deliveryCompanyId) requestBody.deliveryCompanyId = params.deliveryCompanyId
      if (params.subDeliveryCompanyId) requestBody.subDeliveryCompanyId = params.subDeliveryCompanyId
      if (params.cityId) requestBody.cityId = params.cityId
      if (params.shippingDateFrom) requestBody.shippingDateFrom = params.shippingDateFrom
      if (params.shippingDateTo) requestBody.shippingDateTo = params.shippingDateTo
      if (params.limit) requestBody.limit = params.limit

      const response = await api.post<Order[]>('/api/v1/orders/ready-for-delivery', requestBody)
      return response
    } catch (err) {
      error('Failed to load orders ready for delivery')
      throw err
    }
  }

  // Get orders by codes - Lookup by scanning/entering order codes
  const getOrdersByCodes = async (codes: string[]): Promise<Order[]> => {
    try {
      const response = await api.post<Order[]>('/api/v1/orders/by-codes', { codes })
      return response
    } catch (err) {
      error('Failed to load orders by codes')
      throw err
    }
  }

  // Get new orders (Phase = "new") - Orders awaiting initial processing
  const getNewOrders = async (params: {
    cityId?: string
    storeId?: string
    sourceId?: string
    createdFrom?: string
    createdTo?: string
    limit?: number
  } = {}): Promise<Order[]> => {
    try {
      const requestBody: Record<string, unknown> = {}
      if (params.cityId) requestBody.cityId = params.cityId
      if (params.storeId) requestBody.storeId = params.storeId
      if (params.sourceId) requestBody.sourceId = params.sourceId
      if (params.createdFrom) requestBody.createdFrom = params.createdFrom
      if (params.createdTo) requestBody.createdTo = params.createdTo
      if (params.limit) requestBody.limit = params.limit

      const response = await api.post<Order[]>('/api/v1/orders/new-orders', requestBody)
      return response
    } catch (err) {
      error('Failed to load new orders')
      throw err
    }
  }

  // Get confirmation orders with assignment status (unified view for supervisor)
  const getConfirmationOrders = async (params: {
    assignmentStatus?: string  // "unassigned", "pending", "taken", or undefined for all
    workerId?: string
    cityId?: string
    limit?: number
  } = {}): Promise<ConfirmationOrderDto[]> => {
    try {
      const queryParams = new URLSearchParams()
      if (params.assignmentStatus) queryParams.append('assignmentStatus', params.assignmentStatus)
      if (params.workerId) queryParams.append('workerId', params.workerId)
      if (params.cityId) queryParams.append('cityId', params.cityId)
      if (params.limit) queryParams.append('limit', params.limit.toString())

      const queryString = queryParams.toString()
      const url = `/api/v1/orders/confirmation-orders${queryString ? `?${queryString}` : ''}`

      const response = await api.get<ConfirmationOrderDto[]>(url)
      return response
    } catch (err) {
      console.warn('Confirmation orders API error:', err)
      return []
    }
  }

  return {
    orders: readonly(orders),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    confirmOrder,
    cancelOrder,
    markAsDelivered,
    markAsReturned,
    bulkUpdateState,
    bulkDelete,
    bulkMoveToShipping,
    exportOrders,
    // Order Item Management
    addOrderItem,
    updateOrderItem,
    removeOrderItem,
    // Worker Operations
    grabOrder,
    releaseOrder,
    bulkGrabOrders,
    getMyOrders,
    getAvailableForGrabbing,
    reassignOrders,
    getPendingConfirmations,
    getReadyForDelivery,
    getOrdersByCodes,
    getNewOrders,
    getConfirmationOrders
  }
}
