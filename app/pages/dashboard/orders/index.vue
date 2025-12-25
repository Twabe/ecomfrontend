<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import {
  useOrdersService,
  useOrdersWorkflowService,
  useCitiesService,
  useProductsService,
  useDeliveryCompaniesService,
  useSubDeliveryCompaniesService,
  useSourcesService,
  useStoresService,
  useReasonsService,
  useOrderAssignmentsService,
  useAutoAssignmentSettingsService,
  useUsersService,
  useDashboardService,
  type OrderDto,
  type CreateOrderRequest,
  type UpdateOrderRequest,
  type ConfirmOrderRequest,
  type CancelOrderRequest
} from '~/services'
import { OrderPhase, OrderState } from '~/constants/order'
import type { DateRange, DatePreset } from '~/utils/date'
import { getDateRangeFromPreset, formatDateForApi, parseDateFromString } from '~/utils/date'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Orders.View'
})

const { t } = useI18n()
const route = useRoute()
const { notify } = useNotification()

// Orders service - basic CRUD from entity service
const {
  items: orders,
  pagination,
  isLoading,
  setPage,
  setKeyword,
  setFilters,
  create: createOrder,
  update: updateOrder,
  remove: deleteOrder,
} = useOrdersService()

// Workflow service - workflow actions like confirm, cancel, etc.
const {
  confirmOrder,
  cancelOrder,
  markAsDelivered,
  markAsReturned,
  getOrder,
  bulkAssignDeliveryCompany,
  archiveOrders,
  unarchiveOrders
} = useOrdersWorkflowService()

// Assignment service for worker assignments
const orderAssignmentsService = useOrderAssignmentsService()

// Auto-assignment settings to check if quality is enabled
const { settings: autoAssignmentSettings } = useAutoAssignmentSettingsService()
const isQualityEnabled = computed(() => autoAssignmentSettings.value?.enableQualityCheck ?? false)

// Users service for workers dropdown
const { users: workers } = useUsersService()

// Dropdown data from services (auto-fetch)
const { items: cities } = useCitiesService()
const { items: products } = useProductsService()
const { items: deliveryCompanies } = useDeliveryCompaniesService()
const { items: subDeliveryCompanies } = useSubDeliveryCompaniesService()
const { items: sources } = useSourcesService()
const { items: stores } = useStoresService()
const { items: reasons } = useReasonsService()

// Search & Filters - Initialize from URL query params
// Default: isArchived = false (show only non-archived orders)
const searchQuery = ref('')
const filters = ref({
  phase: (route.query.phase as string) || '',
  state: (route.query.state as string) || '',
  trackingState: (route.query.trackingState as string) || '',
  cityId: (route.query.cityId as string) || '',
  deliveryCompanyId: (route.query.deliveryCompanyId as string) || '',
  storeId: (route.query.storeId as string) || '',
  sourceId: (route.query.sourceId as string) || '',
  isArchived: route.query.isArchived === 'true' ? true : route.query.isArchived === 'false' ? false : false as boolean | null
})

// Date range filter - Initialize from URL or default to this month
const datePreset = ref<DatePreset>((route.query.datePreset as DatePreset) || 'this_month')
const initDateRange = (): DateRange => {
  const fromStr = route.query.createdFrom as string | undefined
  const toStr = route.query.createdTo as string | undefined
  if (fromStr || toStr) {
    return {
      from: parseDateFromString(fromStr),
      to: parseDateFromString(toStr)
    }
  }
  return getDateRangeFromPreset('this_month')
}
const dateRange = ref<DateRange>(initDateRange())

// Dashboard stats service with date range
const dashboardParams = computed(() => ({
  startDate: formatDateForApi(dateRange.value.from),
  endDate: formatDateForApi(dateRange.value.to)
}))
const { overview: stats, isLoadingOverview: isStatsLoading } = useDashboardService(dashboardParams)

// Check if showing all orders (no filters) - show full stats
const showFullStats = computed(() => {
  return !route.query.phase && !route.query.state && !route.query.trackingState
})

