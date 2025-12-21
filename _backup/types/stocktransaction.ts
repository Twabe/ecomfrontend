// Stock Transaction types - READ ONLY audit trail for stock movements

export interface StockTransaction {
  id: string
  type: string              // "Purchase", "Sale", "Adjustment", etc.
  productId: string
  productName: string
  quantity: number
  price: number
  deliveryCompanyId: string | null
  deliveryCompanyName: string | null
  purchaseId: string | null
  orderId: string | null
  referenceCode: string | null
  totalValue: number
  averageCost: number
  quantityBefore: number
  quantityAfter: number
  notes: string | null
  performedBy: string | null
  dateAdded: string
}

// Stock transaction types
export const STOCK_TRANSACTION_TYPES = [
  { value: 'Purchase', label: 'Purchase', color: 'green' },
  { value: 'Sale', label: 'Sale', color: 'blue' },
  { value: 'Return', label: 'Return', color: 'orange' },
  { value: 'Adjustment', label: 'Adjustment', color: 'purple' },
  { value: 'Transfer', label: 'Transfer', color: 'gray' }
]
