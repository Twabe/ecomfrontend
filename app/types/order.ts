// Order Item
export interface OrderItem {
  id: string
  productId: string
  productName: string
  productReference?: string

  // Variant information
  productVariantId?: string
  variantName?: string
  variantSku?: string

  // Pricing
  quantity: number
  originalUnitPrice: number
  unitPrice: number
  discountAmount: number
  discountReason?: string
  unitCost: number
  total: number
  totalCost: number
  grossProfit: number
  note?: string
}

// Order Fee
export interface OrderFee {
  id: string
  feeType: string
  description?: string
  amount: number
  isIncludedInPrice: boolean
}

// Order Cost
export interface OrderCost {
  id: string
  costType: string
  description?: string
  amount: number
  workerId?: string
}

// Order
export interface Order {
  id: string
  code: string
  items: OrderItem[]
  orderFees: OrderFee[]
  orderCosts: OrderCost[]

  // Customer Info
  customerId?: string
  fullName: string
  phone: string
  address?: string
  cityId?: string
  cityName?: string
  zipCode?: string
  email?: string

  // Pricing
  price: number
  fees: number

  // Order Status & Tracking
  phase?: string
  state?: string
  followUp?: string
  dateReported?: string
  dateValidated?: string

  trackingStateId?: string
  trackingStateName?: string
  trackingStateColor?: string

  // Delivery Company
  deliveryCompanyId?: string
  deliveryCompanyName?: string
  subDeliveryCompanyId?: string
  subDeliveryCompanyName?: string

  // Delivery Tracking
  trackingCode?: string
  deliveryStatus?: string
  deliveryStatusUpdatedAt?: string
  deliveryNote?: string

  // COD Payment Tracking
  codAmountCollected?: number
  codCollectedDate?: string
  codPaymentStatus?: string

  // Platform Integration
  platformIntegrationId?: string
  platformOrderId?: string
  platformSource?: string

  // Workers
  workerId?: string
  moderatorId?: string
  mediaBuyerId?: string

  // Store
  storeId?: string
  storeName?: string

  // Source
  sourceId?: string
  sourceName?: string

  // Reason (for cancellation/return)
  reasonId?: string
  reasonName?: string

  // Extra Tag
  extraTagId?: string
  extraTagName?: string

  // Additional Info
  note?: string
  utm1?: string
  utm2?: string
  workers?: string

  // Status Flags
  isInvoiced: boolean
  isInvoicedMediaBuyer: boolean
  isArchived: boolean
  cannotEdit: boolean
  isBlacklisted: boolean

  // Timestamps
  createdOn: string
}

// Create Order Item Request
export interface CreateOrderItemRequest {
  productId: string
  productVariantId?: string
  quantity: number
  unitPrice: number
  discountAmount?: number
  discountReason?: string
  note?: string

  // Local display fields (not sent to backend, used for UI rendering)
  _productName?: string
  _variantName?: string
  _variantSku?: string
}

// Add Order Item Request (for adding item to existing order)
// Note: unitCost is calculated by backend from stock average cost
export interface AddOrderItemRequest {
  productId: string
  quantity: number
  unitPrice?: number
  discountAmount?: number
  discountReason?: string
  note?: string
}

// Update Order Item Request
// Note: unitCost cannot be changed through this endpoint
export interface UpdateOrderItemRequest {
  quantity?: number
  unitPrice?: number
  discountAmount?: number
  discountReason?: string
  note?: string
}

// Create Order Request
export interface CreateOrderRequest {
  code: string
  items: CreateOrderItemRequest[]
  fullName: string
  phone: string
  cityId: string
  address: string
  price?: number
  fees?: number
  zipCode?: string
  email?: string
  phase?: string
  state?: string
  trackingStateId?: string
  deliveryCompanyId?: string
  subDeliveryCompanyId?: string
  storeId?: string
  sourceId?: string
}

// Update Order Request
// Note: 'id' is REQUIRED in the request body per backend API spec
export interface UpdateOrderRequest {
  id: string  // Required by backend
  code?: string
  fullName?: string
  phone?: string
  cityId?: string
  price?: number
  fees?: number
  address?: string
  zipCode?: string
  email?: string
  phase?: string
  state?: string
  trackingStateId?: string
  deliveryCompanyId?: string
  subDeliveryCompanyId?: string
  workerId?: string
  moderatorId?: string
  mediaBuyerId?: string
  storeId?: string
  sourceId?: string
  reasonId?: string
  extraTagId?: string
  note?: string
  utm1?: string
  utm2?: string
}

