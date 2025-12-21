import type { MediaBuyerInvoice, CreateMediaBuyerInvoiceRequest, UpdateMediaBuyerInvoiceRequest } from '~/types/mediabuyerinvoice'
import type { PaginatedResponse } from '~/types/api'

export const useMediaBuyerInvoices = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const mediaBuyerInvoices = useState<MediaBuyerInvoice[]>('mediaBuyerInvoices', () => [])
  const isLoading = useState<boolean>('mediaBuyerInvoices-loading', () => false)
  const pagination = useState('mediaBuyerInvoices-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search media buyer invoices
  const searchMediaBuyerInvoices = async (params: {
    keyword?: string
    mediaBuyerId?: string | null
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<MediaBuyerInvoice>>('/api/v1/mediabuyerinvoices/search', {
        keyword: params.keyword || '',
        mediaBuyerId: params.mediaBuyerId,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['dateAdded desc']
      })

      mediaBuyerInvoices.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load media buyer invoices')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single media buyer invoice
  const getMediaBuyerInvoice = async (id: string) => {
    try {
      return await api.get<MediaBuyerInvoice>(`/api/v1/mediabuyerinvoices/${id}`)
    } catch (err) {
      error('Failed to load media buyer invoice')
      throw err
    }
  }

  // Create media buyer invoice
  const createMediaBuyerInvoice = async (data: CreateMediaBuyerInvoiceRequest) => {
    try {
      const id = await api.post<string>('/api/v1/mediabuyerinvoices', data)
      success('Media buyer invoice created successfully')
      await searchMediaBuyerInvoices({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create media buyer invoice')
      throw err
    }
  }

  // Update media buyer invoice
  const updateMediaBuyerInvoice = async (id: string, data: UpdateMediaBuyerInvoiceRequest) => {
    try {
      await api.put(`/api/v1/mediabuyerinvoices/${id}`, data)
      success('Media buyer invoice updated successfully')
      await searchMediaBuyerInvoices({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update media buyer invoice')
      throw err
    }
  }

  // Delete media buyer invoice
  const deleteMediaBuyerInvoice = async (id: string) => {
    try {
      await api.delete(`/api/v1/mediabuyerinvoices/${id}`)
      success('Media buyer invoice deleted successfully')
      await searchMediaBuyerInvoices({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete media buyer invoice')
      throw err
    }
  }

  return {
    mediaBuyerInvoices: readonly(mediaBuyerInvoices),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchMediaBuyerInvoices,
    getMediaBuyerInvoice,
    createMediaBuyerInvoice,
    updateMediaBuyerInvoice,
    deleteMediaBuyerInvoice
  }
}
