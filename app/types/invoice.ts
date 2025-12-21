// Invoice Types

export interface Invoice {
  id: string
  code: string
  deliveryCompanyId: string | null
  deliveryCompanyName: string | null
  storeId: string | null
  storeName: string | null
  workerId: string | null
  workerName: string | null
  mediaBuyerId: string | null
  mediaBuyerName: string | null
  ordersCount: number
  totalPrice: number
  isValidated: boolean
  isReceived: boolean
  dateCreated: string | null
  dateReceived: string | null
  note: string | null
  createdOn: string
  lastModifiedOn: string | null
}

export interface InvoiceOrder {
  orderId: string
  orderCode: string
  customerName: string
  customerPhone: string | null
  city: string | null
  price: number
  fees: number
  state: string | null
}

export interface InvoiceDetails extends Invoice {
  orders: InvoiceOrder[]
}

export interface CreateInvoiceRequest {
  code: string
  ordersCount?: number
  totalPrice?: number
  deliveryCompanyId?: string
  storeId?: string
  workerId?: string
  mediaBuyerId?: string
  dateCreated?: string
  note?: string
}

export interface UpdateInvoiceRequest {
  id: string
  code?: string
  ordersCount?: number
  totalPrice?: number
  deliveryCompanyId?: string
  storeId?: string
  workerId?: string
  mediaBuyerId?: string
  dateCreated?: string
  note?: string
}

export interface GenerateInvoiceRequest {
  orderIds: string[]
  deliveryCompanyId?: string
  storeId?: string
  workerId?: string
  mediaBuyerId?: string
  note?: string
}

export interface GenerateInvoiceResponse {
  invoiceId: string
  invoiceCode: string
  ordersIncluded: number
  totalPrice: number
  orderCodes: string[]
  errors: string[]
}

export interface MarkInvoicePaidRequest {
  invoiceId: string
  receivedDate?: string
}

export interface SearchInvoicesParams {
  keyword?: string
  pageNumber?: number
  pageSize?: number
  orderBy?: string[]
  code?: string
  deliveryCompanyId?: string
  storeId?: string
  workerId?: string
  isValidated?: boolean
  isReceived?: boolean
  dateCreatedStart?: string
  dateCreatedEnd?: string
  minTotalPrice?: number
  maxTotalPrice?: number
}
