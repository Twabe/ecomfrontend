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
                  {{ editingFee ? $t('common.edit') : $t('common.create') }} {{ $t('nav.orderFees') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <!-- Order ID -->
                  <div class="mb-4">
                    <label class="label">{{ $t('orderFees.orderId') }} *</label>
                    <input
                      v-model="form.orderId"
                      type="text"
                      class="input font-mono"
                      placeholder="00000000-0000-0000-0000-000000000000"
                      required
                    />
                  </div>

                  <!-- Fee Type -->
                  <div class="mb-4">
                    <label class="label">{{ $t('orderFees.feeType') }} *</label>
                    <select v-model="form.feeType" class="input" required>
                      <option value="">{{ $t('common.select') }}...</option>
                      <option v-for="type in ORDER_FEE_TYPES" :key="type.value" :value="type.value">
                        {{ type.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Amount -->
                  <div class="mb-4">
                    <label class="label">{{ $t('orderFees.amount') }} *</label>
                    <input
                      v-model.number="form.amount"
                      type="number"
                      step="0.01"
                      min="0"
                      class="input"
                      required
                    />
                  </div>

                  <!-- Description -->
                  <div class="mb-4">
                    <label class="label">{{ $t('common.description') }}</label>
                    <textarea
                      v-model="form.description"
                      class="input"
                      rows="2"
                    ></textarea>
                  </div>

                  <!-- Is Included In Price -->
                  <div class="mb-4">
                    <label class="flex items-center gap-3 cursor-pointer">
                      <input
                        v-model="form.isIncludedInPrice"
                        type="checkbox"
                        class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span class="text-gray-700 dark:text-gray-300">{{ $t('orderFees.isIncludedInPrice') }}</span>
                    </label>
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.orderFees') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('common.records') }}</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        {{ $t('common.create') }}
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <select v-model="filterFeeType" class="input" @change="applyFilters">
          <option :value="null">{{ $t('orderFees.allTypes') }}</option>
          <option v-for="type in ORDER_FEE_TYPES" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-3 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="orderFees.length === 0" class="text-center py-12">
        <CurrencyDollarIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('orderFees.orderId') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('orderFees.feeType') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('orderFees.amount') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.description') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('orderFees.included') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in orderFees" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="font-mono text-xs text-gray-600 dark:text-gray-400">{{ item.orderId.substring(0, 8) }}...</span>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                  {{ getFeeTypeLabel(item.feeType) }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(item.amount) }}</span>
              </td>
              <td class="py-3 px-4">
                <span v-if="item.description" class="text-gray-600 dark:text-gray-400 text-sm truncate max-w-xs block">{{ item.description }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded',
                    item.isIncludedInPrice
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  ]"
                >
                  {{ item.isIncludedInPrice ? $t('common.yes') : $t('common.no') }}
                </span>
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
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'
import {
  useOrderFeesService,
  type OrderFeeDto
} from '~/services'
import { ORDER_FEE_TYPES } from '~/types/orderfee'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.OrderFees.View'
})

const { t } = useI18n()
const { notify } = useNotification()

const {
  items: orderFees,
  isLoading,
  isMutating,
  pagination,
  setPage,
  setKeyword,
  setFilters,
  create: createOrderFee,
  update: updateOrderFee,
  remove: deleteOrderFee
} = useOrderFeesService()

// Format helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount)
}

const getFeeTypeLabel = (feeType: string) => {
  const found = ORDER_FEE_TYPES.find(t => t.value === feeType)
  return found ? found.label : feeType
}

// Modal state
const showModal = ref(false)
const editingFee = ref<OrderFeeDto | null>(null)
const form = ref({
  orderId: '',
  feeType: '',
  amount: 0,
  description: '',
  isIncludedInPrice: false
})

// Search & Filters
const searchKeyword = ref('')
const filterFeeType = ref<string | null>(null)

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 300)
}

// Apply filters
const applyFilters = () => {
  setFilters({
    feeType: filterFeeType.value || undefined
  })
  setKeyword(searchKeyword.value)
}

// Open create modal
const openCreateModal = () => {
  editingFee.value = null
  form.value = {
    orderId: '',
    feeType: '',
    amount: 0,
    description: '',
    isIncludedInPrice: false
  }
  showModal.value = true
}

// Open edit modal
const openEditModal = (item: OrderFeeDto) => {
  editingFee.value = item
  form.value = {
    orderId: item.orderId!,
    feeType: item.feeType!,
    amount: item.amount!,
    description: item.description || '',
    isIncludedInPrice: item.isIncludedInPrice!
  }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingFee.value = null
  form.value = {
    orderId: '',
    feeType: '',
    amount: 0,
    description: '',
    isIncludedInPrice: false
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.orderId || !form.value.feeType || form.value.amount < 0) return

  try {
    if (editingFee.value) {
      await updateOrderFee(editingFee.value.id!, {
        id: editingFee.value.id!,
        orderId: form.value.orderId,
        feeType: form.value.feeType,
        amount: form.value.amount,
        description: form.value.description || undefined,
        isIncludedInPrice: form.value.isIncludedInPrice
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await createOrderFee({
        orderId: form.value.orderId,
        feeType: form.value.feeType,
        amount: form.value.amount,
        description: form.value.description || undefined,
        isIncludedInPrice: form.value.isIncludedInPrice
      })
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle delete
const handleDelete = async (item: OrderFeeDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await deleteOrderFee(item.id!)
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
