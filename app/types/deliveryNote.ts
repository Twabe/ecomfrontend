// DeliveryNote Types

export interface DeliveryNote {
  id: string
  code: string
  deliveryCompanyId: string
  deliveryCompanyName: string
  orderIds: string  // Comma-separated order IDs
  dateAdded: string
}

export interface DeliveryNoteOrder {
  orderId: string
  orderCode: string
  customerName: string
  customerPhone: string | null
  city: string | null
  price: number
  state: string | null
}

export interface DeliveryNoteDetails extends DeliveryNote {
  orders: DeliveryNoteOrder[]
}

export interface CreateDeliveryNoteRequest {
  code: string
  deliveryCompanyId: string  // Required
}

export interface UpdateDeliveryNoteRequest {
  id: string
  code?: string
  deliveryCompanyId?: string
}

export interface CreateDeliveryNoteWithOrdersRequest {
  code?: string
  autoGenerateCode?: boolean
  deliveryCompanyId: string  // Required
  orderIds: string[]
}

export interface CreateDeliveryNoteWithOrdersResponse {
  deliveryNoteId: string
  deliveryNoteCode: string
  ordersIncluded: number
  totalAmount: number
  errors: string[]
}

export interface AddOrdersToDeliveryNoteRequest {
  deliveryNoteId: string
  orderIds: string[]
}

export interface RemoveOrdersFromDeliveryNoteRequest {
  deliveryNoteId: string
  orderIds: string[]
}

export interface SearchDeliveryNotesParams {
  keyword?: string
  pageNumber?: number
  pageSize?: number
  orderBy?: string[]
  code?: string
  deliveryCompanyId?: string
}
