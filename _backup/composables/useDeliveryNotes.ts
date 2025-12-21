import type {
  DeliveryNote,
  DeliveryNoteDetails,
  CreateDeliveryNoteRequest,
  UpdateDeliveryNoteRequest,
  CreateDeliveryNoteWithOrdersRequest,
  CreateDeliveryNoteWithOrdersResponse,
  AddOrdersToDeliveryNoteRequest,
  RemoveOrdersFromDeliveryNoteRequest,
  SearchDeliveryNotesParams
} from '~/types/deliveryNote'
import type { PaginatedResponse } from '~/types/api'

export const useDeliveryNotes = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const deliveryNotes = useState<DeliveryNote[]>('deliveryNotes', () => [])
  const isLoading = useState<boolean>('deliveryNotes-loading', () => false)
  const pagination = useState('deliveryNotes-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search delivery notes
  const searchDeliveryNotes = async (params: SearchDeliveryNotesParams = {}) => {
    isLoading.value = true
    try {
      const body: Record<string, unknown> = {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: params.orderBy || ['CreatedOn desc']
      }

      // Add filter parameters
      if (params.code) body.code = params.code
      if (params.deliveryCompanyId) body.deliveryCompanyId = params.deliveryCompanyId
      if (params.storeId) body.storeId = params.storeId

      const response = await api.post<PaginatedResponse<DeliveryNote>>('/api/v1/deliverynotes/search', body)

      deliveryNotes.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load delivery notes')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single delivery note
  const getDeliveryNote = async (id: string) => {
    try {
      return await api.get<DeliveryNote>(`/api/v1/deliverynotes/${id}`)
    } catch (err) {
      error('Failed to load delivery note')
      throw err
    }
  }

  // Get delivery note with orders list
  const getDeliveryNoteDetails = async (id: string) => {
    try {
      return await api.get<DeliveryNoteDetails>(`/api/v1/deliverynotes/${id}/details`)
    } catch (err) {
      error('Failed to load delivery note details')
      throw err
    }
  }

  // Create delivery note
  const createDeliveryNote = async (data: CreateDeliveryNoteRequest) => {
    try {
      const id = await api.post<string>('/api/v1/deliverynotes', data)
      success('Delivery note created successfully')
      await searchDeliveryNotes({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create delivery note')
      throw err
    }
  }

  // Update delivery note
  const updateDeliveryNote = async (id: string, data: UpdateDeliveryNoteRequest) => {
    try {
      await api.put(`/api/v1/deliverynotes/${id}`, data)
      success('Delivery note updated successfully')
      await searchDeliveryNotes({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update delivery note')
      throw err
    }
  }

  // Delete delivery note
  const deleteDeliveryNote = async (id: string) => {
    try {
      await api.delete(`/api/v1/deliverynotes/${id}`)
      success('Delivery note deleted successfully')
      await searchDeliveryNotes({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete delivery note')
      throw err
    }
  }

  // Create delivery note with orders
  const createDeliveryNoteWithOrders = async (data: CreateDeliveryNoteWithOrdersRequest) => {
    try {
      const response = await api.post<CreateDeliveryNoteWithOrdersResponse>('/api/v1/deliverynotes/with-orders', data)

      if (response.ordersIncluded > 0) {
        success(`Delivery note ${response.deliveryNoteCode} created with ${response.ordersIncluded} order(s)`)
      }
      if (response.errors && response.errors.length > 0) {
        error(`${response.errors.length} order(s) could not be included`)
      }

      await searchDeliveryNotes({ pageNumber: pagination.value.currentPage })
      return response
    } catch (err) {
      error('Failed to create delivery note')
      throw err
    }
  }

  // Add orders to delivery note
  const addOrdersToDeliveryNote = async (data: AddOrdersToDeliveryNoteRequest) => {
    try {
      await api.post(`/api/v1/deliverynotes/${data.deliveryNoteId}/add-orders`, {
        orderIds: data.orderIds
      })
      success('Orders added to delivery note')
      await searchDeliveryNotes({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to add orders to delivery note')
      throw err
    }
  }

  // Remove orders from delivery note
  const removeOrdersFromDeliveryNote = async (data: RemoveOrdersFromDeliveryNoteRequest) => {
    try {
      await api.post(`/api/v1/deliverynotes/${data.deliveryNoteId}/remove-orders`, {
        orderIds: data.orderIds
      })
      success('Orders removed from delivery note')
      await searchDeliveryNotes({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to remove orders from delivery note')
      throw err
    }
  }

  return {
    deliveryNotes: readonly(deliveryNotes),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchDeliveryNotes,
    getDeliveryNote,
    getDeliveryNoteDetails,
    createDeliveryNote,
    updateDeliveryNote,
    deleteDeliveryNote,
    createDeliveryNoteWithOrders,
    addOrdersToDeliveryNote,
    removeOrdersFromDeliveryNote
  }
}
