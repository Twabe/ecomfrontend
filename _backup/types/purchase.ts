export interface Purchase {
  id: string
  code: string
  supplierId: string
  supplierName?: string
  purchaseDate: string
  expectedDeliveryDate?: string
  actualDeliveryDate?: string
  status: string
  totalCost: number
  note?: string
  items: PurchaseItem[]
}

export interface PurchaseItem {
  id: string
  productId: string
  productName: string
  productReference?: string
  quantity: number
  unitCost: number
  total: number
  note?: string
}

export interface CreatePurchaseRequest {
  code: string
  supplierId: string
  purchaseDate?: string
  expectedDeliveryDate?: string
  note?: string
  items: CreatePurchaseItemRequest[]
}

export interface CreatePurchaseItemRequest {
  productId: string
  quantity: number
  unitCost: number
  note?: string
}

export interface UpdatePurchaseRequest {
  id: string
  code?: string
  supplierId?: string
  purchaseDate?: string
  expectedDeliveryDate?: string
  note?: string
}

export interface UpdatePurchaseStatusRequest {
  status: string
  reason?: string
}

export const PurchaseStatuses = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Shipped: 'Shipped',
  Received: 'Received',
  Cancelled: 'Cancelled'
} as const

export type PurchaseStatus = typeof PurchaseStatuses[keyof typeof PurchaseStatuses]

export const PurchaseStatusColors: Record<string, string> = {
  Pending: 'yellow',
  Confirmed: 'blue',
  Shipped: 'purple',
  Received: 'green',
  Cancelled: 'red'
}
