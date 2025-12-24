<template>
  <div>
    <!-- Stats Row -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <WorkerStatCard
        :label="$t('worker.overdueCallbacks')"
        :count="overdueCount"
        color="red"
        icon-type="warning"
      />
      <WorkerStatCard
        :label="$t('worker.todayCallbacks')"
        :count="todayCount"
        color="yellow"
        icon-type="pending"
      />
      <WorkerStatCard
        :label="$t('worker.upcomingCallbacks')"
        :count="upcomingCount"
        color="green"
        icon-type="callback"
      />
    </div>

    <!-- Filters -->
    <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
      <button
        v-for="f in filters"
        :key="f.value"
        @click="activeFilter = f.value"
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
          activeFilter === f.value
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        ]"
      >
        {{ f.label }}
        <span
          v-if="f.count > 0"
          :class="[
            'ml-1.5 px-1.5 py-0.5 text-xs rounded-full',
            activeFilter === f.value
              ? 'bg-white/20 text-white'
              : f.value === 'overdue'
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
          ]"
        >
          {{ f.count }}
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <!-- Empty State - only show when NO callbacks at all -->
    <div v-else-if="allCallbacks.length === 0" class="text-center py-8">
      <PhoneArrowUpRightIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p class="text-gray-500 dark:text-gray-400">{{ $t('worker.noCallbacks') }}</p>
    </div>

    <!-- Two Column Layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Confirmation Callbacks Column -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckIcon class="w-5 h-5 text-purple-500" />
            {{ $t('worker.confirmation') }}
          </h2>
          <span class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
            {{ confirmationCallbacks.length }}
          </span>
        </div>

        <div v-if="confirmationCallbacks.length === 0" class="text-center py-8">
          <PhoneArrowUpRightIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400">{{ $t('worker.noCallbacks') }}</p>
        </div>

        <div v-else class="space-y-3 max-h-[600px] overflow-y-auto">
          <div
            v-for="callback in confirmationCallbacks"
            :key="callback.id"
            :class="[
              'p-3 rounded-lg border transition-all',
              callback.isCallbackOverdue
                ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                : 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20'
            ]"
          >
            <!-- Header: Code + Retry Count + Price + View -->
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span class="font-mono font-semibold text-primary-600 dark:text-primary-400 text-sm">
                  {{ callback.orderCode }}
                </span>
                <span
                  v-if="callback.callbackAttemptNumber > 0"
                  class="px-1.5 py-0.5 text-xs font-medium bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200 rounded flex items-center gap-0.5"
                >
                  <ArrowPathIcon class="w-3 h-3" />
                  x{{ callback.callbackAttemptNumber }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {{ formatCurrency(callback.totalPrice || callback.orderPrice) }}
                </span>
                <button
                  @click="emit('view-order', callback)"
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
                {{ callback.customerName }}
              </p>
              <div class="flex items-center gap-2 shrink-0 text-xs">
                <a
                  :href="'tel:' + callback.customerPhone"
                  class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <PhoneIcon class="w-3 h-3" />
                  {{ callback.customerPhone }}
                </a>
                <span v-if="callback.customerCity || callback.cityName" class="text-gray-400 dark:text-gray-500">
                  {{ callback.customerCity || callback.cityName }}
                </span>
              </div>
            </div>

            <!-- Attempt Badge (for confirmation callbacks) -->
            <div class="flex items-center gap-2 mt-1">
              <span
                v-if="!callback.attemptCount || callback.attemptCount === 0"
                class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                <SparklesIcon class="w-3 h-3" />
                {{ $t('worker.newOrder') }}
              </span>
              <template v-else>
                <span
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded-full"
                  :class="getAttemptBadgeClass(callback.attemptCount)"
                >
                  <ArrowPathIcon class="w-3 h-3" />
                  {{ $t('worker.attempt') }} #{{ callback.attemptCount }}
                </span>
                <span v-if="callback.lastAttemptResult" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatLastAttemptResult(callback.lastAttemptResult) }}
                </span>
                <span v-if="callback.lastAttemptAt" class="text-xs text-gray-400 dark:text-gray-500">
                  · {{ formatTimeAgo(callback.lastAttemptAt) }}
                </span>
              </template>
            </div>

            <!-- Scheduled Time -->
            <div
              :class="[
                'flex items-center gap-1.5 text-xs mt-1',
                callback.isCallbackOverdue
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-purple-600 dark:text-purple-400'
              ]"
            >
              <ClockIcon class="w-3 h-3" />
              <span>{{ formatCallbackTime(callback.callbackScheduledAt) }}</span>
              <span
                v-if="callback.isCallbackOverdue"
                class="px-1 py-0.5 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 rounded"
              >
                {{ $t('worker.overdue') }}
              </span>
            </div>

            <!-- Notes History (if any) -->
            <div
              v-if="callback.notes"
              class="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs text-gray-600 dark:text-gray-400 max-h-20 overflow-y-auto"
            >
              <div class="flex items-start gap-1">
                <ChatBubbleLeftIcon class="w-3 h-3 mt-0.5 shrink-0" />
                <pre class="whitespace-pre-wrap font-sans text-xs">{{ callback.notes }}</pre>
              </div>
            </div>

            <!-- Actions for Confirmation -->
            <div class="flex gap-2 mt-2 pt-2 border-t border-purple-200 dark:border-purple-700">
              <a
                :href="'tel:' + callback.customerPhone"
                class="btn-primary flex-1 text-xs py-1.5 flex items-center justify-center"
              >
                <PhoneIcon class="w-3 h-3 mr-1" />
                {{ $t('worker.call') }}
              </a>
              <button
                @click="emit('confirm', callback)"
                class="btn-secondary text-xs py-1.5 px-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                :title="$t('orders.confirmOrder')"
              >
                <CheckIcon class="w-4 h-4" />
              </button>
              <button
                @click="emit('cancel', callback)"
                class="btn-secondary text-xs py-1.5 px-2 text-red-600 hover:text-red-700 dark:text-red-400"
                :title="$t('orders.cancelOrder')"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
              <button
                @click="openRescheduleModal(callback)"
                class="btn-secondary text-xs py-1.5 px-2 text-purple-600 hover:text-purple-700 dark:text-purple-400"
                :title="$t('worker.rescheduleCallback')"
              >
                <CalendarIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Suivi Callbacks Column -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TruckIcon class="w-5 h-5 text-blue-500" />
            {{ $t('worker.suivi') }}
          </h2>
          <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
            {{ suiviCallbacks.length }}
          </span>
        </div>

        <!-- Bulk Actions Bar -->
        <div v-if="suiviCallbacks.length > 0" class="flex items-center justify-between gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="isAllSuiviSelected"
              :indeterminate="isSomeSuiviSelected && !isAllSuiviSelected"
              @change="toggleSelectAllSuivi"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ selectedSuiviIds.length > 0 ? `${selectedSuiviIds.length} ${$t('common.selected')}` : $t('common.selectAll') }}
            </span>
          </label>
          <div v-if="selectedSuiviIds.length > 0" class="flex items-center gap-2">
            <button
              @click="openBulkAssignDeliveryModal"
              class="btn-secondary text-xs py-1 px-2 flex items-center gap-1"
              :class="assignableSelectedCount > 0
                ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'"
              :disabled="isBulkProcessing || assignableSelectedCount === 0"
              :title="assignableSelectedCount > 0 ? $t('worker.bulkAssignDelivery') : $t('worker.noAssignableOrders')"
            >
              <TruckIcon class="w-3.5 h-3.5" />
              {{ $t('worker.assignDelivery') }}
              <span v-if="assignableSelectedCount < selectedSuiviIds.length" class="text-xs text-gray-500">
                ({{ assignableSelectedCount }})
              </span>
            </button>
            <button
              @click="handleBulkDelivered"
              class="btn-secondary text-xs py-1 px-2 flex items-center gap-1"
              :class="deliverableSelectedCount > 0
                ? 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'"
              :disabled="isBulkProcessing || deliverableSelectedCount === 0"
              :title="deliverableSelectedCount > 0 ? $t('worker.bulkDelivered') : $t('worker.noDeliverableOrders')"
            >
              <CheckCircleIcon class="w-3.5 h-3.5" />
              {{ $t('worker.delivered') }}
              <span v-if="deliverableSelectedCount < selectedSuiviIds.length" class="text-xs text-gray-500">
                ({{ deliverableSelectedCount }})
              </span>
            </button>
          </div>
        </div>

        <div v-if="suiviCallbacks.length === 0" class="text-center py-8">
          <PhoneArrowUpRightIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400">{{ $t('worker.noCallbacks') }}</p>
        </div>

        <div v-else class="space-y-3 max-h-[600px] overflow-y-auto">
          <div
            v-for="callback in suiviCallbacks"
            :key="callback.id"
            :class="[
              'p-3 rounded-lg border transition-all',
              callback.isCallbackOverdue
                ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
            ]"
          >
            <!-- Header: Checkbox + Code + Retry Count + Price + View -->
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :checked="selectedSuiviIds.includes(callback.id)"
                  @change="toggleSuiviSelection(callback.id)"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  @click.stop
                />
                <span class="font-mono font-semibold text-primary-600 dark:text-primary-400 text-sm">
                  {{ callback.orderCode }}
                </span>
                <span
                  v-if="callback.callbackAttemptNumber > 0"
                  class="px-1.5 py-0.5 text-xs font-medium bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200 rounded flex items-center gap-0.5"
                >
                  <ArrowPathIcon class="w-3 h-3" />
                  x{{ callback.callbackAttemptNumber }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {{ formatCurrency(callback.totalPrice || callback.orderPrice) }}
                </span>
                <button
                  @click="emit('view-order', callback)"
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
                {{ callback.customerName }}
              </p>
              <div class="flex items-center gap-2 shrink-0 text-xs">
                <a
                  :href="'tel:' + callback.customerPhone"
                  class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <PhoneIcon class="w-3 h-3" />
                  {{ callback.customerPhone }}
                </a>
                <span v-if="callback.customerCity || callback.cityName" class="text-gray-400 dark:text-gray-500">
                  {{ callback.customerCity || callback.cityName }}
                </span>
              </div>
            </div>

            <!-- Attempt Badge (for suivi callbacks) -->
            <div class="flex items-center gap-2 mt-1">
              <span
                v-if="!callback.attemptCount || callback.attemptCount === 0"
                class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                <SparklesIcon class="w-3 h-3" />
                {{ $t('worker.newOrder') }}
              </span>
              <template v-else>
                <span
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded-full"
                  :class="getAttemptBadgeClass(callback.attemptCount)"
                >
                  <ArrowPathIcon class="w-3 h-3" />
                  {{ $t('worker.attempt') }} #{{ callback.attemptCount }}
                </span>
                <span v-if="callback.lastAttemptResult" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatLastAttemptResult(callback.lastAttemptResult) }}
                </span>
                <span v-if="callback.lastAttemptAt" class="text-xs text-gray-400 dark:text-gray-500">
                  · {{ formatTimeAgo(callback.lastAttemptAt) }}
                </span>
              </template>
            </div>

            <!-- Delivery Company Info (Suivi specific) -->
            <div v-if="callback.deliveryCompanyName" class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mt-1">
              <TruckIcon class="w-3 h-3" />
              <span>{{ callback.deliveryCompanyName }}</span>
              <span v-if="callback.subDeliveryCompanyName" class="text-gray-400">
                → {{ callback.subDeliveryCompanyName }}
              </span>
            </div>

            <!-- Suivi Result & Tracking State -->
            <div v-if="callback.suiviResult || callback.trackingStateName" class="flex items-center gap-2 text-xs mt-1">
              <span v-if="callback.suiviResult" :class="getSuiviResultClass(callback.suiviResult)">
                {{ formatSuiviResult(callback.suiviResult) }}
              </span>
              <span v-if="callback.trackingStateName" class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                {{ callback.trackingStateName }}
              </span>
            </div>

            <!-- Scheduled Time -->
            <div
              :class="[
                'flex items-center gap-1.5 text-xs mt-1',
                callback.isCallbackOverdue
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-blue-600 dark:text-blue-400'
              ]"
            >
              <ClockIcon class="w-3 h-3" />
              <span>{{ formatCallbackTime(callback.callbackScheduledAt) }}</span>
              <span
                v-if="callback.isCallbackOverdue"
                class="px-1 py-0.5 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 rounded"
              >
                {{ $t('worker.overdue') }}
              </span>
            </div>

            <!-- Notes History (if any) -->
            <div
              v-if="callback.notes"
              class="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs text-gray-600 dark:text-gray-400 max-h-20 overflow-y-auto"
            >
              <div class="flex items-start gap-1">
                <ChatBubbleLeftIcon class="w-3 h-3 mt-0.5 shrink-0" />
                <pre class="whitespace-pre-wrap font-sans text-xs">{{ callback.notes }}</pre>
              </div>
            </div>

            <!-- Actions for Suivi -->
            <div class="flex gap-2 mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
              <a
                :href="'tel:' + callback.customerPhone"
                class="btn-primary flex-1 text-xs py-1.5 flex items-center justify-center"
              >
                <PhoneIcon class="w-3 h-3 mr-1" />
                {{ $t('worker.call') }}
              </a>
              <button
                @click="openAssignDeliveryModal(callback)"
                class="btn-secondary text-xs py-1.5 px-2"
                :class="canAssignDelivery(callback)
                  ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'"
                :title="canAssignDelivery(callback) ? $t('worker.assignDelivery') : $t('worker.orderNeedsConfirmation')"
                :disabled="isMutating || isAssigningDelivery || !canAssignDelivery(callback)"
              >
                <TruckIcon class="w-4 h-4" />
              </button>
              <button
                @click="handleQuickDelivered(callback)"
                class="btn-secondary text-xs py-1.5 px-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                :title="$t('worker.delivered')"
                :disabled="isMutating"
              >
                <CheckCircleIcon class="w-4 h-4" />
              </button>
              <button
                @click="handleQuickReturned(callback)"
                class="btn-secondary text-xs py-1.5 px-2 text-orange-600 hover:text-orange-700 dark:text-orange-400"
                :title="$t('worker.returned')"
                :disabled="isMutating"
              >
                <ArrowUturnLeftIcon class="w-4 h-4" />
              </button>
              <button
                @click="openRescheduleModal(callback)"
                class="btn-secondary text-xs py-1.5 px-2 text-purple-600 hover:text-purple-700 dark:text-purple-400"
                :title="$t('worker.rescheduleCallback')"
              >
                <CalendarIcon class="w-4 h-4" />
              </button>
              <button
                @click="openSuiviModal(callback)"
                class="btn-secondary text-xs py-1.5 px-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                :title="$t('worker.moreOptions')"
              >
                <EllipsisHorizontalIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reschedule Modal -->
    <WorkerCallbackModal
      v-model="showRescheduleModal"
      :assignment="selectedCallback"
      :max-attempts="settings?.maxCallbackAttempts"
      @submit="handleReschedule"
    />

    <!-- Complete Suivi Modal (for suivi callbacks) -->
    <WorkerCompleteSuiviModal
      v-model="showSuiviModal"
      :assignment="selectedSuiviCallback"
      :tracking-states="trackingStatesService.items.value ?? []"
      @submit="handleCompleteSuivi"
    />

    <!-- Assign Delivery Modal (Single) -->
    <AssignDeliveryModal
      :show="showAssignDeliveryModal"
      :order="assignDeliveryOrder"
      :delivery-companies="deliveryCompaniesService.items.value ?? []"
      :sub-delivery-companies="subDeliveryCompaniesService.items.value ?? []"
      :is-submitting="isAssigningDelivery"
      @close="closeAssignDeliveryModal"
      @submit="handleAssignDelivery"
    />

    <!-- Bulk Assign Delivery Modal -->
    <BulkAssignDeliveryModal
      :show="showBulkAssignDeliveryModal"
      :order-count="assignableSelectedCount"
      :delivery-companies="deliveryCompaniesService.items.value ?? []"
      :sub-delivery-companies="subDeliveryCompaniesService.items.value ?? []"
      :is-submitting="isBulkProcessing"
      @close="closeBulkAssignDeliveryModal"
      @submit="handleBulkAssignDelivery"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ClockIcon,
  PhoneIcon,
  PhoneArrowUpRightIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  EyeIcon,
  CheckCircleIcon,
  ArrowUturnLeftIcon,
  EllipsisHorizontalIcon,
  TruckIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'
