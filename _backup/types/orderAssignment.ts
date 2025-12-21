// Assignment status constants
export const AssignmentStatuses = {
  PENDING: 'pending',
  TAKEN: 'taken',
  COMPLETED: 'completed',
  RELEASED: 'released',
  REASSIGNED: 'reassigned',
  EXPIRED: 'expired'
} as const

export type AssignmentStatus = typeof AssignmentStatuses[keyof typeof AssignmentStatuses]

export const AssignmentStatusColors: Record<AssignmentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  taken: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  released: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  reassigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

// Service types
export const ServiceTypes = {
  CONFIRMATION: 'confirmation',
  SUIVI: 'suivi',
  QUALITY: 'quality',
  CALLBACK: 'callback'
} as const

export type ServiceType = typeof ServiceTypes[keyof typeof ServiceTypes]

// Strategy types for auto-assignment
export const AssignmentStrategies = {
  ROUND_ROBIN: 'round_robin',
  LEAST_LOADED: 'least_loaded',
  RANDOM: 'random',
  PRIORITY: 'priority'
} as const

export type AssignmentStrategy = typeof AssignmentStrategies[keyof typeof AssignmentStrategies]

export const AssignmentStrategyLabels: Record<AssignmentStrategy, string> = {
  round_robin: 'Round Robin',
  least_loaded: 'Least Loaded',
  random: 'Random',
  priority: 'Priority Based'
}

// Order summary for assignment display
export interface OrderSummary {
  id: string
  code: string
  fullName: string
  phone: string
  cityName?: string
  price: number
  state?: string
  phase?: string
  createdOn: string
}

// Main OrderAssignment interface
export interface OrderAssignment {
  id: string
  orderId: string
  workerId: string
  serviceType: ServiceType
  status: AssignmentStatus
  assignedAt: string
  takenAt?: string
  completedAt?: string
  releasedAt?: string
  assignedByUserId?: string
  priority: number
  notes?: string
  result?: string
}

// Worker assignment DTO (includes order details)
// Fields match backend WorkerAssignmentDto from GetMyPendingAssignmentsRequest
export interface WorkerAssignmentDto {
  id: string
  orderId: string
  orderCode: string
  serviceType: ServiceType
  status: AssignmentStatus
  assignedAt: string
  takenAt?: string
  priority: number
  notes?: string
  // Order summary for worker's view (named as per backend DTO)
  customerName: string
  customerPhone: string
  customerCity?: string
  customerAddress?: string
  cityName?: string
  orderPrice: number
  totalPrice: number
  productNames?: string
  orderPhase?: string
  orderState?: string
  itemCount: number
  firstProductName?: string
  // Callback fields
  callbackScheduledAt?: string
  callbackAttemptNumber: number
  isCallbackOverdue: boolean
}

// Request types
export interface AssignOrderRequest {
  orderId: string
  workerId: string
  serviceType: ServiceType
  priority?: number
  notes?: string
}

export interface TakeAssignmentResponse {
  assignmentId: string
  orderId: string
  orderCode: string
  status: string
  takenAt: string
}

export interface CompleteAssignmentRequest {
  assignmentId?: string
  result: string
  notes?: string
}

export interface CompleteAssignmentResponse {
  assignmentId: string
  orderId: string
  status: string
  result: string
  completedAt: string
}

export interface ReleaseAssignmentRequest {
  assignmentId?: string
  reason?: string
}

export interface ReleaseAssignmentResponse {
  assignmentId: string
  orderId: string
  status: string
  releasedAt: string
}

// Self-assign request and response
export interface SelfAssignOrderRequest {
  orderId: string
  serviceType: ServiceType
  notes?: string
}

export interface SelfAssignOrderResponse {
  assignmentId: string
  orderId: string
  orderCode: string
  status: string
  assignedAt: string
}

// WorkerServiceConfig interface
export interface WorkerServiceConfig {
  id: string
  userId: string
  isOnline: boolean
  canDoConfirmation: boolean
  canDoSuivi: boolean
  canDoQuality: boolean
  canDoCallback: boolean
  maxConcurrentAssignments: number
  currentAssignmentCount: number
  autoAssignPriority: number
  lastAssignedAt?: string
  restrictedCityIds?: string
  restrictedSourceIds?: string
}

export interface WorkerSummaryDto {
  userId: string
  userName: string
  email?: string
  isOnline: boolean
  currentAssignmentCount: number
  maxConcurrentAssignments: number
  canDoConfirmation: boolean
  canDoSuivi: boolean
}

export interface SetOnlineStatusRequest {
  isOnline: boolean
}

// AutoAssignmentSettings interface
export interface AutoAssignmentSettings {
  id: string
  isEnabled: boolean
  autoAssignConfirmation: boolean
  autoAssignSuivi: boolean
  strategy: AssignmentStrategy
  onlyOnlineWorkers: boolean
  assignmentTimeoutMinutes: number
  globalMaxOrdersPerWorker: number
  // Quality Control Settings
  enableQualityCheck: boolean
  autoAssignQuality: boolean
  qualityPassThreshold: number
  returnRejectedToSameConfirmateur: boolean
  // Callback Settings
  maxCallbackAttempts: number
  callbackReminderMinutes: number
  autoCancelUnreachable: boolean
  // Suivi Settings
  autoAssignSuiviAfterConfirm: boolean
  suiviToSameWorker: boolean
  defaultSuiviPriority: number
  // General Settings
  allowWorkerSelfAssign: boolean
  enableWhatsAppIntegration: boolean
}

