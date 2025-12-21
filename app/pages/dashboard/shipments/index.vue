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
                  {{ editingShipment ? $t('common.edit') : $t('common.create') }} {{ $t('nav.shipments') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <!-- Product -->
                  <div class="mb-4">
                    <label class="label">{{ $t('nav.products') }} *</label>
                    <select v-model="form.productId" class="input" required @change="onProductChange">
                      <option value="">{{ $t('common.select') }}...</option>
                      <option v-for="product in products" :key="product.id" :value="product.id">
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
                      <option value="">{{ isLoadingVariants ? $t('common.loading') : $t('common.select') }}...</option>
                      <option v-for="variant in productVariants" :key="variant.id" :value="variant.id">
                        {{ variant.name }} ({{ variant.sku }})
                      </option>
                    </select>
                    <p v-if="selectedProductHasVariants && productVariants.length === 0 && !isLoadingVariants" class="text-xs text-amber-600 mt-1">
                      {{ $t('productVariants.noVariants') }}
                    </p>
                  </div>

                  <!-- Quantity -->
                  <div class="mb-4">
                    <label class="label">{{ $t('common.quantity') }} *</label>
                    <input
                      v-model.number="form.quantity"
                      type="number"
                      min="1"
                      class="input"
                      required
                    />
                  </div>

                  <!-- Delivery Company -->
                  <div class="mb-4">
                    <label class="label">{{ $t('nav.deliveryCompanies') }} *</label>
                    <select v-model="form.deliveryCompanyId" class="input" required>
                      <option value="">{{ $t('common.select') }}...</option>
                      <option v-for="company in deliveryCompanies" :key="company.id" :value="company.id">
                        {{ company.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Date Sent -->
                  <div class="mb-4">
                    <label class="label">{{ $t('shipments.dateSent') }}</label>
                    <input
                      v-model="form.dateSent"
                      type="date"
                      class="input"
                    />
                  </div>

                  <!-- Order IDs -->
                  <div class="mb-4">
                    <label class="label">{{ $t('shipments.orderIds') }}</label>
                    <textarea
                      v-model="form.orderIds"
                      class="input"
                      rows="2"
                      :placeholder="$t('shipments.orderIdsPlaceholder')"
                    ></textarea>
                  </div>

                  <!-- Receipt -->
                  <div class="mb-4">
                    <label class="label">{{ $t('shipments.receipt') }}</label>
                    <input
                      v-model="form.receipt"
                      type="text"
                      class="input"
                    />
                  </div>

                  <!-- Is Received -->
                  <div class="mb-4">
                    <label class="flex items-center gap-3 cursor-pointer">
                      <input
                        v-model="form.isReceived"
                        type="checkbox"
                        class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span class="text-gray-700 dark:text-gray-300">{{ $t('shipments.isReceived') }}</span>
                    </label>
                  </div>

                  <!-- Date Received (only if editing and isReceived) -->
                  <div v-if="editingShipment && form.isReceived" class="mb-4">
                    <label class="label">{{ $t('shipments.dateReceived') }}</label>
                    <input
                      v-model="form.dateReceived"
                      type="date"
                      class="input"
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.shipments') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('common.records') }}</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        {{ $t('common.create') }}
      </button>
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
        <select v-model="filterProductId" class="input" @change="applyFilters">
          <option :value="null">{{ $t('shipments.allProducts') }}</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>
        <select v-model="filterDeliveryCompanyId" class="input" @change="applyFilters">
          <option :value="null">{{ $t('shipments.allCompanies') }}</option>
          <option v-for="company in deliveryCompanies" :key="company.id" :value="company.id">
            {{ company.name }}
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

      <div v-else-if="shipments.length === 0" class="text-center py-12">
        <TruckIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('nav.products') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.quantity') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('nav.deliveryCompanies') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('shipments.dateSent') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.status') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('shipments.dateReceived') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in shipments" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="font-medium text-gray-900 dark:text-white">{{ item.productName }}</span>
                <span v-if="item.variantName" class="block text-xs text-gray-500 dark:text-gray-400">
                  {{ item.variantName }}
                  <span v-if="item.variantSku" class="text-gray-400">({{ item.variantSku }})</span>
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="font-semibold text-gray-900 dark:text-white">{{ item.quantity }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                  {{ item.deliveryCompanyName }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span v-if="item.dateSent" class="text-gray-600 dark:text-gray-400 text-sm">{{ formatDate(item.dateSent) }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded',
                    item.isReceived
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  ]"
                >
                  {{ item.isReceived ? $t('shipments.received') : $t('shipments.inTransit') }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span v-if="item.dateReceived" class="text-gray-600 dark:text-gray-400 text-sm">{{ formatDate(item.dateReceived) }}</span>
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
  TruckIcon
} from '@heroicons/vue/24/outline'
import {
  useShipmentsService,
  useProductsService,
  useDeliveryCompaniesService,
  useProductVariantsByProduct,
  type ShipmentDto
} from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Shipments.View'
})

const { t } = useI18n()
const { notify } = useNotification()

const {
  items: shipments,
  isLoading,
  isMutating,
  pagination,
  setPage,
  setKeyword,
  setFilters,
  create: createShipment,
  update: updateShipment,
  remove: deleteShipment
} = useShipmentsService()

// Get products and delivery companies for dropdowns (auto-fetch)
const { items: products } = useProductsService()
const { items: deliveryCompanies } = useDeliveryCompaniesService()

// Product variants - loaded dynamically when product is selected
const selectedProductIdForVariants = ref<string | null>(null)
const { variants: productVariants, isLoading: isLoadingVariants } = useProductVariantsByProduct(selectedProductIdForVariants)

// Check if selected product has variants
const selectedProductHasVariants = computed(() => {
  if (!form.value.productId) return false
  const product = products.value.find(p => p.id === form.value.productId)
  return product?.hasVariants && (product?.variantCount ?? 0) > 0
})

// Variant is required if product has variants
const isVariantRequired = computed(() => selectedProductHasVariants.value)

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
const editingShipment = ref<ShipmentDto | null>(null)
const form = ref({
  productId: '',
  productVariantId: '' as string | null,
  quantity: 1,
  deliveryCompanyId: '',
  dateSent: null as string | null,
  orderIds: '',
  receipt: '',
  isReceived: false,
  dateReceived: null as string | null
})

// Handle product change - reset variant and load new variants
const onProductChange = () => {
  form.value.productVariantId = ''
  selectedProductIdForVariants.value = form.value.productId || null
}

// Search & Filters
const searchKeyword = ref('')
const filterProductId = ref<string | null>(null)
const filterDeliveryCompanyId = ref<string | null>(null)

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
    productId: filterProductId.value || undefined,
    deliveryCompanyId: filterDeliveryCompanyId.value || undefined
  })
  setKeyword(searchKeyword.value)
}

