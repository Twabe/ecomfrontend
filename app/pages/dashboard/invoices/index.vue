<script setup lang="ts">
import {
  DocumentTextIcon,
  LockClosedIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import {
  useInvoicesService,
  useDeliveryCompaniesService,
  useStoresService,
  type InvoiceDto,
  type InvoiceDetailsDto,
  type UpdateInvoiceRequest,
  type MarkInvoicePaidRequest
} from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Invoices.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Invoices service with all operations
const {
  items: invoices,
  pagination,
  isLoading,
  setPage,
  setKeyword,
  setFilters,
  update: updateInvoice,
  remove: deleteInvoice,
  getInvoiceDetails,
  validateInvoice,
  markInvoicePaid
} = useInvoicesService()

// Dropdown data from services (auto-fetch)
const { items: deliveryCompanies } = useDeliveryCompaniesService()
const { items: stores } = useStoresService()

// Search & Filters
const searchQuery = ref('')
const filters = ref({
  deliveryCompanyId: '',
  storeId: '',
  isValidated: '',
  isReceived: ''
})

// Modals
const showFormModal = ref(false)
const showViewModal = ref(false)
const showMarkPaidModal = ref(false)
const showDeleteModal = ref(false)

const selectedInvoice = ref<InvoiceDto | null>(null)
const invoiceDetails = ref<InvoiceDetailsDto | null>(null)

// Watch filters
watch([searchQuery, filters], () => {
  applyFilters()
}, { deep: true })

const applyFilters = () => {
  setFilters({
    deliveryCompanyId: filters.value.deliveryCompanyId || undefined,
    storeId: filters.value.storeId || undefined,
    isValidated: filters.value.isValidated === '' ? undefined : filters.value.isValidated === 'true',
    isReceived: filters.value.isReceived === '' ? undefined : filters.value.isReceived === 'true'
  })
  if (searchQuery.value) {
    setKeyword(searchQuery.value)
  }
}

// CRUD handlers
const openEditModal = (invoice: InvoiceDto) => {
  selectedInvoice.value = invoice
  showFormModal.value = true
}

const openViewModal = async (invoice: InvoiceDto) => {
  selectedInvoice.value = invoice
  try {
    invoiceDetails.value = await getInvoiceDetails(invoice.id!)
    showViewModal.value = true
  } catch (error: any) {
    invoiceDetails.value = null
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const openDeleteModal = (invoice: InvoiceDto) => {
  selectedInvoice.value = invoice
  showDeleteModal.value = true
}

const openMarkPaidModal = (invoice: InvoiceDto) => {
  selectedInvoice.value = invoice
  showMarkPaidModal.value = true
}

// Validate invoice
const handleValidate = async (invoice: InvoiceDto) => {
  try {
    await validateInvoice(invoice.id!)
    notify({ type: 'success', message: t('invoices.validateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleUpdate = async (id: string, data: UpdateInvoiceRequest) => {
  try {
    await updateInvoice(id, data)
    showFormModal.value = false
    selectedInvoice.value = null
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleDelete = async () => {
  if (!selectedInvoice.value) return
  try {
    await deleteInvoice(selectedInvoice.value.id!)
    showDeleteModal.value = false
    selectedInvoice.value = null
    notify({ type: 'success', message: t('messages.deleteSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Mark as paid
const handleMarkPaid = async (data: MarkInvoicePaidRequest) => {
  try {
    await markInvoicePaid(data)
    showMarkPaidModal.value = false
    selectedInvoice.value = null
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Pagination
const changePage = (page: number) => {
  setPage(page)
}

// Statistics computed from invoices
const stats = computed(() => {
  const total = invoices.value.length
  const open = invoices.value.filter(i => !i.isValidated).length
  const validated = invoices.value.filter(i => i.isValidated && !i.isReceived).length
  const received = invoices.value.filter(i => i.isReceived).length

  const totalAmount = invoices.value.reduce((sum, i) => sum + (i.totalPrice || 0), 0)
  const openAmount = invoices.value.filter(i => !i.isValidated).reduce((sum, i) => sum + (i.totalPrice || 0), 0)
  const pendingAmount = invoices.value.filter(i => i.isValidated && !i.isReceived).reduce((sum, i) => sum + (i.totalPrice || 0), 0)
  const receivedAmount = invoices.value.filter(i => i.isReceived).reduce((sum, i) => sum + (i.totalPrice || 0), 0)

  return {
    total,
    open,
    validated,
    received,
    totalAmount,
    openAmount,
    pendingAmount,
    receivedAmount
  }
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('invoices.title') }}
      </h1>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total Invoices -->
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
            <DocumentTextIcon class="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('invoices.stats.total') }}</p>
            <p class="text-xl font-semibold text-gray-900 dark:text-white">{{ stats.total }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatCurrency(stats.totalAmount) }}</p>
          </div>
        </div>
      </div>

      <!-- Open Invoices -->
      <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm dark:border-yellow-800 dark:bg-yellow-900/20">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-800/30">
            <ClockIcon class="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p class="text-sm text-yellow-700 dark:text-yellow-400">{{ t('invoices.stats.open') }}</p>
            <p class="text-xl font-semibold text-yellow-800 dark:text-yellow-300">{{ stats.open }}</p>
            <p class="text-xs text-yellow-600 dark:text-yellow-500">{{ formatCurrency(stats.openAmount) }}</p>
          </div>
        </div>
      </div>

      <!-- Validated (Pending Payment) -->
      <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-800 dark:bg-amber-900/20">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-amber-100 p-2 dark:bg-amber-800/30">
            <LockClosedIcon class="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-sm text-amber-700 dark:text-amber-400">{{ t('invoices.stats.pendingPayment') }}</p>
            <p class="text-xl font-semibold text-amber-800 dark:text-amber-300">{{ stats.validated }}</p>
            <p class="text-xs text-amber-600 dark:text-amber-500">{{ formatCurrency(stats.pendingAmount) }}</p>
          </div>
        </div>
      </div>

      <!-- Received (Paid) -->
      <div class="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm dark:border-green-800 dark:bg-green-900/20">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-green-100 p-2 dark:bg-green-800/30">
            <CheckCircleIcon class="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-sm text-green-700 dark:text-green-400">{{ t('invoices.stats.received') }}</p>
            <p class="text-xl font-semibold text-green-800 dark:text-green-300">{{ stats.received }}</p>
            <p class="text-xs text-green-600 dark:text-green-500">{{ formatCurrency(stats.receivedAmount) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <InvoicesInvoiceFilters
      v-model:search-query="searchQuery"
      v-model:filters="filters"
      :delivery-companies="deliveryCompanies"
      :stores="stores"
    />

    <!-- Table -->
    <InvoicesInvoiceTable
      :invoices="invoices"
      :is-loading="isLoading"
      :pagination="pagination"
      @view="openViewModal"
      @edit="openEditModal"
      @delete="openDeleteModal"
      @validate="handleValidate"
      @mark-paid="openMarkPaidModal"
      @page-change="changePage"
    />

    <!-- Modals -->
    <InvoicesInvoiceFormModal
      :show="showFormModal"
      :invoice="selectedInvoice"
      :delivery-companies="deliveryCompanies"
      :stores="stores"
      @close="showFormModal = false"
      @update="handleUpdate"
    />

    <InvoicesInvoiceViewModal
      :show="showViewModal"
      :invoice="invoiceDetails"
      @close="showViewModal = false"
    />

    <InvoicesInvoiceMarkPaidModal
      :show="showMarkPaidModal"
      :invoice="selectedInvoice"
      @close="showMarkPaidModal = false"
      @confirm="handleMarkPaid"
    />

    <InvoicesInvoiceDeleteModal
      :show="showDeleteModal"
      @close="showDeleteModal = false"
      @confirm="handleDelete"
    />
  </div>
</template>
