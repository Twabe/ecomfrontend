<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { XMarkIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import type { OrderDto } from '~/api/generated/models'
import {
  useLegalInvoicesGenerateFromOrders,
  type GenerateLegalInvoiceFromOrdersRequest,
} from '~/services/legal-invoices/useLegalInvoicesService'

const props = defineProps<{
  show: boolean
  orders: OrderDto[]
}>()

const emit = defineEmits<{
  close: []
  success: [response: { legalInvoiceId: string; legalInvoiceCode: string }]
}>()

const { t } = useI18n()
const { notify } = useNotification()

// Form state
const form = ref({
  companyName: '',
  iceNumber: '',
  address: '',
})

// Mutation
const generateMutation = useLegalInvoicesGenerateFromOrders()

// Computed
const totalOrdersPrice = computed(() => {
  return props.orders.reduce((sum, order) => sum + (order.price || 0), 0)
})

const totalItemsCount = computed(() => {
  return props.orders.reduce(
    (sum, order) => sum + (order.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0),
    0
  )
})

const ordersWithLegalInvoice = computed(() => {
  return props.orders.filter((o) => o.isLegalInvoiced)
})

const canGenerate = computed(() => {
  return (
    form.value.companyName &&
    form.value.iceNumber &&
    form.value.iceNumber.length === 15 &&
    /^\d{15}$/.test(form.value.iceNumber) &&
    form.value.address &&
    ordersWithLegalInvoice.value.length === 0
  )
})

// Methods
const handleSubmit = async () => {
  if (!canGenerate.value) return

  const request: GenerateLegalInvoiceFromOrdersRequest = {
    orderIds: props.orders.map((o) => o.id!),
    companyName: form.value.companyName,
    iceNumber: form.value.iceNumber,
    address: form.value.address,
  }

  try {
    const response = await generateMutation.mutateAsync(request)

    if (response.errors && response.errors.length > 0) {
      notify({
        type: 'error',
        message: response.errors.join('\n'),
      })
      return
    }

    notify({
      type: 'success',
      message: t('legalInvoices.generatedSuccess', {
        code: response.legalInvoiceCode,
        count: response.ordersIncluded,
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
              class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
            >
              <div class="mb-4 flex items-center justify-between">
                <DialogTitle class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <DocumentTextIcon class="h-6 w-6 text-primary-600" />
                  {{ t('legalInvoices.createFromOrders') }}
                </DialogTitle>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-500"
                  @click="closeModal"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>

              <!-- Warning for already invoiced orders -->
              <div
                v-if="ordersWithLegalInvoice.length > 0"
                class="mb-4 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20"
              >
                <div class="flex">
                  <ExclamationTriangleIcon class="h-5 w-5 text-amber-400" />
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-amber-800 dark:text-amber-200">
                      {{ t('legalInvoices.alreadyInvoicedWarning') }}
                    </h3>
                    <div class="mt-2 text-sm text-amber-700 dark:text-amber-300">
                      <ul class="list-inside list-disc space-y-1">
                        <li v-for="order in ordersWithLegalInvoice" :key="order.id">
                          {{ order.code }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Summary -->
              <div class="mb-6 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <div class="text-center">
                  <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {{ orders.length }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ t('legalInvoices.ordersCount') }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                    {{ totalItemsCount }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ t('legalInvoices.itemsCount') }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {{ formatPrice(totalOrdersPrice) }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ t('legalInvoices.totalAmount') }}
                  </div>
                </div>
              </div>

              <!-- Orders List (collapsed) -->
              <details class="mb-6">
                <summary class="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ t('legalInvoices.viewOrders') }} ({{ orders.length }})
                </summary>
                <div class="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600">
                  <table class="min-w-full text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th class="px-3 py-2 text-left">{{ t('orders.code') }}</th>
                        <th class="px-3 py-2 text-left">{{ t('orders.customer') }}</th>
                        <th class="px-3 py-2 text-right">{{ t('orders.price') }}</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                      <tr
                        v-for="order in orders"
                        :key="order.id"
                        :class="{
                          'bg-amber-50 dark:bg-amber-900/20': order.isLegalInvoiced,
                        }"
                      >
                        <td class="px-3 py-2 font-mono text-primary-600 dark:text-primary-400">
                          {{ order.code }}
                        </td>
                        <td class="px-3 py-2">{{ order.fullName }}</td>
                        <td class="px-3 py-2 text-right">{{ formatPrice(order.price || 0) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </details>

              <!-- Form -->
              <form @submit.prevent="handleSubmit">
                <div class="space-y-4">
                  <!-- Company Name -->
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

                  <!-- ICE Number -->
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

                  <!-- Address -->
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

                <!-- Actions -->
                <div class="mt-6 flex justify-end gap-3">
                  <button type="button" class="btn-secondary" @click="closeModal">
                    {{ t('common.cancel') }}
                  </button>
                  <button
                    type="submit"
                    class="btn-primary"
                    :disabled="!canGenerate || generateMutation.isPending.value"
                  >
                    <span v-if="generateMutation.isPending.value">
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
