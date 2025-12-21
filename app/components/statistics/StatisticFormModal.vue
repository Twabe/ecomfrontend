<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { Statistic, CreateStatisticRequest, UpdateStatisticRequest } from '~/types/statistic'
import type { DeliveryCompany } from '~/types/deliveryCompany'
import type { City } from '~/types/city'
import type { Product } from '~/types/product'

const props = defineProps<{
  show: boolean
  statistic: Statistic | null
  deliveryCompanies: DeliveryCompany[]
  cities: City[]
  products: Product[]
}>()

const emit = defineEmits<{
  close: []
  create: [data: CreateStatisticRequest]
  update: [id: string, data: UpdateStatisticRequest]
}>()

const { t } = useI18n()

const isEditMode = computed(() => !!props.statistic)

const formData = ref<CreateStatisticRequest>({
  deliveredCount: 0,
  canceledCount: 0,
  deliveryCompanyId: undefined,
  cityId: undefined,
  productId: undefined,
  workerId: undefined
})

watch(() => props.show, (val) => {
  if (val) {
    if (props.statistic) {
      formData.value = {
        deliveredCount: props.statistic.deliveredCount,
        canceledCount: props.statistic.canceledCount,
        deliveryCompanyId: props.statistic.deliveryCompanyId || undefined,
        cityId: props.statistic.cityId || undefined,
        productId: props.statistic.productId || undefined,
        workerId: props.statistic.workerId || undefined
      }
    } else {
      formData.value = {
        deliveredCount: 0,
        canceledCount: 0,
        deliveryCompanyId: undefined,
        cityId: undefined,
        productId: undefined,
        workerId: undefined
      }
    }
  }
})

const handleSubmit = () => {
  if (isEditMode.value && props.statistic) {
    emit('update', props.statistic.id, formData.value)
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
                {{ isEditMode ? t('statistics.editStatistic') : t('statistics.createStatistic') }}
              </DialogTitle>

              <form class="mt-4 space-y-4" @submit.prevent="handleSubmit">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('statistics.delivered') }} *
                    </label>
                    <input
                      v-model.number="formData.deliveredCount"
                      type="number"
                      min="0"
                      required
                      class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('statistics.canceled') }} *
                    </label>
                    <input
                      v-model.number="formData.canceledCount"
                      type="number"
                      min="0"
                      required
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
                    {{ t('nav.cities') }}
                  </label>
                  <select
                    v-model="formData.cityId"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option :value="undefined">{{ t('common.select') }}</option>
                    <option v-for="city in cities" :key="city.id" :value="city.id">{{ city.name }}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('nav.products') }}
                  </label>
                  <select
                    v-model="formData.productId"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option :value="undefined">{{ t('common.select') }}</option>
                    <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
                  </select>
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
                    {{ isEditMode ? t('common.save') : t('common.create') }}
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
