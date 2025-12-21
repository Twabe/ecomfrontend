<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
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
            <DialogPanel class="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
              <!-- Header -->
              <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ $t('customers.orderHistory') }}
                  </DialogTitle>
                  <p v-if="customer" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {{ customer.fullName }} - {{ customer.phone }}
                  </p>
                </div>
                <button @click="emit('close')" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                  <XMarkIcon class="w-5 h-5" />
                </button>
              </div>

              <!-- Content -->
              <div class="p-6 max-h-[60vh] overflow-y-auto">
                <!-- Loading -->
                <div v-if="isLoading" class="text-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p class="text-gray-500 dark:text-gray-400 mt-2">{{ $t('common.loading') }}</p>
                </div>

                <!-- No Orders -->
                <div v-else-if="orders.length === 0" class="text-center py-8">
                  <ShoppingCartIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p class="text-gray-500 dark:text-gray-400">{{ $t('customers.noOrders') }}</p>
                </div>

                <!-- Orders List -->
                <div v-else class="space-y-4">
                  <div
                    v-for="order in orders"
                    :key="order.id"
                    class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="font-mono font-semibold text-primary-600 dark:text-primary-400">{{ order.code }}</span>
                          <span :class="getStateClass(order.state)" class="px-2 py-0.5 text-xs font-medium rounded">
                            {{ order.state }}
                          </span>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {{ formatDate(order.createdOn) }}
                        </p>
                      </div>
                      <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {{ formatCurrency(order.price) }}
                      </p>
                    </div>

                    <!-- Order Items -->
                    <div class="bg-gray-50 dark:bg-gray-700/50 rounded p-3">
                      <div class="flex flex-wrap gap-2">
                        <div
                          v-for="item in order.items"
                          :key="item.id"
                          class="flex items-center gap-2 text-sm"
                        >
                          <span class="text-gray-600 dark:text-gray-400">{{ item.quantity }}x</span>
                          <span class="text-gray-900 dark:text-white">{{ item.productName }}</span>
                          <span v-if="order.items.indexOf(item) < order.items.length - 1" class="text-gray-400">|</span>
                        </div>
                      </div>
                    </div>

                    <!-- Order Details -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                      <div>
                        <span class="text-gray-500 dark:text-gray-400">{{ $t('customers.city') }}:</span>
                        <span class="ml-1 text-gray-900 dark:text-white">{{ order.cityName }}</span>
                      </div>
                      <div v-if="order.deliveryCompanyName">
                        <span class="text-gray-500 dark:text-gray-400">{{ $t('delivery.company') }}:</span>
                        <span class="ml-1 text-gray-900 dark:text-white">{{ order.deliveryCompanyName }}</span>
                      </div>
                      <div v-if="order.sourceName">
                        <span class="text-gray-500 dark:text-gray-400">{{ $t('orders.source') }}:</span>
                        <span class="ml-1 text-gray-900 dark:text-white">{{ order.sourceName }}</span>
                      </div>
                      <div>
                        <span class="text-gray-500 dark:text-gray-400">{{ $t('orders.shipping') }}:</span>
                        <span class="ml-1 text-gray-900 dark:text-white">{{ formatCurrency(order.fees) }}</span>
                      </div>
                    </div>

                    <!-- Note -->
                    <div v-if="order.note" class="mt-3 text-sm">
                      <span class="text-gray-500 dark:text-gray-400">{{ $t('orders.notes') }}:</span>
                      <p class="text-gray-900 dark:text-white mt-1">{{ order.note }}</p>
                    </div>
                  </div>
                </div>

                <!-- Pagination -->
                <div v-if="pagination.totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ $t('common.showing') }} {{ orders.length }} {{ $t('common.of') }} {{ pagination.totalCount }}
                  </p>
                  <div class="flex gap-2">
                    <button
                      @click="loadOrders(pagination.currentPage - 1)"
                      :disabled="pagination.currentPage === 1"
                      class="btn-secondary text-sm px-3 py-1"
                    >
                      {{ $t('common.previous') }}
                    </button>
                    <button
                      @click="loadOrders(pagination.currentPage + 1)"
                      :disabled="pagination.currentPage === pagination.totalPages"
                      class="btn-secondary text-sm px-3 py-1"
                    >
                      {{ $t('common.next') }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" class="btn-secondary" @click="emit('close')">
                  {{ $t('common.close') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/vue/24/outline'
import type { Customer } from '~/types/customer'
import type { Order } from '~/types/order'
import { OrderStateColors } from '~/types/order'

const props = defineProps<{
  isOpen: boolean
  customer: Customer | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { getCustomerOrders } = useCustomers()

const orders = ref<Order[]>([])
const isLoading = ref(false)
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  pageSize: 10
})

// Format helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount)
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStateClass = (state?: string) => {
  return OrderStateColors[state || ''] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

// Load orders
const loadOrders = async (page = 1) => {
  if (!props.customer?.id) return

  isLoading.value = true
  try {
    const response = await getCustomerOrders(props.customer.id, {
      pageNumber: page,
      pageSize: 10
    })
    orders.value = response.data
    pagination.value = {
      currentPage: response.currentPage,
      totalPages: response.totalPages,
      totalCount: response.totalCount,
      pageSize: response.pageSize
    }
  } finally {
    isLoading.value = false
  }
}

// Watch for modal open
watch(() => props.isOpen, (newValue) => {
  if (newValue && props.customer) {
    loadOrders()
  } else {
    orders.value = []
    pagination.value = {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      pageSize: 10
    }
  }
})
</script>
