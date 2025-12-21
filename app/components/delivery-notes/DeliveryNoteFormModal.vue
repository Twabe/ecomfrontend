<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { DeliveryNote, CreateDeliveryNoteRequest, UpdateDeliveryNoteRequest } from '~/types/deliveryNote'
import type { DeliveryCompany } from '~/types/deliveryCompany'
import type { SubDeliveryCompany } from '~/types/subDeliveryCompany'

const props = defineProps<{
  show: boolean
  deliveryNote: DeliveryNote | null
  deliveryCompanies: DeliveryCompany[]
  subDeliveryCompanies: SubDeliveryCompany[]
}>()

const emit = defineEmits<{
  close: []
  create: [data: CreateDeliveryNoteRequest]
  update: [id: string, data: UpdateDeliveryNoteRequest]
}>()

const { t } = useI18n()

const isEditMode = computed(() => !!props.deliveryNote)

const formData = ref<CreateDeliveryNoteRequest>({
  code: '',
  deliveryCompanyId: '',
  subDeliveryCompanyId: undefined
})

watch(() => props.show, (val) => {
  if (val) {
    if (props.deliveryNote) {
      formData.value = {
        code: props.deliveryNote.code,
        deliveryCompanyId: props.deliveryNote.deliveryCompanyId,
        subDeliveryCompanyId: props.deliveryNote.subDeliveryCompanyId || undefined
      }
    } else {
      formData.value = {
        code: '',
        deliveryCompanyId: '',
        subDeliveryCompanyId: undefined
      }
    }
  }
})

const handleSubmit = () => {
  if (isEditMode.value && props.deliveryNote) {
    emit('update', props.deliveryNote.id, formData.value)
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
                {{ isEditMode ? t('deliveryNotes.editNote') : t('deliveryNotes.createNote') }}
              </DialogTitle>

              <form class="mt-4 space-y-4" @submit.prevent="handleSubmit">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('deliveryNotes.code') }} *
                  </label>
                  <input
                    v-model="formData.code"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('nav.deliveryCompanies') }} *
                  </label>
                  <select
                    v-model="formData.deliveryCompanyId"
                    required
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{{ t('common.select') }}</option>
                    <option v-for="dc in deliveryCompanies" :key="dc.id" :value="dc.id">{{ dc.name }}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('nav.subDeliveryCompanies') }}
                  </label>
                  <select
                    v-model="formData.subDeliveryCompanyId"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option :value="undefined">{{ t('common.select') }}</option>
                    <option v-for="sdc in subDeliveryCompanies" :key="sdc.id" :value="sdc.id">{{ sdc.name }}</option>
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
