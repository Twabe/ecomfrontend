import type {
  Payment,
  PaymentDetails,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  AllocatePaymentRequest,
  DeallocatePaymentRequest,
  UnallocatedOrder,
  UnallocatedPayment,
  OutstandingCodReport,
  CompanyBalanceSummary,
  SearchPaymentsParams,
  GetUnallocatedOrdersParams,
  GetUnallocatedPaymentsReportParams
} from '~/types/payment'
import type { PaginatedResponse } from '~/types/api'

export const usePayments = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const payments = useState<Payment[]>('payments', () => [])
  const isLoading = useState<boolean>('payments-loading', () => false)
  const pagination = useState('payments-pagination', () => ({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  }))

  // Search payments
  const searchPayments = async (params: SearchPaymentsParams = {}) => {
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
      if (params.paymentMethod) body.paymentMethod = params.paymentMethod
      if (params.paymentDateStart) body.paymentDateStart = params.paymentDateStart
      if (params.paymentDateEnd) body.paymentDateEnd = params.paymentDateEnd
      if (params.minAmount !== undefined) body.minAmount = params.minAmount
      if (params.maxAmount !== undefined) body.maxAmount = params.maxAmount

      const response = await api.post<PaginatedResponse<Payment>>('/api/v1/payments/search', body)

      payments.value = response.data
      pagination.value = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        pageSize: response.pageSize
      }

      return response
    } catch (err) {
      error('Failed to load payments')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get single payment
  const getPayment = async (id: string) => {
    try {
      return await api.get<Payment>(`/api/v1/payments/${id}`)
    } catch (err) {
      error('Failed to load payment')
      throw err
    }
  }

  // Get payment with allocations
  const getPaymentDetails = async (id: string) => {
    try {
      return await api.get<PaymentDetails>(`/api/v1/payments/${id}`)
    } catch (err) {
      error('Failed to load payment details')
      throw err
    }
  }

  // Create payment
  const createPayment = async (data: CreatePaymentRequest) => {
    try {
      const id = await api.post<string>('/api/v1/payments', data)
      success('Payment created successfully')
      await searchPayments({ pageNumber: pagination.value.currentPage })
      return id
    } catch (err) {
      error('Failed to create payment')
      throw err
    }
  }

  // Update payment
  const updatePayment = async (id: string, data: UpdatePaymentRequest) => {
    try {
      await api.put(`/api/v1/payments/${id}`, data)
      success('Payment updated successfully')
      await searchPayments({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to update payment')
      throw err
    }
  }

  // Delete payment
  const deletePayment = async (id: string) => {
    try {
      await api.delete(`/api/v1/payments/${id}`)
      success('Payment deleted successfully')
      await searchPayments({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to delete payment')
      throw err
    }
  }

  // Allocate payment to orders
  const allocatePayment = async (data: AllocatePaymentRequest) => {
    try {
      await api.post('/api/v1/payments/allocate', data)
      success('Payment allocated successfully')
      await searchPayments({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to allocate payment')
      throw err
    }
  }

  // Deallocate payment from orders
  const deallocatePayment = async (data: DeallocatePaymentRequest) => {
    try {
      await api.post('/api/v1/payments/deallocate', data)
      success('Payment deallocated successfully')
      await searchPayments({ pageNumber: pagination.value.currentPage })
    } catch (err) {
      error('Failed to deallocate payment')
      throw err
    }
  }

  // Get unallocated orders (orders that need payment allocation)
  const getUnallocatedOrders = async (params: GetUnallocatedOrdersParams) => {
    try {
      const body: Record<string, unknown> = {
        keyword: '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 50,
        orderBy: params.orderBy || ['CreatedOn desc'],
        deliveryCompanyId: params.deliveryCompanyId
      }

      // Add optional filter parameters
      if (params.deliveryDateFrom) body.deliveryDateFrom = params.deliveryDateFrom
      if (params.deliveryDateTo) body.deliveryDateTo = params.deliveryDateTo
      if (params.codPaymentStatus) body.codPaymentStatus = params.codPaymentStatus

      return await api.post<PaginatedResponse<UnallocatedOrder>>('/api/v1/payments/unallocated-orders', body)
    } catch (err) {
      error('Failed to load unallocated orders')
      throw err
    }
  }

  // Get outstanding COD report
  const getOutstandingCodReport = async (params: { deliveryCompanyId?: string } = {}) => {
    try {
      return await api.post<OutstandingCodReport[]>('/api/v1/payments/reports/outstanding-cod', params)
    } catch (err) {
      error('Failed to load outstanding COD report')
      throw err
    }
  }

  // Get company balance summary
  const getCompanyBalanceSummary = async () => {
    try {
      return await api.post<CompanyBalanceSummary[]>('/api/v1/payments/reports/company-balance-summary', {})
    } catch (err) {
      error('Failed to load company balance summary')
      throw err
    }
  }

  // Get unallocated payments report
  const getUnallocatedPaymentsReport = async (params: GetUnallocatedPaymentsReportParams = {}) => {
    try {
      const body: Record<string, unknown> = {
        keyword: params.keyword || '',
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 20,
        orderBy: params.orderBy || ['PaymentDate desc']
      }

      // Add filter parameters
      if (params.deliveryCompanyId) body.deliveryCompanyId = params.deliveryCompanyId
      if (params.paymentDateFrom) body.paymentDateFrom = params.paymentDateFrom
      if (params.paymentDateTo) body.paymentDateTo = params.paymentDateTo
      if (params.minUnallocatedAmount !== undefined) body.minUnallocatedAmount = params.minUnallocatedAmount

      return await api.post<PaginatedResponse<UnallocatedPayment>>('/api/v1/payments/reports/unallocated-payments', body)
    } catch (err) {
      error('Failed to load unallocated payments report')
      throw err
    }
  }

  return {
    payments: readonly(payments),
    isLoading: readonly(isLoading),
    pagination: readonly(pagination),
    searchPayments,
    getPayment,
    getPaymentDetails,
    createPayment,
    updatePayment,
    deletePayment,
    allocatePayment,
    deallocatePayment,
    getUnallocatedOrders,
    getOutstandingCodReport,
    getCompanyBalanceSummary,
    getUnallocatedPaymentsReport
  }
}
