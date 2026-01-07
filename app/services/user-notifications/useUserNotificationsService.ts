/**
 * User Notifications Service
 *
 * Service for managing user notifications (persistent notifications in database)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { customInstance } from '~/api/axios-instance'

// Types (will be replaced by Orval-generated types when API is regenerated)
export interface UserNotificationDto {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  readAt?: string
  relatedEntityId?: string
  relatedEntityType?: string
  metadata?: string
  createdOn: string
}

export interface UnreadCountDto {
  count: number
}

export interface MarkAllNotificationsAsReadResponse {
  markedCount: number
}

export interface PaginationResponse<T> {
  data: T[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

// Notification type constants (matching backend)
export const NotificationType = {
  Info: 'info',
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
  OrderCreated: 'order_created',
  OrderConfirmed: 'order_confirmed',
  OrderCancelled: 'order_cancelled',
  OrderDelivered: 'order_delivered',
  OrderReturned: 'order_returned',
  AssignmentCreated: 'assignment_created',
  AssignmentReassigned: 'assignment_reassigned',
  AssignmentCompleted: 'assignment_completed',
  InvoiceCreated: 'invoice_created',
  InvoicePaid: 'invoice_paid',
  StockLow: 'stock_low',
  StockOut: 'stock_out',
  SystemAlert: 'system_alert',
  SystemMaintenance: 'system_maintenance',
} as const

// Entity types for navigation
export const NotificationEntityType = {
  Order: 'Order',
  OrderAssignment: 'OrderAssignment',
  Invoice: 'Invoice',
  DeliveryNote: 'DeliveryNote',
  Product: 'Product',
  Stock: 'Stock',
  Customer: 'Customer',
  Payment: 'Payment',
} as const

export function useUserNotificationsService() {
  const queryClient = useQueryClient()

  const queryKey = ['userNotifications'] as const

  // Get my notifications (paginated)
  const useMyNotifications = (options?: {
    pageNumber?: number
    pageSize?: number
    isRead?: boolean | null
    type?: string | null
    enabled?: boolean
  }) => {
    return useQuery({
      queryKey: [...queryKey, 'list', options?.pageNumber, options?.pageSize, options?.isRead, options?.type] as const,
      queryFn: async () => {
        const params = new URLSearchParams()
        if (options?.pageNumber) params.append('pageNumber', options.pageNumber.toString())
        if (options?.pageSize) params.append('pageSize', options.pageSize.toString())
        if (options?.isRead !== undefined && options?.isRead !== null) {
          params.append('isRead', options.isRead.toString())
        }
        if (options?.type) params.append('type', options.type)

        const url = `/api/v1/usernotifications${params.toString() ? `?${params.toString()}` : ''}`
        return customInstance<PaginationResponse<UserNotificationDto>>({
          url,
          method: 'GET',
        })
      },
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      enabled: options?.enabled !== false,
    })
  }

  // Get unread count (for badge)
  const unreadCountQuery = useQuery({
    queryKey: [...queryKey, 'unreadCount'] as const,
    queryFn: async () => {
      return customInstance<UnreadCountDto>({
        url: '/api/v1/usernotifications/unread-count',
        method: 'GET',
      })
    },
    staleTime: 30 * 1000, // 30 seconds - poll frequently
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  })

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return customInstance<UserNotificationDto>({
        url: `/api/v1/usernotifications/${id}/read`,
        method: 'POST',
      })
    },
    onSuccess: () => {
      // Invalidate both list and count
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return customInstance<MarkAllNotificationsAsReadResponse>({
        url: '/api/v1/usernotifications/mark-all-read',
        method: 'POST',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // Computed
  const unreadCount = computed(() => unreadCountQuery.data.value?.count ?? 0)
  const isLoadingCount = computed(() => unreadCountQuery.isLoading.value)
  const isMutating = computed(() =>
    markAsReadMutation.isPending.value ||
    markAllAsReadMutation.isPending.value
  )

  // Actions
  const markAsRead = async (id: string): Promise<UserNotificationDto> => {
    return markAsReadMutation.mutateAsync(id)
  }

  const markAllAsRead = async (): Promise<MarkAllNotificationsAsReadResponse> => {
    return markAllAsReadMutation.mutateAsync()
  }

  // Helper to get icon and color for notification type
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case NotificationType.Success:
      case NotificationType.OrderDelivered:
      case NotificationType.AssignmentCompleted:
      case NotificationType.InvoicePaid:
        return { icon: 'check-circle', color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' }

      case NotificationType.Warning:
      case NotificationType.StockLow:
        return { icon: 'exclamation-triangle', color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' }

      case NotificationType.Error:
      case NotificationType.StockOut:
      case NotificationType.OrderCancelled:
      case NotificationType.OrderReturned:
        return { icon: 'x-circle', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' }

      case NotificationType.OrderCreated:
      case NotificationType.OrderConfirmed:
        return { icon: 'shopping-bag', color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' }

      case NotificationType.AssignmentCreated:
      case NotificationType.AssignmentReassigned:
        return { icon: 'user-plus', color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20' }

      case NotificationType.InvoiceCreated:
        return { icon: 'document-text', color: 'text-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20' }

      case NotificationType.SystemAlert:
      case NotificationType.SystemMaintenance:
        return { icon: 'cog', color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-900/20' }

      default:
        return { icon: 'bell', color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' }
    }
  }

  // Get route for notification navigation
  const getNotificationRoute = (notification: UserNotificationDto): string | null => {
    if (!notification.relatedEntityId || !notification.relatedEntityType) {
      return null
    }

    switch (notification.relatedEntityType) {
      case NotificationEntityType.Order:
        return `/dashboard/orders/${notification.relatedEntityId}`
      case NotificationEntityType.OrderAssignment:
        return `/dashboard/worker` // Worker dashboard shows assignments
      case NotificationEntityType.Invoice:
        return `/dashboard/invoices/${notification.relatedEntityId}`
      case NotificationEntityType.DeliveryNote:
        return `/dashboard/delivery/notes/${notification.relatedEntityId}`
      case NotificationEntityType.Product:
        return `/dashboard/products/${notification.relatedEntityId}`
      case NotificationEntityType.Stock:
        return `/dashboard/stocks`
      case NotificationEntityType.Customer:
        return `/dashboard/customers/${notification.relatedEntityId}`
      case NotificationEntityType.Payment:
        return `/dashboard/payments/${notification.relatedEntityId}`
      default:
        return null
    }
  }

  return {
    // Queries
    useMyNotifications,
    unreadCountQuery,

    // Computed
    unreadCount,
    isLoadingCount,
    isMutating,

    // Actions
    markAsRead,
    markAllAsRead,
    refetchCount: () => unreadCountQuery.refetch(),
    invalidateAll: () => queryClient.invalidateQueries({ queryKey }),

    // Helpers
    getNotificationStyle,
    getNotificationRoute,
  }
}

export type {
  UserNotificationDto,
  UnreadCountDto,
  MarkAllNotificationsAsReadResponse,
  PaginationResponse,
}
