<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useOrdersWorkflowService, useProductVariantsByProduct, type OrderDto, type AddOrderItemRequest, type UpdateOrderItemRequest } from '~/services'
import type { ProductDto, ProductVariantDto } from '~/services'

interface OrderItem {
  id: string
  productId: string
  productName: string
  productVariantId?: string
  variantName?: string
  variantSku?: string
  quantity: number
  unitPrice: number
  discountAmount: number
  discountReason?: string
  note?: string
  total: number
}

interface OrderWithItems extends OrderDto {
  items?: OrderItem[]
}

const props = defineProps<{
  show: boolean
  order: OrderWithItems | null
  products: ProductDto[]
}>()

const emit = defineEmits<{
  close: []
  itemAdded: [itemId: string]
  itemUpdated: [itemId: string]
  itemRemoved: [itemId: string]
}>()

const { t } = useI18n()
const ordersWorkflow = useOrdersWorkflowService()

// State
const isSubmitting = ref(false)
const editingItemId = ref<string | null>(null)

// New item form
const newItem = ref({
  productId: '',
  productVariantId: '' as string | undefined,
  quantity: 1,
  unitPrice: undefined as number | undefined,
  discountAmount: 0,
  discountReason: '',
  note: ''
})

// Variants for selected product
const selectedProductIdForVariants = computed(() => newItem.value.productId || undefined)
const { variants: productVariants, isLoading: isLoadingVariants } = useProductVariantsByProduct(selectedProductIdForVariants)

// Edit form for inline editing
const editForm = ref<UpdateOrderItemRequest>({
  quantity: 1,
  unitPrice: 0,
  discountAmount: 0,
  discountReason: '',
  note: ''
})

// Computed
const selectedProduct = computed(() => {
  if (!newItem.value.productId) return null
  return props.products.find(p => p.id === newItem.value.productId)
})

const selectedVariant = computed(() => {
  if (!newItem.value.productVariantId) return null
  return productVariants.value.find(v => v.id === newItem.value.productVariantId)
})

// Check if selected product has variants
const productHasVariants = computed(() => {
  if (!selectedProduct.value) return false
  return selectedProduct.value.hasVariants === true
})

const itemsTotal = computed(() => {
  if (!props.order?.items) return 0
  return props.order.items.reduce((sum, item) => sum + item.total, 0)
})

// Watchers
watch(() => newItem.value.productId, (productId) => {
  // Reset variant when product changes
  newItem.value.productVariantId = undefined
  if (productId) {
    const product = props.products.find(p => p.id === productId)
    if (product) {
      newItem.value.unitPrice = product.rate
    }
  }
})

// Update price when variant is selected
watch(() => newItem.value.productVariantId, (variantId) => {
  if (variantId) {
    const variant = productVariants.value.find(v => v.id === variantId)
    if (variant?.price) {
      newItem.value.unitPrice = variant.price
    }
  } else if (newItem.value.productId) {
    // Fallback to product price
    const product = props.products.find(p => p.id === newItem.value.productId)
    if (product) {
      newItem.value.unitPrice = product.rate
    }
  }
})

watch(() => props.show, (val) => {
  if (!val) {
    resetNewItem()
    editingItemId.value = null
  }
})

// Methods
const resetNewItem = () => {
  newItem.value = {
    productId: '',
    productVariantId: undefined,
    quantity: 1,
    unitPrice: undefined,
    discountAmount: 0,
    discountReason: '',
    note: ''
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)
}

const getProductName = (productId: string) => {
  const product = props.products.find(p => p.id === productId)
  return product?.name || productId
}

const handleAddItem = async () => {
  if (!props.order?.id || !newItem.value.productId) return

  // If product has variants, require variant selection
  if (productHasVariants.value && !newItem.value.productVariantId) {
    return
  }

  isSubmitting.value = true
  try {
    const result = await ordersWorkflow.addOrderItem(props.order.id, {
      orderId: props.order.id,  // Required by backend validation (must match URL orderId)
      productId: newItem.value.productId,
      productVariantId: newItem.value.productVariantId || undefined,
      quantity: newItem.value.quantity,
      unitPrice: newItem.value.unitPrice,
      discountAmount: newItem.value.discountAmount || 0,
      discountReason: newItem.value.discountReason || undefined,
      note: newItem.value.note || undefined
    })
    emit('itemAdded', result as string)
    resetNewItem()
  } finally {
    isSubmitting.value = false
  }
}