export interface UpdateAutoAssignmentSettingsRequest {
  isEnabled?: boolean
  autoAssignConfirmation?: boolean
  autoAssignSuivi?: boolean
  strategy?: AssignmentStrategy
  onlyOnlineWorkers?: boolean
  assignmentTimeoutMinutes?: number
  globalMaxOrdersPerWorker?: number
  // Quality Control Settings
  enableQualityCheck?: boolean
  autoAssignQuality?: boolean
  qualityPassThreshold?: number
  returnRejectedToSameConfirmateur?: boolean
  // Callback Settings
  maxCallbackAttempts?: number
  callbackReminderMinutes?: number
  autoCancelUnreachable?: boolean
  // Suivi Settings
  autoAssignSuiviAfterConfirm?: boolean
  suiviToSameWorker?: boolean
  defaultSuiviPriority?: number
  // General Settings
  allowWorkerSelfAssign?: boolean
  enableWhatsAppIntegration?: boolean
}

// Bulk assign request and response
export interface BulkAssignOrdersRequest {
  orderIds: string[]
  workerId: string
  serviceTypes: ServiceType[]
  priority?: number
  notes?: string
}

export interface BulkAssignOrdersResponse {
  totalOrders: number
  successfullyAssigned: number
  failed: number
  errors: string[]
  assignmentIds: string[]
  assignedOrderCodes: string[]
}

// Bulk reassign request and response
export interface BulkReassignOrdersRequest {
  orderIds: string[]
  toWorkerId: string
  serviceTypes?: ServiceType[]
  notes?: string
}

export interface BulkReassignOrdersResponse {
  totalOrders: number
  successfullyReassigned: number
  failed: number
  errors: string[]
  newAssignmentIds: string[]
  reassignedOrderCodes: string[]
}

// Supervisor assignment DTO - combines Order info with Assignment info
export interface SupervisorAssignmentDto {
  orderId: string
  orderCode: string
  customerName: string
  customerPhone: string
  cityName?: string
  orderPrice: number
  sourceName?: string
  orderCreatedOn: string
  // Assignment info
  assignmentId: string
  workerId: string
  workerName?: string
  serviceType: ServiceType
  status: AssignmentStatus
  assignedAt: string
  takenAt?: string
  priority: number
  serviceChain?: string
}

// ============================================
// NEW: Service-specific request/response types
// ============================================

// Schedule Callback
export interface ScheduleCallbackRequest {
  scheduledAt: string // ISO datetime
  notes?: string
}

export interface ScheduleCallbackResponse {
  assignmentId: string
  orderId: string
  orderCode: string
  callbackScheduledAt: string
  callbackAttemptNumber: number
  maxCallbackAttempts: number
  isLastAttempt: boolean
}

// Complete Suivi
export type SuiviResult = 'delivered' | 'returned' | 'in_progress' | 'no_response' | 'refused' | 'postponed'

export interface CompleteSuiviRequest {
  trackingStateId: string
  result: SuiviResult
  notes?: string
  codAmountCollected?: number
}

export interface CompleteSuiviResponse {
  assignmentId: string
  orderId: string
  orderCode: string
  status: string
  result: string
  completedAt: string
  newTrackingStateId: string
  newTrackingStateName: string
  codAmountCollected?: number
}

// Complete Quality
export interface QualityCheckItem {
  checkName: string
  passed: boolean
}

export interface CompleteQualityRequest {
  approved: boolean
  score: number // 0-100
  checklist: QualityCheckItem[]
  notes?: string
  rejectionReason?: string // Required if !approved
}

export interface CompleteQualityResponse {
  assignmentId: string
  orderId: string
  orderCode: string
  status: string
  approved: boolean
  score: number
  completedAt: string
  nextAssignmentId?: string
  nextServiceType?: string
}

// Callback filter type
export type CallbackFilter = 'overdue' | 'today' | 'upcoming'

// Default quality checklist items (for UI)
export const DEFAULT_QUALITY_CHECKLIST = [
  { id: 'customer_name', label: 'Nom du client correct', labelAr: 'اسم الزبون صحيح' },
  { id: 'phone_verified', label: 'Numéro de téléphone vérifié', labelAr: 'رقم الهاتف تم التحقق منه' },
  { id: 'address_complete', label: 'Adresse complète', labelAr: 'العنوان كامل' },
  { id: 'product_matches', label: 'Produit correspond à la commande', labelAr: 'المنتج يطابق الطلب' },
  { id: 'price_confirmed', label: 'Prix confirmé avec le client', labelAr: 'السعر مؤكد مع الزبون' }
] as const
