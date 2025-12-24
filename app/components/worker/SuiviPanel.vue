<template>
  <div>
    <!-- Stats Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <WorkerStatCard
        :label="$t('worker.toFollow')"
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
        :label="$t('worker.delivered')"
        :count="deliveredTodayCount"
        color="green"
        icon-type="delivery"
      />
      <WorkerStatCard
        :label="$t('worker.issues')"
        :count="issuesCount"
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
            {{ $t('worker.toFollow') }}
          </h2>
          <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
            {{ pendingCount }}
          </span>
        </div>

        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>

        <div v-else-if="pendingAssignments.length === 0" class="text-center py-8">
          <InboxIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400">{{ $t('worker.noSuiviAssignments') }}</p>
        </div>

        <div v-else class="space-y-2 max-h-[600px] overflow-y-auto">
          <div
            v-for="assignment in pendingAssignments"
            :key="assignment.id"
            class="p-3 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
          >
            <!-- Header: Code + Price -->
            <div class="flex items-center justify-between mb-1">
              <span class="font-mono font-semibold text-primary-600 dark:text-primary-400 text-sm">
                {{ assignment.orderCode }}
              </span>
              <span class="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {{ formatCurrency(assignment.totalPrice || assignment.orderPrice) }}
              </span>
            </div>
            <!-- Customer + City Row -->
            <div class="flex items-center justify-between gap-2">
              <p class="font-medium text-gray-900 dark:text-white text-sm truncate flex-1">
                {{ assignment.customerName }}
              </p>
              <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 shrink-0">
                <TruckIcon class="w-3 h-3" />
                {{ assignment.customerCity || assignment.cityName }}
              </span>
            </div>

            <!-- Attempt Badge -->
            <div class="flex items-center gap-2 mt-1.5">
              <span
                v-if="!assignment.attemptCount || assignment.attemptCount === 0"
                class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                <SparklesIcon class="w-3 h-3" />
                {{ $t('worker.newOrder') }}
              </span>
              <template v-else>
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full"
                  :class="getAttemptBadgeClass(assignment.attemptCount)"
                >
                  <ArrowPathIcon class="w-3 h-3" />
                  {{ $t('worker.attempt') }} #{{ assignment.attemptCount }}
                </span>
                <span v-if="assignment.lastAttemptResult" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatLastAttemptResult(assignment.lastAttemptResult) }}
                </span>
                <span v-if="assignment.lastAttemptAt" class="text-xs text-gray-400 dark:text-gray-500">
                  · {{ formatTimeAgo(assignment.lastAttemptAt) }}
                </span>
              </template>
            </div>

            <!-- Notes History (if any) -->
            <div
              v-if="assignment.notes"
              class="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs text-gray-600 dark:text-gray-400 max-h-20 overflow-y-auto"
            >
              <div class="flex items-start gap-1">
                <ChatBubbleLeftIcon class="w-3 h-3 mt-0.5 shrink-0" />
                <pre class="whitespace-pre-wrap font-sans text-xs">{{ assignment.notes }}</pre>
              </div>
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

      <!-- Active Tracking -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TruckIcon class="w-5 h-5 text-blue-500" />
            {{ $t('worker.activeTracking') }}
            <!-- Select All checkbox -->
            <label v-if="activeAssignments.length > 0" class="ml-2 flex items-center gap-1.5 text-sm font-normal cursor-pointer">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="isAllSelected ? deselectAll() : selectAll()"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <span class="text-gray-500 dark:text-gray-400">{{ $t('common.selectAll') }}</span>
            </label>
          </h2>
          <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
            {{ activeCount }}
          </span>
        </div>

        <!-- Bulk Actions Bar -->
        <div
          v-if="selectedAssignments.size > 0"
          class="mb-4 p-3 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg"
        >
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-medium text-primary-700 dark:text-primary-300">
              {{ selectedAssignments.size }} {{ $t('common.selected') }}
            </span>
            <div class="flex-1"></div>
            <button
              @click="handleBulkComplete(SuiviResult.Delivered)"
              :disabled="isBulkProcessing || isBulkAssignDeliveryProcessing"
              class="btn-primary text-sm py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircleIcon class="w-4 h-4 mr-1" />
              {{ $t('worker.markAllDelivered') }}
            </button>
            <button
              @click="handleBulkComplete(SuiviResult.Returned)"
              :disabled="isBulkProcessing || isBulkAssignDeliveryProcessing"
              class="btn-secondary text-sm py-1.5 px-3 text-orange-600 dark:text-orange-400 disabled:opacity-50"
            >
              <ArrowUturnLeftIcon class="w-4 h-4 mr-1" />
              {{ $t('worker.markAllReturned') }}
            </button>
            <button
              @click="openBulkAssignDeliveryModal"
              :disabled="isBulkProcessing || isBulkAssignDeliveryProcessing"
              class="btn-secondary text-sm py-1.5 px-3 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700 disabled:opacity-50"
            >
              <TruckIcon class="w-4 h-4 mr-1" />
              {{ $t('worker.assignAllDelivery') }}
            </button>
            <button
              @click="deselectAll"
              class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              :title="$t('common.cancel')"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>

          <!-- Bulk processing indicator -->
          <div v-if="isBulkProcessing || isBulkAssignDeliveryProcessing" class="mt-2 flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
            {{ $t('worker.processingBulk') }}
          </div>
        </div>

        <!-- Bulk Result Banner -->
        <div
          v-if="bulkResult"
          class="mb-4 p-3 rounded-lg"
          :class="bulkResult.failed > 0 ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800' : 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800'"
        >
          <div class="flex items-center justify-between">
            <div class="text-sm">
              <span class="font-medium" :class="bulkResult.failed > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'">
                {{ $t('worker.bulkCompleted', { count: bulkResult.successfullyCompleted }) }}
              </span>
              <span v-if="bulkResult.failed > 0" class="ml-2 text-red-600 dark:text-red-400">
                {{ $t('worker.bulkFailed', { count: bulkResult.failed }) }}
              </span>
              <span v-if="bulkResult.totalCodCollected > 0" class="ml-2 text-emerald-600 dark:text-emerald-400">
                COD: {{ formatCurrency(bulkResult.totalCodCollected) }}
              </span>
            </div>
            <button @click="dismissBulkResult" class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
          <!-- Show errors if any -->
          <div v-if="bulkResult.errors.length > 0" class="mt-2 text-xs text-red-600 dark:text-red-400">
            <div v-for="(error, idx) in bulkResult.errors.slice(0, 3)" :key="idx">
              {{ error }}
            </div>
            <div v-if="bulkResult.errors.length > 3" class="text-gray-500">
              {{ $t('common.andMore', { count: bulkResult.errors.length - 3 }) }}
            </div>
          </div>
        </div>

        <!-- Bulk Delivery Assignment Result Banner -->
        <div
          v-if="bulkDeliveryResult"
          class="mb-4 p-3 rounded-lg"
          :class="bulkDeliveryResult.failed > 0 ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800' : 'bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800'"
        >
          <div class="flex items-center justify-between">
            <div class="text-sm flex items-center gap-2">
              <TruckIcon class="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span class="font-medium" :class="bulkDeliveryResult.failed > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-orange-700 dark:text-orange-300'">
                {{ $t('worker.deliveryAssignedBulk', { count: bulkDeliveryResult.successfullyAssigned }) }}
              </span>
              <span v-if="bulkDeliveryResult.failed > 0" class="text-red-600 dark:text-red-400">
                {{ $t('worker.bulkFailed', { count: bulkDeliveryResult.failed }) }}
              </span>
            </div>
            <button @click="dismissBulkDeliveryResult" class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
          <!-- Show errors if any -->
          <div v-if="bulkDeliveryResult.errors.length > 0" class="mt-2 text-xs text-red-600 dark:text-red-400">
            <div v-for="(error, idx) in bulkDeliveryResult.errors.slice(0, 3)" :key="idx">
              {{ error }}
            </div>
            <div v-if="bulkDeliveryResult.errors.length > 3" class="text-gray-500">
              {{ $t('common.andMore', { count: bulkDeliveryResult.errors.length - 3 }) }}
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>

        <div v-else-if="activeAssignments.length === 0" class="text-center py-8">
          <TruckIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400">{{ $t('worker.noActiveSuivi') }}</p>
        </div>

        <div v-else class="space-y-2 max-h-[600px] overflow-y-auto">
          <div
            v-for="assignment in activeAssignments"
            :key="assignment.id"
            class="p-3 border rounded-lg transition-colors"
            :class="isSelected(assignment.id)
              ? 'border-primary-400 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/30 ring-1 ring-primary-400 dark:ring-primary-600'
              : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'"
          >
            <!-- Header: Checkbox + Code + Price + View -->
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :checked="isSelected(assignment.id)"
                  @change="toggleSelection(assignment.id)"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <span class="font-mono font-semibold text-primary-600 dark:text-primary-400 text-sm">
                  {{ assignment.orderCode }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-base font-bold text-emerald-600 dark:text-emerald-400">
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

            <!-- Customer Info Row -->
            <div class="flex items-center justify-between gap-2">
              <p class="font-medium text-gray-900 dark:text-white text-sm truncate flex-1">
                {{ assignment.customerName }}
              </p>
              <a
                :href="'tel:' + assignment.customerPhone"
                class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
              >
                <PhoneIcon class="w-3 h-3" />
                {{ assignment.customerPhone }}
              </a>
            </div>

            <!-- Delivery Company (compact inline) or Needs Assignment badge -->
            <div v-if="assignment.deliveryCompanyName" class="flex items-center gap-2 mt-1 text-xs text-orange-600 dark:text-orange-400">
              <TruckIcon class="w-3 h-3 shrink-0" />
              <span class="truncate">
                {{ assignment.deliveryCompanyName }}
                <span v-if="assignment.subDeliveryCompanyName" class="text-orange-400 dark:text-orange-500">
                  → {{ assignment.subDeliveryCompanyName }}
                </span>
              </span>
              <a
                v-if="assignment.deliveryCompanyPhone"
                :href="'tel:' + assignment.deliveryCompanyPhone"
                class="hover:underline shrink-0"
              >
                {{ assignment.deliveryCompanyPhone }}
              </a>
            </div>
            <!-- Needs Delivery Company badge + Assign button -->
            <div v-else class="flex items-center gap-2 mt-1">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 rounded-full">
                <ExclamationTriangleIcon class="w-3 h-3" />
                {{ $t('worker.needsDelivery') }}
              </span>
              <button
                @click="emit('assign-delivery', assignment)"
                class="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 rounded hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
              >
                {{ $t('worker.assignDelivery') }}
              </button>
            </div>

            <!-- Previous notes (from confirmation agent) -->
            <div v-if="assignment.notes" class="mt-1.5 p-2 bg-gray-100 dark:bg-gray-700/50 rounded text-xs text-gray-600 dark:text-gray-400 italic">
              <ChatBubbleLeftIcon class="w-3 h-3 inline mr-1" />
              {{ assignment.notes }}
            </div>

            <!-- Actions Row 1: Contact buttons -->
            <div class="flex gap-1.5 mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
              <a
                :href="'tel:' + assignment.customerPhone"
                class="btn-secondary flex-1 text-xs py-1.5 flex items-center justify-center"
              >
                <PhoneIcon class="w-3.5 h-3.5 mr-1" />
                {{ $t('worker.call') }}
              </a>
              <a
                v-if="enableWhatsApp"
                :href="getWhatsAppLink(assignment.customerPhone)"
                target="_blank"
                class="btn-secondary flex-1 text-xs py-1.5 flex items-center justify-center text-green-600 dark:text-green-400"
              >
                <ChatBubbleLeftRightIcon class="w-3.5 h-3.5 mr-1" />
                WA
              </a>
              <a
                v-if="assignment.deliveryCompanyPhone"
                :href="'tel:' + assignment.deliveryCompanyPhone"
                class="btn-secondary flex-1 text-xs py-1.5 flex items-center justify-center text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700"
              >
                <TruckIcon class="w-3.5 h-3.5 mr-1" />
                Livreur
              </a>
            </div>

            <!-- Actions Row 2: Complete buttons -->
            <div class="flex gap-1.5 mt-1.5">
              <button
                @click="quickComplete(assignment, SuiviResult.Delivered)"
                class="btn-primary flex-1 text-xs py-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircleIcon class="w-3.5 h-3.5 mr-1" />
                {{ $t('worker.delivered') }}
              </button>
              <button
                @click="quickComplete(assignment, SuiviResult.Returned)"
                class="btn-secondary flex-1 text-xs py-1.5 text-orange-600 dark:text-orange-400"
              >
                <ArrowUturnLeftIcon class="w-3.5 h-3.5 mr-1" />
                {{ $t('orders.returned') }}
              </button>
              <button
                @click="openCompleteModal(assignment)"
                class="btn-secondary text-xs py-1.5 px-2"
                :title="$t('worker.moreOptions')"
              >
                <EllipsisHorizontalIcon class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Complete Suivi Modal -->
    <WorkerCompleteSuiviModal
      v-model="showCompleteModal"
      :assignment="selectedAssignment"
      :tracking-states="shippingTrackingStates"
      @submit="handleCompleteSuivi"
    />

    <!-- Bulk Assign Delivery Modal -->
    <OrdersBulkAssignDeliveryModal
      :show="showBulkAssignDeliveryModal"
      :order-count="selectedAssignments.size"
      :delivery-companies="deliveryCompanies"
      :sub-delivery-companies="subDeliveryCompanies"
      :is-submitting="isBulkAssignDeliveryProcessing"
      @close="showBulkAssignDeliveryModal = false"
      @submit="handleBulkAssignDelivery"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ClockIcon,
  TruckIcon,
  InboxIcon,
  HandRaisedIcon,
  PhoneIcon,
  CheckCircleIcon,
  ArrowUturnLeftIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  SparklesIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useOrderAssignmentsService, type WorkerAssignmentDto, type BulkCompleteSuiviAssignmentsResponse } from '~/services'
