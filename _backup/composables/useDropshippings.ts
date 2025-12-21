import type { Dropshipping, CreateDropshippingRequest, UpdateDropshippingRequest } from '~/types/dropshipping'
import type { PaginatedResponse } from '~/types/api'

export const useDropshippings = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const dropshippings = useState<Dropshipping[]>('dropshippings', () => [])
  const isLoading = useState<boolean>('dropshippings-loading', () => false)
  const pagination = useState('dropshippings-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search dropshippings
  const searchDropshippings = async (params: {
    keyword?: string
    productId?: string | null
    deliveryCompanyId?: string | null
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<Dropshipping>>('/api/v1/dropshippings/search', {
        keyword: params.keyword || '',
        productId: params.productId,
        deliveryCompanyId: params.deliveryCompanyId,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['dateAdded desc']
      })

      dropshippings.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load dropshippings')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single dropshipping
  const getDropshipping = async (id: string) => {
    try {
      return await api.get<Dropshipping>(`/api/v1/dropshippings/${id}`)
    } catch (err) {
      error('Failed to load dropshipping')
      throw err
    }
  }

  // Create dropshipping
  const createDropshipping = async (data: CreateDropshippingRequest) => {
    try {
      const id = await api.post<string>('/api/v1/dropshippings', data)
      success('Dropshipping created successfully')
      await searchDropshippings({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create dropshipping')
      throw err
    }
  }

  // Update dropshipping
  const updateDropshipping = async (id: string, data: UpdateDropshippingRequest) => {
    try {
      await api.put(`/api/v1/dropshippings/${id}`, data)
      success('Dropshipping updated successfully')
      await searchDropshippings({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update dropshipping')
      throw err
    }
  }

  // Delete dropshipping
  const deleteDropshipping = async (id: string) => {
    try {
      await api.delete(`/api/v1/dropshippings/${id}`)
      success('Dropshipping deleted successfully')
      await searchDropshippings({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete dropshipping')
      throw err
    }
  }

  return {
    dropshippings: readonly(dropshippings),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchDropshippings,
    getDropshipping,
    createDropshipping,
    updateDropshipping,
    deleteDropshipping
  }
}
