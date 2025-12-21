// Dropshipping types - for tracking product dropshipping between delivery companies

export interface Dropshipping {
  id: string
  productId: string
  productName: string
  quantity: number
  workerId: string | null
  deliveryCompanyId: string
  deliveryCompanyName: string
  receiverDeliveryCompanyId: string | null
  receiverDeliveryCompanyName: string | null
  isBought: boolean
  dateAdded: string
}

export interface CreateDropshippingRequest {
  productId: string
  quantity: number
  deliveryCompanyId: string
  receiverDeliveryCompanyId?: string | null
  isBought?: boolean
}

export interface UpdateDropshippingRequest {
  id: string
  productId: string
  quantity: number
  deliveryCompanyId: string
  receiverDeliveryCompanyId?: string | null
  isBought?: boolean
}
