<script setup lang="ts">
import { PlusIcon, DocumentPlusIcon } from '@heroicons/vue/24/outline'
import { OrderState } from '~/constants/order'
import {
  useDeliveryNotesService,
  useOrdersService,
  useDeliveryCompaniesService,
  useSubDeliveryCompaniesService,
  type DeliveryNoteDto,
  type DeliveryNoteDetailsDto,
  type CreateDeliveryNoteRequest,
  type UpdateDeliveryNoteRequest,
  type CreateDeliveryNoteWithOrdersRequest
} from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.DeliveryNotes.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Delivery notes service with all operations
const {
  items: deliveryNotes,
  pagination,
  isLoading,
  isMutating,
  setPage,
  setKeyword,
  setFilters,
  create: createDeliveryNote,
  update: updateDeliveryNote,
  remove: deleteDeliveryNote,
  getDeliveryNoteDetails,
  createDeliveryNoteWithOrders,
  addOrdersToDeliveryNote,
  removeOrdersFromDeliveryNote
} = useDeliveryNotesService()

// Dropdown data from services (auto-fetch)
const { items: deliveryCompanies } = useDeliveryCompaniesService()
const { items: subDeliveryCompanies } = useSubDeliveryCompaniesService()

// Orders service for orders modal (needs manual control)
const {
  items: availableOrders,
  isLoading: isLoadingOrders,
  setFilters: setOrderFilters
} = useOrdersService()

// Search & Filters
const searchQuery = ref('')
const filters = ref({
  deliveryCompanyId: '',
  subDeliveryCompanyId: ''
})

// Modals
const showFormModal = ref(false)
const showViewModal = ref(false)
const showOrdersModal = ref(false)
const showDeleteModal = ref(false)

const selectedNote = ref<DeliveryNoteDto | null>(null)
const noteDetails = ref<DeliveryNoteDetailsDto | null>(null)
const isEditMode = ref(false)
const ordersModalMode = ref<'create' | 'add'>('create')

// Watch filters
watch([searchQuery, filters], () => {
  applyFilters()
}, { deep: true })

const applyFilters = () => {
  setFilters({
    deliveryCompanyId: filters.value.deliveryCompanyId || undefined,
    subDeliveryCompanyId: filters.value.subDeliveryCompanyId || undefined
  })
  if (searchQuery.value) {
    setKeyword(searchQuery.value)
  }
}

// CRUD handlers
const openCreateModal = () => {
  selectedNote.value = null
  isEditMode.value = false
  showFormModal.value = true
}

const openEditModal = (note: DeliveryNoteDto) => {
  selectedNote.value = note
  isEditMode.value = true
  showFormModal.value = true
}