import { useOrdersWorkflowService, type BulkAssignDeliveryCompanyResponse } from '~/services/orders/useOrdersService'
import { trackingStatesSearch } from '~/api/generated/endpoints/tracking-states/tracking-states'
import { deliveryCompaniesSearch } from '~/api/generated/endpoints/delivery-companies/delivery-companies'
import { subDeliveryCompaniesSearch } from '~/api/generated/endpoints/sub-delivery-companies/sub-delivery-companies'
import { ServiceTypes, SuiviResult } from '~/constants/order'
import type { SuiviResultType } from '~/constants/order'
import type { DeliveryCompany } from '~/types/deliverycompany'
import type { SubDeliveryCompany } from '~/types/subDeliveryCompany'

const emit = defineEmits<{
  (e: 'assign-delivery', assignment: WorkerAssignmentDto): void
  (e: 'view-order', assignment: WorkerAssignmentDto): void
}>()

const { t } = useI18n()
const notification = useNotification()

// Services
const orderAssignmentsService = useOrderAssignmentsService()
const ordersWorkflow = useOrdersWorkflowService()

// Query params for filtering by service type
const pendingParams = ref({ serviceType: ServiceTypes.Suivi })
const activeParams = ref({ serviceType: ServiceTypes.Suivi })

// Vue Query hooks
const myPendingQuery = orderAssignmentsService.useMyPendingAssignments(pendingParams)
const myActiveQuery = orderAssignmentsService.useMyActiveAssignments(activeParams)

