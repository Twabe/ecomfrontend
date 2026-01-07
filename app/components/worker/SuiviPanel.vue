<template>
  <div>
    <!-- Stats Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <WorkerStatCard
        :label="$t('worker.toFollow')"
        :count="totalCount"
        color="blue"
        icon-type="pending"
      />
      <WorkerStatCard
        :label="$t('worker.needsDelivery')"
        :count="needsDeliveryCount"
        color="orange"
        icon-type="delivery"
      />
      <WorkerStatCard
        :label="$t('worker.delivered')"
        :count="deliveredTodayCount"
        color="green"
        icon-type="active"
      />
      <WorkerStatCard
        :label="$t('worker.issues')"
        :count="issuesCount"
        color="red"
        icon-type="error"
      />
    </div>

    <!-- Filters Section -->
    <div class="card mb-6">
      <div class="flex flex-wrap gap-3 items-end">
        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('common.search') }}
          </label>
          <input
            v-model="filters.keyword"
            type="text"
            :placeholder="$t('worker.searchOrderCodeOrCustomer')"
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            @keyup.enter="applyFilters"
          />
        </div>

        <!-- Confirmer Filter -->
        <div class="w-[180px]">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('worker.confirmer') }}
          </label>
          <select
            v-model="filters.confirmerId"
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option v-for="user in confirmers" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>

        <!-- Delivery Company Filter -->
        <div class="w-[180px]">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('worker.deliveryCompany') }}
          </label>
          <select
            v-model="filters.deliveryCompanyId"
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option value="none">{{ $t('worker.noDeliveryCompany') }}</option>
            <option v-for="dc in deliveryCompanies" :key="dc.id" :value="dc.id">
              {{ dc.name }}
            </option>
          </select>
        </div>

        <!-- Date Filter -->
        <div class="w-[150px]">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('common.dateFrom') }}
          </label>
          <input
            v-model="filters.confirmedFrom"
            type="date"
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div class="w-[150px]">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('common.dateTo') }}
          </label>
          <input
            v-model="filters.confirmedTo"
            type="date"
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <!-- Filter Actions -->
        <div class="flex gap-2">
          <button
            @click="applyFilters"
            class="btn-primary px-4 py-2 text-sm"
          >
            <FunnelIcon class="w-4 h-4 mr-1" />
            {{ $t('common.filter') }}
          </button>
          <button
            @click="resetFilters"
            class="btn-secondary px-4 py-2 text-sm"
          >
            <XMarkIcon class="w-4 h-4 mr-1" />
            {{ $t('common.reset') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <div
      v-if="selectedOrders.size > 0"
      class="mb-4 p-3 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg"
    >
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm font-medium text-primary-700 dark:text-primary-300">
          {{ selectedOrders.size }} {{ $t('common.selected') }}
        </span>
        <div class="flex-1"></div>
        <button
          @click="handleBulkMarkDelivered"
          :disabled="isBulkProcessing"
          class="btn-primary text-sm py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
        >
          <CheckCircleIcon class="w-4 h-4 mr-1" />
          {{ $t('worker.markAllDelivered') }}
        </button>
        <button
          @click="openBulkAssignDeliveryModal"
          :disabled="isBulkProcessing"
          class="btn-secondary text-sm py-1.5 px-3 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700 disabled:opacity-50"
        >
          <TruckIcon class="w-4 h-4 mr-1" />
          {{ $t('worker.assignAllDelivery') }}
        </button>
        <button
          @click="deselectAll"
          class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          :title="$t('common.cancel')"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Orders List -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <TruckIcon class="w-5 h-5 text-blue-500" />
          {{ $t('worker.ordersInTracking') }}
          <label v-if="orders.length > 0" class="ml-2 flex items-center gap-1.5 text-sm font-normal cursor-pointer">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="isAllSelected ? deselectAll() : selectAll()"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <span class="text-gray-500 dark:text-gray-400">{{ $t('common.selectAll') }}</span>
          </label>
        </h2>
        <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
          {{ totalCount }}
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="text-center py-8">
        <TruckIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('worker.noSuiviOrders') }}</p>
      </div>

      <!-- Orders Grid -->
      <div v-else class="space-y-3">
        <div
          v-for="order in orders"
          :key="order.orderId"
          class="p-4 border rounded-lg transition-colors"
          :class="isSelected(order.orderId)
            ? 'border-primary-400 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/30 ring-1 ring-primary-400 dark:ring-primary-600'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'"
        >
          <!-- Header Row: Checkbox + Code + Price + View -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                :checked="isSelected(order.orderId)"
                @change="toggleSelection(order.orderId)"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <span class="font-mono font-semibold text-primary-600 dark:text-primary-400">
                {{ order.orderCode }}
              </span>
              <span
                v-if="!order.deliveryCompanyId"
                class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 rounded-full"
              >
                <ExclamationTriangleIcon class="w-3 h-3" />
                {{ $t('worker.needsDelivery') }}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {{ formatCurrency(order.totalPrice) }}
              </span>
              <button
                @click="emit('view-order', order)"
                class="p-1.5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 bg-gray-100 dark:bg-gray-700 rounded"
                :title="$t('common.view')"
              >
                <EyeIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Customer Info Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <div class="flex items-center gap-2">
              <UserIcon class="w-4 h-4 text-gray-400" />
              <span class="font-medium text-gray-900 dark:text-white">{{ order.customerName }}</span>
            </div>
            <div class="flex items-center gap-2">
              <a
                :href="'tel:' + order.customerPhone"
                class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <PhoneIcon class="w-4 h-4" />
                {{ order.customerPhone }}
              </a>
            </div>
          </div>

          <!-- Location & Confirmer Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center gap-2">
              <MapPinIcon class="w-4 h-4" />
              <span>{{ order.cityName || '-' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <UserCircleIcon class="w-4 h-4" />
              <span>{{ $t('worker.confirmedBy') }}: {{ order.confirmerName || '-' }}</span>
              <span v-if="order.confirmedAt" class="text-xs text-gray-400">
                ({{ formatDate(order.confirmedAt) }})
              </span>
            </div>
          </div>

          <!-- Delivery Company Row -->
          <div v-if="order.deliveryCompanyName" class="flex items-center gap-2 mb-2 text-sm text-orange-600 dark:text-orange-400">
            <TruckIcon class="w-4 h-4" />
            <span>{{ order.deliveryCompanyName }}</span>
            <a
              v-if="order.deliveryCompanyPhone"
              :href="'tel:' + order.deliveryCompanyPhone"
              class="hover:underline"
            >
              {{ order.deliveryCompanyPhone }}
            </a>
          </div>

          <!-- Tracking State -->
          <div v-if="order.trackingStateName" class="mb-3">
            <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded">
              {{ order.trackingStateName }}
            </span>
          </div>

          <!-- Actions Row -->
          <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            <!-- Contact Actions -->
            <a
              :href="'tel:' + order.customerPhone"
              class="btn-secondary text-xs py-1.5 px-3"
            >
              <PhoneIcon class="w-3.5 h-3.5 mr-1" />
              {{ $t('worker.call') }}
            </a>
            <a
              :href="getWhatsAppLink(order.customerPhone)"
              target="_blank"
              class="btn-secondary text-xs py-1.5 px-3 text-green-600 dark:text-green-400"
            >
              <ChatBubbleLeftRightIcon class="w-3.5 h-3.5 mr-1" />
              WA
            </a>

            <div class="flex-1"></div>

            <!-- Action Buttons -->
            <button
              v-if="!order.deliveryCompanyId"
              @click="emit('assign-delivery', order)"
              class="btn-secondary text-xs py-1.5 px-3 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700"
            >
              <TruckIcon class="w-3.5 h-3.5 mr-1" />
              {{ $t('worker.assignDelivery') }}
            </button>
            <button
              @click="handleMarkDelivered(order)"
              class="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircleIcon class="w-3.5 h-3.5 mr-1" />
              {{ $t('worker.delivered') }}
            </button>
            <button
              @click="handleReturnToConfirmation(order)"
              class="btn-secondary text-xs py-1.5 px-3 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700"
            >
              <ArrowUturnLeftIcon class="w-3.5 h-3.5 mr-1" />
              {{ $t('worker.returnToConfirmation') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50"
        >
          <ChevronLeftIcon class="w-4 h-4 mr-1" />
          {{ $t('common.previous') }}
        </button>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('common.page') }} {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="currentPage >= totalPages"
          class="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50"
        >
          {{ $t('common.next') }}
          <ChevronRightIcon class="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>

    <!-- Bulk Assign Delivery Modal -->
    <OrdersBulkAssignDeliveryModal
      :show="showBulkAssignDeliveryModal"
      :order-count="selectedOrders.size"
      :delivery-companies="deliveryCompanies"
      :is-submitting="isBulkProcessing"
      @close="showBulkAssignDeliveryModal = false"
      @submit="handleBulkAssignDelivery"
    />

    <!-- Return to Confirmation Modal -->
    <BaseModal
      :show="showReturnModal"
      :title="$t('worker.returnToConfirmationTitle')"
      @close="showReturnModal = false"
    >
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('worker.returnToConfirmationMessage', { code: selectedOrderForReturn?.orderCode }) }}
        </p>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('common.reason') }} ({{ $t('common.optional') }})
          </label>
          <textarea
            v-model="returnReason"
            rows="3"
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            :placeholder="$t('worker.returnReasonPlaceholder')"
          ></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button
            @click="showReturnModal = false"
            class="btn-secondary px-4 py-2"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="confirmReturnToConfirmation"
            :disabled="isReturning"
            class="btn-primary px-4 py-2 bg-amber-600 hover:bg-amber-700"
          >
            <ArrowUturnLeftIcon class="w-4 h-4 mr-1" />
            {{ $t('worker.returnToConfirmation') }}
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import {
  TruckIcon,
  PhoneIcon,
  CheckCircleIcon,
  ArrowUturnLeftIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  XMarkIcon,
  FunnelIcon,
  UserIcon,
  UserCircleIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import {
  useOrdersWorkflowService,
  type SuiviOrderDto,
  type SearchSuiviOrdersRequest,
} from '~/services/orders/useOrdersService'
import { useOrderAssignmentsService } from '~/services'
import { deliveryCompaniesSearch } from '~/api/generated/endpoints/delivery-companies/delivery-companies'
import { usersGetList } from '~/api/generated/endpoints/users/users'
import type { DeliveryCompany } from '~/types/deliverycompany'

const emit = defineEmits<{
  (e: 'assign-delivery', order: SuiviOrderDto): void
  (e: 'view-order', order: SuiviOrderDto): void
}>()

const { t } = useI18n()
const notification = useNotification()

// Services
const ordersWorkflow = useOrdersWorkflowService()
const orderAssignmentsService = useOrderAssignmentsService()

// Filter state
const filters = reactive({
  keyword: '',
  confirmerId: '',
  deliveryCompanyId: '',
  confirmedFrom: '',
  confirmedTo: '',
})

// Pagination
const currentPage = ref(1)
const pageSize = ref(20)

// Build search params
const searchParams = computed<SearchSuiviOrdersRequest>(() => ({
  keyword: filters.keyword || undefined,
  confirmerId: filters.confirmerId || undefined,
  deliveryCompanyId: filters.deliveryCompanyId === 'none' ? undefined : (filters.deliveryCompanyId || undefined),
  needsDeliveryCompany: filters.deliveryCompanyId === 'none' ? true : undefined,
  confirmedFrom: filters.confirmedFrom || undefined,
  confirmedTo: filters.confirmedTo || undefined,
  pageNumber: currentPage.value,
  pageSize: pageSize.value,
}))

// Query
const { data: searchResult, isLoading, refetch } = ordersWorkflow.useSearchSuiviOrders(searchParams)

// Computed from query
const orders = computed(() => searchResult.value?.data ?? [])
const totalCount = computed(() => searchResult.value?.totalCount ?? 0)
const totalPages = computed(() => searchResult.value?.totalPages ?? 1)

// Stats - need separate calculation
const needsDeliveryCount = computed(() =>
  orders.value.filter(o => !o.deliveryCompanyId).length
)
const deliveredTodayCount = ref(0)
const issuesCount = ref(0)

// Selection state
const selectedOrders = ref<Set<string>>(new Set())
const isBulkProcessing = ref(false)

// Modal state
const showBulkAssignDeliveryModal = ref(false)
const showReturnModal = ref(false)
const selectedOrderForReturn = ref<SuiviOrderDto | null>(null)
const returnReason = ref('')
const isReturning = ref(false)

// Dropdown data
const deliveryCompanies = ref<DeliveryCompany[]>([])
const confirmers = ref<{ id: string; name: string }[]>([])

// Selection helpers
const isSelected = (id: string) => selectedOrders.value.has(id)

const toggleSelection = (id: string) => {
  const newSet = new Set(selectedOrders.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  selectedOrders.value = newSet
}

const selectAll = () => {
  selectedOrders.value = new Set(orders.value.map(o => o.orderId))
}

const deselectAll = () => {
  selectedOrders.value = new Set()
}

const isAllSelected = computed(() =>
  orders.value.length > 0 && selectedOrders.value.size === orders.value.length
)

// Format helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount)
}

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getWhatsAppLink = (phone: string) => {
  let formattedPhone = phone.replace(/\s/g, '').replace(/^0/, '212')
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = '+' + formattedPhone
  }
  return `https://wa.me/${formattedPhone}`
}

