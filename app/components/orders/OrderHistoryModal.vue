<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import {
  ClockIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  ArrowRightIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  HandRaisedIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  UserPlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import { useOrderHistoriesService, type OrderHistoryDto } from '~/services'

const props = defineProps<{
  show: boolean
  orderId: string | null
  orderCode: string | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

// Use the new service
const { getByOrderId, getActionLabel, parseMetadata } = useOrderHistoriesService()

// Create a computed ref for orderId
const orderIdRef = computed(() => props.orderId ?? undefined)

// Query for history by order ID
const { data: history, isLoading, error } = getByOrderId(orderIdRef)

// Expanded metadata items
const expandedItems = ref<Set<string>>(new Set())

const toggleMetadata = (id: string) => {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id)
  } else {
    expandedItems.value.add(id)
  }
}

// Action type icon mapping
const actionIcons: Record<string, any> = {
  order_created: PlusCircleIcon,
  state_change: ArrowRightIcon,
  phase_change: ClockIcon,
  assignment_created: UserPlusIcon,
  assignment_taken: HandRaisedIcon,
  assignment_released: HandRaisedIcon,
  assignment_completed: CheckCircleIcon,
  assignment_reassigned: ArrowPathIcon,
  delivery_assigned: TruckIcon,
  stock_deducted: MinusCircleIcon,
  stock_restored: PlusCircleIcon,
  cod_collected: BanknotesIcon,
  warning: ExclamationTriangleIcon,
}

// Action type colors
const actionColors: Record<string, { bg: string; text: string; dot: string }> = {
  order_created: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  state_change: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  phase_change: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  assignment_created: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  assignment_taken: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300', dot: 'bg-teal-500' },
  assignment_released: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
  assignment_completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  assignment_reassigned: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  delivery_assigned: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
  stock_deducted: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  stock_restored: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  cod_collected: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  warning: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
}

const getActionColor = (actionType: string) => {
  return actionColors[actionType] ?? actionColors.state_change
}

const getActionIcon = (actionType: string) => {
  return actionIcons[actionType] ?? ArrowRightIcon
}

// State badge colors
const stateColors: Record<string, string> = {
  new: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  shipping: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  returned: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  canceled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  in_progress: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
  no_response: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  refused: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  postponed: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
}

const getStateColor = (state?: string) => {
  if (!state) return stateColors.new
  return stateColors[state.toLowerCase()] || stateColors.new
}

// Service type labels
const serviceTypeLabels: Record<string, string> = {
  confirmation: 'Confirmation',
  suivi: 'Suivi',
  quality: 'Qualité',
  callback: 'Rappel',
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatPrice = (price?: number) => {
  if (price === undefined || price === null) return null
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2
  }).format(price)
}

