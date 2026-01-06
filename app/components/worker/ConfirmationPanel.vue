<template>
  <div>
    <!-- Stats Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <WorkerStatCard
        :label="$t('worker.pending')"
        :count="pendingCount"
        color="yellow"
        icon-type="pending"
      />
      <WorkerStatCard
        :label="$t('worker.active')"
        :count="activeCount"
        color="blue"
        icon-type="active"
      />
      <WorkerStatCard
        :label="$t('worker.callbacks')"
        :count="callbackCount"
        color="purple"
        icon-type="callback"
      />
      <WorkerStatCard
        :label="$t('worker.completedToday')"
        :count="completedTodayCount"
        color="green"
        icon-type="completed"
      />
    </div>

    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Pending Queue -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ClockIcon class="w-5 h-5 text-yellow-500" />
            {{ $t('worker.pendingAssignments') }}
          </h2>
          <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
            {{ pendingAssignments.length }}
          </span>
        </div>

        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>

        <div v-else-if="pendingAssignments.length === 0" class="text-center py-8">
          <InboxIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400">{{ $t('worker.noPendingAssignments') }}</p>
        </div>

        <div v-else class="space-y-2 max-h-[600px] overflow-y-auto">
          <div
            v-for="assignment in pendingAssignments"
            :key="assignment.id"
            class="p-3 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
          >
            <!-- Header: Code + Callback Badge + Price -->
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span class="font-mono font-semibold text-primary-600 dark:text-primary-400 text-sm">
                  {{ assignment.orderCode }}
                </span>
                <span
                  v-if="assignment.callbackAttemptNumber > 0"
                  class="px-1.5 py-0.5 text-xs font-medium bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200 rounded flex items-center gap-0.5"
                >
                  <ArrowPathIcon class="w-3 h-3" />
                  x{{ assignment.callbackAttemptNumber }}
                </span>
              </div>
              <span class="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {{ formatCurrency(assignment.totalPrice || assignment.orderPrice) }}
              </span>
            </div>
            <!-- Customer + Phone + City Row -->
            <div class="flex items-center justify-between gap-2">
              <p class="font-medium text-gray-900 dark:text-white text-sm truncate flex-1">
                {{ assignment.customerName }}
              </p>
              <div class="flex items-center gap-2 shrink-0 text-xs">
                <a
                  :href="'tel:' + assignment.customerPhone"
                  class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <PhoneIcon class="w-3 h-3" />
                  {{ assignment.customerPhone }}
                </a>
                <span v-if="assignment.customerCity || assignment.cityName" class="text-gray-400 dark:text-gray-500">
                  {{ assignment.customerCity || assignment.cityName }}
                </span>
              </div>
            </div>
            <!-- Callback scheduled info -->
            <div
              v-if="assignment.callbackScheduledAt"
              :class="[
                'mt-1 text-xs flex items-center gap-1',
                assignment.isCallbackOverdue
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-purple-600 dark:text-purple-400'
              ]"
            >
              <ClockIcon class="w-3 h-3" />
              {{ formatCallbackTime(assignment.callbackScheduledAt) }}
              <span v-if="assignment.isCallbackOverdue" class="font-semibold">({{ $t('worker.overdue') }})</span>
            </div>
            <!-- Take Button -->
            <div class="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800">
              <button
                @click="handleTake(assignment)"
                class="w-full btn-primary py-1.5 text-sm font-semibold"
                :disabled="isTaking"
              >
                <HandRaisedIcon class="w-4 h-4 mr-1" />
                {{ $t('worker.take') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Work -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardDocumentListIcon class="w-5 h-5 text-blue-500" />
            {{ $t('worker.activeWork') }}
          </h2>
          <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
            {{ activeAssignments.length }}
          </span>
        </div>

        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>

        <div v-else-if="activeAssignments.length === 0" class="text-center py-8">
          <ClipboardDocumentListIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400">{{ $t('worker.noActiveWork') }}</p>
        </div>

        <div v-else class="space-y-2 max-h-[600px] overflow-y-auto">
          <div
            v-for="assignment in activeAssignments"
            :key="assignment.id"
            class="p-3 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
          >
            <!-- Header: Code + Callback Badge + Price + View Button -->
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span class="font-mono font-semibold text-primary-600 dark:text-primary-400 text-sm">
                  {{ assignment.orderCode }}
                </span>
                <span
                  v-if="assignment.callbackAttemptNumber > 0"
                  class="px-1.5 py-0.5 text-xs font-medium bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200 rounded flex items-center gap-0.5"
                >
                  <ArrowPathIcon class="w-3 h-3" />
                  x{{ assignment.callbackAttemptNumber }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {{ formatCurrency(assignment.totalPrice || assignment.orderPrice) }}
                </span>
                <button
                  @click="$emit('view-order', assignment)"
                  class="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 bg-gray-100 dark:bg-gray-700 rounded"
                  :title="$t('common.view')"
                >
                  <EyeIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
            <!-- Customer + Phone + City Row -->
            <div class="flex items-center justify-between gap-2">
              <p class="font-medium text-gray-900 dark:text-white text-sm truncate flex-1">
                {{ assignment.customerName }}
              </p>
              <div class="flex items-center gap-2 shrink-0 text-xs">
                <a
                  :href="'tel:' + assignment.customerPhone"
                  class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <PhoneIcon class="w-3 h-3" />
                  {{ assignment.customerPhone }}
                </a>
                <span v-if="assignment.customerCity || assignment.cityName" class="text-gray-400 dark:text-gray-500">
                  {{ assignment.customerCity || assignment.cityName }}
                </span>
              </div>
            </div>

            <!-- Row 1: Communication + Callback + Release -->
            <div class="flex gap-1.5 mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
              <a
                :href="'tel:' + assignment.customerPhone"
                class="btn-secondary flex-1 text-xs py-1.5 flex items-center justify-center"
              >
                <PhoneIcon class="w-3.5 h-3.5 mr-1" />
                {{ $t('worker.call') }}
              </a>
              <a
                :href="getWhatsAppLink(assignment.customerPhone)"
                target="_blank"
                class="btn-secondary flex-1 text-xs py-1.5 flex items-center justify-center text-green-600 dark:text-green-400"
              >
                <ChatBubbleLeftRightIcon class="w-3.5 h-3.5 mr-1" />
                WA
              </a>
              <button
                v-if="props.myConfig?.canDoCallback"
                @click="openCallbackModal(assignment)"
                class="btn-secondary text-xs py-1.5 px-2 text-purple-600 hover:text-purple-700 dark:text-purple-400"
                :title="$t('worker.scheduleCallback')"
              >
                <PhoneArrowUpRightIcon class="w-3.5 h-3.5" />
              </button>
              <button
                @click="handleRelease(assignment)"
                class="btn-secondary text-xs py-1.5 px-2"
                :title="$t('worker.release')"
              >
                <ArrowUturnLeftIcon class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Row 2: Confirm + Cancel -->
            <div class="flex gap-1.5 mt-1.5">
              <button
                @click="$emit('confirm', assignment)"
                class="btn-primary flex-1 text-xs py-1.5"
              >
                <CheckIcon class="w-3.5 h-3.5 mr-1" />
                {{ $t('orders.confirmOrder') }}
              </button>
              <button
                @click="$emit('cancel', assignment)"
                class="btn-secondary flex-1 text-xs py-1.5 text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <XMarkIcon class="w-3.5 h-3.5 mr-1" />
                {{ $t('orders.cancelOrder') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Callback Modal -->
    <WorkerCallbackModal
      v-model="showCallbackModal"
      :assignment="selectedAssignment"
      :max-attempts="settings?.maxCallbackAttempts"
      @submit="handleScheduleCallback"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ClockIcon,
  ClipboardDocumentListIcon,
  InboxIcon,
  HandRaisedIcon,
  PhoneIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUturnLeftIcon,
  PhoneArrowUpRightIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'
import { useOrderAssignmentsService, type WorkerAssignmentDto } from '~/services'
import type { CallbackFilter, WorkerServiceConfigDto } from '~/types/orderAssignment'
import { ServiceTypes } from '~/constants/order'

const props = defineProps<{
  myConfig?: WorkerServiceConfigDto
}>()

const emit = defineEmits<{
  (e: 'confirm', assignment: WorkerAssignmentDto): void
  (e: 'cancel', assignment: WorkerAssignmentDto): void
  (e: 'view-order', assignment: WorkerAssignmentDto): void
}>()

const { t } = useI18n()

// Services
const orderAssignmentsService = useOrderAssignmentsService()

// Query params for filtering by service type
const pendingParams = ref({ serviceType: ServiceTypes.Confirmation })
const activeParams = ref({ serviceType: ServiceTypes.Confirmation })

// Vue Query hooks
const myPendingQuery = orderAssignmentsService.useMyPendingAssignments(pendingParams)
const myActiveQuery = orderAssignmentsService.useMyActiveAssignments(activeParams)

// Computed from queries
const myPendingAssignments = computed(() => myPendingQuery.data.value ?? [])
const myActiveAssignments = computed(() => myActiveQuery.data.value ?? [])
const isLoading = computed(() => myPendingQuery.isLoading.value || myActiveQuery.isLoading.value)

// State
const isTaking = ref(false)
const showCallbackModal = ref(false)
const selectedAssignment = ref<WorkerAssignmentDto | null>(null)
const completedTodayCount = ref(0)
const settings = ref<{ maxCallbackAttempts?: number } | null>(null)

// Filtered assignments - exclude those with scheduled callbacks (they show in Callbacks tab)
const pendingAssignments = computed(() =>
  myPendingAssignments.value.filter(a => !a.callbackScheduledAt)
)
const activeAssignments = computed(() =>
  myActiveAssignments.value.filter(a => !a.callbackScheduledAt)
)

// Counts
const pendingCount = computed(() => pendingAssignments.value.length)
const activeCount = computed(() => activeAssignments.value.length)
const callbackCount = computed(() =>
  activeAssignments.value.filter(a => a.callbackScheduledAt).length
)

// Format helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount)
}

const formatCallbackTime = (isoDate: string) => {
  const date = new Date(isoDate)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow = date.toDateString() === tomorrow.toDateString()

  const time = date.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })

  if (isToday) return `${t('worker.today')} ${time}`
  if (isTomorrow) return `${t('worker.tomorrow')} ${time}`
  return date.toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit' }) + ' ' + time
}

const getWhatsAppLink = (phone: string) => {
  let formattedPhone = phone.replace(/\s/g, '').replace(/^0/, '212')
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = '+' + formattedPhone
  }
  return `https://wa.me/${formattedPhone}`
}

// Actions
const handleTake = async (assignment: WorkerAssignmentDto) => {
  isTaking.value = true
  try {
    await orderAssignmentsService.take(assignment.id)
    notification.success(t('worker.assignmentTaken'))
  } catch (error: any) {
    const status = error?.response?.status
    const errorMessage = error?.response?.data?.exception || error?.response?.data?.message || ''

    if (status === 404) {
      // Assignment no longer exists
      notification.warning(t('worker.assignmentNotFound'))
    } else if (status === 409) {
      // Assignment already taken, reassigned, or order was modified
      notification.info(t('worker.assignmentAlreadyProcessed'))
    } else if (status === 403) {
      // Assignment belongs to another worker (was reassigned)
      notification.warning(t('worker.assignmentReassigned'))
    } else {
      notification.error(errorMessage || t('common.errorOccurred'))
    }
    // Refresh to sync UI with backend state
    await Promise.all([myPendingQuery.refetch(), myActiveQuery.refetch()])
  } finally {
    isTaking.value = false
  }
}

const isReleasing = ref(false)
const notification = useNotification()

const handleRelease = async (assignment: WorkerAssignmentDto) => {
  if (!confirm(t('worker.confirmRelease'))) return

  isReleasing.value = true
  try {
    await orderAssignmentsService.release(assignment.id, { reason: 'Worker released' })
    notification.success(t('worker.releaseSuccess'))
  } catch (error: any) {
    const status = error?.response?.status
    const errorMessage = error?.response?.data?.exception || error?.response?.data?.message || ''

    if (status === 404) {
      // Assignment no longer exists
      notification.warning(t('worker.assignmentNotFound'))
    } else if (status === 409) {
      // Assignment already completed or reassigned
      notification.info(t('worker.assignmentAlreadyProcessed'))
    } else {
      notification.error(errorMessage || t('common.errorOccurred'))
    }
    // Refresh to sync UI with backend state
    await Promise.all([myPendingQuery.refetch(), myActiveQuery.refetch()])
  } finally {
    isReleasing.value = false
  }
}

const openCallbackModal = (assignment: WorkerAssignmentDto) => {
  selectedAssignment.value = assignment
  showCallbackModal.value = true
}

const handleScheduleCallback = async (data: { scheduledAt: string; notes?: string }) => {
  if (!selectedAssignment.value) return
  try {
    await orderAssignmentsService.scheduleCallback(selectedAssignment.value.id, data)
    showCallbackModal.value = false
    selectedAssignment.value = null
  } catch {
    // Error handled by service
  }
}

// Vue Query auto-fetches data on mount, no need for manual onMounted

// Expose refresh method
defineExpose({
  refresh: async () => {
    await Promise.all([
      myPendingQuery.refetch(),
      myActiveQuery.refetch()
    ])
  }
})
</script>