// Computed from queries
const myPendingAssignments = computed(() => myPendingQuery.data.value ?? [])
const myActiveAssignments = computed(() => myActiveQuery.data.value ?? [])
const isLoading = computed(() => myPendingQuery.isLoading.value || myActiveQuery.isLoading.value)

// Stats query for delivered/issues counters
const statsServiceType = ref(ServiceTypes.Suivi)
const myStatsQuery = orderAssignmentsService.useMyStats(statsServiceType)
const deliveredTodayCount = computed(() => myStatsQuery.data.value?.deliveredTodayCount ?? 0)
const issuesCount = computed(() => myStatsQuery.data.value?.issuesCount ?? 0)

// State
const isTaking = ref(false)
const showCompleteModal = ref(false)
const selectedAssignment = ref<WorkerAssignmentDto | null>(null)
const shippingTrackingStates = ref<{ id: string; state: string }[]>([])
const enableWhatsApp = ref(true)

// Bulk selection state
const selectedAssignments = ref<Set<string>>(new Set())
const isBulkProcessing = ref(false)
const bulkResult = ref<BulkCompleteSuiviAssignmentsResponse | null>(null)
const bulkDeliveryResult = ref<BulkAssignDeliveryCompanyResponse | null>(null)

// Bulk Assign Delivery modal state
const showBulkAssignDeliveryModal = ref(false)
const deliveryCompanies = ref<DeliveryCompany[]>([])
const subDeliveryCompanies = ref<SubDeliveryCompany[]>([])
const isBulkAssignDeliveryProcessing = ref(false)