const handleClose = () => {
  expandedItems.value.clear()
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
            <DialogPanel class="w-full max-w-2xl transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <!-- Header -->
              <DialogTitle class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <ClockIcon class="h-5 w-5 text-primary-600" />
                {{ t('orders.historyTitle') }} - {{ orderCode }}
              </DialogTitle>

              <!-- Content -->
              <div class="mt-4 max-h-[70vh] overflow-y-auto">
                <!-- Loading -->
                <div v-if="isLoading" class="flex items-center justify-center py-8">
                  <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
                </div>

                <!-- Error -->
                <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {{ error }}
                </div>

                <!-- Empty State -->
                <div v-else-if="!history || history.length === 0" class="py-8 text-center">
                  <ClockIcon class="mx-auto h-12 w-12 text-gray-400" />
                  <p class="mt-2 text-gray-500 dark:text-gray-400">{{ t('orders.noHistory') }}</p>
                </div>

                <!-- Timeline -->
                <div v-else class="relative space-y-0">
                  <div
                    v-for="(item, index) in history"
                    :key="item.id"
                    class="relative pb-6 last:pb-0"
                  >
                    <!-- Timeline line -->
                    <div
                      v-if="index < history.length - 1"
                      class="absolute left-3 top-8 h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                    ></div>

                    <!-- Timeline item -->
                    <div class="flex gap-3">
                      <!-- Dot with icon -->
                      <div
                        class="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        :class="getActionColor(item.actionType).bg"
                      >
                        <component
                          :is="getActionIcon(item.actionType)"
                          class="h-3.5 w-3.5"
                          :class="getActionColor(item.actionType).text"
                        />
                      </div>

                      <!-- Content -->
                      <div class="flex-1 -mt-0.5 min-w-0">
                        <!-- Header row: Action type + Date -->
                        <div class="flex items-center justify-between gap-2 flex-wrap">
                          <div class="flex items-center gap-2 flex-wrap">
                            <!-- Action type badge -->
                            <span
                              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                              :class="[getActionColor(item.actionType).bg, getActionColor(item.actionType).text]"
                            >
                              {{ getActionLabel(item.actionType).label }}
                            </span>

                            <!-- Service type badge (if applicable) -->
                            <span
                              v-if="item.serviceType"
                              class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {{ serviceTypeLabels[item.serviceType] || item.serviceType }}
                            </span>
                          </div>

                          <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {{ formatDate(item.createdOn) }}
                          </span>
                        </div>

                        <!-- State transition (if has previousState or state) -->
                        <div
                          v-if="item.previousState || item.state"
                          class="mt-1.5 flex items-center gap-2 text-sm"
                        >
                          <span
                            v-if="item.previousState"
                            class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                            :class="getStateColor(item.previousState)"
                          >
                            {{ item.previousState }}
                          </span>
                          <ArrowRightIcon v-if="item.previousState && item.state" class="h-3 w-3 text-gray-400" />
                          <span
                            v-if="item.state"
                            class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                            :class="getStateColor(item.state)"
                          >
                            {{ item.state }}
                          </span>
                        </div>

                        <!-- Agent + Phase -->
                        <div class="mt-1.5 flex items-center gap-3 flex-wrap text-xs text-gray-600 dark:text-gray-400">
                          <div v-if="item.agentName" class="flex items-center gap-1">
                            <UserIcon class="h-3 w-3" />
                            {{ item.agentName }}
                          </div>
                          <div v-if="item.phase" class="flex items-center gap-1">
                            <ClockIcon class="h-3 w-3" />
                            Phase: {{ item.phase }}
                          </div>
                          <div v-if="item.orderPrice" class="flex items-center gap-1">
                            <BanknotesIcon class="h-3 w-3" />
                            {{ formatPrice(item.orderPrice) }}
                          </div>
                          <div v-if="item.codAmount" class="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <BanknotesIcon class="h-3 w-3" />
                            COD: {{ formatPrice(item.codAmount) }}
                          </div>
                        </div>

                        <!-- Comment -->
                        <div
                          v-if="item.comment"
                          class="mt-2 rounded bg-gray-50 p-2 text-sm text-gray-700 dark:bg-gray-700/50 dark:text-gray-300"
                        >
                          <ChatBubbleLeftIcon class="mr-1 inline h-3 w-3" />
                          {{ item.comment }}
                        </div>

                        <!-- Metadata (expandable) -->
                        <div v-if="item.metadata" class="mt-2">
                          <button
                            type="button"
                            class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            @click="toggleMetadata(item.id)"
                          >
                            <component
                              :is="expandedItems.has(item.id) ? ChevronDownIcon : ChevronRightIcon"
                              class="h-3 w-3"
                            />
                            Détails
                          </button>
                          <div
                            v-if="expandedItems.has(item.id)"
                            class="mt-1 rounded bg-gray-100 p-2 text-xs font-mono text-gray-600 dark:bg-gray-700 dark:text-gray-300 overflow-x-auto"
                          >
                            <pre class="whitespace-pre-wrap">{{ JSON.stringify(parseMetadata(item.metadata), null, 2) }}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="mt-6 flex justify-end">
                <button
                  type="button"
                  class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
