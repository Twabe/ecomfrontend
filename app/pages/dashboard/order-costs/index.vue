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
                  {{ editingCost ? $t('common.edit') : $t('common.create') }} {{ $t('nav.orderCosts') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <!-- Order ID -->
                  <div class="mb-4">
                    <label class="label">{{ $t('orderCosts.orderId') }} *</label>
                    <input
                      v-model="form.orderId"
                      type="text"
                      class="input font-mono"
                      placeholder="00000000-0000-0000-0000-000000000000"
                      required
                    />
                  </div>

                  <!-- Cost Type -->
                  <div class="mb-4">
                    <label class="label">{{ $t('orderCosts.costType') }} *</label>
                    <select v-model="form.costType" class="input" required>
                      <option value="">{{ $t('common.select') }}...</option>
                      <option v-for="type in ORDER_COST_TYPES" :key="type.value" :value="type.value">
                        {{ type.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Amount -->
                  <div class="mb-4">
                    <label class="label">{{ $t('orderCosts.amount') }} *</label>
                    <input
                      v-model.number="form.amount"
                      type="number"
                      step="0.01"
                      min="0"
                      class="input"
                      required
                    />
                  </div>

                  <!-- Worker ID (optional) -->
                  <div class="mb-4">
                    <label class="label">{{ $t('orderCosts.worker') }}</label>
                    <select v-model="form.workerId" class="input">
                      <option :value="null">{{ $t('common.none') }}</option>
                      <option v-for="user in users" :key="user.id" :value="user.id">
                        {{ user.firstName }} {{ user.lastName }}
                      </option>
                    </select>
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.orderCosts') }}</h1>
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
        <select v-model="filterCostType" class="input" @change="applyFilters">
          <option :value="null">{{ $t('orderCosts.allTypes') }}</option>
          <option v-for="type in ORDER_COST_TYPES" :key="type.value" :value="type.value">
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

      <div v-else-if="orderCosts.length === 0" class="text-center py-12">
        <CurrencyDollarIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('orderCosts.orderId') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('orderCosts.costType') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('orderCosts.amount') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('orderCosts.worker') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.description') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in orderCosts" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="font-mono text-xs text-gray-600 dark:text-gray-400">{{ item.orderId.substring(0, 8) }}...</span>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
                  {{ getCostTypeLabel(item.costType) }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="font-semibold text-red-600 dark:text-red-400">{{ formatCurrency(item.amount) }}</span>
              </td>
              <td class="py-3 px-4">
                <span v-if="item.workerId" class="text-gray-600 dark:text-gray-400 text-sm">{{ getUserName(item.workerId) }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="py-3 px-4">
                <span v-if="item.description" class="text-gray-600 dark:text-gray-400 text-sm truncate max-w-xs block">{{ item.description }}</span>
                <span v-else class="text-gray-400">-</span>
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
  useOrderCostsService,
  useUsersService,
  type OrderCostDto
} from '~/services'
import { ORDER_COST_TYPES } from '~/types/ordercost'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.OrderCosts.View'
})

const { t } = useI18n()
const { notify } = useNotification()

const {
  items: orderCosts,
  isLoading,
  isMutating,
  pagination,
  setPage,
  setKeyword,
  setFilters,
  create: createOrderCost,
  update: updateOrderCost,
  remove: deleteOrderCost
} = useOrderCostsService()

// Get users for dropdown (auto-fetch)
const { users } = useUsersService()

// Format helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount)
}

const getCostTypeLabel = (costType: string) => {
  const found = ORDER_COST_TYPES.find(t => t.value === costType)
  return found ? found.label : costType
}

const getUserName = (userId: string) => {
  const user = users.value.find(u => u.id === userId)
  return user ? `${user.firstName} ${user.lastName}` : userId.substring(0, 8) + '...'
}

// Modal state
const showModal = ref(false)
const editingCost = ref<OrderCostDto | null>(null)
const form = ref({
  orderId: '',
  costType: '',
  amount: 0,
  workerId: null as string | null,
  description: ''
})

// Search & Filters
const searchKeyword = ref('')
const filterCostType = ref<string | null>(null)

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
    costType: filterCostType.value || undefined
  })
  setKeyword(searchKeyword.value)
}

// Open create modal
const openCreateModal = () => {
  editingCost.value = null
  form.value = {
    orderId: '',
    costType: '',
    amount: 0,
    workerId: null,
    description: ''
  }
  showModal.value = true
}

// Open edit modal
const openEditModal = (item: OrderCostDto) => {
  editingCost.value = item
  form.value = {
    orderId: item.orderId!,
    costType: item.costType!,
    amount: item.amount!,
    workerId: item.workerId || null,
    description: item.description || ''
  }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingCost.value = null
  form.value = {
    orderId: '',
    costType: '',
    amount: 0,
    workerId: null,
    description: ''
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.orderId || !form.value.costType || form.value.amount < 0) return

  try {
    if (editingCost.value) {
      await updateOrderCost(editingCost.value.id!, {
        id: editingCost.value.id!,
        orderId: form.value.orderId,
        costType: form.value.costType,
        amount: form.value.amount,
        workerId: form.value.workerId || undefined,
        description: form.value.description || undefined
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await createOrderCost({
        orderId: form.value.orderId,
        costType: form.value.costType,
        amount: form.value.amount,
        workerId: form.value.workerId || undefined,
        description: form.value.description || undefined
      })
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle delete
const handleDelete = async (item: OrderCostDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await deleteOrderCost(item.id!)
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