// Current filter label for filtered pages
const currentFilterLabel = computed(() => {
  if (route.query.phase === 'new') return t('stats.new')
  if (route.query.phase === 'confirmation') return t('stats.confirmation')
  if (route.query.phase === 'shipping') {
    if (route.query.trackingState === 'in_progress') return t('stats.inDelivery')
    if (route.query.trackingState === 'no_answer') return t('orders.noAnswer')
    return t('stats.readyToShip')
  }
  if (route.query.state === 'delivered') return t('stats.delivered')
  if (route.query.state === 'returned') return t('stats.returned')
  if (route.query.state === 'cancelled') return t('stats.cancelled')
  return t('orders.title')
})

// Helper to get amount from dashboard stats by state
const getAmountByState = (state: string): number => {
  const stateData = stats.value?.ordersByState?.find(
    s => s.state?.toLowerCase() === state.toLowerCase()
  )
  return stateData?.totalAmount ?? 0
}

// Current filter stats for filtered pages
const currentFilterStats = computed(() => {
  if (showFullStats.value) return undefined

  // For state-based filters, use dashboard stats (accurate total)
  const stateFilter = route.query.state as string | undefined
  if (stateFilter) {
    return {
      label: currentFilterLabel.value,
      count: pagination.value?.totalCount ?? 0,
      amount: getAmountByState(stateFilter)
    }
  }

  // For phase-based filters, calculate from visible orders (current page only)
  const visibleAmount = orders.value.reduce((sum, order) => {
    return sum + (order.price ?? 0) + (order.fees ?? 0)
  }, 0)

  return {
    label: currentFilterLabel.value,
    count: pagination.value?.totalCount ?? 0,
    amount: visibleAmount
  }
})

// Selection for bulk actions
const selectedOrders = ref<string[]>([])

// Modals
const showFormModal = ref(false)
const showConfirmModal = ref(false)
const showCancelModal = ref(false)
const showDeliveredModal = ref(false)
const showReturnedModal = ref(false)
const showDeleteModal = ref(false)
const showViewModal = ref(false)
const showItemsModal = ref(false)
const showHistoryModal = ref(false)
const showAssignDeliveryModal = ref(false)
const showAssignWorkerModal = ref(false)
const showBulkConfirmModal = ref(false)
const showBulkCancelModal = ref(false)

const selectedOrder = ref<OrderDto | null>(null)
const selectedOrderForHistory = ref<{ id: string; code: string } | null>(null)
const isEditMode = ref(false)

// Check if selected order can have its items edited (not confirmed or delivered)
// Backend business rule: Cannot modify items of confirmed or delivered orders
const canEditOrderItems = computed(() => {
  if (!selectedOrder.value) return true // Default to true for create mode
  const state = selectedOrder.value.state?.toLowerCase()
  return state !== OrderState.Confirmed && state !== OrderState.Delivered
})

// Watch for route query changes (when user clicks sidebar links)
watch(() => route.query, (newQuery) => {
  filters.value = {
    phase: (newQuery.phase as string) || '',
    state: (newQuery.state as string) || '',
    trackingState: (newQuery.trackingState as string) || '',
    cityId: (newQuery.cityId as string) || '',
    deliveryCompanyId: (newQuery.deliveryCompanyId as string) || '',
    storeId: (newQuery.storeId as string) || '',
    sourceId: (newQuery.sourceId as string) || '',
    // Default to false (non-archived) unless explicitly set to true or null in URL
    isArchived: newQuery.isArchived === 'true' ? true : newQuery.isArchived === 'null' ? null : false
  }
  applyFilters()
}, { deep: true })

// Watch filters
watch([searchQuery, filters], () => {
  applyFilters()
}, { deep: true })

// Apply filters on initial mount (for URL query params like ?state=returned)
onMounted(() => {
  applyFilters()
})

// Hide phase/status filters when entering from sidebar links
const hidePhaseStatusFilters = computed(() => {
  return !!(route.query.phase || route.query.state || route.query.trackingState)
})

// Check if we're in shipping phase (for bulk action buttons)
const isShippingPhase = computed(() => {
  return route.query.phase === OrderPhase.Shipping
})