import {
  useOrderAssignmentsService,
  useTrackingStatesService,
  useDeliveryCompaniesService,
  useSubDeliveryCompaniesService,
  useOrdersWorkflowService,
  type WorkerAssignmentDto
} from '~/services'
import AssignDeliveryModal from '~/components/orders/AssignDeliveryModal.vue'
import BulkAssignDeliveryModal from '~/components/orders/BulkAssignDeliveryModal.vue'
import { ServiceTypes, OrderState, SuiviResult } from '~/constants/order'

const emit = defineEmits<{
  (e: 'confirm', assignment: WorkerAssignmentDto): void
  (e: 'cancel', assignment: WorkerAssignmentDto): void
  (e: 'view-order', assignment: WorkerAssignmentDto): void
}>()

const { t } = useI18n()

// Services
const orderAssignmentsService = useOrderAssignmentsService()
const trackingStatesService = useTrackingStatesService()
const deliveryCompaniesService = useDeliveryCompaniesService()
const subDeliveryCompaniesService = useSubDeliveryCompaniesService()
const ordersWorkflowService = useOrdersWorkflowService()

// Filter state - filtering done in frontend for accurate counts
const activeFilter = ref<string | null>(null)

// Query for my callbacks - always fetch all (no backend filter)
const myCallbacksQuery = orderAssignmentsService.useMyCallbacks()

