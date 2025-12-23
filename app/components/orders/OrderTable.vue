<script setup lang="ts">
import {
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShoppingCartIcon,
  ClockIcon,
  TruckIcon,
  UserGroupIcon,
  EyeIcon,
  ArchiveBoxIcon,
  ArchiveBoxXMarkIcon
} from '@heroicons/vue/24/outline'
import type { Order } from '~/types/order'
import { OrderStateColors, OrderPhaseColors } from '~/types/order'

const props = defineProps<{
  orders: Order[]
  isLoading: boolean
  pagination: {
    currentPage: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}>()

const emit = defineEmits<{
  view: [order: Order]
  edit: [order: Order]
  'edit-items': [order: Order]
  delete: [order: Order]
  confirm: [order: Order]
  cancel: [order: Order]
  history: [order: Order]
  'assign-delivery': [order: Order]
  'assign-worker': [order: Order]
  archive: [order: Order]
  unarchive: [order: Order]
  selectionChange: [orderIds: string[]]
  pageChange: [page: number]
}>()

const { t } = useI18n()

const selectedOrders = ref<string[]>([])
const selectAll = ref(false)

watch(selectAll, (val) => {
  selectedOrders.value = val ? props.orders.map(o => o.id) : []
})

watch(selectedOrders, (val) => {
  emit('selectionChange', val)
}, { deep: true })

watch(() => props.orders, () => {
  // Reset selection when orders change
  selectedOrders.value = []
  selectAll.value = false
})

const toggleOrderSelection = (orderId: string) => {
  const index = selectedOrders.value.indexOf(orderId)
  if (index === -1) {
    selectedOrders.value.push(orderId)
  } else {
    selectedOrders.value.splice(index, 1)
  }
}

const getStateColor = (state: string) => OrderStateColors[state?.toLowerCase()] || 'bg-gray-100 text-gray-800'
const getPhaseColor = (phase: string) => OrderPhaseColors[phase?.toLowerCase()] || 'bg-gray-100 text-gray-800'

// Translation helpers for phase and state
const getPhaseLabel = (phase: string) => {
  if (!phase) return t('orders.phases.new')
  const key = `orders.phases.${phase.toLowerCase()}`
  const translated = t(key)
  // Return original if no translation found (key returned as-is)
  return translated === key ? phase : translated
}

const getStateLabel = (state: string) => {
  if (!state) return t('orders.statuses.new')
  const key = `orders.statuses.${state.toLowerCase()}`
  const translated = t(key)
  // Return original if no translation found (key returned as-is)
  return translated === key ? state : translated
}

// Check if order can have delivery company assigned
const canAssignDelivery = (order: Order) => {
  const phase = order.phase?.toLowerCase()
  const state = order.state?.toLowerCase()
  // Block terminal states
  if (['cancelled', 'canceled', 'delivered', 'returned'].includes(state || '')) return false
  // Only allow for shipping phase or confirmed orders
  return ['suivi', 'shipping', 'quality'].includes(phase || '') || state === 'confirmed'
}

// Check if order can have worker assigned
const canAssignWorker = (order: Order) => {
  const state = order.state?.toLowerCase()
  // Block terminal states
  return !['cancelled', 'canceled', 'delivered', 'returned'].includes(state || '')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-MA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Assignment status colors
const getAssignmentStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'taken': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
  }
}

// Service type colors
const getServiceTypeColor = (serviceType: string) => {
  switch (serviceType?.toLowerCase()) {
    case 'confirmation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'quality': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
    case 'suivi': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
    case 'callback': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
  }
}

// Get service type label
const getServiceTypeLabel = (serviceType: string) => {
  const key = `supervisor.${serviceType?.toLowerCase()}`
  const translated = t(key)
  return translated === key ? serviceType : translated
}

// Get assignment status label
const getAssignmentStatusLabel = (status: string) => {
  const key = `supervisor.status${status?.charAt(0).toUpperCase() + status?.slice(1)}`
  const translated = t(key)
  return translated === key ? status : translated
}

