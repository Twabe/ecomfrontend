// Order Fee types - for tracking fees associated with orders

export interface OrderFee {
  id: string
  orderId: string
  feeType: string           // "shipping", "cod", "handling", etc.
  description: string | null
  amount: number
  isIncludedInPrice: boolean
}

export interface CreateOrderFeeRequest {
  orderId: string
  feeType: string
  description?: string | null
  amount: number
  isIncludedInPrice?: boolean
}

export interface UpdateOrderFeeRequest {
  id: string
  orderId: string
  feeType: string
  description?: string | null
  amount: number
  isIncludedInPrice?: boolean
}

// Common fee types
export const ORDER_FEE_TYPES = [
  { value: 'shipping', label: 'Shipping' },
  { value: 'cod', label: 'COD Fee' },
  { value: 'handling', label: 'Handling' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' }
]
