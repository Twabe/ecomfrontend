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
              <DialogPanel class="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ editingProduct ? $t('common.edit') : $t('common.create') }} {{ $t('nav.products') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <!-- BASIC INFO SECTION -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Product Name -->
                    <div class="md:col-span-2">
                      <label class="label">{{ $t('common.name') }} *</label>
                      <input
                        v-model="form.name"
                        type="text"
                        class="input"
                        required
                        maxlength="75"
                        :placeholder="$t('common.name')"
                      />
                    </div>

                    <!-- SKU (Reference) -->
                    <div>
                      <label class="label">{{ $t('products.sku') }} *</label>
                      <input
                        v-model="form.reference"
                        type="text"
                        class="input"
                        required
                        maxlength="50"
                        :placeholder="$t('products.skuPlaceholder')"
                      />
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {{ $t('products.skuHint') }}
                      </p>
                    </div>

                    <!-- Brand -->
                    <div>
                      <label class="label">{{ $t('products.brand') }} *</label>
                      <select v-model="form.brandId" class="input" required>
                        <option value="">{{ $t('common.select') }}...</option>
                        <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                          {{ brand.name }}
                        </option>
                      </select>
                    </div>

                    <!-- Selling Price -->
                    <div>
                      <label class="label">{{ $t('products.sellingPrice') }} *</label>
                      <input
                        v-model.number="form.rate"
                        type="number"
                        class="input"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <!-- Buying Price -->
                    <div>
                      <label class="label">{{ $t('products.buyingPrice') }}</label>
                      <input
                        v-model.number="form.buyingPrice"
                        type="number"
                        class="input"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <!-- Shipping Price -->
                    <div>
                      <label class="label">{{ $t('products.shippingPrice') }}</label>
                      <input
                        v-model.number="form.shippingPrice"
                        type="number"
                        class="input"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <!-- Marketing Price -->
                    <div>
                      <label class="label">{{ $t('products.marketingPrice') }}</label>
                      <input
                        v-model.number="form.marketingPrice"
                        type="number"
                        class="input"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <!-- Charges -->
                    <div>
                      <label class="label">{{ $t('products.charges') }}</label>
                      <input
                        v-model.number="form.charges"
                        type="number"
                        class="input"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <!-- Link -->
                    <div>
                      <label class="label">{{ $t('products.link') }}</label>
                      <input
                        v-model="form.link"
                        type="url"
                        class="input"
                        :placeholder="$t('products.link')"
                      />
                    </div>

                    <!-- Track Stock -->
                    <div class="md:col-span-2">
                      <label class="flex items-center gap-3 cursor-pointer">
                        <input
                          v-model="form.trackStock"
                          type="checkbox"
                          class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <span class="font-medium text-gray-900 dark:text-white">{{ $t('products.trackStock') }}</span>
                          <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('products.trackStockHint') }}</p>
                        </div>
                      </label>
                    </div>

                    <!-- Description -->
                    <div class="md:col-span-2">
                      <label class="label">{{ $t('products.description') }}</label>
                      <textarea
                        v-model="form.description"
                        class="input"
                        rows="3"
                        :placeholder="$t('products.description')"
                      ></textarea>
                    </div>
                  </div>

                  <!-- VARIANTS SECTION (only for new products) -->
                  <div v-if="!editingProduct" class="mt-6 pt-6 border-t dark:border-gray-600">
                    <!-- Has Variants Toggle -->
                    <label class="flex items-center gap-3 cursor-pointer mb-4">
                      <input
                        v-model="form.hasVariants"
                        type="checkbox"
                        class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ $t('products.hasVariants') }}</span>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('products.hasVariantsHint') }}</p>
                      </div>
                    </label>

                    <!-- Variant Configuration (shown when hasVariants is true) -->
                    <div v-if="form.hasVariants" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <!-- Tabs -->
                      <div class="flex gap-2 mb-4">
                        <button
                          type="button"
                          @click="variantTab = 'auto'"
                          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          :class="variantTab === 'auto'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'"
                        >
                          {{ $t('products.autoGenerate') }}
                        </button>
                        <button
                          type="button"
                          @click="variantTab = 'manual'"
                          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          :class="variantTab === 'manual'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'"
                        >
                          {{ $t('products.manualEntry') }}
                        </button>
                      </div>

                      <!-- Auto-Generate Tab -->
                      <div v-if="variantTab === 'auto'">
                        <VariantOptionsBuilder
                          :parent-sku="form.reference"
                          :variants="generatedVariants"
                          @update:variants="generatedVariants = $event"
                        />
                      </div>

                      <!-- Manual Entry Tab -->
                      <div v-else>
                        <ManualVariantEntry
                          :parent-sku="form.reference"
                          :variants="manualVariants"
                          @update:variants="manualVariants = $event"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Edit Mode: Link to Variants Page -->
                  <div v-else-if="editingProduct?.hasVariants" class="mt-6 pt-6 border-t dark:border-gray-600">
                    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div class="flex items-center gap-3">
                        <Squares2X2Icon class="w-5 h-5 text-primary-600" />
                        <div>
                          <span class="font-medium text-gray-900 dark:text-white">{{ $t('products.variants') }}</span>
                          <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{ editingProduct.variantCount || 0 }} {{ $t('products.variantsConfigured') }}
                          </p>
                        </div>
                      </div>
                      <NuxtLink
                        :to="'/dashboard/products/' + editingProduct.id + '/variants'"
                        class="btn-secondary text-sm"
                        @click="closeModal"
                      >
                        {{ $t('products.manageVariants') }}
                      </NuxtLink>
                    </div>
                  </div>

                  <!-- Form Actions -->
                  <div class="flex justify-end gap-3 mt-6">
                    <button type="button" class="btn-secondary" @click="closeModal">
                      {{ $t('common.cancel') }}
                    </button>
                    <button
                      type="submit"
                      class="btn-primary"
                      :disabled="isSubmitting || !isFormValid"
                    >
                      {{ isSubmitting ? $t('common.loading') : $t('common.save') }}
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.products') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.products') }}</p>
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

      <div v-else-if="products.length === 0" class="text-center py-12">
        <CubeIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.name') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('products.sku') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('products.brand') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('products.variants') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('products.sellingPrice') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <div>
                  <span class="font-medium text-gray-900 dark:text-white">{{ product.name }}</span>
                  <p v-if="product.description" class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                    {{ product.description }}
                  </p>
                </div>
              </td>
              <td class="py-3 px-4">
                <code class="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  {{ product.reference || '-' }}
                </code>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                  {{ product.brandName }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <!-- Only show variants link for products that already have variants -->
                <NuxtLink
                  v-if="product.hasVariants"
                  :to="'/dashboard/products/' + product.id + '/variants'"
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50"
                >
                  <Squares2X2Icon class="w-3.5 h-3.5" />
                  <span>{{ product.variantCount || 0 }}</span>
                </NuxtLink>
                <span v-else class="text-gray-400 dark:text-gray-500">-</span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="font-medium text-gray-900 dark:text-white">{{ formatPrice(product.rate) }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(product)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(product)"
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
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, CubeIcon, Squares2X2Icon } from '@heroicons/vue/24/outline'
import { useProductsService, useBrandsService, type ProductDto } from '~/services'
import { customInstance } from '~/api/axios-instance'
import VariantOptionsBuilder from '~/components/products/VariantOptionsBuilder.vue'
import ManualVariantEntry from '~/components/products/ManualVariantEntry.vue'

// Manual API function for bulk variant creation
interface BulkCreateVariantsRequest {
  productId: string
  variants: Array<{
    name: string
    sku: string
    barcode?: string
    options?: string
    price?: number
    buyingPrice?: number
    weight?: number
    sortOrder: number
    isActive: boolean
  }>
}

interface BulkCreateVariantsResult {
  created: number
  skipped: number
  errors: string[]
  createdIds: string[]
}

const productVariantsBulkCreate = (data: BulkCreateVariantsRequest): Promise<BulkCreateVariantsResult> => {
  return customInstance<BulkCreateVariantsResult>({
    url: '/api/v1/productvariants/bulk',
    method: 'POST',
    data
  })
}

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Products.View'
})

