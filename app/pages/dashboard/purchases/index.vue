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
              <DialogPanel class="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ editingPurchase ? $t('common.edit') : $t('common.create') }} {{ $t('nav.purchases') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <div class="space-y-4">
                    <!-- Header Info -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="label">{{ $t('purchases.code') }} *</label>
                        <input
                          v-model="form.code"
                          type="text"
                          class="input"
                          required
                          maxlength="50"
                          placeholder="ACH-001"
                        />
                      </div>

                      <div>
                        <label class="label">{{ $t('purchases.supplier') }} *</label>
                        <select v-model="form.supplierId" class="input" required>
                          <option value="">{{ $t('common.select') }}</option>
                          <option v-for="supplier in suppliersList" :key="supplier.id" :value="supplier.id">
                            {{ supplier.name }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="label">{{ $t('purchases.purchaseDate') }}</label>
                        <input
                          v-model="form.purchaseDate"
                          type="date"
                          class="input"
                        />
                      </div>

                      <div>
                        <label class="label">{{ $t('purchases.expectedDeliveryDate') }}</label>
                        <input
                          v-model="form.expectedDeliveryDate"
                          type="date"
                          class="input"
                        />
                      </div>
                    </div>

                    <div>
                      <label class="label">{{ $t('common.note') }}</label>
                      <textarea
                        v-model="form.note"
                        class="input"
                        rows="2"
                      ></textarea>
                    </div>

                    <!-- Items Section (Only for Create) -->
                    <div v-if="!editingPurchase" class="border-t dark:border-gray-700 pt-4">
                      <div class="flex items-center justify-between mb-3">
                        <h3 class="font-medium text-gray-900 dark:text-white">{{ $t('purchases.items') }}</h3>
                        <button type="button" class="btn-secondary text-sm" @click="addItem">
                          <PlusIcon class="w-4 h-4 mr-1" />
                          {{ $t('purchases.addItem') }}
                        </button>
                      </div>

                      <div v-if="form.items.length === 0" class="text-center py-4 text-gray-500">
                        {{ $t('purchases.noItems') }}
                      </div>

                      <div v-else class="space-y-3">
                        <div v-for="(item, index) in form.items" :key="index" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div class="grid grid-cols-12 gap-3">
                            <div class="col-span-5">
                              <label class="text-xs text-gray-500">{{ $t('stocks.product') }}</label>
                              <select
                                v-model="item.productId"
                                class="input text-sm"
                                required
                                @change="item.productVariantId = undefined; currentItemIndexForVariants = index"
                              >
                                <option value="">{{ $t('common.select') }}</option>
                                <option v-for="product in productsList" :key="product.id" :value="product.id">
                                  {{ product.name }}
                                  {{ product.hasVariants ? `(${product.variantCount || 0} variants)` : '' }}
                                </option>
                              </select>
                            </div>
                            <div class="col-span-2">
                              <label class="text-xs text-gray-500">{{ $t('stocks.quantity') }}</label>
                              <input
                                v-model.number="item.quantity"
                                type="number"
                                class="input text-sm"
                                min="1"
                                required
                              />
                            </div>
                            <div class="col-span-2">
                              <label class="text-xs text-gray-500">{{ $t('purchases.unitCost') }}</label>
                              <input
                                v-model.number="item.unitCost"
                                type="number"
                                class="input text-sm"
                                min="0"
                                step="0.01"
                                required
                              />
                            </div>
                            <div class="col-span-2">
                              <label class="text-xs text-gray-500">{{ $t('purchases.total') }}</label>
                              <div class="input bg-gray-100 dark:bg-gray-600 text-sm">
                                {{ (item.quantity * item.unitCost).toFixed(2) }}
                              </div>
                            </div>
                            <div class="col-span-1 flex items-end">
                              <button
                                type="button"
                                class="p-2 text-red-500 hover:text-red-700"
                                @click="removeItem(index)"
                              >
                                <TrashIcon class="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <!-- Variant Selection Row (shown when product has variants) -->
                          <div v-if="item.productId && getProductHasVariants(item.productId)" class="mt-2 grid grid-cols-12 gap-3">
                            <div class="col-span-5">
                              <label class="text-xs text-gray-500">
                                {{ $t('products.variant') || 'Variant' }} <span class="text-red-500">*</span>
                              </label>
                              <select
                                v-model="item.productVariantId"
                                class="input text-sm"
                                :class="{ 'border-red-300': !item.productVariantId }"
                                required
                                @focus="currentItemIndexForVariants = index"
                              >
                                <option :value="undefined">
                                  {{ currentItemIndexForVariants === index && isLoadingVariants ? $t('common.loading') : $t('common.select') }}
                                </option>
                                <template v-if="currentItemIndexForVariants === index">
                                  <option v-for="variant in currentProductVariants" :key="variant.id" :value="variant.id">
                                    {{ variant.name }} ({{ variant.sku }})
                                    {{ variant.buyingPrice ? `- ${variant.buyingPrice.toFixed(2)}` : '' }}
                                  </option>
                                </template>
                              </select>
                              <p v-if="!item.productVariantId" class="mt-1 text-xs text-red-500">
                                {{ $t('products.variantRequired') || 'Please select a variant' }}
                              </p>
                            </div>
                          </div>
                        </div>

                        <!-- Total -->
                        <div class="flex justify-end pt-2 border-t dark:border-gray-600">
                          <div class="text-right">
                            <span class="text-gray-500">{{ $t('purchases.totalCost') }}:</span>
                            <span class="ml-2 text-lg font-bold text-gray-900 dark:text-white">
                              {{ calculateTotal().toFixed(2) }}
                            </span>
                          </div>
                        </div>
                      </div>
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

    <!-- Receive Purchase Modal -->
    <TransitionRoot :show="showReceiveModal" as="template">
      <Dialog as="div" class="relative z-50" @close="showReceiveModal = false">
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
                  {{ $t('purchases.receiveTitle') }}
                </DialogTitle>

                <div v-if="receivingPurchase" class="mb-4">
                  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-medium text-gray-900 dark:text-white">{{ receivingPurchase.code }}</span>
                      <span class="text-sm text-gray-500">{{ receivingPurchase.supplierName }}</span>
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ receivingPurchase.items?.length ?? 0 }} {{ $t('purchases.items') }} -
                      <span class="font-medium">{{ (receivingPurchase.totalCost ?? 0).toFixed(2) }}</span>
                    </div>
                  </div>

                  <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                    <div class="flex items-start gap-2">
                      <InformationCircleIcon class="w-5 h-5 text-blue-500 mt-0.5" />
                      <p class="text-sm text-blue-700 dark:text-blue-300">
                        {{ $t('purchases.receiveStockNote') }}
                      </p>
                    </div>
                  </div>
                </div>

                <form @submit.prevent="submitReceive">
                  <div class="space-y-4">
                    <div>
                      <label class="label">{{ $t('purchases.actualDeliveryDate') }}</label>
                      <input
                        v-model="receiveForm.actualDeliveryDate"
                        type="date"
                        class="input"
                      />
                    </div>

                    <div>
                      <label class="label">{{ $t('purchases.receiveComment') }}</label>
                      <textarea
                        v-model="receiveForm.comment"
                        class="input"
                        rows="2"
                        :placeholder="$t('purchases.receiveCommentPlaceholder')"
                      ></textarea>
                    </div>
                  </div>

                  <div class="flex justify-end gap-3 mt-6">
                    <button type="button" class="btn-secondary" @click="showReceiveModal = false">
                      {{ $t('common.cancel') }}
                    </button>
                    <button type="submit" class="btn-primary bg-green-600 hover:bg-green-700" :disabled="isMutating">
                      <ArchiveBoxArrowDownIcon class="w-5 h-5 mr-2" />
                      {{ isMutating ? $t('common.loading') : $t('purchases.receiveAndUpdateStock') }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- View Details Modal -->
    <TransitionRoot :show="showViewModal" as="template">
      <Dialog as="div" class="relative z-50" @close="showViewModal = false">
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
              <DialogPanel class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ $t('purchases.details') }} - {{ viewingPurchase?.code }}
                </DialogTitle>

                <div v-if="viewingPurchase" class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <span class="text-sm text-gray-500">{{ $t('purchases.supplier') }}</span>
                      <p class="font-medium">{{ viewingPurchase.supplierName }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">{{ $t('common.status') }}</span>
                      <p>
                        <span :class="getStatusClass(viewingPurchase.status)">
                          {{ viewingPurchase.status }}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">{{ $t('purchases.purchaseDate') }}</span>
                      <p class="font-medium">{{ formatDate(viewingPurchase.purchaseDate) }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">{{ $t('purchases.totalCost') }}</span>
                      <p class="font-bold text-lg">{{ (viewingPurchase.totalCost ?? 0).toFixed(2) }}</p>
                    </div>
                  </div>

                  <!-- Items -->
                  <div class="border-t dark:border-gray-700 pt-4">
                    <h3 class="font-medium text-gray-900 dark:text-white mb-3">{{ $t('purchases.items') }}</h3>
                    <table class="min-w-full text-sm">
                      <thead>
                        <tr class="border-b dark:border-gray-700">
                          <th class="text-left py-2">{{ $t('stocks.product') }}</th>
                          <th class="text-center py-2">{{ $t('stocks.quantity') }}</th>
                          <th class="text-right py-2">{{ $t('purchases.unitCost') }}</th>
                          <th class="text-right py-2">{{ $t('purchases.total') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in viewingPurchase.items" :key="item.id" class="border-b dark:border-gray-700">
                          <td class="py-2">
                            <div>
                              {{ item.productName }}
                              <span v-if="item.productReference" class="text-gray-500 text-xs">({{ item.productReference }})</span>
                            </div>
                            <div v-if="item.variantName" class="text-sm text-gray-500 dark:text-gray-400">
                              {{ item.variantName }}
                              <span v-if="item.variantSku" class="text-xs">
                                - <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">{{ item.variantSku }}</code>
                              </span>
                            </div>
                          </td>
                          <td class="py-2 text-center">{{ item.quantity }}</td>
                          <td class="py-2 text-right">{{ (item.unitCost ?? 0).toFixed(2) }}</td>
                          <td class="py-2 text-right font-medium">{{ (item.total ?? 0).toFixed(2) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="flex justify-end mt-6">
                  <button type="button" class="btn-secondary" @click="showViewModal = false">
                    {{ $t('common.cancel') }}
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.purchases') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.purchases') }}</p>
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
        <select v-model="filterSupplier" class="input" @change="applyFilters">
          <option value="">{{ $t('common.all') }} {{ $t('nav.suppliers') }}</option>
          <option v-for="supplier in suppliersList" :key="supplier.id" :value="supplier.id">
            {{ supplier.name }}
          </option>
        </select>
        <select v-model="filterStatus" class="input" @change="applyFilters">
          <option value="">{{ $t('common.all') }} {{ $t('common.status') }}</option>
          <option v-for="status in statusOptions" :key="status" :value="status">
            {{ status }}
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

      <div v-else-if="purchases.length === 0" class="text-center py-12">
        <ShoppingCartIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('purchases.code') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('purchases.supplier') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('purchases.purchaseDate') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('purchases.items') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('purchases.totalCost') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.status') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="purchase in purchases" :key="purchase.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <button
                  @click="openViewModal(purchase)"
                  class="font-medium text-primary-600 hover:underline"
                >
                  {{ purchase.code }}
                </button>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-900 dark:text-white">{{ purchase.supplierName }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-600 dark:text-gray-300">{{ formatDate(purchase.purchaseDate) }}</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="text-gray-900 dark:text-white">{{ purchase.items?.length ?? 0 }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="font-medium text-gray-900 dark:text-white">{{ (purchase.totalCost ?? 0).toFixed(2) }}</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span :class="getStatusClass(purchase.status)">
                  {{ purchase.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <!-- Status actions -->
                  <button
                    v-if="purchase.status === 'Pending'"
                    @click="handleConfirm(purchase)"
                    class="p-2 text-blue-500 hover:text-blue-700"
                    :title="$t('purchases.confirm')"
                  >
                    <CheckIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="purchase.status === 'Confirmed'"
                    @click="handleShip(purchase)"
                    class="p-2 text-purple-500 hover:text-purple-700"
                    :title="$t('purchases.markShipped')"
                  >
                    <TruckIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="purchase.status === 'Shipped'"
                    @click="handleReceive(purchase)"
                    class="p-2 text-green-500 hover:text-green-700"
                    :title="$t('purchases.markReceived')"
                  >
                    <ArchiveBoxArrowDownIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="purchase.status !== 'Cancelled' && purchase.status !== 'Received'"
                    @click="handleCancel(purchase)"
                    class="p-2 text-red-500 hover:text-red-700"
                    :title="$t('purchases.cancel')"
                  >
                    <XCircleIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="openEditModal(purchase)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(purchase)"
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
import {
  PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, ShoppingCartIcon,
  CheckIcon, TruckIcon, ArchiveBoxArrowDownIcon, XCircleIcon, InformationCircleIcon
} from '@heroicons/vue/24/outline'
import { usePurchasesService, useSuppliersService, useProductsService, useProductVariantsByProduct, type PurchaseDto, type ProductDto } from '~/services'
import { PurchaseStatuses } from '~/types/purchase'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Purchases.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Purchases service with all operations
const {
  items: purchases,
  pagination,
  isLoading,
  isMutating,
  setPage,
  setKeyword,
  setFilters,
  create,
  update,
  remove,
  confirmPurchase,
  markAsShipped,
  cancelPurchase,
  receivePurchase,
} = usePurchasesService()

// Dropdowns data from services (auto-fetch)
const { items: suppliersList } = useSuppliersService()
const { items: productsList } = useProductsService()
const statusOptions = Object.values(PurchaseStatuses)

// Modal state
const showModal = ref(false)
const showViewModal = ref(false)
const showReceiveModal = ref(false)
const editingPurchase = ref<PurchaseDto | null>(null)
const viewingPurchase = ref<PurchaseDto | null>(null)
const receivingPurchase = ref<PurchaseDto | null>(null)

// Receive form
const receiveForm = ref({
  actualDeliveryDate: new Date().toISOString().split('T')[0],
  comment: ''
})

// Filters
const searchKeyword = ref('')
const filterSupplier = ref('')
const filterStatus = ref('')

interface FormItem {
  productId: string
  productVariantId?: string
  quantity: number
  unitCost: number
  note?: string
}

// Track which item index is being edited for variant loading
const currentItemIndexForVariants = ref<number | null>(null)
const currentProductIdForVariants = computed(() => {
  if (currentItemIndexForVariants.value === null) return undefined
  const item = form.value.items[currentItemIndexForVariants.value]
  return item?.productId || undefined
})
const { variants: currentProductVariants, isLoading: isLoadingVariants } = useProductVariantsByProduct(currentProductIdForVariants)

// Helper to check if a product has variants
const getProductHasVariants = (productId: string): boolean => {
  const product = productsList.value.find((p: ProductDto) => p.id === productId)
  return product?.hasVariants === true
}

// Helper to get product variant count
const getProductVariantCount = (productId: string): number => {
  const product = productsList.value.find((p: ProductDto) => p.id === productId)
  return product?.variantCount || 0
}

const defaultForm = () => ({
  code: '',
  supplierId: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  expectedDeliveryDate: '',
  note: '',
  items: [] as FormItem[]
})

const form = ref(defaultForm())

// Generate unique purchase code: ACH-YYYYMMDD-XXX
const generatePurchaseCode = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `ACH-${year}${month}${day}-${random}`
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
    supplierId: filterSupplier.value || undefined,
    status: filterStatus.value || undefined
  })
}

// Open create modal
const openCreateModal = () => {
  editingPurchase.value = null
  form.value = defaultForm()
  form.value.code = generatePurchaseCode() // Auto-generate code
  showModal.value = true
}

// Open edit modal
const openEditModal = (purchase: PurchaseDto) => {
  editingPurchase.value = purchase
  form.value = {
    code: purchase.code || '',
    supplierId: purchase.supplierId || '',
    purchaseDate: purchase.purchaseDate?.split('T')[0] || '',
    expectedDeliveryDate: purchase.expectedDeliveryDate?.split('T')[0] || '',
    note: purchase.note || '',
    items: []
  }
  showModal.value = true
}

// Open view modal
const openViewModal = (purchase: PurchaseDto) => {
  viewingPurchase.value = purchase
  showViewModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingPurchase.value = null
}

// Add item
const addItem = () => {
  form.value.items.push({
    productId: '',
    quantity: 1,
    unitCost: 0
  })
}

// Remove item
const removeItem = (index: number) => {
  form.value.items.splice(index, 1)
}

// Calculate total
const calculateTotal = () => {
  return form.value.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
}

// Format date
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

// Get status class
const getStatusClass = (status?: string) => {
  const baseClass = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'
  switch (status) {
    case 'Pending':
      return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`
    case 'Confirmed':
      return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`
    case 'Shipped':
      return `${baseClass} bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400`
    case 'Received':
      return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`
    case 'Cancelled':
      return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`
    default:
      return `${baseClass} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.code.trim() || !form.value.supplierId) return

  try {
    if (editingPurchase.value) {
      await update(editingPurchase.value.id!, {
        id: editingPurchase.value.id!,
        code: form.value.code,
        supplierId: form.value.supplierId,
        purchaseDate: form.value.purchaseDate,
        expectedDeliveryDate: form.value.expectedDeliveryDate || undefined,
        note: form.value.note || undefined
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      if (form.value.items.length === 0) {
        notify({ type: 'error', message: t('purchases.itemsRequired') })
        return
      }

      // Validate that all items with variants have a variant selected
      const invalidItems = form.value.items.filter(item =>
        item.productId && getProductHasVariants(item.productId) && !item.productVariantId
      )
      if (invalidItems.length > 0) {
        notify({ type: 'error', message: t('products.variantRequired') || 'Please select a variant for all products with variants' })
        return
      }

      await create({
        code: form.value.code,
        supplierId: form.value.supplierId,
        purchaseDate: form.value.purchaseDate,
        expectedDeliveryDate: form.value.expectedDeliveryDate || undefined,
        note: form.value.note || undefined,
        items: form.value.items.map(item => ({
          productId: item.productId,
          productVariantId: item.productVariantId || undefined,
          quantity: item.quantity,
          unitCost: item.unitCost,
          note: item.note
        }))
      })
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Status actions
const handleConfirm = async (purchase: PurchaseDto) => {
  if (confirm(t('purchases.confirmAction'))) {
    try {
      await confirmPurchase(purchase.id!)
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}

const handleShip = async (purchase: PurchaseDto) => {
  if (confirm(t('purchases.shipAction'))) {
    try {
      await markAsShipped(purchase.id!)
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}

const handleReceive = (purchase: PurchaseDto) => {
  receivingPurchase.value = purchase
  receiveForm.value = {
    actualDeliveryDate: new Date().toISOString().split('T')[0],
    comment: ''
  }
  showReceiveModal.value = true
}

const submitReceive = async () => {
  if (!receivingPurchase.value) return

  try {
    await receivePurchase(receivingPurchase.value.id!, {
      actualDeliveryDate: receiveForm.value.actualDeliveryDate || undefined,
      comment: receiveForm.value.comment || undefined
    })
    notify({ type: 'success', message: t('messages.updateSuccess') })
    showReceiveModal.value = false
    receivingPurchase.value = null
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleCancel = async (purchase: PurchaseDto) => {
  if (confirm(t('purchases.cancelAction'))) {
    try {
      await cancelPurchase(purchase.id!)
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}

// Handle delete
const handleDelete = async (purchase: PurchaseDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await remove(purchase.id!)
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}
</script>
