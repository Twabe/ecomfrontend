<template>
  <div>
    <!-- Details Modal -->
    <TransitionRoot :show="showDetailsModal" as="template">
      <Dialog as="div" class="relative z-50" @close="showDetailsModal = false">
        <TransitionChild
          enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-900/50" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
              leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <DocumentTextIcon class="w-6 h-6 text-primary-600" />
                  {{ $t('legalInvoices.details') }} - {{ selectedInvoice?.code }}
                </DialogTitle>

                <div v-if="selectedInvoice" class="space-y-6">
                  <!-- Company Info -->
                  <div class="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('legalInvoices.companyName') }}</span>
                      <p class="font-medium text-gray-900 dark:text-white">{{ selectedInvoice.companyName }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('legalInvoices.iceNumber') }}</span>
                      <p class="font-mono font-medium text-gray-900 dark:text-white">{{ selectedInvoice.iceNumber }}</p>
                    </div>
                    <div class="col-span-2">
                      <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('common.address') }}</span>
                      <p class="text-gray-900 dark:text-white">{{ selectedInvoice.address }}</p>
                    </div>
                  </div>

                  <!-- Summary -->
                  <div class="grid grid-cols-3 gap-4">
                    <div class="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <div class="text-2xl font-bold text-primary-600">{{ selectedInvoice.ordersCount }}</div>
                      <div class="text-sm text-gray-500">{{ $t('legalInvoices.ordersCount') }}</div>
                    </div>
                    <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div class="text-2xl font-bold text-green-600">{{ formatPrice(selectedInvoice.totalAmount || 0) }}</div>
                      <div class="text-sm text-gray-500">{{ $t('legalInvoices.totalAmount') }}</div>
                    </div>
                    <div class="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div class="text-2xl font-bold" :class="getStatusColor(selectedInvoice.status)">
                        {{ getStatusText(selectedInvoice.status) }}
                      </div>
                      <div class="text-sm text-gray-500">{{ $t('common.status') }}</div>
                    </div>
                  </div>

                  <!-- Items Table -->
                  <div v-if="selectedInvoice.items && selectedInvoice.items.length > 0">
                    <h4 class="font-medium text-gray-900 dark:text-white mb-3">{{ $t('legalInvoices.items') }}</h4>
                    <div class="overflow-x-auto border rounded-lg dark:border-gray-600">
                      <table class="min-w-full text-sm">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th class="px-4 py-2 text-left">{{ $t('orders.code') }}</th>
                            <th class="px-4 py-2 text-left">{{ $t('nav.products') }}</th>
                            <th class="px-4 py-2 text-right">{{ $t('legalInvoices.quantity') }}</th>
                            <th class="px-4 py-2 text-right">{{ $t('legalInvoices.unitPrice') }}</th>
                            <th class="px-4 py-2 text-right">{{ $t('common.total') }}</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                          <tr v-for="item in selectedInvoice.items" :key="item.id">
                            <td class="px-4 py-2 font-mono text-primary-600">{{ item.orderCode }}</td>
                            <td class="px-4 py-2">
                              <div>{{ item.productName }}</div>
                              <div v-if="item.variantName" class="text-xs text-gray-500">{{ item.variantName }}</div>
                            </td>
                            <td class="px-4 py-2 text-right">{{ item.quantity }}</td>
                            <td class="px-4 py-2 text-right">{{ formatPrice(item.unitPrice) }}</td>
                            <td class="px-4 py-2 text-right font-medium">{{ formatPrice(item.total) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div class="flex justify-end mt-6">
                  <button type="button" class="btn-secondary" @click="showDetailsModal = false">
                    {{ $t('common.close') }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Edit Modal -->
    <TransitionRoot :show="showEditModal" as="template">
      <Dialog as="div" class="relative z-50" @close="showEditModal = false">
        <TransitionChild
          enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-900/50" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
              leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ $t('common.edit') }} {{ $t('nav.legalInvoices') }}
                </DialogTitle>

                <form @submit.prevent="handleUpdate">
                  <div class="space-y-4">
                    <div>
                      <label class="label">{{ $t('legalInvoices.companyName') }}</label>
                      <input v-model="editForm.companyName" type="text" class="input" />
                    </div>
                    <div>
                      <label class="label">{{ $t('legalInvoices.iceNumber') }}</label>
                      <input v-model="editForm.iceNumber" type="text" class="input font-mono" maxlength="15" />
                      <p class="text-xs text-gray-500 mt-1">{{ $t('legalInvoices.iceHelp') }}</p>
                    </div>
                    <div>
                      <label class="label">{{ $t('common.address') }}</label>
                      <textarea v-model="editForm.address" class="input" rows="2"></textarea>
                    </div>
                  </div>

                  <div class="flex justify-end gap-3 mt-6">
                    <button type="button" class="btn-secondary" @click="showEditModal = false">
                      {{ $t('common.cancel') }}
                    </button>
                    <button type="submit" class="btn-primary" :disabled="isMutating">
                      {{ isMutating ? $t('common.loading') : $t('common.save') }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Manual Invoice Modal -->
    <LegalInvoicesLegalInvoiceManualModal
      :show="showManualModal"
      :products="products"
      @close="showManualModal = false"
      @success="handleManualSuccess"
    />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.legalInvoices') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.legalInvoices') }}</p>
      </div>
      <button @click="showManualModal = true" class="btn-primary inline-flex items-center gap-2">
        <PlusIcon class="w-5 h-5" />
        {{ $t('legalInvoices.createManual') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px] relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchKeyword"
            type="text"
            class="input pl-10"
            :placeholder="$t('common.search') + '...'"
            @input="debouncedSearch"
          />
        </div>
        <select v-model="statusFilter" class="input w-auto" @change="handleStatusFilter">
          <option value="">{{ $t('legalInvoices.allStatuses') }}</option>
          <option value="draft">{{ $t('legalInvoices.statusDraft') }}</option>
          <option value="finalized">{{ $t('legalInvoices.statusFinalized') }}</option>
          <option value="cancelled">{{ $t('legalInvoices.statusCancelled') }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-3 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="legalInvoices.length === 0" class="text-center py-12">
        <DocumentTextIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
        <p class="text-sm text-gray-400 mt-2">{{ $t('legalInvoices.createFromOrdersHint') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('legalInvoices.code') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('legalInvoices.companyName') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('legalInvoices.iceNumber') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('legalInvoices.ordersCount') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('legalInvoices.totalAmount') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.status') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.date') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in legalInvoices" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="font-mono font-semibold text-primary-600 dark:text-primary-400">{{ item.code }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="font-medium text-gray-900 dark:text-white">{{ item.companyName }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs font-mono bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                  {{ item.iceNumber }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="font-medium">{{ item.ordersCount || 0 }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="font-medium">{{ formatPrice(item.totalAmount || 0) }}</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusBadgeClass(item.status)"
                >
                  {{ getStatusText(item.status) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-600 dark:text-gray-400 text-sm">{{ formatDate(item.dateAdded) }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openDetailsModal(item)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.view')"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="item.status === 'draft'"
                    @click="openEditModal(item)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="item.status === 'draft'"
                    @click="handleFinalize(item)"
                    class="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                    :title="$t('legalInvoices.finalize')"
                  >
                    <CheckCircleIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="item.status !== 'cancelled'"
                    @click="handleCancel(item)"
                    class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    :title="$t('legalInvoices.cancel')"
                  >
                    <XCircleIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="item.status === 'draft'"
                    @click="handleDelete(item)"
                    class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    :title="$t('common.delete')"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Page {{ pagination.currentPage }} / {{ pagination.totalPages }}
        </p>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.currentPage - 1)"
            :disabled="!pagination.hasPreviousPage"
            class="btn-secondary text-sm px-3 py-1"
          >
            {{ $t('common.previous') }}
          </button>
          <button
            @click="changePage(pagination.currentPage + 1)"
            :disabled="!pagination.hasNextPage"
            class="btn-secondary text-sm px-3 py-1"
          >
            {{ $t('common.next') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import {
  useLegalInvoicesService,
  useLegalInvoicesFinalize,
  useLegalInvoicesCancel,
  useProductsService,
  type LegalInvoiceDto
} from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.LegalInvoices.View'
})

const { t } = useI18n()
const { notify } = useNotification()

const {
  items: legalInvoices,
  isLoading,
  isMutating,
  pagination,
  setPage,
  setKeyword,
  setFilters,
  update: updateLegalInvoice,
  remove: deleteLegalInvoice
} = useLegalInvoicesService()

const finalizeMutation = useLegalInvoicesFinalize()
const cancelMutation = useLegalInvoicesCancel()

// Products for manual modal
const { items: products } = useProductsService()

// Manual modal state
const showManualModal = ref(false)

const handleManualSuccess = (response: { legalInvoiceId: string; legalInvoiceCode: string }) => {
  showManualModal.value = false
}

// Format helpers
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(price)
}

const getStatusText = (status?: string) => {
  switch (status) {
    case 'draft': return t('legalInvoices.statusDraft')
    case 'finalized': return t('legalInvoices.statusFinalized')
    case 'cancelled': return t('legalInvoices.statusCancelled')
    default: return status || ''
  }
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'draft': return 'text-amber-600'
    case 'finalized': return 'text-green-600'
    case 'cancelled': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

const getStatusBadgeClass = (status?: string) => {
  switch (status) {
    case 'draft': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    case 'finalized': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

// Modal states
const showDetailsModal = ref(false)
const showEditModal = ref(false)
const selectedInvoice = ref<LegalInvoiceDto | null>(null)

const editForm = ref({
  companyName: '',
  iceNumber: '',
  address: ''
})

// Search and filter
const searchKeyword = ref('')
const statusFilter = ref('')

let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    setKeyword(searchKeyword.value)
  }, 300)
}

const handleStatusFilter = () => {
  setFilters({ status: statusFilter.value || undefined })
}

// Modal handlers
const openDetailsModal = (item: LegalInvoiceDto) => {
  selectedInvoice.value = item
  showDetailsModal.value = true
}

const openEditModal = (item: LegalInvoiceDto) => {
  selectedInvoice.value = item
  editForm.value = {
    companyName: item.companyName || '',
    iceNumber: item.iceNumber || '',
    address: item.address || ''
  }
  showEditModal.value = true
}

// Action handlers
const handleUpdate = async () => {
  if (!selectedInvoice.value) return

  try {
    await updateLegalInvoice(selectedInvoice.value.id!, {
      id: selectedInvoice.value.id!,
      companyName: editForm.value.companyName || undefined,
      iceNumber: editForm.value.iceNumber || undefined,
      address: editForm.value.address || undefined
    })
    notify({ type: 'success', message: t('messages.updateSuccess') })
    showEditModal.value = false
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleFinalize = async (item: LegalInvoiceDto) => {
  if (!confirm(t('legalInvoices.confirmFinalize'))) return

  try {
    await finalizeMutation.mutateAsync(item.id!)
    notify({ type: 'success', message: t('legalInvoices.finalizedSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleCancel = async (item: LegalInvoiceDto) => {
  if (!confirm(t('legalInvoices.confirmCancel'))) return

  try {
    await cancelMutation.mutateAsync({ id: item.id! })
    notify({ type: 'success', message: t('legalInvoices.cancelledSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleDelete = async (item: LegalInvoiceDto) => {
  if (!confirm(t('messages.confirmDelete'))) return

  try {
    await deleteLegalInvoice(item.id!)
    notify({ type: 'success', message: t('messages.deleteSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const changePage = (page: number) => {
  setPage(page)
}
</script>
