<script setup lang="ts">
import { PlusIcon, DocumentPlusIcon } from '@heroicons/vue/24/outline'
import {
  useInvoicesService,
  useOrdersService,
  useDeliveryCompaniesService,
  useStoresService,
  type InvoiceDto,
  type InvoiceDetailsDto,
  type CreateInvoiceRequest,
  type UpdateInvoiceRequest,
  type GenerateInvoiceRequest,
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
  isMutating,
  setPage,
  setKeyword,
  setFilters,
  create: createInvoice,
  update: updateInvoice,
  remove: deleteInvoice,
  getInvoiceDetails,
  generateInvoice,
  markInvoicePaid
} = useInvoicesService()

// Dropdown data from services (auto-fetch)
const { items: deliveryCompanies } = useDeliveryCompaniesService()
const { items: stores } = useStoresService()

// Orders service for generate modal (needs manual control)
const {
  items: availableOrders,
  isLoading: isLoadingOrders,
  setFilters: setOrderFilters
} = useOrdersService()

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
const showGenerateModal = ref(false)
const showMarkPaidModal = ref(false)
const showDeleteModal = ref(false)

const selectedInvoice = ref<InvoiceDto | null>(null)
const invoiceDetails = ref<InvoiceDetailsDto | null>(null)
const isEditMode = ref(false)

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
const openCreateModal = () => {
  selectedInvoice.value = null
  isEditMode.value = false
  showFormModal.value = true
}

const openEditModal = (invoice: InvoiceDto) => {
  selectedInvoice.value = invoice
  isEditMode.value = true
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

const handleCreate = async (data: CreateInvoiceRequest) => {
  try {
    await createInvoice(data)
    showFormModal.value = false
    notify({ type: 'success', message: t('messages.createSuccess') })
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

// Generate invoice from orders
const openGenerateModal = async () => {
  showGenerateModal.value = true
  // Load delivered orders that are not yet invoiced
  setOrderFilters({
    state: 'delivered',
    isInvoiced: false
  })
}

const handleSearchOrdersForGenerate = async (params: { deliveryCompanyId?: string; storeId?: string }) => {
  setOrderFilters({
    state: 'delivered',
    isInvoiced: false,
    deliveryCompanyId: params.deliveryCompanyId,
    storeId: params.storeId
  })
}

const handleGenerate = async (data: GenerateInvoiceRequest) => {
  try {
    await generateInvoice(data)
    showGenerateModal.value = false
    notify({ type: 'success', message: t('messages.createSuccess') })
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
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('invoices.title') }}
      </h1>
      <div class="flex gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-primary-600 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400"
          @click="openGenerateModal"
        >
          <DocumentPlusIcon class="h-5 w-5" />
          {{ t('invoices.generateFromOrders') }}
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          @click="openCreateModal"
        >
          <PlusIcon class="h-5 w-5" />
          {{ t('invoices.createInvoice') }}
        </button>
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
      @mark-paid="openMarkPaidModal"
      @page-change="changePage"
    />

    <!-- Modals -->
    <InvoicesInvoiceFormModal
      :show="showFormModal"
      :invoice="isEditMode ? selectedInvoice : null"
      :delivery-companies="deliveryCompanies"
      :stores="stores"
      @close="showFormModal = false"
      @create="handleCreate"
      @update="handleUpdate"
    />

    <InvoicesInvoiceViewModal
      :show="showViewModal"
      :invoice="invoiceDetails"
      @close="showViewModal = false"
    />

    <InvoicesInvoiceGenerateModal
      :show="showGenerateModal"
      :delivery-companies="deliveryCompanies"
      :stores="stores"
      :available-orders="availableOrders"
      :is-loading-orders="isLoadingOrders"
      @close="showGenerateModal = false"
      @generate="handleGenerate"
      @search-orders="handleSearchOrdersForGenerate"
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