// Selection helpers
const isSelected = (id: string) => selectedAssignments.value.has(id)

const toggleSelection = (id: string) => {
  const newSet = new Set(selectedAssignments.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  selectedAssignments.value = newSet
}

const selectAll = () => {
  const allIds = activeAssignments.value.map(a => a.id)
  selectedAssignments.value = new Set(allIds)
}

const deselectAll = () => {
  selectedAssignments.value = new Set()
}

const isAllSelected = computed(() => {
  return activeAssignments.value.length > 0 &&
    selectedAssignments.value.size === activeAssignments.value.length
})

// Filtered assignments (already filtered by service type via params)
const pendingAssignments = computed(() => myPendingAssignments.value)
const activeAssignments = computed(() => myActiveAssignments.value)

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

const getWhatsAppLink = (phone: string) => {
  // Format Moroccan phone for WhatsApp
  let formattedPhone = phone.replace(/\s/g, '').replace(/^0/, '212')
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = '+' + formattedPhone
  }
  return `https://wa.me/${formattedPhone}`
}

// Attempt tracking helpers
const formatLastAttemptResult = (result: string) => {
  const resultMap: Record<string, string> = {
    no_response: t('worker.noResponse'),
    in_progress: t('worker.inProgress'),
    postponed: t('worker.postponed'),
    refused: t('worker.refused')
  }
  return resultMap[result] || result
}