// Computed - all callbacks from backend
const allCallbacks = computed(() => myCallbacksQuery.data.value ?? [])
const isLoading = computed(() => myCallbacksQuery.isLoading.value)
const isMutating = computed(() => orderAssignmentsService.isMutating.value)

// State
const showRescheduleModal = ref(false)
const showSuiviModal = ref(false)
const showAssignDeliveryModal = ref(false)
const showBulkAssignDeliveryModal = ref(false)
const selectedCallback = ref<WorkerAssignmentDto | null>(null)
const selectedSuiviCallback = ref<WorkerAssignmentDto | null>(null)
const selectedAssignDeliveryCallback = ref<WorkerAssignmentDto | null>(null)
const isAssigningDelivery = ref(false)
const isBulkProcessing = ref(false)
const settings = ref<{ maxCallbackAttempts?: number } | null>(null)

// Bulk selection state for Suivi
const selectedSuiviIds = ref<string[]>([])

// Computed for bulk selection
const isAllSuiviSelected = computed(() =>
  suiviCallbacks.value.length > 0 && selectedSuiviIds.value.length === suiviCallbacks.value.length
)
const isSomeSuiviSelected = computed(() =>
  selectedSuiviIds.value.length > 0 && selectedSuiviIds.value.length < suiviCallbacks.value.length
)

