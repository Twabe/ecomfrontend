export interface Customer {
  id: string
  // Identity
  phone: string
  phoneInternational: string
  fullName: string
  email?: string
  // Default Location
  defaultCityId?: string
  defaultCityName?: string
  defaultAddress?: string
  // Blacklist Status
  isBlacklisted: boolean
  blacklistReason?: string
  blacklistedAt?: string
  // Order Statistics
  totalOrders: number
  confirmedOrders: number
  cancelledOrders: number
  deliveredOrders: number
  returnedOrders: number
  totalSpent: number
  firstOrderDate?: string
  lastOrderDate?: string
  // Calculated (from backend)
  averageOrderValue: number
  cancellationRate: number
  returnRate: number
  isHighValue: boolean
  isProblematic: boolean
}

export interface CreateCustomerRequest {
  phone: string
  phoneInternational: string
  fullName: string
  email?: string
  defaultCityId?: string
  defaultAddress?: string
}

export interface UpdateCustomerRequest {
  id: string
  fullName?: string
  email?: string
  defaultCityId?: string
  defaultAddress?: string
}

export interface BlacklistCustomerRequest {
  reason: string
}