// Filter actions
const applyFilters = () => {
  currentPage.value = 1
  refetch()
}

const resetFilters = () => {
  filters.keyword = ''
  filters.confirmerId = ''
  filters.deliveryCompanyId = ''
  filters.confirmedFrom = ''
  filters.confirmedTo = ''
  currentPage.value = 1
  refetch()
}

// Pagination
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Actions
const handleMarkDelivered = async (order: SuiviOrderDto) => {
  try {
    await ordersWorkflow.markAsDelivered({
      orderIds: [order.orderId],
      codAmountCollected: order.totalPrice
    })
    refetch()
  } catch (error) {
    console.error('Mark delivered error:', error)
  }
}

const handleReturnToConfirmation = (order: SuiviOrderDto) => {
  selectedOrderForReturn.value = order
  returnReason.value = ''
  showReturnModal.value = true
}

const confirmReturnToConfirmation = async () => {
  if (!selectedOrderForReturn.value) return

  isReturning.value = true
  try {
    await ordersWorkflow.returnToConfirmation({
      orderId: selectedOrderForReturn.value.orderId,
      reason: returnReason.value || undefined
    })
    showReturnModal.value = false
    selectedOrderForReturn.value = null
    refetch()
  } catch (error) {
    console.error('Return to confirmation error:', error)
    notification.error(t('worker.returnToConfirmationError'))
  } finally {
    isReturning.value = false
  }
}