const { t } = useI18n()
const { notify } = useNotification()

const {
  items: products,
  pagination,
  isLoading,
  isMutating,
  setPage,
  setKeyword,
  create,
  update,
  remove,
} = useProductsService()

const { items: brands } = useBrandsService()

const searchKeyword = ref('')
const showModal = ref(false)
const editingProduct = ref<ProductDto | null>(null)
const isSubmitting = ref(false)

const variantTab = ref<'auto' | 'manual'>('auto')
const generatedVariants = ref<any[]>([])
const manualVariants = ref<any[]>([])

const form = ref({
  name: '',
  brandId: '',
  reference: '',
  rate: 0,
  buyingPrice: 0,
  shippingPrice: 0,
  marketingPrice: 0,
  charges: 0,
  link: '',
  description: '',
  trackStock: true,
  hasVariants: false
})

const variantsToCreate = computed(() => {
  if (!form.value.hasVariants) return []
  return variantTab.value === 'auto' ? generatedVariants.value : manualVariants.value
})

const isFormValid = computed(() => {
  if (!form.value.name.trim() || !form.value.brandId || !form.value.reference.trim()) {
    return false
  }
  if (form.value.hasVariants && variantsToCreate.value.length > 0) {
    return variantsToCreate.value.every(v => v.name?.trim() && v.sku?.trim())
  }
  return true
})

