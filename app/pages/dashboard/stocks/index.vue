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
                  {{ editingStock ? $t('common.edit') : $t('common.create') }} {{ $t('nav.stocks') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <div class="space-y-4">
                    <div>
                      <label class="label">{{ $t('stocks.product') }} *</label>
                      <select v-model="form.productId" class="input" required :disabled="!!editingStock">
                        <option value="">{{ $t('common.select') }}</option>
                        <option v-for="product in productsList" :key="product.id" :value="product.id">
                          {{ product.name }} {{ product.reference ? `(${product.reference})` : '' }}
                        </option>
                      </select>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="label">{{ $t('stocks.quantity') }} *</label>
                        <input
                          v-model.number="form.quantity"
                          type="number"
                          class="input"
                          required
                          min="0"
                        />
                      </div>

                      <div>
                        <label class="label">{{ $t('stocks.brokenQuantity') }}</label>
                        <input
                          v-model.number="form.brokenQuantity"
                          type="number"
                          class="input"
                          min="0"
                        />
                      </div>
                    </div>

                    <div v-if="!editingStock">
                      <label class="label">{{ $t('stocks.totalValue') }}</label>
                      <input
                        v-model.number="form.totalValue"
                        type="number"
                        class="input"
                        min="0"
                        step="0.01"
                        :placeholder="$t('stocks.totalValuePlaceholder')"
                      />
                    </div>

                    <div>
                      <label class="label">{{ $t('stocks.deliveryCompany') }}</label>
                      <select v-model="form.deliveryCompanyId" class="input">
                        <option value="">{{ $t('common.none') }}</option>
                        <option v-for="dc in deliveryCompaniesList" :key="dc.id" :value="dc.id">
                          {{ dc.name }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="label">{{ $t('stocks.details') }}</label>
                      <textarea
                        v-model="form.details"
                        class="input"
                        rows="2"
                      ></textarea>
                    </div>
                  </div>

                  <div class="flex justify-end gap-3 mt-6">
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

    <!-- Add Stock Modal -->
    <TransitionRoot :show="showAddStockModal" as="template">
      <Dialog as="div" class="relative z-50" @close="showAddStockModal = false">
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
              <DialogPanel class="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ $t('stocks.addStock') }} - {{ addingToStock?.productName }}
                  <span v-if="addingToStock?.variantName" class="text-sm font-normal text-gray-500">
                    ({{ addingToStock.variantName }})
                  </span>
                </DialogTitle>

                <div class="space-y-4">
                  <div>
                    <label class="label">{{ $t('stocks.quantityToAdd') }} *</label>
                    <input
                      v-model.number="addStockForm.quantityToAdd"
                      type="number"
                      class="input"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label class="label">{{ $t('stocks.unitCost') }} *</label>
                    <input
                      v-model.number="addStockForm.unitCost"
                      type="number"
                      class="input"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div class="bg-gray-100 dark:bg-gray-700 rounded p-3">
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      {{ $t('stocks.newTotalValue') }}: <strong>{{ (addStockForm.quantityToAdd * addStockForm.unitCost).toFixed(2) }}</strong>
                    </p>
                  </div>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                  <button type="button" class="btn-secondary" @click="showAddStockModal = false">
                    {{ $t('common.cancel') }}
                  </button>
                  <button
                    type="button"
                    class="btn-primary"
                    :disabled="!addStockForm.quantityToAdd || addStockForm.unitCost < 0 || isMutating"
                    @click="handleAddStock"
                  >
                    {{ isMutating ? $t('common.loading') : $t('stocks.addStock') }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.stocks') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.stocks') }}</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        {{ $t('common.create') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <select v-model="filterProduct" class="input" @change="applyFilters">
          <option value="">{{ $t('common.all') }} {{ $t('nav.products') }}</option>
          <option v-for="product in productsList" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>
        <select v-model="filterDeliveryCompany" class="input" @change="applyFilters">
          <option value="">{{ $t('common.all') }} {{ $t('nav.deliveryCompanies') }}</option>
          <option v-for="dc in deliveryCompaniesList" :key="dc.id" :value="dc.id">
            {{ dc.name }}
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

      <div v-else-if="stocks.length === 0" class="text-center py-12">
        <ArchiveBoxIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('stocks.product') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('products.variant') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('stocks.quantity') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('stocks.brokenQuantity') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('stocks.available') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('stocks.averageCost') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('stocks.totalValue') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('stocks.deliveryCompany') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="stock in stocks" :key="stock.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <div>
                  <span class="font-medium text-gray-900 dark:text-white">{{ stock.productName }}</span>
                  <div v-if="stock.productReference" class="text-xs text-gray-500">{{ stock.productReference }}</div>
                </div>
              </td>
              <td class="py-3 px-4">
                <div v-if="stock.variantName || stock.variantSku">
                  <span class="font-medium text-gray-900 dark:text-white">{{ stock.variantName }}</span>
                  <div v-if="stock.variantSku" class="text-xs text-gray-500">
                    <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">{{ stock.variantSku }}</code>
                  </div>
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="text-gray-900 dark:text-white">{{ stock.quantity }}</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span :class="(stock.brokenQuantity ?? 0) > 0 ? 'text-red-600' : 'text-gray-500'">
                  {{ stock.brokenQuantity ?? 0 }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    (stock.availableQuantity ?? 0) > 10
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : (stock.availableQuantity ?? 0) > 0
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  ]"
                >
                  {{ stock.availableQuantity ?? 0 }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="text-gray-900 dark:text-white">{{ (stock.averageCost ?? 0).toFixed(2) }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="font-medium text-gray-900 dark:text-white">{{ (stock.totalValue ?? 0).toFixed(2) }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-600 dark:text-gray-300">{{ stock.deliveryCompanyName || '-' }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openAddStockModal(stock)"
                    class="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                    :title="$t('stocks.addStock')"
                  >
                    <PlusCircleIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="openEditModal(stock)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(stock)"
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
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, ArchiveBoxIcon, PlusCircleIcon } from '@heroicons/vue/24/outline'
import { useStocksService, useProductsService, useDeliveryCompaniesService, type StockDto } from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Stocks.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Stocks service
const {
  items: stocks,
  pagination,
  isLoading,
  isMutating,
  setPage,
  setKeyword,
  setFilters,
  create,
  update,
  remove,
  addStockWithCost,
} = useStocksService()

// Dropdowns data from services (auto-fetch)
const { items: productsList } = useProductsService()
const { items: deliveryCompaniesList } = useDeliveryCompaniesService()

// Modal state
const showModal = ref(false)
const showAddStockModal = ref(false)
const editingStock = ref<StockDto | null>(null)
const addingToStock = ref<StockDto | null>(null)

// Filters
const searchKeyword = ref('')
const filterProduct = ref('')
const filterDeliveryCompany = ref('')

const defaultForm = () => ({
  productId: '',
  quantity: 0,
  brokenQuantity: 0,
  totalValue: 0,
  details: '',
  deliveryCompanyId: ''
})

const form = ref(defaultForm())

const addStockForm = ref({
  quantityToAdd: 1,
  unitCost: 0
})

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => setKeyword(searchKeyword.value), 300)
}

// Apply filters
const applyFilters = () => {
  setFilters({
    productId: filterProduct.value || undefined,
    deliveryCompanyId: filterDeliveryCompany.value || undefined
  })
}

// Open create modal
const openCreateModal = () => {
  editingStock.value = null
  form.value = defaultForm()
  showModal.value = true
}

// Open edit modal
const openEditModal = (stock: StockDto) => {
  editingStock.value = stock
  form.value = {
    productId: stock.productId || '',
    quantity: stock.quantity ?? 0,
    brokenQuantity: stock.brokenQuantity ?? 0,
    totalValue: stock.totalValue ?? 0,
    details: stock.details || '',
    deliveryCompanyId: stock.deliveryCompanyId || ''
  }
  showModal.value = true
}

// Open add stock modal
const openAddStockModal = (stock: StockDto) => {
  addingToStock.value = stock
  addStockForm.value = {
    quantityToAdd: 1,
    unitCost: stock.averageCost || 0
  }
  showAddStockModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingStock.value = null
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.productId) return

  try {
    if (editingStock.value) {
      await update(editingStock.value.id!, {
        id: editingStock.value.id!,
        productId: form.value.productId,
        quantity: form.value.quantity,
        brokenQuantity: form.value.brokenQuantity,
        details: form.value.details || undefined,
        deliveryCompanyId: form.value.deliveryCompanyId || undefined
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await create({
        productId: form.value.productId,
        quantity: form.value.quantity,
        brokenQuantity: form.value.brokenQuantity,
        totalValue: form.value.totalValue,
        details: form.value.details || undefined,
        deliveryCompanyId: form.value.deliveryCompanyId || undefined
      })
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle add stock
const handleAddStock = async () => {
  if (!addingToStock.value) return

  try {
    await addStockWithCost(addingToStock.value.id!, {
      quantityToAdd: addStockForm.value.quantityToAdd,
      unitCost: addStockForm.value.unitCost
    })
    notify({ type: 'success', message: t('messages.updateSuccess') })
    showAddStockModal.value = false
    addingToStock.value = null
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle delete
const handleDelete = async (stock: StockDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await remove(stock.id!)
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}
</script>
