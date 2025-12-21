// Payment Types

export type PaymentMethod = 'cash' | 'bank_transfer' | 'check'

export interface Payment {
  id: string
  paymentCode: string
  deliveryCompanyId: string
  deliveryCompanyName: string
  amount: number
  unallocatedAmount: number
  paymentDate: string
  isFullyAllocated: boolean
  linkedOrdersCount: number
}

export interface PaymentAllocation {
  id: string
  paymentId: string
  orderId: string
  orderCode: string
  amount: number
  createdOn: string
}

export interface PaymentDetails extends Payment {
  allocations: PaymentAllocation[]
}

export interface CreatePaymentRequest {
  deliveryCompanyId: string  // Required
  paymentCode: string  // Required
  amount: number
  paymentDate: string  // Required
  paymentMethod: string  // Required - 'Cash', 'BankTransfer', 'Check'
  bankReference?: string
  notes?: string
}

export interface UpdatePaymentRequest {
  id: string
  paymentCode?: string
  deliveryCompanyId?: string
  amount?: number
  paymentMethod?: string
  bankReference?: string
  paymentDate?: string
  notes?: string
}

export interface AllocatePaymentRequest {
  paymentId: string
  orderAllocations: {
    orderId: string
    amount: number
  }[]
}

export interface DeallocatePaymentRequest {
  paymentId: string
  allocationIds: string[]
}

// Unallocated order - order awaiting payment allocation (matches backend UnallocatedOrderDto)
export interface UnallocatedOrder {
  id: string
  code: string
  fullName: string
  phone: string
  price: number
  state: string | null
  phase: string | null
  dateValidated: string | null
  codPaymentStatus: string | null
  codAmountCollected: number | null
  codCollectedDate: string | null
}

export interface GetUnallocatedOrdersParams {
  keyword?: string
  pageNumber?: number
  pageSize?: number
  orderBy?: string[]
  deliveryCompanyId: string  // Required
  deliveryDateFrom?: string
  deliveryDateTo?: string
  codPaymentStatus?: string
}

export interface OutstandingCodReport {
  deliveryCompanyId: string
  deliveryCompanyName: string
  totalDeliveredAmount: number
  totalReceivedAmount: number
  outstandingAmount: number
  deliveredOrdersCount: number
  paidOrdersCount: number
}

export interface CompanyBalanceSummary {
  deliveryCompanyId: string
  deliveryCompanyName: string
  outstandingOrdersCount: number
  totalOutstandingAmount: number
  oldestOutstandingDate: string | null
  daysSinceOldest: number | null
  totalPaymentsCount: number
  totalPaymentsReceived: number
  totalUnallocatedAmount: number
  unallocatedPaymentsCount: number
  netBalance: number
  paymentTermDays: number
  nextExpectedPaymentDate: string | null
}

export interface UnallocatedPayment {
  id: string
  paymentCode: string
  deliveryCompanyId: string
  deliveryCompanyName: string
  amount: number
  allocatedAmount: number
  unallocatedAmount: number
  paymentDate: string
  paymentMethod: string
  linkedOrdersCount: number
  daysSincePayment: number
}

export interface GetUnallocatedPaymentsReportParams {
  keyword?: string
  pageNumber?: number
  pageSize?: number
  orderBy?: string[]
  deliveryCompanyId?: string
  paymentDateFrom?: string
  paymentDateTo?: string
  minUnallocatedAmount?: number
}

export interface SearchPaymentsParams {
  keyword?: string
  pageNumber?: number
  pageSize?: number
  orderBy?: string[]
  paymentCode?: string
  deliveryCompanyId?: string
  paymentMethod?: string
  paymentDateStart?: string
  paymentDateEnd?: string
  minAmount?: number
  maxAmount?: number
}