// Calculate duration from assignedAt or takenAt
const formatDuration = (assignedAt: string | null, takenAt: string | null) => {
  const startDate = takenAt ? new Date(takenAt) : assignedAt ? new Date(assignedAt) : null
  if (!startDate) return '-'

  const now = new Date()
  const diffMs = now.getTime() - startDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 60) {
    return `${diffMins}m`
  }
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  if (hours < 24) {
    return `${hours}h ${mins}m`
  }
  const days = Math.floor(hours / 24)
  return `${days}j ${hours % 24}h`
}

// Get active assignment for order (first one or primary)
const getActiveAssignment = (order: Order) => {
  if (!order.activeAssignments || order.activeAssignments.length === 0) return null
  // Return the first assignment (or the most relevant - taken over pending)
  return order.activeAssignments.find(a => a.status === 'taken') || order.activeAssignments[0]
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="w-12 px-4 py-3">
              <input
                v-model="selectAll"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300"
              />
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('orders.orderNumber') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('orders.customer') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('orders.city') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('orders.deliveryCompany') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('orders.total') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('orders.phase') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('orders.status') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('orders.date') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('orders.assignment') }}
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-if="isLoading">
            <td colspan="11" class="px-4 py-8 text-center text-gray-500">
              {{ t('common.loading') }}
            </td>
          </tr>
          <tr v-else-if="orders.length === 0">
            <td colspan="11" class="px-4 py-8 text-center text-gray-500">
              {{ t('common.noData') }}
            </td>
          </tr>
          <tr
            v-for="order in orders"
            :key="order.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            :class="{ 'bg-red-50 dark:bg-red-900/10': order.isBlacklisted }"
          >
            <td class="px-4 py-3">
              <input
                type="checkbox"
                :checked="selectedOrders.includes(order.id)"
                class="h-4 w-4 rounded border-gray-300"
                @change="toggleOrderSelection(order.id)"
              />
            </td>
            <td class="whitespace-nowrap px-4 py-3">
              <button
                class="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                @click="emit('view', order)"
              >
                {{ order.code }}
              </button>
              <div v-if="order.trackingCode" class="text-xs text-gray-500">
                {{ order.trackingCode }}
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="font-medium text-gray-900 dark:text-white">{{ order.fullName }}</div>
              <div class="text-sm text-gray-500">{{ order.phone }}</div>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {{ order.cityName }}
            </td>
            <td class="px-4 py-3">
              <div v-if="order.deliveryCompanyName">
                <span class="font-medium text-gray-900 dark:text-white">{{ order.deliveryCompanyName }}</span>
                <span v-if="order.subDeliveryCompanyName" class="block text-xs text-gray-500">
                  {{ order.subDeliveryCompanyName }}
                </span>
              </div>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">
              {{ formatCurrency(order.price) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3">
              <span
                class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                :class="getPhaseColor(order.phase || '')"
              >
                {{ getPhaseLabel(order.phase || '') }}
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-3">
              <span
                v-if="order.trackingStateName"
                class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                :style="{ backgroundColor: order.trackingStateColor + '20', color: order.trackingStateColor }"
              >
                {{ order.trackingStateName }}
              </span>
              <span
                v-else
                class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                :class="getStateColor(order.state || '')"
              >
                {{ getStateLabel(order.state || '') }}
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(order.createdOn) }}
            </td>
            <!-- Assignment Column -->
            <td class="px-4 py-3">
              <template v-if="order.activeAssignments && order.activeAssignments.length > 0">
                <div class="space-y-1.5">
                  <div
                    v-for="assignment in order.activeAssignments"
                    :key="assignment.id"
                    class="flex flex-wrap items-center gap-1.5"
                  >
                    <!-- Service Type Badge -->
                    <span
                      class="inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                      :class="getServiceTypeColor(assignment.serviceType)"
                    >
                      {{ getServiceTypeLabel(assignment.serviceType) }}
                    </span>
                    <!-- Status Badge -->
                    <span
                      class="inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                      :class="getAssignmentStatusColor(assignment.status)"
                    >
                      {{ getAssignmentStatusLabel(assignment.status) }}
                    </span>
                    <!-- Worker Name -->
                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {{ assignment.workerName }}
                    </span>
                    <!-- Duration -->
                    <span class="text-[10px] text-gray-500">
                      {{ formatDuration(assignment.assignedAt, assignment.takenAt) }}
                    </span>
                  </div>
                </div>
              </template>
              <span v-else class="text-xs text-gray-400">-</span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <!-- View Details button - navigates to order details page -->
                <NuxtLink
                  :to="`/dashboard/orders/${order.id}`"
                  class="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  :title="t('common.view')"
                >
                  <EyeIcon class="h-5 w-5" />
                </NuxtLink>
                <!-- Confirm button (only for pending orders in confirmation phase) -->
                <button
                  v-if="order.phase === 'confirmation' && order.state !== 'confirmed'"
                  class="rounded p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  :title="t('orders.confirmOrder')"
                  @click="emit('confirm', order)"
                >
                  <CheckCircleIcon class="h-5 w-5" />
                </button>
                <!-- Cancel button -->
                <button
                  v-if="order.state !== 'cancelled' && order.state !== 'delivered'"
                  class="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  :title="t('orders.cancelOrder')"
                  @click="emit('cancel', order)"
                >
                  <XCircleIcon class="h-5 w-5" />
                </button>
                <!-- Edit button -->
                <button
                  v-if="!order.cannotEdit"
                  class="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  :title="t('common.edit')"
                  @click="emit('edit', order)"
                >
                  <PencilSquareIcon class="h-5 w-5" />
                </button>
                <!-- Edit Items button -->
                <button
                  v-if="!order.cannotEdit"
                  class="rounded p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  :title="t('orders.manageItems')"
                  @click="emit('edit-items', order)"
                >
                  <ShoppingCartIcon class="h-5 w-5" />
                </button>
                <!-- Assign Delivery Company button -->
                <button
                  v-if="canAssignDelivery(order)"
                  class="rounded p-1 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  :title="t('orders.assignDelivery')"
                  @click="emit('assign-delivery', order)"
                >
                  <TruckIcon class="h-5 w-5" />
                </button>
                <!-- Assign Worker button -->
                <button
                  v-if="canAssignWorker(order)"
                  class="rounded p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  :title="t('orders.assignWorker')"
                  @click="emit('assign-worker', order)"
                >
                  <UserGroupIcon class="h-5 w-5" />
                </button>
                <!-- History button -->
                <button
                  class="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  :title="t('orders.viewHistory')"
                  @click="emit('history', order)"
                >
                  <ClockIcon class="h-5 w-5" />
                </button>
                <!-- Archive/Unarchive button -->
                <button
                  v-if="!order.isArchived"
                  class="rounded p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  :title="t('orders.archive')"
                  @click="emit('archive', order)"
                >
                  <ArchiveBoxIcon class="h-5 w-5" />
                </button>
                <button
                  v-else
                  class="rounded p-1 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                  :title="t('orders.unarchive')"
                  @click="emit('unarchive', order)"
                >
                  <ArchiveBoxXMarkIcon class="h-5 w-5" />
                </button>
                <!-- Delete button -->
                <button
                  class="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  :title="t('common.delete')"
                  @click="emit('delete', order)"
                >
                  <TrashIcon class="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ t('common.showing') }} {{ (pagination.currentPage - 1) * pagination.pageSize + 1 }} -
        {{ Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount) }}
        {{ t('common.of') }} {{ pagination.totalCount }}
      </div>
      <div class="flex gap-2">
        <button
          :disabled="pagination.currentPage === 1"
          class="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
          @click="emit('pageChange', pagination.currentPage - 1)"
        >
          {{ t('common.previous') }}
        </button>
        <button
          :disabled="pagination.currentPage === pagination.totalPages"
          class="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
          @click="emit('pageChange', pagination.currentPage + 1)"
        >
          {{ t('common.next') }}
        </button>
      </div>
    </div>
  </div>
</template>
