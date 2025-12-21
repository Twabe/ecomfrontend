import type { LegalInvoice, CreateLegalInvoiceRequest, UpdateLegalInvoiceRequest } from '~/types/legalinvoice'
import type { PaginatedResponse } from '~/types/api'

export const useLegalInvoices = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const legalInvoices = useState<LegalInvoice[]>('legalInvoices', () => [])
  const isLoading = useState<boolean>('legalInvoices-loading', () => false)
  const pagination = useState('legalInvoices-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search legal invoices
  const searchLegalInvoices = async (params: {
    keyword?: string
    pageNumber?: number
    pageSize?: number
  } = {}) => {
    isLoading.value = true
    try {
      const response = await api.post<PaginatedResponse<LegalInvoice>>('/api/v1/legalinvoices/search', {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        orderBy: ['dateAdded desc']
      })

      legalInvoices.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load legal invoices')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single legal invoice
  const getLegalInvoice = async (id: string) => {
    try {
      return await api.get<LegalInvoice>(`/api/v1/legalinvoices/${id}`)
    } catch (err) {
      error('Failed to load legal invoice')
      throw err
    }
  }

  // Create legal invoice
  const createLegalInvoice = async (data: CreateLegalInvoiceRequest) => {
    try {
      const id = await api.post<string>('/api/v1/legalinvoices', data)
      success('Legal invoice created successfully')
      await searchLegalInvoices({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create legal invoice')
      throw err
    }
  }

  // Update legal invoice
  const updateLegalInvoice = async (id: string, data: UpdateLegalInvoiceRequest) => {
    try {
      await api.put(`/api/v1/legalinvoices/${id}`, data)
      success('Legal invoice updated successfully')
      await searchLegalInvoices({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update legal invoice')
      throw err
    }
  }

  // Delete legal invoice
  const deleteLegalInvoice = async (id: string) => {
    try {
      await api.delete(`/api/v1/legalinvoices/${id}`)
      success('Legal invoice deleted successfully')
      await searchLegalInvoices({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete legal invoice')
      throw err
    }
  }

  return {
    legalInvoices: readonly(legalInvoices),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchLegalInvoices,
    getLegalInvoice,
    createLegalInvoice,
    updateLegalInvoice,
    deleteLegalInvoice
  }
}
