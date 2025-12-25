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
                  {{ editingExpense ? $t('common.edit') : $t('common.create') }} {{ $t('nav.expenses') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <!-- Expense Type -->
                  <div class="mb-4">
                    <label class="label">{{ $t('nav.expenseTypes') }} *</label>
                    <select v-model="form.expenseTypeId" class="input" required>
                      <option value="">{{ $t('common.select') }}...</option>
                      <option v-for="type in expenseTypesList" :key="type.id" :value="type.id">
                        {{ type.title }}
                      </option>
                    </select>
                  </div>

                  <!-- Cost -->
                  <div class="mb-4">
                    <label class="label">{{ $t('common.cost') }} *</label>
                    <input
                      v-model.number="form.cost"
                      type="number"
                      step="0.01"
                      min="0.01"
                      class="input"
                      required
                      :placeholder="$t('common.cost')"
                    />
                  </div>

                  <!-- Product (Optional) -->
                  <div class="mb-4">
                    <label class="label">{{ $t('nav.products') }} ({{ $t('common.optional') }})</label>
                    <select v-model="form.productId" class="input" @change="onProductChange">
                      <option :value="null">{{ $t('common.none') }}</option>
                      <option v-for="product in productsList" :key="product.id" :value="product.id">
                        {{ product.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Product Variant (if product has variants) -->
                  <div v-if="selectedProductHasVariants" class="mb-4">
                    <label class="label">{{ $t('productVariants.title') }} {{ isVariantRequired ? '*' : '' }}</label>
                    <select
                      v-model="form.productVariantId"
                      class="input"
                      :required="isVariantRequired"
                      :disabled="isLoadingVariants"
                    >
                      <option :value="null">{{ isLoadingVariants ? $t('common.loading') : $t('common.select') }}...</option>
                      <option v-for="variant in productVariants" :key="variant.id" :value="variant.id">
                        {{ variant.name }} ({{ variant.sku }})
                      </option>
                    </select>
                    <p v-if="selectedProductHasVariants && productVariants.length === 0 && !isLoadingVariants" class="text-xs text-amber-600 mt-1">
                      {{ $t('productVariants.noVariants') }}
                    </p>
                  </div>

                  <!-- Nature -->
                  <div class="mb-4">
                    <label class="label">{{ $t('expenses.nature') }}</label>
                    <input
                      v-model="form.nature"
                      type="text"
                      class="input"
                      :placeholder="$t('expenses.naturePlaceholder')"
                    />
                  </div>

                  <!-- Description -->
                  <div class="mb-4">
                    <label class="label">{{ $t('common.description') }}</label>
                    <textarea
                      v-model="form.description"
                      class="input min-h-[80px]"
                      :placeholder="$t('common.description')"
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.expenses') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.expenses') }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="handleExportCsv" class="btn-secondary" :disabled="expenses.length === 0">
          <ArrowDownTrayIcon class="w-5 h-5 mr-2" />
          {{ $t('common.export') }}
        </button>
        <button @click="openCreateModal" class="btn-primary">
          <PlusIcon class="w-5 h-5 mr-2" />
          {{ $t('common.create') }}
        </button>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="card mb-6">
      <DateRangeFilter
        v-model="dateRange"
        :preset="datePreset"
        @update:preset="onPresetChange"
        @update:model-value="onDateRangeChange"
      />
    </div>

    <!-- Search & Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <select v-model="filterExpenseTypeId" class="input" @change="applyFilters">
          <option value="">{{ $t('expenses.allTypes') }}</option>
          <option v-for="type in expenseTypesList" :key="type.id" :value="type.id">
            {{ type.title }}
          </option>
        </select>
        <select v-model="filterProductId" class="input" @change="applyFilters">
          <option value="">{{ $t('expenses.allProducts') }}</option>
          <option v-for="product in productsList" :key="product.id" :value="product.id">
            {{ product.name }}
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

      <div v-else-if="expenses.length === 0" class="text-center py-12">
        <BanknotesIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('nav.expenseTypes') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('nav.products') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.cost') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('expenses.nature') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.description') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="expense in expenses" :key="expense.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                  {{ expense.expenseTypeName }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span v-if="expense.productName" class="text-gray-900 dark:text-white">{{ expense.productName }}</span>
                <span v-else class="text-gray-400">-</span>
                <span v-if="expense.variantName" class="block text-xs text-gray-500 dark:text-gray-400">
                  {{ expense.variantName }}
                  <span v-if="expense.variantSku" class="text-gray-400">({{ expense.variantSku }})</span>
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(expense.cost) }}</span>
              </td>
              <td class="py-3 px-4">
                <span v-if="expense.nature" class="text-gray-700 dark:text-gray-300">{{ expense.nature }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="py-3 px-4">
                <span v-if="expense.description" class="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">{{ expense.description }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(expense)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(expense)"
                    class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    :title="$t('common.delete')"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <!-- Totals Row -->
          <tfoot v-if="expenses.length > 0" class="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <td class="py-3 px-4 font-bold text-gray-900 dark:text-white" colspan="2">
                {{ $t('common.total') }} ({{ expenses.length }} {{ $t('common.records') }})
              </td>
              <td class="py-3 px-4 text-right">
                <span class="font-bold text-gray-900 dark:text-white text-lg">{{ formatCurrency(totalCost) }}</span>
              </td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Page {{ pagination.currentPage }} / {{ pagination.totalPages }}
        </p>
        <div class="flex gap-2">
          <button
            @click="setPage(pagination.currentPage - 1)"
            :disabled="!pagination.hasPreviousPage"
            class="btn-secondary text-sm px-3 py-1"
          >
            {{ $t('common.previous') }}
          </button>
          <button
            @click="setPage(pagination.currentPage + 1)"
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
  BanknotesIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'
import {
  useExpensesService,
  useExpenseTypesService,
  useProductsService,
  useProductVariantsByProduct,
  type ExpenseDto
} from '~/services'
import type { DateRange, DatePreset } from '~/utils/date'
import { getDateRangeFromPreset, formatDateForApi } from '~/utils/date'
import { exportToCsv, formatCurrencyForCsv } from '~/utils/csvExport'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Expenses.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Expenses service provides all CRUD operations with caching
const {
  items: expenses,
  pagination,
  isLoading,
  isMutating,
  setPage,
  setKeyword,
  setFilters,
  create,
  update,
  remove,
} = useExpensesService()

// Expense types and products for dropdowns (using services which auto-fetch)
const { items: expenseTypesList } = useExpenseTypesService()
const { items: productsList } = useProductsService()

// Product variants - loaded dynamically when product is selected
const selectedProductIdForVariants = ref<string | null>(null)
const { variants: productVariants, isLoading: isLoadingVariants } = useProductVariantsByProduct(selectedProductIdForVariants)

// Check if selected product has variants
const selectedProductHasVariants = computed(() => {
  if (!form.value.productId) return false
  const product = productsList.value.find(p => p.id === form.value.productId)
  return product?.hasVariants && (product?.variantCount ?? 0) > 0
})

// Variant is required if product has variants
const isVariantRequired = computed(() => selectedProductHasVariants.value)

// Format currency
const formatCurrency = (value?: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(value || 0)
}

// Modal state
const showModal = ref(false)
const editingExpense = ref<ExpenseDto | null>(null)
const form = ref({
  expenseTypeId: '',
  cost: 0,
  productId: null as string | null,
  productVariantId: null as string | null,
  nature: '',
  description: ''
})

// Search & Filters
const searchKeyword = ref('')
const filterExpenseTypeId = ref('')
const filterProductId = ref('')

// Date range filter
const datePreset = ref<DatePreset>('this_month')
const dateRange = ref<DateRange>(getDateRangeFromPreset('this_month'))

// Total cost calculation
const totalCost = computed(() => {
  return expenses.value.reduce((sum, item) => sum + (item.cost || 0), 0)
})

// Handle date range change
const onDateRangeChange = (range: DateRange) => {
  dateRange.value = range
  applyFilters()
}

// Handle preset change
const onPresetChange = (preset: DatePreset) => {
  datePreset.value = preset
}

// CSV Export
const handleExportCsv = () => {
  const columns = [
    { key: 'expenseTypeName', label: t('nav.expenseTypes') },
    { key: 'productName', label: t('nav.products') },
    { key: 'variantName', label: t('productVariants.title') },
    { key: 'cost', label: t('common.cost'), formatter: (val: number) => formatCurrencyForCsv(val, 'MAD') },
    { key: 'nature', label: t('expenses.nature') },
    { key: 'description', label: t('common.description') },
  ]

  const filename = `expenses-${new Date().toISOString().split('T')[0]}`
  exportToCsv(expenses.value, columns, filename)
  notify({ type: 'success', message: t('messages.exportSuccess') })
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => setKeyword(searchKeyword.value), 300)
}

// Apply filters
const applyFilters = () => {
  setFilters({
    expenseTypeId: filterExpenseTypeId.value || undefined,
    productId: filterProductId.value || undefined,
    startDate: formatDateForApi(dateRange.value.from),
    endDate: formatDateForApi(dateRange.value.to)
  })
}

// Handle product change - reset variant and load new variants
const onProductChange = () => {
  form.value.productVariantId = null
  selectedProductIdForVariants.value = form.value.productId
}

// Open create modal
const openCreateModal = () => {
  editingExpense.value = null
  selectedProductIdForVariants.value = null
  form.value = {
    expenseTypeId: '',
    cost: 0,
    productId: null,
    productVariantId: null,
    nature: '',
    description: ''
  }
  showModal.value = true
}

// Open edit modal
const openEditModal = (expense: ExpenseDto) => {
  editingExpense.value = expense
  selectedProductIdForVariants.value = expense.productId || null
  form.value = {
    expenseTypeId: expense.expenseTypeId || '',
    cost: expense.cost || 0,
    productId: expense.productId || null,
    productVariantId: expense.productVariantId || null,
    nature: expense.nature || '',
    description: expense.description || ''
  }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingExpense.value = null
  selectedProductIdForVariants.value = null
  form.value = {
    expenseTypeId: '',
    cost: 0,
    productId: null,
    productVariantId: null,
    nature: '',
    description: ''
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.expenseTypeId || form.value.cost <= 0) return

  // Validate variant if required
  if (isVariantRequired.value && !form.value.productVariantId) {
    notify({ type: 'error', message: t('productVariants.selectVariant') })
    return
  }

  try {
    if (editingExpense.value) {
      await update(editingExpense.value.id!, {
        id: editingExpense.value.id!,
        expenseTypeId: form.value.expenseTypeId,
        cost: form.value.cost,
        productId: form.value.productId || undefined,
        productVariantId: form.value.productVariantId || undefined,
        nature: form.value.nature || undefined,
        description: form.value.description || undefined
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await create({
        expenseTypeId: form.value.expenseTypeId,
        cost: form.value.cost,
        productId: form.value.productId || undefined,
        productVariantId: form.value.productVariantId || undefined,
        nature: form.value.nature || undefined,
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
const handleDelete = async (expense: ExpenseDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await remove(expense.id!)
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}
</script>
