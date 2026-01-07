<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { XMarkIcon, PlusIcon, TrashIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import { useProductVariantsByProduct, type ProductDto } from '~/services'
import {
  useLegalInvoicesCreateManual,
  type ManualLegalInvoiceItemDto,
} from '~/services/legal-invoices/useLegalInvoicesService'

const props = defineProps<{
  show: boolean
  products: ProductDto[]
}>()

const emit = defineEmits<{
  close: []
  success: [response: { legalInvoiceId: string; legalInvoiceCode: string }]
}>()

const { t } = useI18n()
const { notify } = useNotification()

// Mutation
const createManualMutation = useLegalInvoicesCreateManual()

// Form state
const form = ref({
  companyName: '',
  iceNumber: '',
  address: '',
})

// Items state
const items = ref<ManualLegalInvoiceItemDto[]>([])

// New item form
const newItem = ref({
  productId: '' as string | undefined,
  productVariantId: '' as string | undefined,
  productName: '',
  productReference: '' as string | undefined,
  variantName: '' as string | undefined,
  quantity: 1,
  unitPrice: 0,
})

// Variants for selected product
const selectedProductIdForVariants = computed(() => newItem.value.productId || undefined)
const { variants: productVariants, isLoading: isLoadingVariants } = useProductVariantsByProduct(selectedProductIdForVariants)

// Computed
const selectedProduct = computed(() => {
  if (!newItem.value.productId) return null
  return props.products.find(p => p.id === newItem.value.productId)
})

const productHasVariants = computed(() => {
  if (!selectedProduct.value) return false
  return selectedProduct.value.hasVariants === true
})

const totalAmount = computed(() => {
  return items.value.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
})

const canGenerate = computed(() => {
  return (
    form.value.companyName &&
    form.value.iceNumber &&
    form.value.iceNumber.length === 15 &&
    /^\d{15}$/.test(form.value.iceNumber) &&
    form.value.address &&
    items.value.length > 0
  )
})

const canAddItem = computed(() => {
  if (!newItem.value.productId) return false
  if (productHasVariants.value && !newItem.value.productVariantId) return false
  if (newItem.value.quantity <= 0) return false
  if (newItem.value.unitPrice < 0) return false
  return true
})

// Watchers
watch(() => newItem.value.productId, (productId) => {
  newItem.value.productVariantId = undefined
  newItem.value.variantName = undefined
  if (productId) {
    const product = props.products.find(p => p.id === productId)
    if (product) {
      newItem.value.productName = product.name
      newItem.value.productReference = product.reference || undefined
      newItem.value.unitPrice = product.rate || 0
    }
  } else {
    newItem.value.productName = ''
    newItem.value.productReference = undefined
    newItem.value.unitPrice = 0
  }
})

watch(() => newItem.value.productVariantId, (variantId) => {
  if (variantId) {
    const variant = productVariants.value.find(v => v.id === variantId)
    if (variant) {
      newItem.value.variantName = variant.name
      if (variant.price) {
        newItem.value.unitPrice = variant.price
      }
    }
  } else {
    newItem.value.variantName = undefined
    if (newItem.value.productId) {
      const product = props.products.find(p => p.id === newItem.value.productId)
      if (product) {
        newItem.value.unitPrice = product.rate || 0
      }
    }
  }
})

// Methods
const resetNewItem = () => {
  newItem.value = {
    productId: undefined,
    productVariantId: undefined,
    productName: '',
    productReference: undefined,
    variantName: undefined,
    quantity: 1,
    unitPrice: 0,
  }
}

const addItem = () => {
  if (!canAddItem.value) return

  items.value.push({
    productId: newItem.value.productId || null,
    productName: newItem.value.productName,
    productReference: newItem.value.productReference || null,
    variantName: newItem.value.variantName || null,
    quantity: newItem.value.quantity,
    unitPrice: newItem.value.unitPrice,
  })

  resetNewItem()
}

const removeItem = (index: number) => {
  items.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (!canGenerate.value) return

  try {
    const response = await createManualMutation.mutateAsync({
      companyName: form.value.companyName,
      iceNumber: form.value.iceNumber,
      address: form.value.address,
      items: items.value,
    })

    notify({
      type: 'success',
      message: t('legalInvoices.generatedSuccess', {
        code: response.legalInvoiceCode,
        count: response.itemsCount,
      }),
    })

    emit('success', {
      legalInvoiceId: response.legalInvoiceId,
      legalInvoiceCode: response.legalInvoiceCode,
    })

    closeModal()
  } catch (error: any) {
    notify({
      type: 'error',
      message: error.message || t('messages.error'),
    })
  }
}

const closeModal = () => {
  form.value = {
    companyName: '',
    iceNumber: '',
    address: '',
  }
  items.value = []
  resetNewItem()
  emit('close')
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
  }).format(price)
}
</script>

