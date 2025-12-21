<template>
  <div class="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
    <!-- Order Info Header -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="font-mono font-semibold text-primary-600 dark:text-primary-400">
            {{ assignment.orderCode }}
          </span>
        </div>
        <p class="font-medium text-gray-900 dark:text-white">{{ assignment.customerName }}</p>
        <div class="flex items-center gap-2 mt-1">
          <a
            :href="'tel:' + assignment.customerPhone"
            class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <PhoneIcon class="w-4 h-4" />
            {{ assignment.customerPhone }}
          </a>
          <span v-if="assignment.customerCity || assignment.cityName" class="text-gray-400">|</span>
          <span v-if="assignment.customerCity || assignment.cityName" class="text-sm text-gray-500 dark:text-gray-400">
            {{ assignment.customerCity || assignment.cityName }}
          </span>
        </div>
        <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-2">
          {{ formatCurrency(assignment.totalPrice || assignment.orderPrice) }}
        </p>
      </div>
    </div>

    <!-- Checklist -->
    <div class="border-t border-blue-200 dark:border-blue-700 pt-4 mb-4">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
        <ClipboardDocumentCheckIcon class="w-5 h-5 text-blue-500" />
        {{ $t('worker.qualityChecklist') }}
      </h3>
      <div class="space-y-2">
        <label
          v-for="(item, index) in checklist"
          :key="item.id"
          class="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/50 cursor-pointer transition-colors"
        >
          <input
            v-model="item.passed"
            type="checkbox"
            class="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span
            :class="[
              'text-sm',
              item.passed
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-gray-700 dark:text-gray-300'
            ]"
          >
            {{ item.label }}
          </span>
        </label>
      </div>
    </div>

    <!-- Score Display -->
    <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg mb-4">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ $t('worker.qualityScore') }}
      </span>
      <div class="flex items-center gap-2">
        <div
          class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        >
          <div
            :class="[
              'h-full transition-all duration-300',
              scoreColor
            ]"
            :style="{ width: `${score}%` }"
          ></div>
        </div>
        <span
          :class="[
            'text-lg font-bold',
            score >= threshold ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          ]"
        >
          {{ score }}%
        </span>
      </div>
    </div>

    <!-- Threshold Info -->
    <div
      :class="[
        'text-sm mb-4 p-2 rounded-lg flex items-center gap-2',
        score >= threshold
          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      ]"
    >
      <component
        :is="score >= threshold ? CheckCircleIcon : ExclamationTriangleIcon"
        class="w-5 h-5"
      />
      <span v-if="score >= threshold">
        {{ $t('worker.scoreAboveThreshold', { threshold }) }}
      </span>
      <span v-else>
        {{ $t('worker.scoreBelowThreshold', { threshold }) }}
      </span>
    </div>

    <!-- Notes -->
    <div class="mb-4">
      <label class="label">{{ $t('orders.notes') }}</label>
      <textarea
        v-model="notes"
        class="input"
        rows="2"
        :placeholder="$t('worker.qualityNotesPlaceholder')"
      ></textarea>
    </div>

    <!-- Rejection Reason (if score below threshold) -->
    <div v-if="score < threshold" class="mb-4">
      <label class="label text-red-600 dark:text-red-400">
        {{ $t('worker.rejectionReason') }} *
      </label>
      <textarea
        v-model="rejectionReason"
        class="input border-red-300 dark:border-red-600"
        rows="2"
        :placeholder="$t('worker.rejectionReasonPlaceholder')"
        required
      ></textarea>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <button
        @click="handleApprove"
        :disabled="!canApprove"
        :class="[
          'flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
          canApprove
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
        ]"
      >
        <CheckCircleIcon class="w-5 h-5" />
        {{ $t('worker.approve') }}
      </button>
      <button
        @click="handleReject"
        :disabled="!canReject"
        :class="[
          'flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
          canReject
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
        ]"
      >
        <XCircleIcon class="w-5 h-5" />
        {{ $t('worker.reject') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PhoneIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import type { WorkerAssignmentDto, QualityCheckItem } from '~/types/orderAssignment'
import { DEFAULT_QUALITY_CHECKLIST } from '~/types/orderAssignment'

const props = defineProps<{
  assignment: WorkerAssignmentDto
  threshold?: number
}>()

const emit = defineEmits<{
  (e: 'approve', data: {
    score: number
    checklist: QualityCheckItem[]
    notes?: string
  }): void
  (e: 'reject', data: {
    score: number
    checklist: QualityCheckItem[]
    notes?: string
    rejectionReason: string
  }): void
}>()

const { t, locale } = useI18n()

// Default threshold if not provided
const threshold = computed(() => props.threshold || 80)

// Initialize checklist from defaults
const checklist = ref(
  DEFAULT_QUALITY_CHECKLIST.map(item => ({
    id: item.id,
    label: locale.value === 'ar' ? item.labelAr : item.label,
    passed: false
  }))
)

const notes = ref('')
const rejectionReason = ref('')

// Calculate score
const score = computed(() => {
  const passed = checklist.value.filter(item => item.passed).length
  const total = checklist.value.length
  return Math.round((passed / total) * 100)
})

// Score color based on threshold
const scoreColor = computed(() => {
  if (score.value >= threshold.value) return 'bg-emerald-500'
  if (score.value >= threshold.value * 0.7) return 'bg-yellow-500'
  return 'bg-red-500'
})

// Can approve if score meets threshold
const canApprove = computed(() => score.value >= threshold.value)

// Can reject if rejection reason provided when score below threshold
const canReject = computed(() => {
  if (score.value >= threshold.value) return true // Can always reject even if score is high
  return rejectionReason.value.trim().length > 0
})

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount)
}

const handleApprove = () => {
  if (!canApprove.value) return
  emit('approve', {
    score: score.value,
    checklist: checklist.value.map(item => ({
      checkName: item.id,
      passed: item.passed
    })),
    notes: notes.value || undefined
  })
}

const handleReject = () => {
  if (!canReject.value) return
  emit('reject', {
    score: score.value,
    checklist: checklist.value.map(item => ({
      checkName: item.id,
      passed: item.passed
    })),
    notes: notes.value || undefined,
    rejectionReason: rejectionReason.value || 'Score below threshold'
  })
}

// Reset form when assignment changes
watch(() => props.assignment?.id, () => {
  checklist.value.forEach(item => item.passed = false)
  notes.value = ''
  rejectionReason.value = ''
})
</script>
