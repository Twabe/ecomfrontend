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
              <DialogPanel class="w-full max-w-xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ editingVariant ? $t('common.edit') : $t('common.create') }} {{ $t('products.variant') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <div class="space-y-4">
                    <div>
                      <label class="label">{{ $t('products.variantName') }} *</label>
                      <input
                        v-model="form.name"
                        type="text"
                        class="input"
                        required
                        maxlength="255"
                        :placeholder="$t('products.variantNamePlaceholder')"
                      />
                      <p class="text-xs text-gray-500 mt-1">{{ $t('products.variantNameHint') }}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="label">SKU *</label>
                        <input
                          v-model="form.sku"
                          type="text"
                          class="input"
                          required
                          maxlength="100"
                          placeholder="PROD-RED-M"
                        />
                      </div>

                      <div>
                        <label class="label">{{ $t('products.barcode') }}</label>
                        <input
                          v-model="form.barcode"
                          type="text"
                          class="input"
                          maxlength="50"
                          placeholder="1234567890123"
                        />
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="label">{{ $t('products.sellingPrice') }}</label>
                        <input
                          v-model.number="form.price"
                          type="number"
                          class="input"
                          min="0"
                          step="0.01"
                          :placeholder="$t('products.leaveEmptyForProductPrice')"
                        />
                      </div>

                      <div>
                        <label class="label">{{ $t('products.buyingPrice') }}</label>
                        <input
                          v-model.number="form.buyingPrice"
                          type="number"
                          class="input"
                          min="0"
                          step="0.01"
                          :placeholder="$t('products.leaveEmptyForProductPrice')"
                        />
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="label">{{ $t('products.weight') }} (g)</label>
                        <input
                          v-model.number="form.weight"
                          type="number"
                          class="input"
                          min="0"
                        />
                      </div>

                      <div>
                        <label class="label">{{ $t('products.sortOrder') }}</label>
                        <input
                          v-model.number="form.sortOrder"
                          type="number"
                          class="input"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label class="flex items-center gap-3 cursor-pointer">
                        <input
                          v-model="form.isActive"
                          type="checkbox"
                          class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span class="font-medium text-gray-900 dark:text-white">{{ $t('common.active') }}</span>
                      </label>
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

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <NuxtLink
            to="/dashboard/products"
            class="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </NuxtLink>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ $t('products.variants') }}
          </h1>
        </div>
        <p v-if="product" class="text-gray-600 dark:text-gray-400">
          {{ product.name }} - {{ variants.length }} {{ $t('products.variants').toLowerCase() }}
        </p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        {{ $t('products.addVariant') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="card text-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-3 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="variants.length === 0" class="card text-center py-12">
      <Squares2X2Icon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p class="text-gray-500 dark:text-gray-400 mb-4">{{ $t('products.noVariants') }}</p>
      <button @click="openCreateModal" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        {{ $t('products.addFirstVariant') }}
      </button>
    </div>

    <!-- Variants List -->
    <div v-else class="card">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('products.variantName') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">SKU</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('products.barcode') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('products.sellingPrice') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.status') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="variant in variants" :key="variant.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="font-medium text-gray-900 dark:text-white">{{ variant.name }}</span>
              </td>
              <td class="py-3 px-4">
                <code class="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ variant.sku }}</code>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-700 dark:text-gray-300">{{ variant.barcode || '-' }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <span v-if="variant.price" class="font-medium text-gray-900 dark:text-white">
                  {{ formatPrice(variant.price) }}
                </span>
                <span v-else class="text-gray-400 italic text-sm">{{ $t('products.fromProduct') }}</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="variant.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
                >
                  {{ variant.isActive ? $t('common.active') : $t('common.inactive') }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(variant)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(variant)"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { PlusIcon, PencilIcon, TrashIcon, ArrowLeftIcon, Squares2X2Icon } from '@heroicons/vue/24/outline'
import { useProductVariantsByProduct, type ProductVariantDto } from '~/services'
import {
  useProductVariantsCreate,
  useProductVariantsUpdate,
  useProductVariantsDelete,
} from '~/api/generated/endpoints/product-variants/product-variants'
import { productsGet } from '~/api/generated/endpoints/products/products'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.ProductVariants.View'
})

const route = useRoute()
const { t } = useI18n()
const { notify } = useNotification()

const productId = computed(() => route.params.id as string)

// Get product details
const { data: product } = useAsyncData(
  `product-${productId.value}`,
  () => productsGet(productId.value)
)

// Get variants for this product
const { variants, isLoading, invalidate } = useProductVariantsByProduct(productId)

// Mutations
const createMutation = useProductVariantsCreate()
const updateMutation = useProductVariantsUpdate()
const deleteMutation = useProductVariantsDelete()

const isMutating = computed(() =>
  createMutation.isPending.value ||
  updateMutation.isPending.value ||
  deleteMutation.isPending.value
)

// Modal state
const showModal = ref(false)
const editingVariant = ref<ProductVariantDto | null>(null)
const form = ref({
  name: '',
  sku: '',
  barcode: '',
  price: null as number | null,
  buyingPrice: null as number | null,
  weight: null as number | null,
  sortOrder: 0,
  isActive: true,
})

// Format price
const formatPrice = (price?: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(price || 0)
}

// Modal handlers
const openCreateModal = () => {
  editingVariant.value = null
  form.value = {
    name: '',
    sku: '',
    barcode: '',
    price: null,
    buyingPrice: null,
    weight: null,
    sortOrder: variants.value.length,
    isActive: true,
  }
  showModal.value = true
}

const openEditModal = (variant: ProductVariantDto) => {
  editingVariant.value = variant
  form.value = {
    name: variant.name || '',
    sku: variant.sku || '',
    barcode: variant.barcode || '',
    price: variant.price || null,
    buyingPrice: variant.buyingPrice || null,
    weight: variant.weight || null,
    sortOrder: variant.sortOrder || 0,
    isActive: variant.isActive ?? true,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingVariant.value = null
}

// CRUD handlers
const handleSubmit = async () => {
  if (!form.value.name.trim() || !form.value.sku.trim()) return

  try {
    if (editingVariant.value) {
      await updateMutation.mutateAsync({
        id: editingVariant.value.id!,
        data: {
          id: editingVariant.value.id!,
          name: form.value.name,
          sku: form.value.sku,
          barcode: form.value.barcode || undefined,
          price: form.value.price || undefined,
          buyingPrice: form.value.buyingPrice || undefined,
          weight: form.value.weight || undefined,
          sortOrder: form.value.sortOrder,
          isActive: form.value.isActive,
        }
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await createMutation.mutateAsync({
        data: {
          productId: productId.value,
          name: form.value.name,
          sku: form.value.sku,
          barcode: form.value.barcode || undefined,
          price: form.value.price || undefined,
          buyingPrice: form.value.buyingPrice || undefined,
          weight: form.value.weight || undefined,
          sortOrder: form.value.sortOrder,
          isActive: form.value.isActive,
        }
      })
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    invalidate()
    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleDelete = async (variant: ProductVariantDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await deleteMutation.mutateAsync({ id: variant.id! })
      invalidate()
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}
</script>
