<template>
  <Menu as="div" class="relative">
    <MenuButton
      class="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
      :title="$t('notifications.title')"
    >
      <BellIcon class="w-5 h-5" />
      <!-- Unread Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </MenuButton>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 focus:outline-none overflow-hidden"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ $t('notifications.title') }}
          </h3>
          <button
            v-if="unreadCount > 0"
            @click.stop="handleMarkAllAsRead"
            :disabled="isMutating"
            class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium disabled:opacity-50"
          >
            {{ $t('notifications.markAllRead') }}
          </button>
        </div>

        <!-- Notifications List -->
        <div class="max-h-96 overflow-y-auto">
          <!-- Loading State -->
          <div v-if="isLoading" class="p-4 space-y-3">
            <div v-for="i in 3" :key="i" class="flex gap-3 animate-pulse">
              <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="!notifications?.length"
            class="py-8 px-4 text-center"
          >
            <BellSlashIcon class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('notifications.empty') }}
            </p>
          </div>

          <!-- Notification Items -->
          <template v-else>
            <MenuItem
              v-for="notification in notifications"
              :key="notification.id"
              v-slot="{ active }"
            >
              <button
                @click="handleNotificationClick(notification)"
                class="w-full px-4 py-3 flex items-start gap-3 text-left transition-colors"
                :class="[
                  active ? 'bg-gray-50 dark:bg-gray-700/50' : '',
                  !notification.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                ]"
              >
                <!-- Icon -->
                <div
                  class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  :class="getNotificationStyle(notification.type).bgColor"
                >
                  <component
                    :is="getIcon(notification.type)"
                    class="w-5 h-5"
                    :class="getNotificationStyle(notification.type).color"
                  />
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <p
                    class="text-sm font-medium truncate"
                    :class="notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'"
                  >
                    {{ notification.title }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {{ formatRelativeTime(notification.createdOn) }}
                  </p>
                </div>

                <!-- Unread Indicator -->
                <div
                  v-if="!notification.isRead"
                  class="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"
                ></div>
              </button>
            </MenuItem>
          </template>
        </div>

        <!-- Footer -->
        <div
          v-if="hasMore"
          class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center"
        >
          <NuxtLink
            to="/dashboard/notifications"
            class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            {{ $t('notifications.viewAll') }}
          </NuxtLink>
        </div>
      </MenuItems>
    </Transition>
  </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  BellIcon,
  BellSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ShoppingBagIcon,
  UserPlusIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'
import {
  useUserNotificationsService,
  type UserNotificationDto,
  NotificationType,
} from '~/services/user-notifications/useUserNotificationsService'

const { t } = useI18n()
const router = useRouter()
const { onUserNotification } = useSignalR()

const {
  useMyNotifications,
  unreadCount,
  isMutating,
  markAsRead,
  markAllAsRead,
  getNotificationStyle,
  getNotificationRoute,
  refetchCount,
} = useUserNotificationsService()

// Fetch recent notifications
const { data: notificationsResponse, isLoading, refetch: refetchNotifications } = useMyNotifications({
  pageNumber: 1,
  pageSize: 10,
})

// Listen for real-time notifications via SignalR
let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = onUserNotification(() => {
    // Refetch notifications and count when a new notification arrives
    refetchCount()
    refetchNotifications()
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

const notifications = computed(() => notificationsResponse.value?.data ?? [])
const hasMore = computed(() => (notificationsResponse.value?.totalCount ?? 0) > 10)

// Handle notification click
const handleNotificationClick = async (notification: UserNotificationDto) => {
  // Mark as read if unread
  if (!notification.isRead) {
    try {
      await markAsRead(notification.id)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Navigate if there's a route
  const route = getNotificationRoute(notification)
  if (route) {
    router.push(route)
  }
}

// Handle mark all as read
const handleMarkAllAsRead = async () => {
  try {
    await markAllAsRead()
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
  }
}

// Get icon component based on notification type
const getIcon = (type: string) => {
  switch (type) {
    case NotificationType.Success:
    case NotificationType.OrderDelivered:
    case NotificationType.AssignmentCompleted:
    case NotificationType.InvoicePaid:
      return CheckCircleIcon

    case NotificationType.Warning:
    case NotificationType.StockLow:
      return ExclamationTriangleIcon

    case NotificationType.Error:
    case NotificationType.StockOut:
    case NotificationType.OrderCancelled:
    case NotificationType.OrderReturned:
      return XCircleIcon

    case NotificationType.OrderCreated:
    case NotificationType.OrderConfirmed:
      return ShoppingBagIcon

    case NotificationType.AssignmentCreated:
    case NotificationType.AssignmentReassigned:
      return UserPlusIcon

    case NotificationType.InvoiceCreated:
      return DocumentTextIcon

    case NotificationType.SystemAlert:
    case NotificationType.SystemMaintenance:
      return Cog6ToothIcon

    default:
      return BellIcon
  }
}

// Format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return t('time.justNow')
  } else if (diffMinutes < 60) {
    return t('time.minutesAgo', { count: diffMinutes })
  } else if (diffHours < 24) {
    return t('time.hoursAgo', { count: diffHours })
  } else if (diffDays < 7) {
    return t('time.daysAgo', { count: diffDays })
  } else {
    return date.toLocaleDateString()
  }
}
</script>
