// Media Buyer Expense types - for tracking media buyer related expenses

export interface MediaBuyerExpense {
  id: string
  mediaBuyerId: string
  price: number
  processedPrice: number
  description: string
  attachments: string | null
  dateAdded: string
}

export interface CreateMediaBuyerExpenseRequest {
  mediaBuyerId: string
  price: number
  processedPrice?: number
  description: string
  attachments?: string | null
}

export interface UpdateMediaBuyerExpenseRequest {
  id: string
  mediaBuyerId: string
  price: number
  processedPrice?: number
  description: string
  attachments?: string | null
}
