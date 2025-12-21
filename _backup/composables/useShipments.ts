import type { Shipment, CreateShipmentRequest, UpdateShipmentRequest } from '~/types/shipment'
import type { PaginatedResponse } from '~/types/api'

export const useShipments = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const shipments = useState<Shipment[]>('shipments', () => [])
  const isLoading = useState<boolean>('shipments-loading', () => false)
  const pagination = useState('shipments-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search shipments
  const searchShipments = async (params: {
    keyword?: string
    productId?: string | null
    deliveryCompanyId?: string | null
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<Shipment>>('/api/v1/shipments/search', {
        keyword: params.keyword || '',
        productId: params.productId,
        deliveryCompanyId: params.deliveryCompanyId,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['dateSent desc']
      })

      shipments.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load shipments')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single shipment
  const getShipment = async (id: string) => {
    try {
      return await api.get<Shipment>(`/api/v1/shipments/${id}`)
    } catch (err) {
      error('Failed to load shipment')
      throw err
    }
  }

  // Create shipment
  const createShipment = async (data: CreateShipmentRequest) => {
    try {
      const id = await api.post<string>('/api/v1/shipments', data)
      success('Shipment created successfully')
      await searchShipments({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create shipment')
      throw err
    }
  }

  // Update shipment
  const updateShipment = async (id: string, data: UpdateShipmentRequest) => {
    try {
      await api.put(`/api/v1/shipments/${id}`, data)
      success('Shipment updated successfully')
      await searchShipments({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update shipment')
      throw err
    }
  }

  // Delete shipment
  const deleteShipment = async (id: string) => {
    try {
      await api.delete(`/api/v1/shipments/${id}`)
      success('Shipment deleted successfully')
      await searchShipments({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete shipment')
      throw err
    }
  }

  return {
    shipments: readonly(shipments),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchShipments,
    getShipment,
    createShipment,
    updateShipment,
    deleteShipment
  }
}