// Selection functions
const toggleSuiviSelection = (id: string) => {
  const index = selectedSuiviIds.value.indexOf(id)
  if (index === -1) {
    selectedSuiviIds.value.push(id)
  } else {
    selectedSuiviIds.value.splice(index, 1)
  }
}

const toggleSelectAllSuivi = () => {
  if (isAllSuiviSelected.value) {
    selectedSuiviIds.value = []
  } else {
    selectedSuiviIds.value = suiviCallbacks.value.map(cb => cb.id)
  }
}

const clearSuiviSelection = () => {
  selectedSuiviIds.value = []
}

// Check if order can have delivery assigned
// Orders in Suivi panel have already passed through confirmation phase,
// so they should be allowed to have delivery assigned regardless of orderState
const canAssignDelivery = (callback: WorkerAssignmentDto) => {
  // If order is in suivi service type, it means it already passed confirmation
  // and should be eligible for delivery assignment
  if (callback.serviceType === ServiceTypes.Suivi) {
    return true
  }
  // For other cases, check orderState
  const state = callback.orderState?.toLowerCase()
  return state === OrderState.Confirmed || state === 'ready_for_delivery' || state === 'awaiting_delivery'
}

// Categorize all callbacks by time
const categorizedCallbacks = computed(() => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  return allCallbacks.value.map(cb => {
    const scheduledAt = new Date(cb.callbackScheduledAt || '')
    const isOverdue = scheduledAt < now
    const isToday = scheduledAt >= todayStart && scheduledAt < todayEnd
    const isUpcoming = scheduledAt >= todayEnd // Future days only
    return {
      ...cb,
      isOverdue,
      isToday,
      isUpcoming,
      category: isOverdue ? 'overdue' : isToday ? 'today' : 'upcoming'
    }
  })
})