// Check if we're in confirmation phase (for bulk confirm/cancel buttons)
const isConfirmationPhase = computed(() => {
  return route.query.phase === OrderPhase.New || route.query.phase === OrderPhase.Confirmation
})

const applyFilters = () => {
  setFilters({
    phase: filters.value.phase || undefined,
    state: filters.value.state || undefined,
    trackingState: filters.value.trackingState || undefined,
    cityId: filters.value.cityId || undefined,
    deliveryCompanyId: filters.value.deliveryCompanyId || undefined,
    storeId: filters.value.storeId || undefined,
    sourceId: filters.value.sourceId || undefined,
    isArchived: filters.value.isArchived ?? undefined,
    // Date range filters
    createdFrom: formatDateForApi(dateRange.value.from),
    createdTo: formatDateForApi(dateRange.value.to)
  })
  if (searchQuery.value) {
    setKeyword(searchQuery.value)
  }
}

// Update URL when date range changes
const router = useRouter()
const updateUrlWithDateFilter = () => {
  const query: Record<string, string | undefined> = { ...route.query }
  query.createdFrom = dateRange.value.from ? dateRange.value.from.toISOString() : undefined
  query.createdTo = dateRange.value.to ? dateRange.value.to.toISOString() : undefined
  query.datePreset = datePreset.value !== 'custom' ? datePreset.value : undefined
  router.replace({ query })
}

// Watch date range changes
watch(dateRange, () => {
  applyFilters()
  updateUrlWithDateFilter()
}, { deep: true })

// CRUD handlers
const openCreateModal = () => {
  selectedOrder.value = null
  isEditMode.value = false
  showFormModal.value = true
}

const openEditModal = (order: OrderDto) => {
  selectedOrder.value = order
  isEditMode.value = true
  showFormModal.value = true
}

const openViewModal = (order: OrderDto) => {
  selectedOrder.value = order
  showViewModal.value = true
}

const openDeleteModal = (order: OrderDto) => {
  selectedOrder.value = order
  showDeleteModal.value = true
}