<template>
  <TransitionRoot :show="show" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
            >
              <div class="mb-4 flex items-center justify-between">
                <DialogTitle class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <DocumentTextIcon class="h-6 w-6 text-primary-600" />
                  {{ t('legalInvoices.createManual') }}
                </DialogTitle>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-500"
                  @click="closeModal"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>

              <form @submit.prevent="handleSubmit">
                <!-- Company Info -->
                <div class="mb-6 space-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ t('legalInvoices.companyInfo') }}</h4>
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label class="label">{{ t('legalInvoices.companyName') }} *</label>
                      <input
                        v-model="form.companyName"
                        type="text"
                        class="input"
                        :placeholder="t('legalInvoices.companyNamePlaceholder')"
                        required
                      />
                    </div>
                    <div>
                      <label class="label">{{ t('legalInvoices.iceNumber') }} *</label>
                      <input
                        v-model="form.iceNumber"
                        type="text"
                        class="input font-mono"
                        placeholder="000000000000000"
                        maxlength="15"
                        pattern="\d{15}"
                        required
                      />
                      <p class="mt-1 text-xs text-gray-500">
                        {{ t('legalInvoices.iceHelp') }}
                      </p>
                      <p
                        v-if="form.iceNumber && form.iceNumber.length !== 15"
                        class="mt-1 text-xs text-red-500"
                      >
                        {{ t('legalInvoices.iceLength', { current: form.iceNumber.length }) }}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label class="label">{{ t('common.address') }} *</label>
                    <textarea
                      v-model="form.address"
                      class="input"
                      rows="2"
                      :placeholder="t('legalInvoices.addressPlaceholder')"
                      required
                    ></textarea>
                  </div>
                </div>

                <!-- Items Section -->
                <div class="mb-6">
                  <h4 class="mb-3 font-medium text-gray-900 dark:text-white">{{ t('legalInvoices.items') }}</h4>

                  <!-- Add Item Form -->
                  <div class="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">
                          {{ t('nav.products') }} *
                        </label>
                        <select
                          v-model="newItem.productId"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">{{ t('common.select') }}</option>
                          <option v-for="product in products" :key="product.id" :value="product.id">
                            {{ product.name }} - {{ formatPrice(product.rate || 0) }}
                            {{ product.hasVariants ? `(${product.variantCount || 0} variants)` : '' }}
                          </option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">
                          {{ t('legalInvoices.quantity') }} *
                        </label>
                        <input
                          v-model.number="newItem.quantity"
                          type="number"
                          min="1"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">
                          {{ t('legalInvoices.unitPrice') }} *
                        </label>
                        <input
                          v-model.number="newItem.unitPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <!-- Variant Selection -->
                    <div v-if="productHasVariants" class="mt-3">
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
                          {{ variant.price ? `- ${formatPrice(variant.price)}` : '' }}
                        </option>
                      </select>
                    </div>

                    <div class="mt-3 flex justify-end">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                        :disabled="!canAddItem"
                        @click="addItem"
                      >
                        <PlusIcon class="h-4 w-4" />
                        {{ t('common.add') }}
                      </button>
                    </div>
                  </div>

                  <!-- Items Table -->
                  <div v-if="items.length > 0" class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                    <table class="min-w-full text-sm">
                      <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th class="px-3 py-2 text-left">{{ t('nav.products') }}</th>
                          <th class="px-3 py-2 text-right">{{ t('legalInvoices.quantity') }}</th>
                          <th class="px-3 py-2 text-right">{{ t('legalInvoices.unitPrice') }}</th>
                          <th class="px-3 py-2 text-right">{{ t('common.total') }}</th>
                          <th class="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                        <tr v-for="(item, index) in items" :key="index">
                          <td class="px-3 py-2">
                            <div>{{ item.productName }}</div>
                            <div v-if="item.variantName" class="text-xs text-gray-500">
                              {{ item.variantName }}
                            </div>
                          </td>
                          <td class="px-3 py-2 text-right">{{ item.quantity }}</td>
                          <td class="px-3 py-2 text-right">{{ formatPrice(item.unitPrice) }}</td>
                          <td class="px-3 py-2 text-right font-medium">
                            {{ formatPrice(item.quantity * item.unitPrice) }}
                          </td>
                          <td class="px-3 py-2 text-right">
                            <button
                              type="button"
                              class="text-red-500 hover:text-red-700"
                              @click="removeItem(index)"
                            >
                              <TrashIcon class="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                      <tfoot class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <td colspan="3" class="px-3 py-2 text-right font-medium">
                            {{ t('legalInvoices.totalAmount') }}:
                          </td>
                          <td class="px-3 py-2 text-right font-bold text-primary-600">
                            {{ formatPrice(totalAmount) }}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div v-else class="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
                    <p class="text-gray-500">{{ t('legalInvoices.noItems') }}</p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-3">
                  <button type="button" class="btn-secondary" @click="closeModal">
                    {{ t('common.cancel') }}
                  </button>
                  <button
                    type="submit"
                    class="btn-primary"
                    :disabled="!canGenerate || createManualMutation.isPending.value"
                  >
                    <span v-if="createManualMutation.isPending.value">
                      {{ t('common.loading') }}
                    </span>
                    <span v-else>
                      {{ t('legalInvoices.generate') }}
                    </span>
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
