<template>
  <div>
    <!-- Create/Edit Modal -->
    <TransitionRoot :show="showModal" as="template">
      <Dialog as="div" class="relative z-50" @close="closeModal">
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
                  {{ editingInvoice ? $t('common.edit') : $t('common.create') }} {{ $t('nav.legalInvoices') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <!-- Invoice Code -->
                  <div class="mb-4">
                    <label class="label">{{ $t('legalInvoices.code') }} *</label>
                    <input
                      v-model="form.code"
                      type="text"
                      class="input"
                      required
                    />
                  </div>

                  <!-- Company Name -->
                  <div class="mb-4">
                    <label class="label">{{ $t('legalInvoices.companyName') }} *</label>
                    <input
                      v-model="form.companyName"
                      type="text"
                      class="input"
                      required
                    />
                  </div>

                  <!-- ICE Number -->
                  <div class="mb-4">
                    <label class="label">{{ $t('legalInvoices.iceNumber') }} *</label>
                    <input
                      v-model="form.iceNumber"
                      type="text"
                      class="input"
                      placeholder="000000000000000"
                      required
                    />
                    <p class="text-xs text-gray-500 mt-1">{{ $t('legalInvoices.iceHelp') }}</p>
                  </div>

                  <!-- Address -->
                  <div class="mb-4">
                    <label class="label">{{ $t('common.address') }} *</label>
                    <textarea
                      v-model="form.address"
                      class="input"
                      rows="2"
                      required
                    ></textarea>
                  </div>

                  <!-- Products -->
                  <div class="mb-4">
                    <label class="label">{{ $t('nav.products') }}</label>
                    <input
                      v-model="form.products"
                      type="text"
                      class="input"
                      :placeholder="$t('legalInvoices.productsPlaceholder')"
                    />
                  </div>

                  <!-- Quantities -->
                  <div class="mb-4">
                    <label class="label">{{ $t('legalInvoices.quantities') }}</label>
                    <input
                      v-model="form.quantities"
                      type="text"
                      class="input"
                      placeholder="1, 2, 3"
                    />
                  </div>

                  <!-- Prices -->
                  <div class="mb-4">
                    <label class="label">{{ $t('legalInvoices.prices') }}</label>
                    <input
                      v-model="form.prices"
                      type="text"
                      class="input"
                      placeholder="100, 200, 300"
                    />
                  </div>

                  <div class="flex justify-end gap-3">
                    <button type="button" class="btn-secondary" @click="closeModal">
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

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.legalInvoices') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.legalInvoices') }}</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        {{ $t('common.create') }}
      </button>
    </div>

    <!-- Search -->
    <div class="card mb-6">
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchKeyword"
          type="text"
          class="input pl-10"
          :placeholder="$t('common.search') + '...'"
          @input="debouncedSearch"
        />
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
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('legalInvoices.code') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('legalInvoices.companyName') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('legalInvoices.iceNumber') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.address') }}</th>
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
              <td class="py-3 px-4">
                <span class="text-gray-600 dark:text-gray-400 text-sm truncate max-w-xs block">{{ item.address }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-600 dark:text-gray-400 text-sm">{{ formatDate(item.dateAdded) }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(item)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
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
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import {
  useLegalInvoicesService,
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
  create: createLegalInvoice,
  update: updateLegalInvoice,
  remove: deleteLegalInvoice
} = useLegalInvoicesService()

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Modal state
const showModal = ref(false)
const editingInvoice = ref<LegalInvoiceDto | null>(null)
const form = ref({
  code: '',
  companyName: '',
  iceNumber: '',
  address: '',
  products: '',
  quantities: '',
  prices: ''
})

// Search
const searchKeyword = ref('')

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    setKeyword(searchKeyword.value)
  }, 300)
}

// Open create modal
const openCreateModal = () => {
  editingInvoice.value = null
  form.value = {
    code: '',
    companyName: '',
    iceNumber: '',
    address: '',
    products: '',
    quantities: '',
    prices: ''
  }
  showModal.value = true
}

// Open edit modal
const openEditModal = (item: LegalInvoiceDto) => {
  editingInvoice.value = item
  form.value = {
    code: item.code!,
    companyName: item.companyName!,
    iceNumber: item.iceNumber!,
    address: item.address!,
    products: item.products || '',
    quantities: item.quantities || '',
    prices: item.prices || ''
  }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingInvoice.value = null
  form.value = {
    code: '',
    companyName: '',
    iceNumber: '',
    address: '',
    products: '',
    quantities: '',
    prices: ''
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.code || !form.value.companyName || !form.value.iceNumber || !form.value.address) return

  try {
    if (editingInvoice.value) {
      await updateLegalInvoice(editingInvoice.value.id!, {
        id: editingInvoice.value.id!,
        code: form.value.code,
        companyName: form.value.companyName,
        iceNumber: form.value.iceNumber,
        address: form.value.address,
        products: form.value.products || undefined,
        quantities: form.value.quantities || undefined,
        prices: form.value.prices || undefined
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await createLegalInvoice({
        code: form.value.code,
        companyName: form.value.companyName,
        iceNumber: form.value.iceNumber,
        address: form.value.address,
        products: form.value.products || undefined,
        quantities: form.value.quantities || undefined,
        prices: form.value.prices || undefined
      })
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle delete
const handleDelete = async (item: LegalInvoiceDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await deleteLegalInvoice(item.id!)
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}

// Change page
const changePage = (page: number) => {
  setPage(page)
}
</script>
