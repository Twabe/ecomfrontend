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
  ArchiveBoxXMarkIcon,
  EllipsisHorizontalIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import type { Order } from '~/types/order'
import { OrderStateColors, OrderPhaseColors } from '~/types/order'
import { OrderPhase, OrderState, ServiceTypes, AssignmentStatus, TerminalStates } from '~/constants/order'

// Track which order's actions modal is open
const actionsModalOrder = ref<Order | null>(null)

const openActionsModal = (order: Order) => {
  actionsModalOrder.value = order
}

const closeActionsModal = () => {
  actionsModalOrder.value = null
}

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
  // Archived orders cannot be modified
  if (order.isArchived) return false
  const phase = order.phase?.toLowerCase()
  const state = order.state?.toLowerCase()
  // Block terminal states
  if (TerminalStates.includes(state || '')) return false
  // Only allow for shipping phase or confirmed orders
  return [ServiceTypes.Suivi, OrderPhase.Shipping, ServiceTypes.Quality].includes(phase || '') || state === OrderState.Confirmed
}

// Check if order can have worker assigned
const canAssignWorker = (order: Order) => {
  // Archived orders cannot be modified
  if (order.isArchived) return false
  const state = order.state?.toLowerCase()
  // Block terminal states
  return !TerminalStates.includes(state || '')
}

// Check if order can be confirmed
const canConfirm = (order: Order) => {
  // Archived orders cannot be modified
  if (order.isArchived) return false
  return order.phase === OrderPhase.Confirmation && order.state !== OrderState.Confirmed
}

// Check if order can be cancelled
const canCancel = (order: Order) => {
  // Archived orders cannot be modified
  if (order.isArchived) return false
  // Terminal states cannot be cancelled
  const state = order.state?.toLowerCase()
  return !TerminalStates.includes(state || '')
}

// Check if order can be edited
const canEdit = (order: Order) => {
  // Archived orders cannot be modified
  if (order.isArchived) return false
  // Terminal states cannot be edited
  const state = order.state?.toLowerCase()
  if (TerminalStates.includes(state || '')) return false
  return !order.cannotEdit
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
    case AssignmentStatus.Pending: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case AssignmentStatus.Taken: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case AssignmentStatus.Completed: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
  }
}

