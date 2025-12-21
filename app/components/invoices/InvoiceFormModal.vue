<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { Invoice, CreateInvoiceRequest, UpdateInvoiceRequest } from '~/types/invoice'
import type { DeliveryCompany } from '~/types/deliveryCompany'
import type { Store } from '~/types/store'

const props = defineProps<{
  show: boolean
  invoice: Invoice | null
  deliveryCompanies: DeliveryCompany[]
  stores: Store[]
}>()

const emit = defineEmits<{
  close: []
  create: [data: CreateInvoiceRequest]
  update: [id: string, data: UpdateInvoiceRequest]
}>()

const { t } = useI18n()

const isEditMode = computed(() => !!props.invoice)

const formData = ref<CreateInvoiceRequest>({
  code: '',
  ordersCount: 0,
  totalPrice: 0,
  deliveryCompanyId: undefined,
  storeId: undefined,
  dateCreated: undefined,
  note: undefined
})

watch(() => props.show, (val) => {
  if (val) {
    if (props.invoice) {
      formData.value = {
        code: props.invoice.code,
        ordersCount: props.invoice.ordersCount,
        totalPrice: props.invoice.totalPrice,
        deliveryCompanyId: props.invoice.deliveryCompanyId || undefined,
        storeId: props.invoice.storeId || undefined,
        dateCreated: props.invoice.dateCreated || undefined,
        note: props.invoice.note || undefined
      }
    } else {
      formData.value = {
        code: '',
        ordersCount: 0,
        totalPrice: 0,
        deliveryCompanyId: undefined,
        storeId: undefined,
        dateCreated: undefined,
        note: undefined
      }
    }
  }
})

const handleSubmit = () => {
  if (isEditMode.value && props.invoice) {
    emit('update', props.invoice.id, formData.value)
  } else {
    emit('create', formData.value)
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
            <DialogPanel class="w-full max-w-lg transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ isEditMode ? t('invoices.editInvoice') : t('invoices.createInvoice') }}
              </DialogTitle>

              <form class="mt-4 space-y-4" @submit.prevent="handleSubmit">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('invoices.code') }} *
                  </label>
                  <input
                    v-model="formData.code"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('invoices.ordersCount') }}
                    </label>
                    <input
                      v-model.number="formData.ordersCount"
                      type="number"
                      min="0"
                      class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('invoices.totalPrice') }}
                    </label>
                    <input
                      v-model.number="formData.totalPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('nav.deliveryCompanies') }}
                  </label>
                  <select
                    v-model="formData.deliveryCompanyId"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option :value="undefined">{{ t('common.select') }}</option>
                    <option v-for="dc in deliveryCompanies" :key="dc.id" :value="dc.id">{{ dc.name }}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('nav.stores') }}
                  </label>
                  <select
                    v-model="formData.storeId"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option :value="undefined">{{ t('common.select') }}</option>
                    <option v-for="store in stores" :key="store.id" :value="store.id">{{ store.name }}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('invoices.dateCreated') }}
                  </label>
                  <input
                    v-model="formData.dateCreated"
                    type="date"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('common.note') }}
                  </label>
                  <textarea
                    v-model="formData.note"
                    rows="3"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div class="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                    @click="handleClose"
                  >
                    {{ t('common.cancel') }}
                  </button>
                  <button
                    type="submit"
                    class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    {{ isEditMode ? t('common.update') : t('common.create') }}
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
