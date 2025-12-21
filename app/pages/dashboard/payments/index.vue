<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import {
  usePaymentsService,
  useDeliveryCompaniesService,
  type PaymentDto,
  type PaymentDetailsDto,
  type CreatePaymentRequest,
  type UpdatePaymentRequest,
  type AllocatePaymentRequest,
  type UnallocatedOrderDto,
  type CompanyBalanceSummaryDto
} from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Payments.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Payments service with all operations
const {
  items: payments,
  pagination,
  isLoading,
  isMutating,
  setPage,
  setKeyword,
  setFilters,
  create: createPayment,
  update: updatePayment,
  remove: deletePayment,
  getPaymentDetails,
  allocatePayment,
  deallocatePayment,
  getUnallocatedOrders,
  getCompanyBalanceSummary
} = usePaymentsService()

// Dropdown data from services (auto-fetch)
const { items: deliveryCompanies } = useDeliveryCompaniesService()

// Search & Filters
const searchQuery = ref('')
const filters = ref({
  deliveryCompanyId: '',
  paymentMethod: ''
})

// Modals
const showFormModal = ref(false)
const showViewModal = ref(false)
const showAllocateModal = ref(false)
const showDeleteModal = ref(false)

const selectedPayment = ref<PaymentDto | null>(null)
const paymentDetails = ref<PaymentDetailsDto | null>(null)
const isEditMode = ref(false)

// Unallocated orders and balance
const unallocatedOrders = ref<UnallocatedOrderDto[]>([])
const isLoadingUnallocated = ref(false)
const companyBalances = ref<CompanyBalanceSummaryDto[]>([])
const isLoadingBalances = ref(false)

// Load company balances on mount
onMounted(async () => {
  await loadCompanyBalances()
})

// Watch filters
watch([searchQuery, filters], () => {
  applyFilters()
}, { deep: true })

const applyFilters = () => {
  setFilters({
    deliveryCompanyId: filters.value.deliveryCompanyId || undefined,
    paymentMethod: filters.value.paymentMethod || undefined
  })
  if (searchQuery.value) {
    setKeyword(searchQuery.value)
  }
}

const loadCompanyBalances = async () => {
  isLoadingBalances.value = true
  try {
    companyBalances.value = await getCompanyBalanceSummary()
  } catch (error: any) {
    companyBalances.value = []
  } finally {
    isLoadingBalances.value = false
  }
}

// CRUD handlers
const openCreateModal = () => {
  selectedPayment.value = null
  isEditMode.value = false
  showFormModal.value = true
}

const openEditModal = (payment: PaymentDto) => {
  selectedPayment.value = payment
  isEditMode.value = true
  showFormModal.value = true
}

const openViewModal = async (payment: PaymentDto) => {
  selectedPayment.value = payment
  try {
    paymentDetails.value = await getPaymentDetails(payment.id!)
    showViewModal.value = true
  } catch (error: any) {
    paymentDetails.value = null
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const openDeleteModal = (payment: PaymentDto) => {
  selectedPayment.value = payment
  showDeleteModal.value = true
}

const handleCreate = async (data: CreatePaymentRequest) => {
  try {
    await createPayment(data)
    showFormModal.value = false
    await loadCompanyBalances()
    notify({ type: 'success', message: t('messages.createSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleUpdate = async (id: string, data: UpdatePaymentRequest) => {
  try {
    await updatePayment(id, data)
    showFormModal.value = false
    selectedPayment.value = null
    await loadCompanyBalances()
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleDelete = async () => {
  if (!selectedPayment.value) return
  try {
    await deletePayment(selectedPayment.value.id!)
    showDeleteModal.value = false
    selectedPayment.value = null
    await loadCompanyBalances()
    notify({ type: 'success', message: t('messages.deleteSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Allocation handlers
const openAllocateModal = async (payment: PaymentDto) => {
  selectedPayment.value = payment
  showAllocateModal.value = true
  isLoadingUnallocated.value = true
  try {
    // deliveryCompanyId is required - fetch unallocated orders for this company
    const response = await getUnallocatedOrders({
      deliveryCompanyId: payment.deliveryCompanyId!,
      pageSize: 100 // Load more orders for allocation
    })
    unallocatedOrders.value = response.data
  } catch (error: any) {
    unallocatedOrders.value = []
  } finally {
    isLoadingUnallocated.value = false
  }
}

const handleAllocate = async (data: AllocatePaymentRequest) => {
  try {
    await allocatePayment(data)
    showAllocateModal.value = false
    selectedPayment.value = null
    await loadCompanyBalances()
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleDeallocate = async (allocationIds: string[]) => {
  if (!paymentDetails.value) return
  try {
    await deallocatePayment({
      paymentId: paymentDetails.value.id!,
      allocationIds
    })
    // Refresh the details
    paymentDetails.value = await getPaymentDetails(paymentDetails.value.id!)
    await loadCompanyBalances()
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Pagination
const changePage = (page: number) => {
  setPage(page)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('payments.title') }}
      </h1>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        @click="openCreateModal"
      >
        <PlusIcon class="h-5 w-5" />
        {{ t('payments.createPayment') }}
      </button>
    </div>

    <!-- Balance Summary -->
    <PaymentsPaymentBalanceSummary
      :balances="companyBalances"
      :is-loading="isLoadingBalances"
    />

    <!-- Filters -->
    <PaymentsPaymentFilters
      v-model:search-query="searchQuery"
      v-model:filters="filters"
      :delivery-companies="deliveryCompanies"
    />

    <!-- Table -->
    <PaymentsPaymentTable
      :payments="payments"
      :is-loading="isLoading"
      :pagination="pagination"
      @view="openViewModal"
      @edit="openEditModal"
      @delete="openDeleteModal"
      @allocate="openAllocateModal"
      @page-change="changePage"
    />

    <!-- Modals -->
    <PaymentsPaymentFormModal
      :show="showFormModal"
      :payment="isEditMode ? selectedPayment : null"
      :delivery-companies="deliveryCompanies"
      @close="showFormModal = false"
      @create="handleCreate"
      @update="handleUpdate"
    />

    <PaymentsPaymentViewModal
      :show="showViewModal"
      :payment="paymentDetails"
      @close="showViewModal = false"
      @deallocate="handleDeallocate"
    />

    <PaymentsPaymentAllocateModal
      :show="showAllocateModal"
      :payment="selectedPayment"
      :unallocated-orders="unallocatedOrders"
      :is-loading-orders="isLoadingUnallocated"
      @close="showAllocateModal = false"
      @allocate="handleAllocate"
    />

    <PaymentsPaymentDeleteModal
      :show="showDeleteModal"
      @close="showDeleteModal = false"
      @confirm="handleDelete"
    />
  </div>
</template>
