export interface Stock {
  id: string
  productId: string
  productName: string
  productReference?: string
  quantity: number
  brokenQuantity: number
  details?: string
  // Weighted Average Costing
  totalValue: number
  averageCost: number
  // Calculated
  availableQuantity: number
  // Delivery Company (for external stock)
  deliveryCompanyId?: string
  deliveryCompanyName?: string
}

export interface CreateStockRequest {
  productId: string
  quantity: number
  brokenQuantity?: number
  totalValue?: number
  details?: string
  deliveryCompanyId?: string
}

export interface UpdateStockRequest {
  id: string
  productId?: string
  quantity?: number
  brokenQuantity?: number
  details?: string
  deliveryCompanyId?: string
}

export interface AdjustStockRequest {
  quantityChange: number
}

export interface AddStockWithCostRequest {
  quantityToAdd: number
  unitCost: number
}