// Bulk actions
const handleBulkMarkDelivered = async () => {
  if (selectedOrders.value.size === 0) return

  isBulkProcessing.value = true
  try {
    const selectedOrdersList = orders.value.filter(o => selectedOrders.value.has(o.orderId))
    const totalCod = selectedOrdersList.reduce((sum, o) => sum + o.totalPrice, 0)

    await ordersWorkflow.markAsDelivered({
      orderIds: Array.from(selectedOrders.value),
      codAmountCollected: totalCod
    })
    deselectAll()
    refetch()
  } catch (error) {
    console.error('Bulk mark delivered error:', error)
  } finally {
    isBulkProcessing.value = false
  }
}

const openBulkAssignDeliveryModal = () => {
  showBulkAssignDeliveryModal.value = true
}

const handleBulkAssignDelivery = async (data: { deliveryCompanyId: string }) => {
  if (selectedOrders.value.size === 0) return

  isBulkProcessing.value = true
  try {
    await ordersWorkflow.bulkAssignDeliveryCompany({
      orderIds: Array.from(selectedOrders.value),
      deliveryCompanyId: data.deliveryCompanyId
    })
    deselectAll()
    refetch()
  } catch (error) {
    console.error('Bulk assign delivery error:', error)
  } finally {
    isBulkProcessing.value = false
    showBulkAssignDeliveryModal.value = false
  }
}

// Load dropdown data
const loadDropdownData = async () => {
  try {
    // Load delivery companies
    const dcResponse = await deliveryCompaniesSearch({ pageNumber: 1, pageSize: 100 })
    deliveryCompanies.value = (dcResponse.data || []) as unknown as DeliveryCompany[]

    // Load users (for confirmer filter)
    const usersResponse = await usersGetList()
    confirmers.value = (usersResponse || []).map((u: any) => ({
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName
    }))
  } catch (error) {
    console.error('Failed to load dropdown data:', error)
  }
}

// Stats query
const statsServiceType = ref('suivi')
const myStatsQuery = orderAssignmentsService.useMyStats(statsServiceType)
watch(() => myStatsQuery.data.value, (stats) => {
  if (stats) {
    deliveredTodayCount.value = stats.deliveredTodayCount ?? 0
    issuesCount.value = stats.issuesCount ?? 0
  }
}, { immediate: true })

onMounted(() => {
  loadDropdownData()
})

// Expose refresh method
defineExpose({
  refresh: () => {
    refetch()
    myStatsQuery.refetch()
  }
})
</script>