// Counts from ALL callbacks
const overdueCount = computed(() =>
  categorizedCallbacks.value.filter(cb => cb.isOverdue).length
)
const todayCount = computed(() =>
  categorizedCallbacks.value.filter(cb => cb.isToday && !cb.isOverdue).length
)
const upcomingCount = computed(() =>
  categorizedCallbacks.value.filter(cb => cb.isUpcoming).length
)

// Filters with counts
const filters = computed(() => [
  { value: null, label: t('common.all'), count: allCallbacks.value.length },
  { value: 'overdue', label: t('worker.overdueCallbacks'), count: overdueCount.value },
  { value: 'today', label: t('worker.todayCallbacks'), count: todayCount.value },
  { value: 'upcoming', label: t('worker.upcomingCallbacks'), count: upcomingCount.value }
])

// Filtered callbacks - frontend filtering based on selected filter
const filteredCallbacks = computed(() => {
  if (!activeFilter.value) {
    return categorizedCallbacks.value
  }
  return categorizedCallbacks.value.filter(cb => cb.category === activeFilter.value)
})

// Split filtered callbacks by service type
const confirmationCallbacks = computed(() =>
  filteredCallbacks.value.filter(cb => cb.serviceType === ServiceTypes.Confirmation)
)
const suiviCallbacks = computed(() =>
  filteredCallbacks.value.filter(cb => cb.serviceType === ServiceTypes.Suivi)
)