const formatPrice = (price?: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(price || 0)
}

let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => setKeyword(searchKeyword.value), 300)
}

const openCreateModal = () => {
  editingProduct.value = null
  form.value = {
    name: '',
    brandId: '',
    reference: '',
    rate: 0,
    buyingPrice: 0,
    shippingPrice: 0,
    marketingPrice: 0,
    charges: 0,
    link: '',
    description: '',
    trackStock: true,
    hasVariants: false
  }
  variantTab.value = 'auto'
  generatedVariants.value = []
  manualVariants.value = []
  showModal.value = true
}

const openEditModal = (product: ProductDto) => {
  editingProduct.value = product
  form.value = {
    name: product.name || '',
    brandId: product.brandId || '',
    reference: product.reference || '',
    rate: product.rate || 0,
    buyingPrice: product.buyingPrice || 0,
    shippingPrice: product.shippingPrice || 0,
    marketingPrice: product.marketingPrice || 0,
    charges: product.charges || 0,
    link: product.link || '',
    description: product.description || '',
    trackStock: product.trackStock ?? true,
    hasVariants: product.hasVariants ?? false
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true

  try {
    const data = {
      name: form.value.name,
      brandId: form.value.brandId,
      reference: form.value.reference || undefined,
      rate: form.value.rate || undefined,
      buyingPrice: form.value.buyingPrice || undefined,
      shippingPrice: form.value.shippingPrice || undefined,
      marketingPrice: form.value.marketingPrice || undefined,
      charges: form.value.charges || undefined,
      link: form.value.link || undefined,
      description: form.value.description || undefined,
      trackStock: form.value.trackStock
    }

    if (editingProduct.value) {
      await update(editingProduct.value.id!, {
        id: editingProduct.value.id!,
        ...data
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      const productId = await create(data)

      if (form.value.hasVariants && variantsToCreate.value.length > 0) {
        try {
          const result = await productVariantsBulkCreate({
            productId: productId,
            variants: variantsToCreate.value.map(v => ({
              name: v.name,
              sku: v.sku,
              barcode: v.barcode || undefined,
              options: v.options || undefined,
              price: v.price || undefined,
              buyingPrice: v.buyingPrice || undefined,
              weight: v.weight || undefined,
              sortOrder: v.sortOrder || 0,
              isActive: v.isActive ?? true
            }))
          })

          if (result.errors && result.errors.length > 0) {
            notify({
              type: 'warning',
              message: t('products.variantsPartialSuccess', { created: result.created, skipped: result.skipped })
            })
          } else {
            notify({
              type: 'success',
              message: t('products.variantsCreated', { count: result.created })
            })
          }
        } catch (variantError: any) {
          notify({
            type: 'warning',
            message: t('products.variantsFailed') + ': ' + variantError.message
          })
        }
      } else {
        notify({ type: 'success', message: t('messages.createSuccess') })
      }
    }

    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async (product: ProductDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await remove(product.id!)
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}
</script>
