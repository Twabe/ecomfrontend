<template>
  <div>
    <!-- Stats Row -->
    <div class="mb-4">
      <div class="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3 flex items-center gap-3">
        <InboxArrowDownIcon class="w-8 h-8 text-indigo-500" />
        <div>
          <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ totalCount }}</p>
          <p class="text-xs text-indigo-600/70 dark:text-indigo-400/70">{{ $t('worker.availableOrders') }}</p>
        </div>
      </div>
    </div>

    <!-- Available Orders Card -->
    <div class="card p-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <InboxArrowDownIcon class="w-4 h-4 text-indigo-500" />
          {{ $t('worker.availableForGrabbing') }}
        </h2>
        <button
          @click="refetch"
          class="p-1.5 text-gray-500 hover:text-primary-600 dark:text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          :disabled="isLoading"
        >
          <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': isLoading || isFetching }" />
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!orders || orders.length === 0" class="text-center py-8">
        <InboxIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('worker.noAvailableOrders') }}</p>
      </div>

      <!-- Compact Orders Table/List -->
      <div v-else class="space-y-2 max-h-[600px] overflow-y-auto">
        <div
          v-for="order in orders"
          :key="order.id"
          class="p-3 border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
        >
          <!-- Row 1: Code + Time + Price + View -->
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-2">
              <span class="font-mono font-semibold text-primary-600 dark:text-primary-400 text-sm">
                {{ order.code }}
              </span>
              <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <ClockIcon class="w-3 h-3" />
                {{ formatTimeAgo(order.createdOn) }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {{ formatCurrency(order.price) }}
              </span>
              <button
                @click.stop="emit('view-order', order)"
                class="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 bg-gray-100 dark:bg-gray-700 rounded"
                :title="$t('common.view')"
              >
                <EyeIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Row 2: Customer + Phone + City -->
          <div class="flex items-center justify-between gap-2">
            <p class="font-medium text-gray-900 dark:text-white text-sm truncate flex-1">
              {{ order.fullName }}
            </p>
            <div class="flex items-center gap-2 shrink-0 text-xs">
              <a
                :href="'tel:' + order.phone"
                class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                @click.stop
              >
                <PhoneIcon class="w-3 h-3" />
                {{ order.phone }}
              </a>
              <span class="text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <MapPinIcon class="w-3 h-3" />
                {{ order.cityName || '-' }}
              </span>
            </div>
          </div>

          <!-- Row 3: Products (if any) - compact -->
          <p v-if="order.items && order.items.length > 0" class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
            {{ order.items.map(i => `${i.productName} x${i.quantity}`).join(', ') }}
          </p>

          <!-- Grab Button - compact -->
          <div class="mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-800">
            <button
              @click="handleSelfAssign(order)"
              :disabled="isAssigning === order.id"
              class="w-full btn-primary py-1.5 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <template v-if="isAssigning === order.id">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </template>
              <template v-else>
                <HandRaisedIcon class="w-4 h-4" />
                {{ $t('worker.grabOrder') }}
              </template>
            </button>
          </div>
        </div>

        <!-- Compact Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between pt-3 border-t dark:border-gray-700">
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ currentPage }}/{{ totalPages }}
          </span>
          <div class="flex gap-1">
            <button
              @click="setPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="btn-secondary text-xs px-2 py-1"
            >
              {{ $t('common.previous') }}
            </button>
            <button
              @click="setPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="btn-secondary text-xs px-2 py-1"
            >
              {{ $t('common.next') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  InboxArrowDownIcon,
  InboxIcon,
  ArrowPathIcon,
  ClockIcon,
  PhoneIcon,
  MapPinIcon,
  HandRaisedIcon,
  EyeIcon,
} from '@heroicons/vue/24/outline'
import {
  useOrdersWorkflowService,
  useOrderAssignmentsService,
  type OrderDto,
} from '~/services'

const emit = defineEmits<{
  (e: 'assigned', order: OrderDto): void
  (e: 'error', error: { code: number; message: string }): void
  (e: 'view-order', order: OrderDto): void
}>()

const { t } = useI18n()
const { error: showError, success: showSuccess } = useNotification()

// Services
const ordersWorkflow = useOrdersWorkflowService()
const orderAssignmentsService = useOrderAssignmentsService()

// Query params
const queryParams = ref({
  pageNumber: 1,
  pageSize: 20,
})

// Query - available orders for grabbing
const availableQuery = ordersWorkflow.useAvailableForGrabbing(queryParams)

// Computed
const orders = computed(() => availableQuery.data.value?.data ?? [])
const totalCount = computed(() => availableQuery.data.value?.totalCount ?? 0)
const totalPages = computed(() => availableQuery.data.value?.totalPages ?? 1)
const currentPage = computed(() => queryParams.value.pageNumber)
const isLoading = computed(() => availableQuery.isLoading.value)
const isFetching = computed(() => availableQuery.isFetching.value)

// State
const isAssigning = ref<string | null>(null)

// Format helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
  }).format(amount)
}

const formatTimeAgo = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return t('worker.justNow')
  if (diffMins < 60) return t('worker.minutesAgo', { count: diffMins })
  if (diffHours < 24) return t('worker.hoursAgo', { count: diffHours })
  return t('worker.daysAgo', { count: diffDays })
}

// Actions
const setPage = (page: number) => {
  queryParams.value.pageNumber = page
}

const refetch = () => {
  availableQuery.refetch()
}

const handleSelfAssign = async (order: OrderDto) => {
  if (isAssigning.value) return

  isAssigning.value = order.id
  try {
    // Self-assign the order
    const result = await orderAssignmentsService.selfAssign({
      orderId: order.id,
      serviceType: 'confirmation',
    })

    // Auto-take the assignment immediately
    if (result.assignmentId) {
      await orderAssignmentsService.take(result.assignmentId)
    }

    showSuccess(t('worker.orderGrabbed', { code: order.code }))
    emit('assigned', order)

    // Refresh the list
    await refetch()
  } catch (err: any) {
    // Handle conflict (409) - order already taken
    if (err?.response?.status === 409) {
      showError(t('worker.orderAlreadyTaken'))
      emit('error', { code: 409, message: 'Order already taken' })
      // Refresh to remove the order from list
      await refetch()
    } else if (err?.response?.status === 400) {
      showError(t('worker.capacityReached'))
      emit('error', { code: 400, message: 'Capacity reached' })
    } else {
      showError(t('common.error'))
      emit('error', { code: 500, message: err?.message || 'Unknown error' })
    }
  } finally {
    isAssigning.value = null
  }
}

// Expose refresh method
defineExpose({
  refresh: refetch,
})
</script>