// Format helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount)
}

const formatCallbackTime = (isoDate: string | null | undefined) => {
  if (!isoDate) return '-'
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

// Suivi result formatting
const formatSuiviResult = (result: string) => {
  const resultMap: Record<string, string> = {
    delivered: t('worker.delivered'),
    returned: t('worker.returned'),
    in_progress: t('worker.inProgress'),
    no_response: t('worker.noResponse'),
    refused: t('worker.refused'),
    postponed: t('worker.postponed')
  }
  return resultMap[result] || result
}

const getSuiviResultClass = (result: string) => {
  const classMap: Record<string, string> = {
    delivered: 'px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded',
    returned: 'px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded',
    in_progress: 'px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded',
    no_response: 'px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded',
    refused: 'px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded',
    postponed: 'px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded'
  }
  return classMap[result] || 'px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded'
}

// Attempt tracking helpers
const getAttemptBadgeClass = (attemptCount: number) => {
  if (attemptCount === 0) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  } else if (attemptCount <= 2) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  } else {
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  }
}

const formatLastAttemptResult = (result: string) => {
  const resultMap: Record<string, string> = {
    no_response: t('worker.noResponse'),
    in_progress: t('worker.inProgress'),
    postponed: t('worker.postponed'),
    refused: t('worker.refused')
  }
  return resultMap[result] || result
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
const openRescheduleModal = (callback: WorkerAssignmentDto) => {
  selectedCallback.value = callback
  showRescheduleModal.value = true
}

const handleReschedule = async (data: { scheduledAt: string; notes?: string }) => {
  if (!selectedCallback.value) return
  try {
    await orderAssignmentsService.scheduleCallback(selectedCallback.value.id, data)
    showRescheduleModal.value = false
    selectedCallback.value = null
    await myCallbacksQuery.refetch()
  } catch {
    // Error handled by service
  }
}

// Suivi Modal Actions
const openSuiviModal = (callback: WorkerAssignmentDto) => {
  selectedSuiviCallback.value = callback
  showSuiviModal.value = true
}

const handleCompleteSuivi = async (data: {
  result: string
  trackingStateId: string
  notes?: string
  codAmountCollected?: number
  postponedUntil?: string
}) => {
  if (!selectedSuiviCallback.value) return
  try {
    await orderAssignmentsService.completeSuivi(selectedSuiviCallback.value.id, data)
    showSuiviModal.value = false
    selectedSuiviCallback.value = null
    await myCallbacksQuery.refetch()
  } catch {
    // Error handled by service
  }
}

// Helper to find tracking state with refetch if needed
const findTrackingState = async (predicate: (ts: any) => boolean) => {
  let state = trackingStatesService.items.value?.find(predicate)

  // If not found and data might not be loaded yet, trigger refetch and wait
  if (!state && (!trackingStatesService.items.value || trackingStatesService.items.value.length === 0)) {
    trackingStatesService.refetch()
    // Wait a bit for the refetch to complete
    await new Promise(resolve => setTimeout(resolve, 500))
    state = trackingStatesService.items.value?.find(predicate)
  }

  return state
}

// Quick actions for Suivi callbacks
const handleQuickDelivered = async (callback: WorkerAssignmentDto) => {
  // Find "delivered" tracking state - TrackingStateDto uses 'state' field not 'code' or 'name'
  const deliveredState = await findTrackingState(
    ts => ts.state?.toLowerCase() === SuiviResult.Delivered || ts.state?.toLowerCase().includes('livré')
  )

  if (!deliveredState) {
    console.error('Delivered tracking state not found. Available states:', trackingStatesService.items.value?.map(s => s.state))
    return
  }

  try {
    await orderAssignmentsService.completeSuivi(callback.id, {
      result: SuiviResult.Delivered,
      trackingStateId: deliveredState.id
    })
    await myCallbacksQuery.refetch()
  } catch {
    // Error handled by service
  }
}

const handleQuickReturned = async (callback: WorkerAssignmentDto) => {
  // Find "returned" tracking state - TrackingStateDto uses 'state' field
  const returnedState = await findTrackingState(
    ts => ts.state?.toLowerCase() === SuiviResult.Returned || ts.state?.toLowerCase().includes('retour')
  )

  if (!returnedState) {
    console.error('Returned tracking state not found. Available states:', trackingStatesService.items.value)
    return
  }

  try {
    await orderAssignmentsService.completeSuivi(callback.id, {
      result: SuiviResult.Returned,
      trackingStateId: returnedState.id
    })
    await myCallbacksQuery.refetch()
  } catch {
    // Error handled by service
  }
}

// Assign Delivery Modal
const assignDeliveryOrder = computed(() => {
  if (!selectedAssignDeliveryCallback.value) return null
  // Map WorkerAssignmentDto to Order-like object for AssignDeliveryModal
  const cb = selectedAssignDeliveryCallback.value
  return {
    id: cb.orderId,
    code: cb.orderCode,
    fullName: cb.customerName,
    phone: cb.customerPhone,
    cityName: cb.customerCity || cb.cityName,
    deliveryCompanyId: cb.deliveryCompanyId,
    subDeliveryCompanyId: cb.subDeliveryCompanyId
  }
})

const openAssignDeliveryModal = (callback: WorkerAssignmentDto) => {
  selectedAssignDeliveryCallback.value = callback
  showAssignDeliveryModal.value = true
}

const closeAssignDeliveryModal = () => {
  showAssignDeliveryModal.value = false
  selectedAssignDeliveryCallback.value = null
}

const handleAssignDelivery = async (data: {
  orderId: string
  deliveryCompanyId: string
  subDeliveryCompanyId?: string
}) => {
  isAssigningDelivery.value = true
  try {
    await ordersWorkflowService.assignDeliveryCompany(data)
    closeAssignDeliveryModal()
    await myCallbacksQuery.refetch()
  } catch {
    // Error handled by service
  } finally {
    isAssigningDelivery.value = false
  }
}

// ==================== BULK ACTIONS ====================

// Get selected suivi callbacks
const selectedSuiviCallbacks = computed(() =>
  suiviCallbacks.value.filter(cb => selectedSuiviIds.value.includes(cb.id))
)

// Get count of selected callbacks that can have delivery assigned
const assignableSelectedCount = computed(() =>
  selectedSuiviCallbacks.value.filter(cb => canAssignDelivery(cb)).length
)

// Get count of selected callbacks that can be marked as delivered (same logic - must be confirmed)
const deliverableSelectedCount = computed(() =>
  selectedSuiviCallbacks.value.filter(cb => canAssignDelivery(cb)).length
)

// Bulk Assign Delivery Modal
const openBulkAssignDeliveryModal = () => {
  if (selectedSuiviIds.value.length === 0) return
  showBulkAssignDeliveryModal.value = true
}

const closeBulkAssignDeliveryModal = () => {
  showBulkAssignDeliveryModal.value = false
}

const handleBulkAssignDelivery = async (data: {
  deliveryCompanyId: string
  subDeliveryCompanyId?: string
}) => {
  if (assignableSelectedCount.value === 0) return

  isBulkProcessing.value = true
  try {
    // Get order IDs from selected callbacks that can have delivery assigned
    const assignableCallbacks = selectedSuiviCallbacks.value.filter(cb => canAssignDelivery(cb))
    const orderIds = assignableCallbacks.map(cb => cb.orderId)

    // Use bulk assign from ordersService
    await ordersWorkflowService.bulkAssignDeliveryCompany({
      orderIds,
      deliveryCompanyId: data.deliveryCompanyId,
      subDeliveryCompanyId: data.subDeliveryCompanyId
    })

    closeBulkAssignDeliveryModal()
    clearSuiviSelection()
    await myCallbacksQuery.refetch()
  } catch {
    // Error handled by service
  } finally {
    isBulkProcessing.value = false
  }
}

// Bulk Mark as Delivered
const handleBulkDelivered = async () => {
  if (deliverableSelectedCount.value === 0) return

  // Find "delivered" tracking state - TrackingStateDto uses 'state' field
  const deliveredState = await findTrackingState(
    ts => ts.state?.toLowerCase() === SuiviResult.Delivered || ts.state?.toLowerCase().includes('livré')
  )

  if (!deliveredState) {
    console.error('Delivered tracking state not found. Available states:', trackingStatesService.items.value?.map(s => s.state))
    return
  }

  isBulkProcessing.value = true
  try {
    // Only process callbacks that can be delivered (confirmed orders)
    const deliverableCallbacks = selectedSuiviCallbacks.value.filter(cb => canAssignDelivery(cb))
    const promises = deliverableCallbacks.map(cb =>
      orderAssignmentsService.completeSuivi(cb.id, {
        result: SuiviResult.Delivered,
        trackingStateId: deliveredState.id
      })
    )

    await Promise.all(promises)
    clearSuiviSelection()
    await myCallbacksQuery.refetch()
  } catch {
    // Error handled by service
  } finally {
    isBulkProcessing.value = false
  }
}

// Load tracking states and delivery companies on mount
onMounted(() => {
  trackingStatesService.setPageSize(100)
  deliveryCompaniesService.setPageSize(100)
  subDeliveryCompaniesService.setPageSize(100)
})

// Expose refresh method
defineExpose({
  refresh: async () => {
    await myCallbacksQuery.refetch()
  }
})
</script>
