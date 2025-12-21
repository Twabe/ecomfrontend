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
                  {{ editingExpense ? $t('common.edit') : $t('common.create') }} {{ $t('nav.mediaBuyerExpenses') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <!-- Media Buyer -->
                  <div class="mb-4">
                    <label class="label">{{ $t('mediaBuyer.mediaBuyer') }} *</label>
                    <select v-model="form.mediaBuyerId" class="input" required>
                      <option value="">{{ $t('common.select') }}...</option>
                      <option v-for="user in users" :key="user.id" :value="user.id">
                        {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
                      </option>
                    </select>
                  </div>

                  <!-- Price -->
                  <div class="mb-4">
                    <label class="label">{{ $t('mediaBuyer.price') }} *</label>
                    <input
                      v-model.number="form.price"
                      type="number"
                      step="0.01"
                      min="0"
                      class="input"
                      required
                    />
                  </div>

                  <!-- Processed Price -->
                  <div class="mb-4">
                    <label class="label">{{ $t('mediaBuyer.processedPrice') }}</label>
                    <input
                      v-model.number="form.processedPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      class="input"
                    />
                  </div>

                  <!-- Description -->
                  <div class="mb-4">
                    <label class="label">{{ $t('common.description') }} *</label>
                    <textarea
                      v-model="form.description"
                      class="input"
                      rows="3"
                      required
                    ></textarea>
                  </div>

                  <!-- Attachments -->
                  <div class="mb-4">
                    <label class="label">{{ $t('mediaBuyer.attachments') }}</label>
                    <input
                      v-model="form.attachments"
                      type="text"
                      class="input"
                      :placeholder="$t('mediaBuyer.attachmentsPlaceholder')"
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.mediaBuyerExpenses') }}</h1>
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
        <select v-model="filterMediaBuyerId" class="input" @change="applyFilters">
          <option :value="null">{{ $t('mediaBuyer.allMediaBuyers') }}</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.firstName }} {{ user.lastName }}
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

      <div v-else-if="mediaBuyerExpenses.length === 0" class="text-center py-12">
        <CurrencyDollarIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('mediaBuyer.mediaBuyer') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('mediaBuyer.price') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('mediaBuyer.processedPrice') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.description') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.date') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in mediaBuyerExpenses" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="font-medium text-gray-900 dark:text-white">{{ getUserName(item.mediaBuyerId) }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="font-semibold text-red-600 dark:text-red-400">{{ formatCurrency(item.price) }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="font-semibold text-green-600 dark:text-green-400">{{ formatCurrency(item.processedPrice) }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-600 dark:text-gray-400 text-sm truncate max-w-xs block">{{ item.description }}</span>
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
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'
import {
  useMediaBuyerExpensesService,
  useUsersService,
  type MediaBuyerExpenseDto
} from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.MediaBuyerExpenses.View'
})

const { t } = useI18n()
const { notify } = useNotification()

const {
  items: mediaBuyerExpenses,
  isLoading,
  isMutating,
  pagination,
  setPage,
  setKeyword,
  setFilters,
  create: createMediaBuyerExpense,
  update: updateMediaBuyerExpense,
  remove: deleteMediaBuyerExpense
} = useMediaBuyerExpensesService()

// Get users for dropdown (auto-fetch)
const { users } = useUsersService()

// Format helpers
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount)
}

const getUserName = (userId: string) => {
  const user = users.value.find(u => u.id === userId)
  return user ? `${user.firstName} ${user.lastName}` : userId.substring(0, 8) + '...'
}

// Modal state
const showModal = ref(false)
const editingExpense = ref<MediaBuyerExpenseDto | null>(null)
const form = ref({
  mediaBuyerId: '',
  price: 0,
  processedPrice: 0,
  description: '',
  attachments: ''
})

// Search & Filters
const searchKeyword = ref('')
const filterMediaBuyerId = ref<string | null>(null)

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
    mediaBuyerId: filterMediaBuyerId.value || undefined
  })
  setKeyword(searchKeyword.value)
}

// Open create modal
const openCreateModal = () => {
  editingExpense.value = null
  form.value = {
    mediaBuyerId: '',
    price: 0,
    processedPrice: 0,
    description: '',
    attachments: ''
  }
  showModal.value = true
}

// Open edit modal
const openEditModal = (item: MediaBuyerExpenseDto) => {
  editingExpense.value = item
  form.value = {
    mediaBuyerId: item.mediaBuyerId,
    price: item.price,
    processedPrice: item.processedPrice,
    description: item.description,
    attachments: item.attachments || ''
  }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingExpense.value = null
  form.value = {
    mediaBuyerId: '',
    price: 0,
    processedPrice: 0,
    description: '',
    attachments: ''
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.mediaBuyerId || !form.value.description || form.value.price < 0) return

  try {
    if (editingExpense.value) {
      await updateMediaBuyerExpense(editingExpense.value.id!, {
        id: editingExpense.value.id!,
        mediaBuyerId: form.value.mediaBuyerId,
        price: form.value.price,
        processedPrice: form.value.processedPrice,
        description: form.value.description,
        attachments: form.value.attachments || undefined
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await createMediaBuyerExpense({
        mediaBuyerId: form.value.mediaBuyerId,
        price: form.value.price,
        processedPrice: form.value.processedPrice,
        description: form.value.description,
        attachments: form.value.attachments || undefined
      })
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle delete
const handleDelete = async (item: MediaBuyerExpenseDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await deleteMediaBuyerExpense(item.id!)
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
