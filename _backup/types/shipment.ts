// Shipment types - for tracking product shipments via delivery companies

export interface Shipment {
  id: string
  productId: string
  productName: string
  quantity: number
  deliveryCompanyId: string
  deliveryCompanyName: string
  orderIds: string | null
  receipt: string | null
  isReceived: boolean
  dateSent: string | null
  dateReceived: string | null
}

export interface CreateShipmentRequest {
  productId: string
  quantity: number
  deliveryCompanyId: string
  orderIds?: string | null
  receipt?: string | null
  isReceived?: boolean
  dateSent?: string | null
}

export interface UpdateShipmentRequest {
  id: string
  productId: string
  quantity: number
  deliveryCompanyId: string
  orderIds?: string | null
  receipt?: string | null
  isReceived?: boolean
  dateSent?: string | null
  dateReceived?: string | null
}
