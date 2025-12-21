import type {
  Invoice,
  InvoiceDetails,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  GenerateInvoiceRequest,
  GenerateInvoiceResponse,
  MarkInvoicePaidRequest,
  SearchInvoicesParams
} from '~/types/invoice'
import type { PaginatedResponse } from '~/types/api'

export const useInvoices = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const invoices = useState<Invoice[]>('invoices', () => [])
  const isLoading = useState<boolean>('invoices-loading', () => false)
  const pagination = useState('invoices-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search invoices
  const searchInvoices = async (params: SearchInvoicesParams = {}) => {
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
      if (params.workerId) body.workerId = params.workerId
      if (params.isValidated !== undefined) body.isValidated = params.isValidated
      if (params.isReceived !== undefined) body.isReceived = params.isReceived
      if (params.dateCreatedStart) body.dateCreatedStart = params.dateCreatedStart
      if (params.dateCreatedEnd) body.dateCreatedEnd = params.dateCreatedEnd
      if (params.minTotalPrice !== undefined) body.minTotalPrice = params.minTotalPrice
      if (params.maxTotalPrice !== undefined) body.maxTotalPrice = params.maxTotalPrice

      const response = await api.post<PaginatedResponse<Invoice>>('/api/v1/invoices/search', body)

      invoices.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load invoices')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single invoice
  const getInvoice = async (id: string) => {
    try {
      return await api.get<Invoice>(`/api/v1/invoices/${id}`)
    } catch (err) {
      error('Failed to load invoice')
      throw err
    }
  }

  // Get invoice with orders list
  const getInvoiceDetails = async (id: string) => {
    try {
      return await api.get<InvoiceDetails>(`/api/v1/invoices/${id}/details`)
    } catch (err) {
      error('Failed to load invoice details')
      throw err
    }
  }

  // Create invoice
  const createInvoice = async (data: CreateInvoiceRequest) => {
    try {
      const id = await api.post<string>('/api/v1/invoices', data)
      success('Invoice created successfully')
      await searchInvoices({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create invoice')
      throw err
    }
  }

  // Update invoice
  const updateInvoice = async (id: string, data: UpdateInvoiceRequest) => {
    try {
      await api.put(`/api/v1/invoices/${id}`, data)
      success('Invoice updated successfully')
      await searchInvoices({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update invoice')
      throw err
    }
  }

  // Delete invoice
  const deleteInvoice = async (id: string) => {
    try {
      await api.delete(`/api/v1/invoices/${id}`)
      success('Invoice deleted successfully')
      await searchInvoices({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete invoice')
      throw err
    }
  }

  // Generate invoice from orders
  const generateInvoice = async (data: GenerateInvoiceRequest) => {
    try {
      const response = await api.post<GenerateInvoiceResponse>('/api/v1/invoices/generate', data)

      if (response.ordersIncluded > 0) {
        success(`Invoice ${response.invoiceCode} created with ${response.ordersIncluded} order(s)`)
      }
      if (response.errors && response.errors.length > 0) {
        error(`${response.errors.length} order(s) could not be included`)
      }

      await searchInvoices({ pageNumber: pagination.value.currentPage })
      return response
    } catch (err) {
      error('Failed to generate invoice')
      throw err
    }
  }

  // Mark invoice as paid/received
  const markInvoicePaid = async (data: MarkInvoicePaidRequest) => {
    try {
      await api.post(`/api/v1/invoices/${data.invoiceId}/mark-paid`, {
        receivedDate: data.receivedDate
      })
      success('Invoice marked as received')
      await searchInvoices({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to mark invoice as paid')
      throw err
    }
  }

  return {
    invoices: readonly(invoices),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchInvoices,
    getInvoice,
    getInvoiceDetails,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    generateInvoice,
    markInvoicePaid
  }
}
