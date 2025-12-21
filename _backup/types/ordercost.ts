// Order Cost types - for tracking costs associated with orders

export interface OrderCost {
  id: string
  orderId: string
  costType: string          // "product", "shipping", "commission", etc.
  description: string | null
  amount: number
  workerId: string | null
}

export interface CreateOrderCostRequest {
  orderId: string
  costType: string
  description?: string | null
  amount: number
  workerId?: string | null
}

export interface UpdateOrderCostRequest {
  id: string
  orderId: string
  costType: string
  description?: string | null
  amount: number
  workerId?: string | null
}

// Common cost types
export const ORDER_COST_TYPES = [
  { value: 'product', label: 'Product Cost' },
  { value: 'shipping', label: 'Shipping Cost' },
  { value: 'commission', label: 'Commission' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'return', label: 'Return Cost' },
  { value: 'other', label: 'Other' }
]