// Service type colors
const getServiceTypeColor = (serviceType: string) => {
  switch (serviceType?.toLowerCase()) {
    case ServiceTypes.Confirmation: return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case ServiceTypes.Quality: return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
    case ServiceTypes.Suivi: return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
    case ServiceTypes.Callback: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
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
  return order.activeAssignments.find(a => a.status === AssignmentStatus.Taken) || order.activeAssignments[0]
}

// Handle action and close modal
const handleAction = (action: string, order: Order) => {
  closeActionsModal()
  switch (action) {
    case 'view':
      emit('view', order)
      break
    case 'edit':
      emit('edit', order)
      break
    case 'edit-items':
      emit('edit-items', order)
      break
    case 'confirm':
      emit('confirm', order)
      break
    case 'cancel':
      emit('cancel', order)
      break
    case 'assign-delivery':
      emit('assign-delivery', order)
      break
    case 'assign-worker':
      emit('assign-worker', order)
      break
    case 'history':
      emit('history', order)
      break
    case 'archive':
      emit('archive', order)
      break
    case 'unarchive':
      emit('unarchive', order)
      break
    case 'delete':
      emit('delete', order)
      break
  }
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
              <button
                class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                @click="openActionsModal(order)"
              >
                <EllipsisHorizontalIcon class="h-5 w-5" />
              </button>
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

    <!-- Actions Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="actionsModalOrder"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          @click.self="closeActionsModal"
        >
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="translate-y-full sm:translate-y-0 sm:scale-95"
            enter-to-class="translate-y-0 sm:scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="translate-y-0 sm:scale-100"
            leave-to-class="translate-y-full sm:translate-y-0 sm:scale-95"
          >
            <div
              v-if="actionsModalOrder"
              class="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl dark:bg-gray-800 sm:rounded-2xl"
            >
              <!-- Header -->
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ t('common.actions') }}
                  </h3>
                  <p class="text-sm text-primary-600 dark:text-primary-400">
                    {{ actionsModalOrder.code }}
                    <span class="ml-2 font-medium">{{ formatCurrency(actionsModalOrder.price) }}</span>
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ actionsModalOrder.fullName }} - {{ actionsModalOrder.cityName }}
                  </p>
                </div>
                <button
                  class="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                  @click="closeActionsModal"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>

              <!-- Actions Grid -->
              <div class="grid grid-cols-2 gap-3">
                <!-- View -->
                <NuxtLink
                  :to="`/dashboard/orders/${actionsModalOrder.id}`"
                  class="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                  @click="closeActionsModal"
                >
                  <EyeIcon class="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('common.view') }}</span>
                </NuxtLink>

                <!-- Confirm -->
                <button
                  v-if="canConfirm(actionsModalOrder)"
                  class="flex flex-col items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 transition hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:hover:bg-green-900/50"
                  @click="handleAction('confirm', actionsModalOrder)"
                >
                  <CheckCircleIcon class="h-6 w-6 text-green-600 dark:text-green-400" />
                  <span class="text-sm font-medium text-green-700 dark:text-green-300">{{ t('orders.confirmOrder') }}</span>
                </button>

                <!-- Cancel -->
                <button
                  v-if="canCancel(actionsModalOrder)"
                  class="flex flex-col items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                  @click="handleAction('cancel', actionsModalOrder)"
                >
                  <XCircleIcon class="h-6 w-6 text-red-600 dark:text-red-400" />
                  <span class="text-sm font-medium text-red-700 dark:text-red-300">{{ t('orders.cancelOrder') }}</span>
                </button>

                <!-- Edit -->
                <button
                  v-if="canEdit(actionsModalOrder)"
                  class="flex flex-col items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-4 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                  @click="handleAction('edit', actionsModalOrder)"
                >
                  <PencilSquareIcon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span class="text-sm font-medium text-blue-700 dark:text-blue-300">{{ t('common.edit') }}</span>
                </button>

                <!-- Manage Items -->
                <button
                  v-if="canEdit(actionsModalOrder)"
                  class="flex flex-col items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 p-4 transition hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
                  @click="handleAction('edit-items', actionsModalOrder)"
                >
                  <ShoppingCartIcon class="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <span class="text-sm font-medium text-purple-700 dark:text-purple-300">{{ t('orders.manageItems') }}</span>
                </button>

                <!-- Assign Delivery -->
                <button
                  v-if="canAssignDelivery(actionsModalOrder)"
                  class="flex flex-col items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 p-4 transition hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-900/30 dark:hover:bg-orange-900/50"
                  @click="handleAction('assign-delivery', actionsModalOrder)"
                >
                  <TruckIcon class="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  <span class="text-sm font-medium text-orange-700 dark:text-orange-300">{{ t('orders.assignDelivery') }}</span>
                </button>

                <!-- Assign Worker -->
                <button
                  v-if="canAssignWorker(actionsModalOrder)"
                  class="flex flex-col items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 p-4 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50"
                  @click="handleAction('assign-worker', actionsModalOrder)"
                >
                  <UserGroupIcon class="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  <span class="text-sm font-medium text-indigo-700 dark:text-indigo-300">{{ t('orders.assignWorker') }}</span>
                </button>

                <!-- History -->
                <button
                  class="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                  @click="handleAction('history', actionsModalOrder)"
                >
                  <ClockIcon class="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('orders.viewHistory') }}</span>
                </button>

                <!-- Archive/Unarchive -->
                <button
                  v-if="!actionsModalOrder.isArchived"
                  class="flex flex-col items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:hover:bg-amber-900/50"
                  @click="handleAction('archive', actionsModalOrder)"
                >
                  <ArchiveBoxIcon class="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  <span class="text-sm font-medium text-amber-700 dark:text-amber-300">{{ t('orders.archive') }}</span>
                </button>
                <button
                  v-else
                  class="flex flex-col items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 p-4 transition hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-900/30 dark:hover:bg-teal-900/50"
                  @click="handleAction('unarchive', actionsModalOrder)"
                >
                  <ArchiveBoxXMarkIcon class="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  <span class="text-sm font-medium text-teal-700 dark:text-teal-300">{{ t('orders.unarchive') }}</span>
                </button>

                <!-- Delete -->
                <button
                  class="flex flex-col items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                  @click="handleAction('delete', actionsModalOrder)"
                >
                  <TrashIcon class="h-6 w-6 text-red-600 dark:text-red-400" />
                  <span class="text-sm font-medium text-red-700 dark:text-red-300">{{ t('common.delete') }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