// Confirm Order Request
export interface ConfirmOrderRequest {
  orderId: string
  deliveryCompanyId?: string
  subDeliveryCompanyId?: string
  moveToShipping?: boolean
  comment?: string
}

// Cancel Order Request
export interface CancelOrderRequest {
  orderId: string
  reasonId?: string
  customReason?: string
  comment?: string
}

// Assign Delivery Company Request (used by Suivi agents)
export interface AssignDeliveryCompanyRequest {
  orderId: string
  deliveryCompanyId: string
  subDeliveryCompanyId?: string
}

// Assign Delivery Company Response
export interface AssignDeliveryCompanyResponse {
  orderId: string
  orderCode: string
  deliveryCompanyId: string
  deliveryCompanyName: string
  subDeliveryCompanyId?: string
  subDeliveryCompanyName?: string
}

// Mark Orders as Delivered Request
export interface MarkOrdersAsDeliveredRequest {
  orderIds: string[]
  deliveredDate?: string
  comment?: string
}

// Mark Orders as Returned Request
export interface MarkOrdersAsReturnedRequest {
  orderIds: string[]
  reasonId?: string
  customReason?: string
  comment?: string
}

// Bulk Update State Request
export interface BulkUpdateStateRequest {
  orderIds: string[]
  state: string
  comment?: string
}

// ==================== Worker Operations ====================

// Grab Order Request
export interface GrabOrderRequest {
  orderId: string
}

// Release Order Request
export interface ReleaseOrderRequest {
  orderId: string
}

// Bulk Grab Orders Request
export interface BulkGrabOrdersRequest {
  orderIds: string[]
}

// Reassign Orders Request
export interface ReassignOrdersRequest {
  orderIds: string[]
  newWorkerId: string
  comment?: string
}

// Get Orders By Codes Request
export interface GetOrdersByCodesRequest {
  codes: string[]
}

// Grab Order Response
export interface GrabOrderResponse {
  orderId: string
  orderCode: string
  workerId: string
  grabbedAt: string
}

// Release Order Response
export interface ReleaseOrderResponse {
  orderId: string
  orderCode: string
  releasedAt: string
}

// Bulk Grab Response
export interface BulkGrabOrdersResponse {
  totalOrders: number
  successfullyGrabbed: number
  failed: number
  errors: string[]
  grabbedOrderCodes: string[]
}

// Reassign Response
export interface ReassignOrdersResponse {
  totalOrders: number
  successfullyReassigned: number
  failed: number
  errors: string[]
}

// Order Phases
export const OrderPhases = {
  CONFIRMATION: 'confirmation',
  SHIPPING: 'shipping'
} as const

// Common Order States
export const OrderStates = {
  NEW: 'new',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
} as const

// State Colors for badges
export const OrderStateColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-orange-100 text-orange-800'
}

// Phase Colors
export const OrderPhaseColors: Record<string, string> = {
  confirmation: 'bg-amber-100 text-amber-800',
  shipping: 'bg-cyan-100 text-cyan-800'
}

// COD Payment Status Colors
export const CodPaymentStatusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Collected: 'bg-blue-100 text-blue-800',
  Paid: 'bg-green-100 text-green-800',
  Partial: 'bg-orange-100 text-orange-800',
  Disputed: 'bg-red-100 text-red-800'
}

// ==================== Supervisor Dashboard ====================

// Unified DTO for confirmation orders view (combines Order + Assignment info)
export interface ConfirmationOrderDto {
  // Order info
  orderId: string
  orderCode: string
  customerName: string
  customerPhone: string
  cityName?: string
  orderPrice: number
  sourceName?: string
  orderCreatedOn: string

  // Assignment info (null if unassigned)
  assignmentId?: string
  workerId?: string
  workerName?: string
  serviceType?: string
  assignmentStatus: 'unassigned' | 'pending' | 'taken'
  assignedAt?: string
  takenAt?: string
}

// Assignment Status Colors
export const AssignmentStatusColors: Record<string, string> = {
  unassigned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  taken: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
}