// Open create modal
const openCreateModal = () => {
  editingShipment.value = null
  selectedProductIdForVariants.value = null
  form.value = {
    productId: '',
    productVariantId: '',
    quantity: 1,
    deliveryCompanyId: '',
    dateSent: null,
    orderIds: '',
    receipt: '',
    isReceived: false,
    dateReceived: null
  }
  showModal.value = true
}

// Open edit modal
const openEditModal = (item: ShipmentDto) => {
  editingShipment.value = item
  // Set product ID and trigger variant loading
  selectedProductIdForVariants.value = item.productId || null
  form.value = {
    productId: item.productId!,
    productVariantId: item.productVariantId || '',
    quantity: item.quantity!,
    deliveryCompanyId: item.deliveryCompanyId!,
    dateSent: item.dateSent ? item.dateSent.split('T')[0] : null,
    orderIds: item.orderIds || '',
    receipt: item.receipt || '',
    isReceived: item.isReceived!,
    dateReceived: item.dateReceived ? item.dateReceived.split('T')[0] : null
  }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingShipment.value = null
  selectedProductIdForVariants.value = null
  form.value = {
    productId: '',
    productVariantId: '',
    quantity: 1,
    deliveryCompanyId: '',
    dateSent: null,
    orderIds: '',
    receipt: '',
    isReceived: false,
    dateReceived: null
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.productId || !form.value.deliveryCompanyId || form.value.quantity < 1) return

  // Validate variant if required
  if (isVariantRequired.value && !form.value.productVariantId) {
    notify({ type: 'error', message: t('productVariants.selectVariant') })
    return
  }

  try {
    if (editingShipment.value) {
      await updateShipment(editingShipment.value.id!, {
        id: editingShipment.value.id!,
        productId: form.value.productId,
        productVariantId: form.value.productVariantId || undefined,
        quantity: form.value.quantity,
        deliveryCompanyId: form.value.deliveryCompanyId,
        dateSent: form.value.dateSent || undefined,
        orderIds: form.value.orderIds || undefined,
        receipt: form.value.receipt || undefined,
        isReceived: form.value.isReceived,
        dateReceived: form.value.dateReceived || undefined
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await createShipment({
        productId: form.value.productId,
        productVariantId: form.value.productVariantId || undefined,
        quantity: form.value.quantity,
        deliveryCompanyId: form.value.deliveryCompanyId,
        dateSent: form.value.dateSent || undefined,
        orderIds: form.value.orderIds || undefined,
        receipt: form.value.receipt || undefined,
        isReceived: form.value.isReceived
      })
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle delete
const handleDelete = async (item: ShipmentDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await deleteShipment(item.id!)
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