const openViewModal = async (note: DeliveryNoteDto) => {
  selectedNote.value = note
  try {
    noteDetails.value = await getDeliveryNoteDetails(note.id!)
    showViewModal.value = true
  } catch (error: any) {
    noteDetails.value = null
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const openDeleteModal = (note: DeliveryNoteDto) => {
  selectedNote.value = note
  showDeleteModal.value = true
}

const handleCreate = async (data: CreateDeliveryNoteRequest) => {
  try {
    await createDeliveryNote(data)
    showFormModal.value = false
    notify({ type: 'success', message: t('messages.createSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleUpdate = async (id: string, data: UpdateDeliveryNoteRequest) => {
  try {
    await updateDeliveryNote(id, data)
    showFormModal.value = false
    selectedNote.value = null
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleDelete = async () => {
  if (!selectedNote.value) return
  try {
    await deleteDeliveryNote(selectedNote.value.id!)
    showDeleteModal.value = false
    selectedNote.value = null
    notify({ type: 'success', message: t('messages.deleteSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Create with orders
const openCreateWithOrdersModal = async () => {
  ordersModalMode.value = 'create'
  showOrdersModal.value = true
  // Load confirmed orders that are not yet in a delivery note
  setOrderFilters({
    state: OrderState.Confirmed
  })
}

// Add orders to existing note
const openAddOrdersModal = async (note: DeliveryNoteDto) => {
  selectedNote.value = note
  ordersModalMode.value = 'add'
  showOrdersModal.value = true
  setOrderFilters({
    state: OrderState.Confirmed
  })
}

const handleSearchOrdersForModal = async (params: { deliveryCompanyId?: string; subDeliveryCompanyId?: string }) => {
  setOrderFilters({
    state: OrderState.Confirmed,
    deliveryCompanyId: params.deliveryCompanyId
  })
}

const handleCreateWithOrders = async (data: CreateDeliveryNoteWithOrdersRequest) => {
  try {
    await createDeliveryNoteWithOrders(data)
    showOrdersModal.value = false
    notify({ type: 'success', message: t('messages.createSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleAddOrders = async (orderIds: string[]) => {
  if (!selectedNote.value) return
  try {
    await addOrdersToDeliveryNote({
      deliveryNoteId: selectedNote.value.id!,
      orderIds
    })
    showOrdersModal.value = false
    selectedNote.value = null
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleRemoveOrders = async (orderIds: string[]) => {
  if (!noteDetails.value) return
  try {
    await removeOrdersFromDeliveryNote({
      deliveryNoteId: noteDetails.value.id!,
      orderIds
    })
    // Refresh the details
    noteDetails.value = await getDeliveryNoteDetails(noteDetails.value.id!)
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
        {{ t('deliveryNotes.title') }}
      </h1>
      <div class="flex gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-primary-600 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400"
          @click="openCreateWithOrdersModal"
        >
          <DocumentPlusIcon class="h-5 w-5" />
          {{ t('deliveryNotes.createWithOrders') }}
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          @click="openCreateModal"
        >
          <PlusIcon class="h-5 w-5" />
          {{ t('deliveryNotes.createNote') }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <DeliveryNotesDeliveryNoteFilters
      v-model:search-query="searchQuery"
      v-model:filters="filters"
      :delivery-companies="deliveryCompanies"
      :sub-delivery-companies="subDeliveryCompanies"
    />

    <!-- Table -->
    <DeliveryNotesDeliveryNoteTable
      :delivery-notes="deliveryNotes"
      :is-loading="isLoading"
      :pagination="pagination"
      @view="openViewModal"
      @edit="openEditModal"
      @delete="openDeleteModal"
      @add-orders="openAddOrdersModal"
      @page-change="changePage"
    />

    <!-- Modals -->
    <DeliveryNotesDeliveryNoteFormModal
      :show="showFormModal"
      :delivery-note="isEditMode ? selectedNote : null"
      :delivery-companies="deliveryCompanies"
      :sub-delivery-companies="subDeliveryCompanies"
      @close="showFormModal = false"
      @create="handleCreate"
      @update="handleUpdate"
    />

    <DeliveryNotesDeliveryNoteViewModal
      :show="showViewModal"
      :delivery-note="noteDetails"
      @close="showViewModal = false"
      @remove-orders="handleRemoveOrders"
    />

    <DeliveryNotesDeliveryNoteOrdersModal
      :show="showOrdersModal"
      :delivery-companies="deliveryCompanies"
      :sub-delivery-companies="subDeliveryCompanies"
      :available-orders="availableOrders"
      :is-loading-orders="isLoadingOrders"
      :mode="ordersModalMode"
      :delivery-note-id="selectedNote?.id"
      @close="showOrdersModal = false"
      @create-with-orders="handleCreateWithOrders"
      @add-orders="handleAddOrders"
      @search-orders="handleSearchOrdersForModal"
    />

    <DeliveryNotesDeliveryNoteDeleteModal
      :show="showDeleteModal"
      @close="showDeleteModal = false"
      @confirm="handleDelete"
    />
  </div>
</template>