const getAttemptBadgeClass = (attemptCount: number) => {
  if (attemptCount === 0) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  } else if (attemptCount <= 2) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  } else {
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  }
}

const formatTimeAgo = (date: string | null | undefined) => {
  if (!date) return ''
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}j`
  if (diffHours > 0) return `${diffHours}h`
  if (diffMins > 0) return `${diffMins}min`
  return t('worker.justNow')
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

const openCompleteModal = (assignment: WorkerAssignmentDto) => {
  selectedAssignment.value = assignment
  showCompleteModal.value = true
}

const quickComplete = async (assignment: WorkerAssignmentDto, result: typeof SuiviResult.Delivered | typeof SuiviResult.Returned) => {
  // Find appropriate tracking state
  const trackingState = shippingTrackingStates.value.find(s => {
    const stateLower = s.state.toLowerCase()
    if (result === SuiviResult.Delivered) {
      return stateLower.includes('livré') || stateLower.includes(SuiviResult.Delivered)
    } else {
      return stateLower.includes('retour') || stateLower.includes('return')
    }
  })

  if (!trackingState) {
    // Open modal if no matching state found
    selectedAssignment.value = assignment
    showCompleteModal.value = true
    return
  }

  try {
    const requestData = {
      trackingStateId: trackingState.id,
      result,
      codAmountCollected: result === SuiviResult.Delivered ? (assignment.totalPrice || assignment.orderPrice) : undefined
    }
    console.log('[SuiviPanel] completeSuivi request:', { assignmentId: assignment.id, ...requestData })
    console.log('[SuiviPanel] shippingTrackingStates:', shippingTrackingStates.value)
    await orderAssignmentsService.completeSuivi(assignment.id, requestData)
  } catch (error: any) {
    console.error('[SuiviPanel] completeSuivi error:', error)
    console.error('[SuiviPanel] error response:', error?.response?.data || error?.message)
    // Handle reassigned assignment error (HTTP 409)
    if (error?.response?.status === 409) {
      notification.warning(t('worker.orderReassigned'))
    }
  }
}

const handleCompleteSuivi = async (data: {
  trackingStateId: string
  result: SuiviResultType
  notes?: string
  codAmountCollected?: number
  postponedUntil?: string
}) => {
  if (!selectedAssignment.value) return
  console.log('[SuiviPanel] handleCompleteSuivi - data from modal:', data)
  console.log('[SuiviPanel] handleCompleteSuivi - trackingStateId is empty?', !data.trackingStateId)
  console.log('[SuiviPanel] handleCompleteSuivi - available tracking states:', shippingTrackingStates.value)
  try {
    await orderAssignmentsService.completeSuivi(selectedAssignment.value.id, data)
    showCompleteModal.value = false
    selectedAssignment.value = null
  } catch (error: any) {
    console.error('[SuiviPanel] handleCompleteSuivi error:', error?.response?.data || error)
    // Handle reassigned assignment error (HTTP 409)
    if (error?.response?.status === 409) {
      notification.warning(t('worker.orderReassigned'))
      showCompleteModal.value = false
      selectedAssignment.value = null
    }
  }
}

// Bulk complete suivi
const handleBulkComplete = async (result: typeof SuiviResult.Delivered | typeof SuiviResult.Returned) => {
  if (selectedAssignments.value.size === 0) return

  // Find appropriate tracking state
  const trackingState = shippingTrackingStates.value.find(s => {
    const stateLower = s.state.toLowerCase()
    if (result === SuiviResult.Delivered) {
      return stateLower.includes('livré') || stateLower.includes(SuiviResult.Delivered)
    } else {
      return stateLower.includes('retour') || stateLower.includes('return')
    }
  })

  if (!trackingState) {
    console.error('[SuiviPanel] No matching tracking state found for result:', result)
    return
  }

  isBulkProcessing.value = true
  bulkResult.value = null

  try {
    const response = await orderAssignmentsService.bulkCompleteSuivi({
      assignmentIds: Array.from(selectedAssignments.value),
      trackingStateId: trackingState.id,
      result
    })

    bulkResult.value = response
    console.log('[SuiviPanel] Bulk complete result:', response)

    // Clear selection after successful bulk operation
    if (response.successfullyCompleted > 0) {
      deselectAll()
    }

    // Auto-hide result after 5 seconds if all successful
    if (response.failed === 0) {
      setTimeout(() => {
        bulkResult.value = null
      }, 5000)
    }
  } catch (error: any) {
    console.error('[SuiviPanel] Bulk complete error:', error?.response?.data || error)
  } finally {
    isBulkProcessing.value = false
  }
}

const dismissBulkResult = () => {
  bulkResult.value = null
}

const dismissBulkDeliveryResult = () => {
  bulkDeliveryResult.value = null
}

// Open bulk assign delivery modal
const openBulkAssignDeliveryModal = () => {
  showBulkAssignDeliveryModal.value = true
}

// Handle bulk assign delivery company submission
const handleBulkAssignDelivery = async (data: { deliveryCompanyId: string; subDeliveryCompanyId?: string }) => {
  if (selectedAssignments.value.size === 0) return

  isBulkAssignDeliveryProcessing.value = true
  bulkDeliveryResult.value = null

  try {
    // Get ORDER IDs from selected assignments (not assignment IDs)
    const orderIds = activeAssignments.value
      .filter(a => selectedAssignments.value.has(a.id))
      .map(a => a.orderId)

    const response = await ordersWorkflow.bulkAssignDeliveryCompany({
      orderIds,
      deliveryCompanyId: data.deliveryCompanyId,
      subDeliveryCompanyId: data.subDeliveryCompanyId
    })

    bulkDeliveryResult.value = response
    console.log('[SuiviPanel] Bulk assign delivery result:', response)

    // Clear selection after successful bulk operation
    if (response.successfullyAssigned > 0) {
      deselectAll()
    }

    // Auto-hide result after 5 seconds if all successful
    if (response.failed === 0) {
      setTimeout(() => {
        bulkDeliveryResult.value = null
      }, 5000)
    }
  } catch (error: any) {
    console.error('[SuiviPanel] Bulk assign delivery error:', error?.response?.data || error)
  } finally {
    isBulkAssignDeliveryProcessing.value = false
    showBulkAssignDeliveryModal.value = false
  }
}

// Load tracking states filtered by shipping phase
const loadTrackingStates = async () => {
  try {
    const response = await trackingStatesSearch({ pageNumber: 1, pageSize: 100 })
    const allStates = response.data || []

    // Try to filter for shipping phase states first
    let filteredStates = allStates.filter((s: any) => s.phases?.toLowerCase().includes('shipping'))

    // If no shipping states found, use all states as fallback
    if (filteredStates.length === 0) {
      console.warn('[SuiviPanel] No shipping phase tracking states found, using all states')
      filteredStates = allStates
    }

    shippingTrackingStates.value = filteredStates.map((s: any) => ({ id: s.id, state: s.state }))
    console.log('[SuiviPanel] Loaded tracking states:', shippingTrackingStates.value)
  } catch (error) {
    console.error('[SuiviPanel] Failed to load tracking states:', error)
    shippingTrackingStates.value = []
  }
}

// Load delivery companies for bulk assign modal
const loadDeliveryCompanies = async () => {
  try {
    const [dcResponse, sdcResponse] = await Promise.all([
      deliveryCompaniesSearch({ pageNumber: 1, pageSize: 100 }),
      subDeliveryCompaniesSearch({ pageNumber: 1, pageSize: 200 })
    ])
    deliveryCompanies.value = (dcResponse.data || []) as unknown as DeliveryCompany[]
    subDeliveryCompanies.value = (sdcResponse.data || []) as unknown as SubDeliveryCompany[]
    console.log('[SuiviPanel] Loaded delivery companies:', deliveryCompanies.value.length, 'sub:', subDeliveryCompanies.value.length)
  } catch (error) {
    console.error('[SuiviPanel] Failed to load delivery companies:', error)
    deliveryCompanies.value = []
    subDeliveryCompanies.value = []
  }
}

// Load tracking states on mount (Vue Query handles assignment loading)
onMounted(async () => {
  await Promise.all([
    loadTrackingStates(),
    loadDeliveryCompanies()
  ])
})

// Expose refresh method
defineExpose({
  refresh: async () => {
    await Promise.all([
      myPendingQuery.refetch(),
      myActiveQuery.refetch(),
      myStatsQuery.refetch()
    ])
  }
})
</script>
