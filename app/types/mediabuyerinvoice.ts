// Media Buyer Invoice types - for tracking media buyer invoices

export interface MediaBuyerInvoice {
  id: string
  code: string
  mediaBuyerId: string
  price: number
  orderIds: string
  period: string
  isValidated: boolean
  dateAdded: string
}

export interface CreateMediaBuyerInvoiceRequest {
  code: string
  mediaBuyerId: string
  price: number
  orderIds: string
  period: string
  isValidated?: boolean
}

export interface UpdateMediaBuyerInvoiceRequest {
  id: string
  code: string
  mediaBuyerId: string
  price: number
  orderIds: string
  period: string
  isValidated?: boolean
}
