<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { Order } from '~/types/order'
import { OrderStateColors, OrderPhaseColors } from '~/types/order'

const props = defineProps<{
  show: boolean
  order: Order | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const getStateColor = (state: string) => OrderStateColors[state?.toLowerCase()] || 'bg-gray-100 text-gray-800'
const getPhaseColor = (phase: string) => OrderPhaseColors[phase?.toLowerCase()] || 'bg-gray-100 text-gray-800'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)
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
            <DialogPanel v-if="order" class="w-full max-w-2xl transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('orders.orderDetails') }} - {{ order.code }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <!-- Status badges -->
                <div class="flex gap-2">
                  <span class="inline-flex rounded-full px-2 py-1 text-xs font-medium" :class="getPhaseColor(order.phase || '')">
                    {{ order.phase }}
                  </span>
                  <span class="inline-flex rounded-full px-2 py-1 text-xs font-medium" :class="getStateColor(order.state || '')">
                    {{ order.state || 'new' }}
                  </span>
                  <span v-if="order.isBlacklisted" class="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                    Blacklisted
                  </span>
                </div>

                <!-- Customer Info -->
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ t('orders.customer') }}</h4>
                  <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div><span class="text-gray-500">{{ t('common.name') }}:</span> {{ order.fullName }}</div>
                    <div><span class="text-gray-500">{{ t('orders.phone') }}:</span> {{ order.phone }}</div>
                    <div v-if="order.sourceCity">
                      <span class="text-gray-500">{{ t('orders.sourceCity', 'Ville (source)') }}:</span>
                      <span class="text-amber-600 dark:text-amber-400">{{ order.sourceCity }}</span>
                    </div>
                    <div v-if="order.deliveryLocationName">
                      <span class="text-gray-500">{{ t('orders.deliveryCity', 'Ville livraison') }}:</span>
                      <span class="text-green-600 dark:text-green-400">{{ order.deliveryLocationName }}</span>
                    </div>
                    <div v-else-if="order.cityName">
                      <span class="text-gray-500">{{ t('orders.city') }}:</span> {{ order.cityName }}
                    </div>
                    <div class="col-span-2"><span class="text-gray-500">{{ t('common.address') }}:</span> {{ order.address }}</div>
                  </div>
                </div>

                <!-- Items -->
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ t('orders.items') }}</h4>
                  <div class="mt-2 space-y-2">
                    <div v-for="item in order.items" :key="item.id" class="flex justify-between text-sm">
                      <div class="flex-1">
                        <span>{{ item.productName }}</span>
                        <span v-if="item.variantName" class="text-gray-500 dark:text-gray-400"> - {{ item.variantName }}</span>
                        <span class="text-gray-500 dark:text-gray-400"> x{{ item.quantity }}</span>
                        <div v-if="item.variantSku" class="text-xs text-gray-400">
                          SKU: {{ item.variantSku }}
                        </div>
                      </div>
                      <span class="font-medium">{{ formatCurrency(item.total) }}</span>
                    </div>
                  </div>
                  <div class="mt-3 border-t border-gray-200 pt-3 dark:border-gray-600">
                    <div class="flex justify-between text-sm">
                      <span>{{ t('orders.shipping') }}</span>
                      <span>{{ formatCurrency(order.fees) }}</span>
                    </div>
                    <div class="flex justify-between font-medium">
                      <span>{{ t('orders.total') }}</span>
                      <span>{{ formatCurrency(order.price) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Delivery Info -->
                <div v-if="order.deliveryCompanyName" class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ t('nav.delivery') }}</h4>
                  <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div><span class="text-gray-500">{{ t('nav.deliveryCompanies') }}:</span> {{ order.deliveryCompanyName }}</div>
                    <div v-if="order.trackingCode">
                      <span class="text-gray-500">{{ t('orders.trackingCode') }}:</span> {{ order.trackingCode }}
                    </div>
                    <div v-if="order.deliveryStatus">
                      <span class="text-gray-500">{{ t('orders.deliveryStatus') }}:</span> {{ order.deliveryStatus }}
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