const handleCreate = async (data: CreateOrderRequest) => {
  try {
    await createOrder(data)
    showFormModal.value = false
    notify({ type: 'success', message: t('messages.createSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleUpdate = async (id: string, data: UpdateOrderRequest) => {
  try {
    await updateOrder(id, data)
    showFormModal.value = false
    selectedOrder.value = null
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleDelete = async () => {
  if (!selectedOrder.value) return
  try {
    await deleteOrder(selectedOrder.value.id!)
    showDeleteModal.value = false
    selectedOrder.value = null
    notify({ type: 'success', message: t('messages.deleteSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Workflow handlers
const openConfirmModal = (order: OrderDto) => {
  selectedOrder.value = order
  showConfirmModal.value = true
}

const handleConfirm = async (data: ConfirmOrderRequest) => {
  try {
    await confirmOrder(data)
    showConfirmModal.value = false
    selectedOrder.value = null
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const openCancelModal = (order: OrderDto) => {
  selectedOrder.value = order
  showCancelModal.value = true
}

const handleCancel = async (data: CancelOrderRequest) => {
  try {
    await cancelOrder(data)
    showCancelModal.value = false
    selectedOrder.value = null
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Bulk actions
const openDeliveredModal = () => {
  if (selectedOrders.value.length === 0) return
  showDeliveredModal.value = true
}

const handleMarkDelivered = async () => {
  try {
    await markAsDelivered({ orderIds: selectedOrders.value })
    showDeliveredModal.value = false
    selectedOrders.value = []
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const openReturnedModal = () => {
  if (selectedOrders.value.length === 0) return
  showReturnedModal.value = true
}

const handleMarkReturned = async (data: { reasonId: string; customReason: string; comment?: string }) => {
  try {
    await markAsReturned({
      orderIds: selectedOrders.value,
      reasonId: data.reasonId || undefined,
      customReason: data.customReason || undefined,
      comment: data.comment || undefined
    })
    showReturnedModal.value = false
    selectedOrders.value = []
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Selection handler
const handleSelectionChange = (orderIds: string[]) => {
  selectedOrders.value = orderIds
}

// Items management
const openItemsModal = (order: OrderDto) => {
  selectedOrder.value = order
  showItemsModal.value = true
}

// History modal
const openHistoryModal = (order: OrderDto) => {
  selectedOrderForHistory.value = { id: order.id!, code: order.code! }
  showHistoryModal.value = true
}

// Handle manage items from OrderFormModal (Edit mode)
const handleManageItemsFromForm = () => {
  showFormModal.value = false
  showItemsModal.value = true
}

const refreshSelectedOrder = async () => {
  if (!selectedOrder.value) return
  try {
    const updatedOrder = await getOrder(selectedOrder.value.id!)
    selectedOrder.value = updatedOrder
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleItemAdded = async (_itemId: string) => {
  await refreshSelectedOrder()
}

const handleItemUpdated = async (_itemId: string) => {
  await refreshSelectedOrder()
}

const handleItemRemoved = async (_itemId: string) => {
  await refreshSelectedOrder()
}

// Store orders for assignment modals (for both single and bulk)
const ordersForAssignment = ref<OrderDto[]>([])

// Assign Delivery Company handlers
const openAssignDeliveryModal = (orderOrOrders?: OrderDto | OrderDto[]) => {
  if (orderOrOrders) {
    // Single order from row action
    ordersForAssignment.value = Array.isArray(orderOrOrders) ? orderOrOrders : [orderOrOrders]
  } else {
    // Bulk from toolbar - use selected orders
    ordersForAssignment.value = orders.value.filter(o => selectedOrders.value.includes(o.id!))
  }
  if (ordersForAssignment.value.length === 0) return
  showAssignDeliveryModal.value = true
}

const handleAssignDelivery = async (data: { orderIds: string[]; deliveryCompanyId: string; subDeliveryCompanyId?: string }) => {
  try {
    await bulkAssignDeliveryCompany({
      orderIds: data.orderIds,
      deliveryCompanyId: data.deliveryCompanyId,
      subDeliveryCompanyId: data.subDeliveryCompanyId
    })
    showAssignDeliveryModal.value = false
    ordersForAssignment.value = []
    selectedOrders.value = []
    notify({ type: 'success', message: t('orders.deliveryAssigned') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Assign Worker handlers
const openAssignWorkerModal = (orderOrOrders?: OrderDto | OrderDto[]) => {
  if (orderOrOrders) {
    // Single order from row action
    ordersForAssignment.value = Array.isArray(orderOrOrders) ? orderOrOrders : [orderOrOrders]
  } else {
    // Bulk from toolbar - use selected orders
    ordersForAssignment.value = orders.value.filter(o => selectedOrders.value.includes(o.id!))
  }
  if (ordersForAssignment.value.length === 0) return
  showAssignWorkerModal.value = true
}

const handleAssignWorker = async (data: {
  orderIds: string[]
  workerId?: string
  serviceTypes: string[]
  individualAssignments?: Record<string, string>
  notes?: string
}) => {
  try {
    if (data.individualAssignments && Object.keys(data.individualAssignments).length > 0) {
      // Individual mode: make separate calls for each service type
      for (const [serviceType, workerId] of Object.entries(data.individualAssignments)) {
        await orderAssignmentsService.bulkAssign({
          orderIds: data.orderIds,
          workerId,
          serviceTypes: [serviceType],
          notes: data.notes,
          allowReassignment: true
        })
      }
    } else if (data.workerId) {
      // Chain mode: single call with all service types
      await orderAssignmentsService.bulkAssign({
        orderIds: data.orderIds,
        workerId: data.workerId,
        serviceTypes: data.serviceTypes,
        notes: data.notes,
        allowReassignment: true
      })
    }
    showAssignWorkerModal.value = false
    ordersForAssignment.value = []
    selectedOrders.value = []
    notify({ type: 'success', message: t('orders.workerAssigned') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Pagination
const changePage = (page: number) => {
  setPage(page)
}

// Archive handlers (single order)
const handleArchive = async (order: OrderDto) => {
  try {
    await archiveOrders({ orderIds: [order.id!] })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleUnarchive = async (order: OrderDto) => {
  try {
    await unarchiveOrders({ orderIds: [order.id!] })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Bulk archive handlers
const handleBulkArchive = async () => {
  if (selectedOrders.value.length === 0) return
  try {
    await archiveOrders({ orderIds: selectedOrders.value })
    selectedOrders.value = []
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleBulkUnarchive = async () => {
  if (selectedOrders.value.length === 0) return
  try {
    await unarchiveOrders({ orderIds: selectedOrders.value })
    selectedOrders.value = []
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Bulk confirm/cancel handlers
const openBulkConfirmModal = () => {
  if (selectedOrders.value.length === 0) return
  showBulkConfirmModal.value = true
}

const openBulkCancelModal = () => {
  if (selectedOrders.value.length === 0) return
  showBulkCancelModal.value = true
}

const handleBulkConfirm = async (data: ConfirmOrderRequest) => {
  if (selectedOrders.value.length === 0) return

  let successCount = 0
  let failCount = 0

  for (const orderId of selectedOrders.value) {
    try {
      await confirmOrder({
        ...data,
        orderId
      })
      successCount++
    } catch (error: any) {
      failCount++
      console.error(`Failed to confirm order ${orderId}:`, error)
    }
  }

  showBulkConfirmModal.value = false
  selectedOrders.value = []

  if (successCount > 0) {
    notify({ type: 'success', message: `${successCount} ${t('orders.ordersConfirmed')}` })
  }
  if (failCount > 0) {
    notify({ type: 'error', message: `${failCount} ${t('orders.ordersFailed')}` })
  }
}

const handleBulkCancel = async (data: CancelOrderRequest) => {
  if (selectedOrders.value.length === 0) return

  let successCount = 0
  let failCount = 0

  for (const orderId of selectedOrders.value) {
    try {
      await cancelOrder({
        ...data,
        orderId
      })
      successCount++
    } catch (error: any) {
      failCount++
      console.error(`Failed to cancel order ${orderId}:`, error)
    }
  }

  showBulkCancelModal.value = false
  selectedOrders.value = []

  if (successCount > 0) {
    notify({ type: 'success', message: `${successCount} ${t('orders.ordersCancelled')}` })
  }
  if (failCount > 0) {
    notify({ type: 'error', message: `${failCount} ${t('orders.ordersFailed')}` })
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('orders.title') }}
      </h1>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        @click="openCreateModal"
      >
        <PlusIcon class="h-5 w-5" />
        {{ t('orders.createOrder') }}
      </button>
    </div>

    <!-- Filters with Date Range -->
    <OrdersOrderFilters
      v-model:search-query="searchQuery"
      v-model:filters="filters"
      v-model:date-range="dateRange"
      v-model:date-preset="datePreset"
      :cities="cities"
      :delivery-companies="deliveryCompanies"
      :stores="stores"
      :sources="sources"
      :hide-phase-status="hidePhaseStatusFilters"
      :show-date-filter="true"
    />

    <!-- Statistics Cards -->
    <OrdersOrderStatisticsCards
      :stats="stats"
      :is-loading="isStatsLoading"
      :show-full-stats="showFullStats"
      :current-filter="currentFilterStats"
    />

    <!-- Bulk Actions -->
    <OrdersOrderBulkActions
      :selected-count="selectedOrders.length"
      :is-shipping-phase="isShippingPhase"
      :is-confirmation-phase="isConfirmationPhase"
      :is-archived-filter="filters.isArchived"
      @assign-delivery="openAssignDeliveryModal()"
      @assign-worker="openAssignWorkerModal()"
      @mark-delivered="openDeliveredModal"
      @mark-returned="openReturnedModal"
      @archive="handleBulkArchive"
      @unarchive="handleBulkUnarchive"
      @bulk-confirm="openBulkConfirmModal"
      @bulk-cancel="openBulkCancelModal"
    />

    <!-- Table -->
    <OrdersOrderTable
      :orders="orders"
      :is-loading="isLoading"
      :pagination="pagination"
      @view="openViewModal"
      @edit="openEditModal"
      @edit-items="openItemsModal"
      @delete="openDeleteModal"
      @confirm="openConfirmModal"
      @cancel="openCancelModal"
      @history="openHistoryModal"
      @assign-delivery="openAssignDeliveryModal"
      @assign-worker="openAssignWorkerModal"
      @archive="handleArchive"
      @unarchive="handleUnarchive"
      @selection-change="handleSelectionChange"
      @page-change="changePage"
    />

    <!-- Modals -->
    <OrdersOrderFormModal
      :show="showFormModal"
      :order="isEditMode ? selectedOrder : null"
      :cities="cities"
      :products="products"
      :delivery-companies="deliveryCompanies"
      :can-edit-items="canEditOrderItems"
      @close="showFormModal = false"
      @create="handleCreate"
      @update="handleUpdate"
      @manage-items="handleManageItemsFromForm"
    />

    <OrdersOrderConfirmModal
      :show="showConfirmModal"
      :order="selectedOrder"
      :delivery-companies="deliveryCompanies"
      :sub-delivery-companies="subDeliveryCompanies"
      @close="showConfirmModal = false"
      @confirm="handleConfirm"
    />

    <OrdersOrderCancelModal
      :show="showCancelModal"
      :order="selectedOrder"
      :reasons="reasons"
      @close="showCancelModal = false"
      @cancel="handleCancel"
    />

    <OrdersOrderDeliveredModal
      :show="showDeliveredModal"
      :selected-count="selectedOrders.length"
      @close="showDeliveredModal = false"
      @confirm="handleMarkDelivered"
    />

    <OrdersOrderReturnedModal
      :show="showReturnedModal"
      :reasons="reasons"
      @close="showReturnedModal = false"
      @confirm="handleMarkReturned"
    />

    <OrdersOrderViewModal
      :show="showViewModal"
      :order="selectedOrder"
      @close="showViewModal = false"
    />

    <OrdersOrderDeleteModal
      :show="showDeleteModal"
      @close="showDeleteModal = false"
      @confirm="handleDelete"
    />

    <OrdersOrderItemsModal
      :show="showItemsModal"
      :order="selectedOrder"
      :products="products"
      @close="showItemsModal = false"
      @item-added="handleItemAdded"
      @item-updated="handleItemUpdated"
      @item-removed="handleItemRemoved"
    />

    <OrdersOrderHistoryModal
      :show="showHistoryModal"
      :order-id="selectedOrderForHistory?.id || null"
      :order-code="selectedOrderForHistory?.code || null"
      @close="showHistoryModal = false"
    />

    <OrdersOrderAssignDeliveryModal
      :show="showAssignDeliveryModal"
      :orders="ordersForAssignment"
      :delivery-companies="deliveryCompanies"
      :sub-delivery-companies="subDeliveryCompanies"
      @close="showAssignDeliveryModal = false"
      @confirm="handleAssignDelivery"
    />

    <OrdersOrderAssignWorkerModal
      :show="showAssignWorkerModal"
      :orders="ordersForAssignment"
      :workers="workers"
      :is-quality-enabled="isQualityEnabled"
      @close="showAssignWorkerModal = false"
      @confirm="handleAssignWorker"
    />

    <!-- Bulk Confirm Modal -->
    <OrdersOrderBulkConfirmModal
      :show="showBulkConfirmModal"
      :selected-count="selectedOrders.length"
      :delivery-companies="deliveryCompanies"
      :sub-delivery-companies="subDeliveryCompanies"
      @close="showBulkConfirmModal = false"
      @confirm="handleBulkConfirm"
    />

    <!-- Bulk Cancel Modal -->
    <OrdersOrderBulkCancelModal
      :show="showBulkCancelModal"
      :selected-count="selectedOrders.length"
      :reasons="reasons"
      @close="showBulkCancelModal = false"
      @cancel="handleBulkCancel"
    />
  </div>
</template>
