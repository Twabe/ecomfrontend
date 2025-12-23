<script setup lang="ts">
import {
  TruckIcon,
  ArrowUturnLeftIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ArchiveBoxIcon,
  ArchiveBoxXMarkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  selectedCount: number
  isShippingPhase?: boolean
  isConfirmationPhase?: boolean
  isArchivedFilter?: boolean | null
}>()

const emit = defineEmits<{
  markDelivered: []
  markReturned: []
  assignDelivery: []
  assignWorker: []
  archive: []
  unarchive: []
  bulkConfirm: []
  bulkCancel: []
}>()

const { t } = useI18n()
</script>

<template>
  <div v-if="selectedCount > 0" class="flex flex-wrap items-center gap-4 rounded-lg bg-primary-50 px-4 py-3 dark:bg-primary-900/20">
    <span class="text-sm font-medium text-primary-700 dark:text-primary-300">
      {{ selectedCount }} {{ t('common.selected') }}
    </span>
    <div class="flex flex-wrap gap-2">
      <!-- Confirm/Cancel buttons - only show in confirmation phase -->
      <template v-if="isConfirmationPhase">
        <button
          class="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
          @click="emit('bulkConfirm')"
        >
          <CheckCircleIcon class="h-4 w-4" />
          {{ t('orders.confirmOrder') }}
        </button>
        <button
          class="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          @click="emit('bulkCancel')"
        >
          <XCircleIcon class="h-4 w-4" />
          {{ t('orders.cancelOrder') }}
        </button>
      </template>
      <button
        class="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700"
        @click="emit('assignDelivery')"
      >
        <BuildingOffice2Icon class="h-4 w-4" />
        {{ t('orders.assignDelivery') }}
      </button>
      <button
        class="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        @click="emit('assignWorker')"
      >
        <UserGroupIcon class="h-4 w-4" />
        {{ t('orders.assignWorker') }}
      </button>
      <!-- Delivered/Returned buttons - only show in shipping phase -->
      <template v-if="isShippingPhase">
        <button
          class="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
          @click="emit('markDelivered')"
        >
          <TruckIcon class="h-4 w-4" />
          {{ t('orders.deliverOrder') }}
        </button>
        <button
          class="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
          @click="emit('markReturned')"
        >
          <ArrowUturnLeftIcon class="h-4 w-4" />
          {{ t('orders.returnOrder') }}
        </button>
      </template>
      <!-- Archive/Unarchive buttons -->
      <button
        v-if="isArchivedFilter !== true"
        class="inline-flex items-center gap-1 rounded-lg bg-gray-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
        @click="emit('archive')"
      >
        <ArchiveBoxIcon class="h-4 w-4" />
        {{ t('orders.archive') }}
      </button>
      <button
        v-if="isArchivedFilter === true"
        class="inline-flex items-center gap-1 rounded-lg bg-gray-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
        @click="emit('unarchive')"
      >
        <ArchiveBoxXMarkIcon class="h-4 w-4" />
        {{ t('orders.unarchive') }}
      </button>
    </div>
  </div>
</template>
