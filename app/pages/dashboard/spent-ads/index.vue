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
                  {{ editingSpentAd ? $t('common.edit') : $t('common.create') }} {{ $t('nav.spentAds') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <!-- Media Buyer -->
                  <div class="mb-4">
                    <label class="label">{{ $t('mediaBuyer.mediaBuyer') }} *</label>
                    <select v-model="form.mediaBuyerId" class="input" required>
                      <option value="">{{ $t('common.select') }}...</option>
                      <option v-for="user in users" :key="user.id" :value="user.id">
                        {{ user.firstName }} {{ user.lastName }}
                      </option>
                    </select>
                  </div>

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
                      <option :value="null">{{ isLoadingVariants ? $t('common.loading') : $t('common.select') }}...</option>
                      <option v-for="variant in productVariants" :key="variant.id" :value="variant.id">
                        {{ variant.name }} ({{ variant.sku }})
                      </option>
                    </select>
                    <p v-if="selectedProductHasVariants && productVariants.length === 0 && !isLoadingVariants" class="text-xs text-amber-600 mt-1">
                      {{ $t('productVariants.noVariants') }}
                    </p>
                  </div>

                  <!-- Platform -->
                  <div class="mb-4">
                    <label class="label">{{ $t('spentAds.platform') }}</label>
                    <select v-model="form.platform" class="input">
                      <option :value="null">{{ $t('common.select') }}...</option>
                      <option v-for="platform in AD_PLATFORMS" :key="platform.value" :value="platform.value">
                        {{ platform.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Amount -->
                  <div class="mb-4">
                    <label class="label">{{ $t('spentAds.amount') }} *</label>
                    <input
                      v-model.number="form.amount"
                      type="number"
                      step="0.01"
                      min="0"
                      class="input"
                      required
                    />
                  </div>

                  <!-- Spent Date -->
                  <div class="mb-4">
                    <label class="label">{{ $t('spentAds.spentDate') }} *</label>
                    <input
                      v-model="form.spentDate"
                      type="date"
                      class="input"
                      required
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.spentAds') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('common.records') }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="handleExportCsv" class="btn-secondary" :disabled="spentAds.length === 0">
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
        <select v-model="filterProductId" class="input" @change="applyFilters">
          <option :value="null">{{ $t('spentAds.allProducts') }}</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>
        <select v-model="filterPlatform" class="input" @change="applyFilters">
          <option :value="null">{{ $t('spentAds.allPlatforms') }}</option>
          <option v-for="platform in AD_PLATFORMS" :key="platform.value" :value="platform.value">
            {{ platform.label }}
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

      <div v-else-if="spentAds.length === 0" class="text-center py-12">
        <CurrencyDollarIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('mediaBuyer.mediaBuyer') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('nav.products') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('spentAds.platform') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('spentAds.amount') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('spentAds.spentDate') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in spentAds" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="font-medium text-gray-900 dark:text-white">{{ getUserName(item.mediaBuyerId) }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-900 dark:text-white">{{ item.productName }}</span>
                <span v-if="item.variantName" class="block text-xs text-gray-500 dark:text-gray-400">
                  {{ item.variantName }}
                  <span v-if="item.variantSku" class="text-gray-400">({{ item.variantSku }})</span>
                </span>
              </td>
              <td class="py-3 px-4">
                <span
                  v-if="item.platform"
                  :class="getPlatformClass(item.platform)"
                  class="px-2 py-1 text-xs font-medium rounded"
                >
                  {{ getPlatformLabel(item.platform) }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="font-semibold text-red-600 dark:text-red-400">{{ formatCurrency(item.amount) }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-600 dark:text-gray-400 text-sm">{{ formatDate(item.spentDate) }}</span>
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
          <!-- Totals Row -->
          <tfoot v-if="spentAds.length > 0" class="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <td class="py-3 px-4 font-bold text-gray-900 dark:text-white" colspan="3">
                {{ $t('common.total') }} ({{ spentAds.length }} {{ $t('common.records') }})
              </td>
              <td class="py-3 px-4 text-right">
                <span class="font-bold text-red-600 dark:text-red-400 text-lg">{{ formatCurrency(totalAmount) }}</span>
              </td>
              <td colspan="2"></td>
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
  CurrencyDollarIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'
import {
  useSpentAdsService,
  useProductsService,
  useUsersService,
  useProductVariantsByProduct,
  type SpentAdDto
} from '~/services'
import { AD_PLATFORMS } from '~/types/spentad'
import type { DateRange, DatePreset } from '~/utils/date'
import { getDateRangeFromPreset, formatDateForApi } from '~/utils/date'
import { exportToCsv, formatDateForCsv, formatCurrencyForCsv } from '~/utils/csvExport'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.SpentAds.View'
})

const { t } = useI18n()
const { notify } = useNotification()

const {
  items: spentAds,
  isLoading,
  isMutating,
  pagination,
  setPage,
  setKeyword,
  setFilters,
  create: createSpentAd,
  update: updateSpentAd,
  remove: deleteSpentAd
} = useSpentAdsService()

// Get products and users for dropdowns (auto-fetch)
const { items: products } = useProductsService()
const { users } = useUsersService()

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

const getPlatformLabel = (platform: string) => {
  const found = AD_PLATFORMS.find(p => p.value === platform)
  return found ? found.label : platform
}

const getPlatformClass = (platform: string) => {
  const colors: Record<string, string> = {
    facebook: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    google: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    tiktok: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    snapchat: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    instagram: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    youtube: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
  return colors[platform] || colors.other
}

// Modal state
const showModal = ref(false)
const editingSpentAd = ref<SpentAdDto | null>(null)
const form = ref({
  mediaBuyerId: '',
  productId: '',
  productVariantId: null as string | null,
  platform: null as string | null,
  amount: 0,
  spentDate: new Date().toISOString().split('T')[0]
})

// Search & Filters
const searchKeyword = ref('')
const filterProductId = ref<string | null>(null)
const filterPlatform = ref<string | null>(null)

// Date range filter
const datePreset = ref<DatePreset>('this_month')
const dateRange = ref<DateRange>(getDateRangeFromPreset('this_month'))

// Total amount calculation
const totalAmount = computed(() => {
  return spentAds.value.reduce((sum, item) => sum + (item.amount || 0), 0)
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
    { key: 'mediaBuyerId', label: t('mediaBuyer.mediaBuyer'), formatter: (val: string) => getUserName(val) },
    { key: 'productName', label: t('nav.products') },
    { key: 'variantName', label: t('productVariants.title') },
    { key: 'platform', label: t('spentAds.platform'), formatter: (val: string) => getPlatformLabel(val) || '' },
    { key: 'amount', label: t('spentAds.amount'), formatter: (val: number) => formatCurrencyForCsv(val, 'MAD') },
    { key: 'spentDate', label: t('spentAds.spentDate'), formatter: (val: string) => formatDateForCsv(val) },
  ]

  const filename = `spent-ads-${new Date().toISOString().split('T')[0]}`
  exportToCsv(spentAds.value, columns, filename)
  notify({ type: 'success', message: t('messages.exportSuccess') })
}

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
    platform: filterPlatform.value || undefined,
    startDate: formatDateForApi(dateRange.value.from),
    endDate: formatDateForApi(dateRange.value.to)
  })
  setKeyword(searchKeyword.value)
}

// Handle product change - reset variant and load new variants
const onProductChange = () => {
  form.value.productVariantId = null
  selectedProductIdForVariants.value = form.value.productId || null
}

// Open create modal
const openCreateModal = () => {
  editingSpentAd.value = null
  selectedProductIdForVariants.value = null
  form.value = {
    mediaBuyerId: '',
    productId: '',
    productVariantId: null,
    platform: null,
    amount: 0,
    spentDate: new Date().toISOString().split('T')[0]
  }
  showModal.value = true
}

// Open edit modal
const openEditModal = (item: SpentAdDto) => {
  editingSpentAd.value = item
  selectedProductIdForVariants.value = item.productId || null
  form.value = {
    mediaBuyerId: item.mediaBuyerId!,
    productId: item.productId!,
    productVariantId: item.productVariantId || null,
    platform: item.platform || null,
    amount: item.amount!,
    spentDate: item.spentDate!.split('T')[0]
  }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingSpentAd.value = null
  selectedProductIdForVariants.value = null
  form.value = {
    mediaBuyerId: '',
    productId: '',
    productVariantId: null,
    platform: null,
    amount: 0,
    spentDate: new Date().toISOString().split('T')[0]
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.mediaBuyerId || !form.value.productId || !form.value.spentDate || form.value.amount < 0) return

  // Validate variant if required
  if (isVariantRequired.value && !form.value.productVariantId) {
    notify({ type: 'error', message: t('productVariants.selectVariant') })
    return
  }

  try {
    if (editingSpentAd.value) {
      await updateSpentAd(editingSpentAd.value.id!, {
        id: editingSpentAd.value.id!,
        mediaBuyerId: form.value.mediaBuyerId,
        productId: form.value.productId,
        productVariantId: form.value.productVariantId || undefined,
        platform: form.value.platform || undefined,
        amount: form.value.amount,
        spentDate: form.value.spentDate
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await createSpentAd({
        mediaBuyerId: form.value.mediaBuyerId,
        productId: form.value.productId,
        productVariantId: form.value.productVariantId || undefined,
        platform: form.value.platform || undefined,
        amount: form.value.amount,
        spentDate: form.value.spentDate
      })
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle delete
const handleDelete = async (item: SpentAdDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await deleteSpentAd(item.id!)
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
