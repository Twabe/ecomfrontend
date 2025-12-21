<template>
  <div>
    <!-- Stats Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <WorkerStatCard
        :label="$t('worker.toCheck')"
        :count="pendingCount"
        color="yellow"
        icon-type="pending"
      />
      <WorkerStatCard
        :label="$t('worker.checking')"
        :count="activeCount"
        color="blue"
        icon-type="active"
      />
      <WorkerStatCard
        :label="$t('worker.approved')"
        :count="approvedTodayCount"
        color="green"
        icon-type="quality"
      />
      <WorkerStatCard
        :label="$t('worker.rejected')"
        :count="rejectedTodayCount"
        color="red"
        icon-type="error"
      />
    </div>

    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Pending Queue -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ClockIcon class="w-5 h-5 text-yellow-500" />
            {{ $t('worker.toCheck') }}
          </h2>
          <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
            {{ pendingCount }}
          </span>
        </div>

        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>

        <div v-else-if="pendingAssignments.length === 0" class="text-center py-8">
          <ShieldCheckIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400">{{ $t('worker.noQualityAssignments') }}</p>
        </div>

        <div v-else class="space-y-3 max-h-[500px] overflow-y-auto">
          <div
            v-for="assignment in pendingAssignments"
            :key="assignment.id"
            class="p-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <span class="font-mono font-semibold text-primary-600 dark:text-primary-400">
                    {{ assignment.orderCode }}
                  </span>
                  <div class="flex items-center gap-2">
                    <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {{ formatCurrency(assignment.totalPrice || assignment.orderPrice) }}
                    </span>
                    <button
                      @click="emit('view-order', assignment)"
                      class="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 bg-gray-100 dark:bg-gray-700 rounded"
                      :title="$t('common.view')"
                    >
                      <EyeIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p class="font-medium text-gray-900 dark:text-white">{{ assignment.customerName }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ assignment.customerCity || assignment.cityName }}
                </p>
                <p v-if="assignment.notes" class="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                  {{ assignment.notes }}
                </p>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-800">
              <button
                @click="handleTake(assignment)"
                class="w-full btn-primary py-2.5 text-base font-semibold"
                :disabled="isTaking"
              >
                <HandRaisedIcon class="w-5 h-5 mr-2" />
                {{ $t('worker.take') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quality Check Form -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheckIcon class="w-5 h-5 text-blue-500" />
            {{ $t('worker.qualityCheck') }}
          </h2>
        </div>

        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>

        <div v-else-if="!activeAssignment" class="text-center py-8">
          <ShieldCheckIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400">{{ $t('worker.noActiveQuality') }}</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">{{ $t('worker.takeAssignmentFirst') }}</p>
        </div>

        <WorkerQualityCheckForm
          v-else
          :assignment="activeAssignment"
          :threshold="qualityThreshold"
          @approve="handleApprove"
          @reject="handleReject"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ClockIcon,
  ShieldCheckIcon,
  HandRaisedIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'
import { useOrderAssignmentsService, type WorkerAssignmentDto } from '~/services'
import type { QualityCheckItem } from '~/types/orderAssignment'

const emit = defineEmits<{
  (e: 'view-order', assignment: WorkerAssignmentDto): void
}>()

const { t } = useI18n()
const notification = useNotification()

// Services
const orderAssignmentsService = useOrderAssignmentsService()

// Query params for filtering by service type
const pendingParams = ref({ serviceType: 'quality' })
const activeParams = ref({ serviceType: 'quality' })

// Vue Query hooks
const myPendingQuery = orderAssignmentsService.useMyPendingAssignments(pendingParams)
const myActiveQuery = orderAssignmentsService.useMyActiveAssignments(activeParams)

// Computed from queries
const myPendingAssignments = computed(() => myPendingQuery.data.value ?? [])
const myActiveAssignments = computed(() => myActiveQuery.data.value ?? [])
const isLoading = computed(() => myPendingQuery.isLoading.value || myActiveQuery.isLoading.value)

// State
const isTaking = ref(false)
const approvedTodayCount = ref(0)
const rejectedTodayCount = ref(0)
const qualityThreshold = ref(80)

// Filtered assignments (already filtered by service type via params)
const pendingAssignments = computed(() => myPendingAssignments.value)
const activeAssignments = computed(() => myActiveAssignments.value)

// Get the first active assignment (quality works on one at a time)
const activeAssignment = computed(() => activeAssignments.value[0] || null)

// Counts
const pendingCount = computed(() => pendingAssignments.value.length)
const activeCount = computed(() => activeAssignments.value.length)

// Format helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount)
}

// Actions
const handleTake = async (assignment: WorkerAssignmentDto) => {
  isTaking.value = true
  try {
    await orderAssignmentsService.take(assignment.id)
  } finally {
    isTaking.value = false
  }
}

const handleApprove = async (data: {
  score: number
  checklist: QualityCheckItem[]
  notes?: string
}) => {
  if (!activeAssignment.value) return
  try {
    await orderAssignmentsService.completeQuality(activeAssignment.value.id, {
      approved: true,
      score: data.score,
      checklist: data.checklist,
      notes: data.notes
    })
    approvedTodayCount.value++
  } catch (error: any) {
    // Handle reassigned assignment error (HTTP 409)
    if (error?.response?.status === 409) {
      notification.warning(t('worker.orderReassigned'))
    }
  }
}

const handleReject = async (data: {
  score: number
  checklist: QualityCheckItem[]
  notes?: string
  rejectionReason: string
}) => {
  if (!activeAssignment.value) return
  try {
    await orderAssignmentsService.completeQuality(activeAssignment.value.id, {
      approved: false,
      score: data.score,
      checklist: data.checklist,
      notes: data.notes,
      rejectionReason: data.rejectionReason
    })
    rejectedTodayCount.value++
  } catch (error: any) {
    // Handle reassigned assignment error (HTTP 409)
    if (error?.response?.status === 409) {
      notification.warning(t('worker.orderReassigned'))
    }
  }
}

// Vue Query auto-fetches on mount, no need for manual onMounted

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