const startEditing = (item: OrderItem) => {
  editingItemId.value = item.id
  editForm.value = {
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discountAmount: item.discountAmount,
    discountReason: item.discountReason || '',
    note: item.note || ''
  }
}

const cancelEditing = () => {
  editingItemId.value = null
}

const handleUpdateItem = async (itemId: string) => {
  if (!props.order?.id) return

  isSubmitting.value = true
  try {
    const result = await ordersWorkflow.updateOrderItem(props.order.id, itemId, {
      orderId: props.order.id,       // Required by backend validation (must match URL orderId)
      orderItemId: itemId,           // Required by backend validation (must match URL itemId)
      quantity: editForm.value.quantity,
      unitPrice: editForm.value.unitPrice,
      discountAmount: editForm.value.discountAmount,
      discountReason: editForm.value.discountReason || undefined,
      note: editForm.value.note || undefined
    })
    emit('itemUpdated', result as string)
    editingItemId.value = null
  } finally {
    isSubmitting.value = false
  }
}

const handleRemoveItem = async (itemId: string) => {
  if (!props.order?.id) return

  isSubmitting.value = true
  try {
    await ordersWorkflow.removeOrderItem(props.order.id, itemId, {
      orderId: props.order.id,   // Required by backend validation (must match URL orderId)
      orderItemId: itemId        // Required by backend validation (must match URL itemId)
    })
    emit('itemRemoved', itemId)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <TransitionRoot :show="show" as="template">
    <Dialog class="relative z-50" @close="handleClose">
      <TransitionChild
        enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
          >
            <DialogPanel v-if="order" class="w-full max-w-3xl transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('orders.manageItems') }} - {{ order.code }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <!-- Existing Items -->
                <div class="rounded-lg border border-gray-200 dark:border-gray-700">
                  <div class="border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-700/50">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ t('orders.items') }}</h4>
                  </div>

                  <div v-if="order.items && order.items.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
                    <div v-for="item in order.items" :key="item.id" class="p-4">
                      <!-- View Mode -->
                      <div v-if="editingItemId !== item.id" class="flex items-center justify-between">
                        <div class="flex-1">
                          <div class="font-medium text-gray-900 dark:text-white">
                            {{ item.productName }}
                            <span v-if="item.variantName" class="text-sm font-normal text-gray-500">
                              - {{ item.variantName }}
                            </span>
                          </div>
                          <div v-if="item.variantSku" class="text-xs text-gray-400">
                            SKU: <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">{{ item.variantSku }}</code>
                          </div>
                          <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                            <span>{{ t('orders.quantity') }}: {{ item.quantity }}</span>
                            <span>{{ t('orders.price') }}: {{ formatCurrency(item.unitPrice) }}</span>
                            <span v-if="item.discountAmount > 0" class="text-red-600">
                              {{ t('orders.discount') }}: -{{ formatCurrency(item.discountAmount) }}
                            </span>
                            <span class="font-medium text-gray-900 dark:text-white">
                              {{ t('orders.total') }}: {{ formatCurrency(item.total) }}
                            </span>
                          </div>
                          <div v-if="item.note" class="mt-1 text-sm text-gray-400">
                            {{ item.note }}
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <button
                            type="button"
                            class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                            :disabled="isSubmitting"
                            @click="startEditing(item)"
                          >
                            <PencilIcon class="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                            :disabled="isSubmitting"
                            @click="handleRemoveItem(item.id)"
                          >
                            <TrashIcon class="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <!-- Edit Mode -->
                      <div v-else class="space-y-3">
                        <div class="font-medium text-gray-900 dark:text-white">{{ item.productName }}</div>
                        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          <div>
                            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('orders.quantity') }}</label>
                            <input
                              v-model.number="editForm.quantity"
                              type="number"
                              min="1"
                              class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('orders.price') }}</label>
                            <input
                              v-model.number="editForm.unitPrice"
                              type="number"
                              min="0"
                              step="0.01"
                              class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('orders.discount') }}</label>
                            <input
                              v-model.number="editForm.discountAmount"
                              type="number"
                              min="0"
                              step="0.01"
                              class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('orders.discountReason') }}</label>
                            <input
                              v-model="editForm.discountReason"
                              type="text"
                              class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('common.note') }}</label>
                            <input
                              v-model="editForm.note"
                              type="text"
                              class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                        <div class="flex justify-end gap-2">
                          <button
                            type="button"
                            class="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400"
                            :disabled="isSubmitting"
                            @click="cancelEditing"
                          >
                            <XMarkIcon class="h-4 w-4" />
                            {{ t('common.cancel') }}
                          </button>
                          <button
                            type="button"
                            class="inline-flex items-center gap-1 rounded-md bg-primary-600 px-2 py-1 text-sm text-white hover:bg-primary-700"
                            :disabled="isSubmitting"
                            @click="handleUpdateItem(item.id)"
                          >
                            <CheckIcon class="h-4 w-4" />
                            {{ t('common.save') }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {{ t('orders.noItems') }}
                  </div>

                  <!-- Items Total -->
                  <div class="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700/50">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600 dark:text-gray-400">{{ t('orders.itemsTotal') }}</span>
                      <span class="font-medium text-gray-900 dark:text-white">{{ formatCurrency(itemsTotal) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600 dark:text-gray-400">{{ t('orders.shipping') }}</span>
                      <span class="font-medium text-gray-900 dark:text-white">{{ formatCurrency(order.fees) }}</span>
                    </div>
                    <div class="mt-2 flex justify-between border-t border-gray-200 pt-2 dark:border-gray-600">
                      <span class="font-medium text-gray-900 dark:text-white">{{ t('orders.total') }}</span>
                      <span class="font-bold text-gray-900 dark:text-white">{{ formatCurrency(itemsTotal + (order.fees || 0)) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Add New Item -->
                <div class="rounded-lg border border-gray-200 dark:border-gray-700">
                  <div class="border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-700/50">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ t('orders.addItem') }}</h4>
                  </div>
                  <div class="p-4 space-y-3">
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('orders.product') }}</label>
                        <select
                          v-model="newItem.productId"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">{{ t('common.select') }}</option>
                          <option v-for="product in products" :key="product.id" :value="product.id">
                            {{ product.name }} - {{ formatCurrency(product.rate) }}
                            {{ product.hasVariants ? `(${product.variantCount || 0} ${t('products.variants').toLowerCase()})` : '' }}
                          </option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('orders.quantity') }}</label>
                        <input
                          v-model.number="newItem.quantity"
                          type="number"
                          min="1"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <!-- Variant Selection (shown only when product has variants) -->
                    <div v-if="productHasVariants" class="grid grid-cols-1 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">
                          {{ t('products.variant') }} *
                        </label>
                        <select
                          v-model="newItem.productVariantId"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          :class="{ 'border-red-300': productHasVariants && !newItem.productVariantId }"
                        >
                          <option value="">{{ isLoadingVariants ? t('common.loading') : t('common.select') }}</option>
                          <option v-for="variant in productVariants" :key="variant.id" :value="variant.id">
                            {{ variant.name }} ({{ variant.sku }})
                            {{ variant.price ? `- ${formatCurrency(variant.price)}` : '' }}
                          </option>
                        </select>
                        <p v-if="productHasVariants && !newItem.productVariantId" class="mt-1 text-xs text-red-500">
                          {{ t('products.variantRequired') || 'Please select a variant' }}
                        </p>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('orders.price') }}</label>
                        <input
                          v-model.number="newItem.unitPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          :placeholder="selectedProduct ? String(selectedProduct.rate) : ''"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('orders.discount') }}</label>
                        <input
                          v-model.number="newItem.discountAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('orders.discountReason') }}</label>
                        <input
                          v-model="newItem.discountReason"
                          type="text"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('common.note') }}</label>
                      <input
                        v-model="newItem.note"
                        type="text"
                        class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div class="flex justify-end">
                      <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                        :disabled="!newItem.productId || (productHasVariants && !newItem.productVariantId) || isSubmitting"
                        @click="handleAddItem"
                      >
                        <PlusIcon class="h-4 w-4" />
                        {{ t('orders.addItem') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex justify-end">
                <button
                  type="button"
                  class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                  @click="handleClose"
                >
                  {{ t('common.close') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
