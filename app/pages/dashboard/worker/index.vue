<template>
  <div>
    <!-- Header with Online Toggle -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('worker.title') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ $t('worker.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Online/Offline Toggle -->
        <button
          @click="handleToggleOnline"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            isOnline
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
          :disabled="isTogglingOnline"
        >
          <span
            :class="[
              'w-3 h-3 rounded-full',
              isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            ]"
          ></span>
          {{ isOnline ? $t('worker.online') : $t('worker.offline') }}
        </button>
        <button @click="refreshAll" class="btn-secondary">
          <ArrowPathIcon class="w-5 h-5 mr-2" :class="{ 'animate-spin': isLoading }" />
          {{ $t('common.refresh') }}
        </button>
      </div>
    </div>

    <!-- Worker Load Card (Always visible) -->
    <div class="card p-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <UserIcon class="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('worker.myLoad') }}</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ currentAssignmentCount }}
          </p>
        </div>
      </div>
    </div>

    <!-- Dynamic Service Tabs -->
    <div v-if="availableTabs.length > 1" class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav class="flex gap-2 sm:gap-4 overflow-x-auto">
        <button
          v-for="tab in availableTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors',
            activeTab === tab.key
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          <component :is="tab.icon" class="w-5 h-5" />
          {{ tab.label }}
          <span
            v-if="tab.count !== undefined"
            :class="[
              'px-2 py-0.5 rounded-full text-xs',
              activeTab === tab.key
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            ]"
          >
            {{ tab.count }}
          </span>
          <!-- Special highlight badge for Available tab -->
          <span
            v-if="tab.highlight"
            class="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 animate-pulse"
          >
            {{ $t('worker.selfAssign') }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div v-if="activeTab === 'available'">
      <WorkerAvailableOrdersPanel
        ref="availablePanelRef"
        @assigned="handleOrderAssigned"
        @view-order="openOrderModal"
      />
    </div>

    <div v-else-if="activeTab === ServiceTypes.Confirmation">
      <WorkerConfirmationPanel
        ref="confirmationPanelRef"
        :my-config="myConfig"
        @confirm="handleConfirm"
        @cancel="handleCancel"
        @view-order="openOrderModal"
      />
    </div>

    <div v-else-if="activeTab === ServiceTypes.Suivi">
      <WorkerSuiviPanel ref="suiviPanelRef" @assign-delivery="handleAssignDelivery" @view-order="openOrderModal" />
    </div>

    <div v-else-if="activeTab === ServiceTypes.Quality">
      <WorkerQualityPanel ref="qualityPanelRef" @view-order="openOrderModal" />
    </div>

    <div v-else-if="activeTab === 'callbacks'">
      <WorkerCallbacksPanel ref="callbacksPanelRef" @confirm="handleConfirm" @cancel="handleCancel" @view-order="openOrderModal" />
    </div>

    <!-- Fallback: Single service view (when worker has only one service) -->
    <div v-else-if="availableTabs.length === 1">
      <WorkerConfirmationPanel
        v-if="availableTabs[0].key === ServiceTypes.Confirmation"
        ref="confirmationPanelRef"
        :my-config="myConfig"
        @confirm="handleConfirm"
        @cancel="handleCancel"
        @view-order="openOrderModal"
      />
      <WorkerSuiviPanel v-else-if="availableTabs[0].key === ServiceTypes.Suivi" ref="suiviPanelRef" @assign-delivery="handleAssignDelivery" @view-order="openOrderModal" />
      <WorkerQualityPanel v-else-if="availableTabs[0].key === ServiceTypes.Quality" ref="qualityPanelRef" @view-order="openOrderModal" />
    </div>

    <!-- No Services Message -->
    <div v-else class="card p-8 text-center">
      <ExclamationCircleIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p class="text-gray-500 dark:text-gray-400">{{ $t('worker.noServicesAssigned') }}</p>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">{{ $t('worker.contactSupervisor') }}</p>
    </div>

    <!-- Order Detail Modal -->
    <TransitionRoot :show="showOrderModal" as="template">
      <Dialog as="div" class="relative z-50" @close="closeOrderModal">
        <TransitionChild
          enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-900/50" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
              leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ $t('orders.orderDetails') }} - {{ selectedAssignment?.orderCode || orderDetails?.code }}
                </DialogTitle>

                <div v-if="orderDetails" class="space-y-4">
                  <!-- Customer Info -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm text-gray-500 dark:text-gray-400">{{ $t('customers.name') }}</label>
                      <p class="font-medium text-gray-900 dark:text-white">{{ orderDetails.fullName }}</p>
                    </div>
                    <div>
                      <label class="text-sm text-gray-500 dark:text-gray-400">{{ $t('customers.phone') }}</label>
                      <a :href="'tel:' + orderDetails.phone" class="font-medium text-blue-600 dark:text-blue-400 hover:underline block">
                        {{ orderDetails.phone }}
                      </a>
                    </div>
                    <div>
                      <label class="text-sm text-gray-500 dark:text-gray-400">{{ $t('customers.city') }}</label>
                      <p class="font-medium text-gray-900 dark:text-white">{{ orderDetails.cityName }}</p>
                    </div>
                    <div>
                      <label class="text-sm text-gray-500 dark:text-gray-400">{{ $t('customers.address') }}</label>
                      <p class="font-medium text-gray-900 dark:text-white">{{ orderDetails.address || '-' }}</p>
                    </div>
                  </div>

                  <!-- Order Items -->
                  <div>
                    <label class="text-sm text-gray-500 dark:text-gray-400 mb-2 block">{{ $t('orders.items') }}</label>
                    <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <table class="min-w-full">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th class="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">{{ $t('orders.product') }}</th>
                            <th class="text-center py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">{{ $t('orders.quantity') }}</th>
                            <th class="text-right py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">{{ $t('orders.price') }}</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                          <tr v-for="item in orderDetails.items" :key="item.id">
                            <td class="py-2 px-3 text-sm text-gray-900 dark:text-white">
                              {{ item.productName }}
                              <span v-if="item.variantName" class="text-gray-500 dark:text-gray-400"> - {{ item.variantName }}</span>
                              <div v-if="item.variantSku" class="text-xs text-gray-400">
                                SKU: {{ item.variantSku }}
                              </div>
                            </td>
                            <td class="py-2 px-3 text-sm text-center text-gray-600 dark:text-gray-400">{{ item.quantity }}</td>
                            <td class="py-2 px-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ formatCurrency(item.total) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Totals -->
                  <div class="flex justify-end">
                    <div class="text-right">
                      <div class="flex justify-between gap-8 text-sm">
                        <span class="text-gray-500 dark:text-gray-400">{{ $t('orders.shipping') }}:</span>
                        <span class="text-gray-900 dark:text-white">{{ formatCurrency(orderDetails.fees) }}</span>
                      </div>
                      <div class="flex justify-between gap-8 text-lg font-bold mt-2">
                        <span class="text-gray-900 dark:text-white">{{ $t('orders.total') }}:</span>
                        <span class="text-emerald-600 dark:text-emerald-400">{{ formatCurrency(orderDetails.price) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Notes -->
                  <div v-if="orderDetails.note">
                    <label class="text-sm text-gray-500 dark:text-gray-400">{{ $t('orders.notes') }}</label>
                    <p class="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded mt-1">{{ orderDetails.note }}</p>
                  </div>
                </div>

                <div class="flex justify-between gap-3 mt-6">
                  <!-- Edit Actions (permission-based) - Hidden for available/unassigned orders -->
                  <div v-if="canUpdateOrders && !isViewingAvailableOrder" class="flex gap-2">
                    <button
                      type="button"
                      class="btn-secondary text-sm"
                      @click="openEditOrderModal"
                    >
                      <PencilIcon class="w-4 h-4 mr-1" />
                      {{ $t('orders.editOrder') }}
                    </button>
                    <!-- Manage Items: Only for non-confirmed/non-delivered orders (backend restriction) -->
                    <button
                      v-if="canEditOrderItems"
                      type="button"
                      class="btn-secondary text-sm"
                      @click="openManageItemsModal"
                    >
                      <CubeIcon class="w-4 h-4 mr-1" />
                      {{ $t('orders.manageItems') }}
                    </button>
                  </div>
                  <div v-else></div>

                  <button type="button" class="btn-secondary" @click="closeOrderModal">
                    {{ $t('common.close') }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Confirm Order Modal -->
    <TransitionRoot :show="showConfirmModal" as="template">
      <Dialog as="div" class="relative z-50" @close="closeConfirmModal">
        <TransitionChild
          enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-900/50" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
              leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ $t('orders.confirmOrder') }} - {{ selectedAssignment?.orderCode }}
                </DialogTitle>

                <form @submit.prevent="submitConfirm">
                  <!-- Order Summary with Edit Button -->
                  <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <!-- Header with Edit Button -->
                    <div class="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                      <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('orders.orderSummary') }}</span>
                      <button
                        type="button"
                        @click="openEditFromConfirm"
                        class="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                      >
                        <PencilSquareIcon class="w-3.5 h-3.5" />
                        {{ $t('common.edit') }}
                      </button>
                    </div>
                    <div class="space-y-2">
                      <!-- Customer Name - prefer orderDetails after edit -->
                      <div class="flex items-center gap-2">
                        <UserIcon class="w-4 h-4 text-gray-400 shrink-0" />
                        <span class="text-sm font-medium text-gray-900 dark:text-white">{{ orderDetails?.fullName || selectedAssignment?.customerName }}</span>
                      </div>
                      <!-- Phone -->
                      <div class="flex items-center gap-2">
                        <PhoneIcon class="w-4 h-4 text-gray-400 shrink-0" />
                        <a :href="'tel:' + (orderDetails?.phone || selectedAssignment?.customerPhone)" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                          {{ orderDetails?.phone || selectedAssignment?.customerPhone }}
                        </a>
                      </div>
                      <!-- City -->
                      <div v-if="orderDetails?.cityName || selectedAssignment?.cityName || selectedAssignment?.customerCity" class="flex items-center gap-2">
                        <MapPinIcon class="w-4 h-4 text-gray-400 shrink-0" />
                        <span class="text-sm text-gray-600 dark:text-gray-300">{{ orderDetails?.cityName || selectedAssignment?.cityName || selectedAssignment?.customerCity }}</span>
                      </div>
                      <!-- Products -->
                      <div v-if="orderDetails?.items?.length || selectedAssignment?.productNames || selectedAssignment?.firstProductName" class="flex items-start gap-2">
                        <CubeIcon class="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span class="text-sm text-gray-600 dark:text-gray-300">
                          <template v-if="orderDetails?.items?.length">
                            {{ orderDetails.items.map(i => i.productName).join(', ') }}
                            <span v-if="orderDetails.items.length > 1" class="text-gray-400">
                              ({{ orderDetails.items.length }} {{ $t('common.items') }})
                            </span>
                          </template>
                          <template v-else>
                            {{ selectedAssignment?.productNames || selectedAssignment?.firstProductName }}
                            <span v-if="selectedAssignment?.itemCount && selectedAssignment.itemCount > 1" class="text-gray-400">
                              ({{ selectedAssignment.itemCount }} {{ $t('common.items') }})
                            </span>
                          </template>
                        </span>
                      </div>
                      <!-- Total Price -->
                      <div class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.total') }}</span>
                        <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {{ formatCurrency(orderDetails?.price || selectedAssignment?.orderPrice || selectedAssignment?.totalPrice || 0) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Quality Checklist Section -->
                  <div v-if="isQualityEnabled" class="mb-4">
                    <div class="flex items-center gap-2 mb-2">
                      <CheckCircleIcon class="w-5 h-5 text-primary-600" />
                      <h4 class="font-medium text-gray-900 dark:text-white">
                        {{ $t('worker.qualityChecklist') }}
                      </h4>
                    </div>

                    <!-- Loading state -->
                    <div v-if="isLoadingChecklist" class="text-center py-3">
                      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mx-auto"></div>
                    </div>

                    <!-- Error state - allow confirm anyway -->
                    <div v-else-if="isChecklistError" class="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
                      <div class="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm">
                        <ExclamationTriangleIcon class="w-4 h-4 flex-shrink-0" />
                        <span>{{ $t('worker.checklistLoadError') }}</span>
                      </div>
                    </div>

                    <!-- Empty state -->
                    <div v-else-if="!checklistItems || checklistItems.length === 0" class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400 text-sm text-center">
                      {{ $t('worker.noChecklistItems') }}
                    </div>

                    <!-- Checklist items -->
                    <div v-else class="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <label
                        v-for="item in checklistItems"
                        :key="item.key"
                        class="flex items-start gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <input
                          v-model="qualityChecks[item.key]"
                          type="checkbox"
                          class="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span
                          :class="[
                            'text-sm',
                            item.isRequired && !qualityChecks[item.key]
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-700 dark:text-gray-300'
                          ]"
                        >
                          {{ getItemLabel(item) }}
                          <span v-if="item.isRequired" class="text-red-500 ml-1">*</span>
                        </span>
                      </label>

                      <!-- Validation warning -->
                      <div
                        v-if="!allRequiredChecked"
                        class="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-700 dark:text-amber-300 text-sm mt-2"
                      >
                        <ExclamationTriangleIcon class="w-4 h-4 flex-shrink-0" />
                        <span>{{ $t('worker.completeChecklist') }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Comment field -->
                  <div class="mb-4">
                    <label class="label">{{ $t('orders.note') }}</label>
                    <textarea
                      v-model="confirmForm.comment"
                      class="input"
                      rows="2"
                      :placeholder="$t('orders.notePlaceholder')"
                    ></textarea>
                  </div>

                  <div class="flex justify-end gap-3">
                    <button type="button" class="btn-secondary" @click="closeConfirmModal">
                      {{ $t('common.cancel') }}
                    </button>
                    <button
                      type="submit"
                      :disabled="isSubmitting || !canConfirmOrder"
                      :class="[
                        'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                        canConfirmOrder
                          ? 'bg-primary-600 hover:bg-primary-700 text-white'
                          : 'bg-gray-400 cursor-not-allowed text-white'
                      ]"
                    >
                      {{ isSubmitting ? $t('common.loading') : $t('orders.confirmOrder') }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Cancel Order Modal -->
    <TransitionRoot :show="showCancelModal" as="template">
      <Dialog as="div" class="relative z-50" @close="closeCancelModal">
        <TransitionChild
          enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-900/50" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
              leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ $t('orders.cancelOrder') }} - {{ selectedAssignment?.orderCode }}
                </DialogTitle>

                <form @submit.prevent="submitCancel">
                  <div class="mb-4">
                    <label class="label">{{ $t('reasons.type') }}</label>
                    <select v-model="cancelForm.reasonId" class="input">
                      <option value="">{{ $t('common.select') }}...</option>
                      <option v-for="reason in reasons" :key="reason.id" :value="reason.id">
                        {{ reason.title }}
                      </option>
                    </select>
                  </div>

                  <div class="mb-4">
                    <label class="label">{{ $t('orders.customReason') }}</label>
                    <textarea v-model="cancelForm.customReason" class="input" rows="2"></textarea>
                  </div>

                  <div class="flex justify-end gap-3">
                    <button type="button" class="btn-secondary" @click="closeCancelModal">
                      {{ $t('common.cancel') }}
                    </button>
                    <button type="submit" class="btn-primary bg-red-600 hover:bg-red-700" :disabled="isSubmitting">
                      {{ isSubmitting ? $t('common.loading') : $t('orders.cancelOrder') }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Assign Delivery Company Modal -->
    <OrdersAssignDeliveryModal
      :show="showAssignDeliveryModal"
      :order="assignDeliveryOrder"
      :delivery-companies="deliveryCompanies"
      :sub-delivery-companies="subDeliveryCompanies"
      :is-submitting="isAssigningDelivery"
      @close="closeAssignDeliveryModal"
      @submit="submitAssignDelivery"
    />

    <!-- Edit Order Modal -->
    <OrdersOrderFormModal
      :show="showEditOrderModal"
      :order="orderDetails"
      :cities="cities"
      :products="products"
      :delivery-companies="deliveryCompanies"
      :can-edit-items="canEditOrderItems"
      @close="closeEditOrderModal"
      @update="handleOrderUpdate"
      @manage-items="handleManageItemsFromForm"
    />

    <!-- Manage Items Modal -->
    <OrdersOrderItemsModal
      :show="showManageItemsModal"
      :order="orderDetails"
      :products="products"
      @close="closeManageItemsModal"
      @item-added="handleItemChanged"
      @item-updated="handleItemChanged"
      @item-removed="handleItemChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { AssignDeliveryCompanyRequest, Order } from '~/types/order'
import { ServiceTypes, OrderPhase, OrderState } from '~/constants/order'
import {
  ArrowPathIcon,
  UserIcon,
  PhoneIcon,
  CheckCircleIcon,
  TruckIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  InboxArrowDownIcon,
  MapPinIcon,
  CubeIcon,
  PhoneArrowUpRightIcon,
  PencilIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import {
  useOrderAssignmentsService,
  useWorkerServiceConfigsService,
  useOrdersWorkflowService,
  useOrdersService,
  useDeliveryCompaniesService,
  useSubDeliveryCompaniesService,
  useReasonsService,
  useAutoAssignmentSettingsService,
  useCitiesService,
  useProductsService,
  useActiveQualityChecklistItems,
  type WorkerAssignmentDto,
  type OrderDto,
  type WorkerServiceConfigDto,
  type UpdateOrderRequest
} from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.WorkerDashboard.View'
})

const { t } = useI18n()
const notification = useNotification()

// Services
const orderAssignmentsService = useOrderAssignmentsService()
const workerConfigsService = useWorkerServiceConfigsService()
const ordersWorkflow = useOrdersWorkflowService()
const { update: updateOrder } = useOrdersService()
const deliveryCompaniesService = useDeliveryCompaniesService()
const subDeliveryCompaniesService = useSubDeliveryCompaniesService()
const reasonsService = useReasonsService()
const autoAssignmentSettingsService = useAutoAssignmentSettingsService()
const { items: cities } = useCitiesService()
const { items: products } = useProductsService()

// Check if Quality is enabled in auto-assignment settings
const isQualityEnabled = computed(() => autoAssignmentSettingsService.settings.value?.enableQualityCheck ?? false)

// Quality Checklist for order confirmation
const { data: checklistItems, isLoading: isLoadingChecklist, isError: isChecklistError, error: checklistError } = useActiveQualityChecklistItems()
const qualityChecks = ref<Record<string, boolean>>({})

// Validation: all required checklist items must be checked
const allRequiredChecked = computed(() => {
  if (!isQualityEnabled.value || !checklistItems.value) return true
  return checklistItems.value
    .filter(item => item.isRequired)
    .every(item => qualityChecks.value[item.key] === true)
})

// Can confirm: either quality check is disabled, failed to load, or all required items are checked
const canConfirmOrder = computed(() => {
  if (!isQualityEnabled.value) return true
  // Allow confirm if checklist failed to load (don't block worker)
  if (isChecklistError.value) return true
  if (!checklistItems.value || checklistItems.value.length === 0) return true
  return allRequiredChecked.value
})

// Get label based on locale
const { locale } = useI18n()
const getItemLabel = (item: { labelAr: string; labelFr: string }) => {
  return locale.value === 'ar' ? item.labelAr : item.labelFr
}

// My pending/active assignments (use reactive query hooks)
const myPendingQuery = orderAssignmentsService.useMyPendingAssignments()
const myActiveQuery = orderAssignmentsService.useMyActiveAssignments()
const myCallbacksQuery = orderAssignmentsService.useMyCallbacks()

// Computed from services
const myPendingAssignments = computed(() => myPendingQuery.data.value ?? [])
const myActiveAssignments = computed(() => myActiveQuery.data.value ?? [])
const myCallbacks = computed(() => myCallbacksQuery.data.value ?? [])
const myConfig = computed<WorkerServiceConfigDto | undefined>(() => workerConfigsService.myConfig.value)
const isOnline = computed(() => myConfig.value?.isOnline ?? false)
const isLoading = computed(() => myPendingQuery.isLoading.value || myActiveQuery.isLoading.value)
// Calculate current assignment count from actual data (pending + active)
const currentAssignmentCount = computed(() => myPendingAssignments.value.length + myActiveAssignments.value.length)
const deliveryCompanies = computed(() => deliveryCompaniesService.items.value)
const subDeliveryCompanies = computed(() => subDeliveryCompaniesService.items.value)
const reasons = computed(() => reasonsService.items.value)

// Panel refs for refresh
const confirmationPanelRef = ref<{ refresh: () => Promise<void> } | null>(null)
const suiviPanelRef = ref<{ refresh: () => Promise<void> } | null>(null)
const qualityPanelRef = ref<{ refresh: () => Promise<void> } | null>(null)
const availablePanelRef = ref<{ refresh: () => Promise<void> } | null>(null)
const callbacksPanelRef = ref<{ refresh: () => Promise<void> } | null>(null)

// State
const isTogglingOnline = ref(false)
const isSubmitting = ref(false)
const activeTab = ref<'available' | 'confirmation' | 'suivi' | 'quality' | 'callbacks'>('confirmation')

// Check permissions
const { hasPermission } = useAuth()
const canSelfAssign = computed(() => hasPermission('Permissions.OrderAssignments.SelfAssign'))
const canUpdateOrders = computed(() => hasPermission('Permissions.Orders.Update'))

// Check if current order can be edited (not confirmed or delivered)
// Backend business rule: Cannot modify items of confirmed or delivered orders
// Also cannot edit items once order is in shipping phase (Suivi orders)
const canEditOrderItems = computed(() => {
  if (!orderDetails.value) return false
  const state = orderDetails.value.state?.toLowerCase()
  const phase = orderDetails.value.phase?.toLowerCase()
  // Cannot edit if:
  // - State is confirmed or delivered
  // - OR Phase is shipping (Suivi orders - items locked after confirmation)
  if (state === OrderState.Confirmed || state === OrderState.Delivered) return false
  if (phase === OrderPhase.Shipping) return false
  return true
})

// Compute available tabs based on worker config
const availableTabs = computed(() => {
  const tabs: Array<{
    key: 'available' | 'confirmation' | 'suivi' | 'quality' | 'callbacks'
    label: string
    icon: any
    count?: number
    highlight?: boolean
  }> = []

  // Add "Available Orders" tab if worker has SelfAssign permission
  if (canSelfAssign.value) {
    tabs.push({
      key: 'available',
      label: t('worker.availableOrders'),
      icon: InboxArrowDownIcon,
      highlight: true, // Special highlight for this tab
    })
  }

  // 1. Confirmation tab - show if:
  //    a) Worker canDoConfirmation, OR
  //    b) Worker has any pending/active Confirmation assignments (even if config not set)
  //    This ensures workers can complete their existing work
  const confirmationPending = myPendingAssignments.value.filter(a => a.serviceType === ServiceTypes.Confirmation && !a.callbackScheduledAt).length
  const confirmationActive = myActiveAssignments.value.filter(a => a.serviceType === ServiceTypes.Confirmation && !a.callbackScheduledAt).length
  const hasConfirmationAssignments = confirmationPending + confirmationActive > 0

  if (myConfig.value?.canDoConfirmation || hasConfirmationAssignments) {
    tabs.push({
      key: ServiceTypes.Confirmation,
      label: t('worker.confirmation'),
      icon: CheckCircleIcon,
      count: confirmationPending + confirmationActive
    })
  }

  // 2. Quality tab - show if:
  //    a) EnableQualityCheck is true AND worker canDoQuality, OR
  //    b) Worker has any pending/active Quality assignments (even if setting was disabled)
  //    This ensures workers can complete their existing Quality work even after setting changes
  const qualityPending = myPendingAssignments.value.filter(a => a.serviceType === ServiceTypes.Quality).length
  const qualityActive = myActiveAssignments.value.filter(a => a.serviceType === ServiceTypes.Quality).length
  const hasQualityAssignments = qualityPending + qualityActive > 0

  if ((isQualityEnabled.value && myConfig.value?.canDoQuality) || hasQualityAssignments) {
    tabs.push({
      key: ServiceTypes.Quality,
      label: t('worker.quality'),
      icon: ShieldCheckIcon,
      count: qualityPending + qualityActive
    })
  }

  // 3. Suivi tab - show if worker canDoSuivi OR has existing suivi assignments
  const suiviPending = myPendingAssignments.value.filter(a => a.serviceType === ServiceTypes.Suivi).length
  const suiviActive = myActiveAssignments.value.filter(a => a.serviceType === ServiceTypes.Suivi).length
  const hasSuiviAssignments = suiviPending + suiviActive > 0

  if (myConfig.value?.canDoSuivi || hasSuiviAssignments) {
    tabs.push({
      key: ServiceTypes.Suivi,
      label: t('worker.suivi'),
      icon: TruckIcon,
      count: suiviPending + suiviActive
    })
  }

  // 4. Callbacks tab - show if worker canDoCallback OR has existing callbacks
  const hasCallbacks = myCallbacks.value.length > 0

  if (myConfig.value?.canDoCallback || hasCallbacks) {
    tabs.push({
      key: 'callbacks',
      label: t('worker.callbacksTab'),
      icon: PhoneArrowUpRightIcon,
      count: myCallbacks.value.length
    })
  }

  return tabs
})

// Set initial active tab to first available
watch(availableTabs, (tabs) => {
  if (tabs.length > 0 && !tabs.find(t => t.key === activeTab.value)) {
    activeTab.value = tabs[0].key
  }
}, { immediate: true })

// Modals
const showOrderModal = ref(false)
const showConfirmModal = ref(false)
const showCancelModal = ref(false)
const showAssignDeliveryModal = ref(false)
const showEditOrderModal = ref(false)
const showManageItemsModal = ref(false)
const selectedAssignment = ref<WorkerAssignmentDto | null>(null)
const orderDetails = ref<OrderDto | null>(null)
// Track if viewing an available (unassigned) order - to hide edit buttons
const isViewingAvailableOrder = ref(false)
// Track if edit was opened from confirm modal - to return after edit
const editFromConfirm = ref(false)
const assignDeliveryOrder = ref<Order | null>(null)
const isAssigningDelivery = ref(false)

const confirmForm = ref({
  comment: ''
})

const cancelForm = ref({
  reasonId: '',
  customReason: ''
})

// Format helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount)
}

// Refresh all data
const refreshAll = async () => {
  await Promise.all([
    myPendingQuery.refetch(),
    myActiveQuery.refetch(),
    myCallbacksQuery.refetch(),
    workerConfigsService.refetchMyConfig()
  ])

  // Refresh active panel
  if (activeTab.value === 'available' && availablePanelRef.value) {
    await availablePanelRef.value.refresh()
  } else if (activeTab.value === ServiceTypes.Confirmation && confirmationPanelRef.value) {
    await confirmationPanelRef.value.refresh()
  } else if (activeTab.value === ServiceTypes.Suivi && suiviPanelRef.value) {
    await suiviPanelRef.value.refresh()
  } else if (activeTab.value === ServiceTypes.Quality && qualityPanelRef.value) {
    await qualityPanelRef.value.refresh()
  } else if (activeTab.value === 'callbacks' && callbacksPanelRef.value) {
    await callbacksPanelRef.value.refresh()
  }
}

// Handle order assigned from available panel (switch to confirmation tab)
// No manual refresh needed - selfAssign already invalidates relevant queries
// Vue Query will automatically refetch when ConfirmationPanel mounts
const handleOrderAssigned = () => {
  // Switch to confirmation tab to work on the order
  if (myConfig.value?.canDoConfirmation) {
    activeTab.value = ServiceTypes.Confirmation
  }
}

// Toggle online status
const handleToggleOnline = async () => {
  if (!myConfig.value?.id) return
  isTogglingOnline.value = true
  try {
    await workerConfigsService.setOnline(myConfig.value.id, { isOnline: !isOnline.value })
  } finally {
    isTogglingOnline.value = false
  }
}

// Open order modal - handles both WorkerAssignmentDto (from assigned tabs) and OrderDto (from available tab)
const openOrderModal = async (data: WorkerAssignmentDto | OrderDto) => {
  // Check if this is an OrderDto (from available orders tab) or WorkerAssignmentDto
  // OrderDto has 'id' and 'code', WorkerAssignmentDto has 'orderId' and 'orderCode'
  const isOrderDto = 'code' in data && !('orderId' in data)

  isViewingAvailableOrder.value = isOrderDto

  if (isOrderDto) {
    // From available orders - data is OrderDto
    const order = data as OrderDto
    selectedAssignment.value = null // No assignment yet
    orderDetails.value = order // Use the passed order directly
  } else {
    // From assigned tabs - data is WorkerAssignmentDto
    const assignment = data as WorkerAssignmentDto
    selectedAssignment.value = assignment
    try {
      orderDetails.value = await ordersWorkflow.getOrder(assignment.orderId)
    } catch {
      orderDetails.value = null
    }
  }
  showOrderModal.value = true
}

const closeOrderModal = () => {
  showOrderModal.value = false
  selectedAssignment.value = null
  orderDetails.value = null
  isViewingAvailableOrder.value = false
}

// Edit order modal - opens OrderFormModal
const openEditOrderModal = () => {
  showOrderModal.value = false // Close view modal first
  showEditOrderModal.value = true
}

const closeEditOrderModal = () => {
  showEditOrderModal.value = false

  // If cancelled from confirm flow, return to confirm modal
  if (editFromConfirm.value && selectedAssignment.value) {
    editFromConfirm.value = false
    showConfirmModal.value = true
  }
}

const handleOrderUpdate = async (id: string, data: UpdateOrderRequest) => {
  // Save flag BEFORE closing modal (closeEditOrderModal resets it)
  const wasFromConfirm = editFromConfirm.value

  try {
    await updateOrder(id, data)
    closeEditOrderModal()

    // Refresh order details
    if (selectedAssignment.value) {
      orderDetails.value = await ordersWorkflow.getOrder(selectedAssignment.value.orderId)
    }

    // If edit was initiated from confirm modal, show success message
    // (confirm modal already opened by closeEditOrderModal)
    if (wasFromConfirm) {
      notification.success(t('common.updateSuccess'))
    } else {
      await refreshAll()
    }
  } catch {
    // Error handled by service
  }
}

// Manage items modal - opens OrderItemsModal
const openManageItemsModal = () => {
  showOrderModal.value = false // Close view modal first
  showManageItemsModal.value = true
}

// Handle manage items from OrderFormModal (Edit mode)
const handleManageItemsFromForm = () => {
  showEditOrderModal.value = false // Close edit order modal first
  showManageItemsModal.value = true
}

const closeManageItemsModal = () => {
  showManageItemsModal.value = false
}

const handleItemChanged = async () => {
  // Refresh order details after item changes
  if (selectedAssignment.value) {
    orderDetails.value = await ordersWorkflow.getOrder(selectedAssignment.value.orderId)
  }
  await refreshAll()
}

// Confirm order flow
const handleConfirm = (assignment: WorkerAssignmentDto) => {
  selectedAssignment.value = assignment
  confirmForm.value = {
    comment: ''
  }
  // Reset quality checks when modal opens
  if (checklistItems.value) {
    const checks: Record<string, boolean> = {}
    checklistItems.value.forEach(item => {
      checks[item.key] = false
    })
    qualityChecks.value = checks
  }
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  selectedAssignment.value = null
}

// Open edit from confirm modal - allows editing order during confirmation
const openEditFromConfirm = async () => {
  if (!selectedAssignment.value) return

  try {
    // Fetch full order details if not already loaded
    if (!orderDetails.value || orderDetails.value.id !== selectedAssignment.value.orderId) {
      orderDetails.value = await ordersWorkflow.getOrder(selectedAssignment.value.orderId)
    }

    // Track that we came from confirm modal
    editFromConfirm.value = true

    // Close confirm modal and open edit modal
    showConfirmModal.value = false
    showEditOrderModal.value = true
  } catch {
    notification.error(t('common.errorOccurred'))
  }
}

const submitConfirm = async () => {
  if (!selectedAssignment.value) return
  isSubmitting.value = true
  try {
    // STEP 1: Confirm order FIRST (validates stock, business rules)
    // If this fails, assignment stays "taken" and user can retry
    const confirmRequest: any = {
      orderId: selectedAssignment.value.orderId,
      moveToShipping: true,
      comment: confirmForm.value.comment || undefined
    }

    // Include quality checks if enabled
    if (isQualityEnabled.value && checklistItems.value && checklistItems.value.length > 0) {
      confirmRequest.qualityChecks = { ...qualityChecks.value }
    }

    await ordersWorkflow.confirmOrder(confirmRequest)

    // STEP 2: Complete assignment AFTER order is confirmed
    // This ensures we only mark as complete when order is truly confirmed
    await orderAssignmentsService.complete(selectedAssignment.value.id, {
      result: 'confirmed',
      notes: confirmForm.value.comment || undefined
    })

    closeConfirmModal()
    await refreshAll()
  } catch (error: any) {
    const status = error?.response?.status
    const errorMessage = error?.response?.data?.exception || error?.response?.data?.message || ''

    // Handle HTTP 404 - Order was deleted
    if (status === 404) {
      // Order no longer exists - clean up assignment
      try {
        await orderAssignmentsService.complete(selectedAssignment.value!.id, {
          result: 'cancelled',
          notes: 'Order was deleted'
        })
      } catch {
        // Assignment may already be completed - ignore
      }
      notification.warning(t('worker.orderDeleted'))
      closeConfirmModal()
      await refreshAll()
    }
    // Handle HTTP 409 Conflict errors
    else if (status === 409) {
      // Check if order was already confirmed
      if (errorMessage.toLowerCase().includes('already confirmed')) {
        // Order was confirmed elsewhere - complete the assignment to remove from list
        try {
          await orderAssignmentsService.complete(selectedAssignment.value!.id, {
            result: 'confirmed',
            notes: 'Order was already confirmed'
          })
        } catch {
          // Assignment may already be completed - ignore
        }
        notification.info(t('worker.orderAlreadyConfirmed'))
        closeConfirmModal()
        await refreshAll()
      } else if (errorMessage.toLowerCase().includes('reassign') || errorMessage.toLowerCase().includes('another worker')) {
        // Order was reassigned to another worker
        notification.warning(t('worker.orderReassigned'))
        closeConfirmModal()
        await refreshAll()
      } else if (errorMessage.toLowerCase().includes('stock') || errorMessage.toLowerCase().includes('insufficient')) {
        // Stock issue - show specific message, keep modal open for retry
        notification.error(t('worker.insufficientStock'))
      } else {
        // Other conflict - show generic message
        notification.warning(t('worker.orderConflict'))
        closeConfirmModal()
        await refreshAll()
      }
    }
    // Handle other errors
    else {
      // Show error message to user (e.g., validation errors)
      const displayMessage = errorMessage || error?.message || t('common.errorOccurred')
      notification.error(displayMessage)
      // Dialog stays open for retry - assignment is still "taken"
    }
  } finally {
    isSubmitting.value = false
  }
}

// Cancel order flow
const handleCancel = (assignment: WorkerAssignmentDto) => {
  selectedAssignment.value = assignment
  cancelForm.value = {
    reasonId: '',
    customReason: ''
  }
  showCancelModal.value = true
}

const closeCancelModal = () => {
  showCancelModal.value = false
  selectedAssignment.value = null
}

const submitCancel = async () => {
  if (!selectedAssignment.value) return
  isSubmitting.value = true
  try {
    // STEP 1: Cancel order FIRST (validates business rules)
    // If this fails, assignment stays "taken" and user can retry
    await ordersWorkflow.cancelOrder({
      orderId: selectedAssignment.value.orderId,
      reasonId: cancelForm.value.reasonId || undefined,
      customReason: cancelForm.value.customReason || undefined
    })

    // STEP 2: Complete assignment AFTER order is cancelled
    // This ensures we only mark as complete when order is truly cancelled
    await orderAssignmentsService.complete(selectedAssignment.value.id, {
      result: 'cancelled'
    })

    closeCancelModal()
    await refreshAll()
  } catch (error: any) {
    const status = error?.response?.status
    const errorMessage = error?.response?.data?.exception || error?.response?.data?.message || ''

    // Handle HTTP 404 - Order was deleted
    if (status === 404) {
      try {
        await orderAssignmentsService.complete(selectedAssignment.value!.id, {
          result: 'cancelled',
          notes: 'Order was deleted'
        })
      } catch {
        // Assignment may already be completed - ignore
      }
      notification.warning(t('worker.orderDeleted'))
      closeCancelModal()
      await refreshAll()
    }
    // Handle HTTP 409 Conflict errors
    else if (status === 409) {
      if (errorMessage.toLowerCase().includes('already cancelled')) {
        try {
          await orderAssignmentsService.complete(selectedAssignment.value!.id, {
            result: 'cancelled',
            notes: 'Order was already cancelled'
          })
        } catch {
          // Assignment may already be completed - ignore
        }
        notification.info(t('worker.orderAlreadyCancelled'))
        closeCancelModal()
        await refreshAll()
      } else {
        notification.warning(t('worker.orderReassigned'))
        closeCancelModal()
        await refreshAll()
      }
    }
    // Handle other errors
    else {
      const displayMessage = errorMessage || error?.message || t('common.errorOccurred')
      notification.error(displayMessage)
      // Dialog stays open for retry - assignment is still "taken"
    }
  } finally {
    isSubmitting.value = false
  }
}

// Assign Delivery Company flow (for Suivi workers)
const handleAssignDelivery = async (assignment: WorkerAssignmentDto) => {
  // Fetch order details to pass to modal
  try {
    const order = await ordersWorkflow.getOrder(assignment.orderId)
    assignDeliveryOrder.value = order
    showAssignDeliveryModal.value = true
  } catch {
    // Error handled by service
  }
}

const closeAssignDeliveryModal = () => {
  showAssignDeliveryModal.value = false
  assignDeliveryOrder.value = null
}

const submitAssignDelivery = async (data: AssignDeliveryCompanyRequest) => {
  if (!data.orderId) return
  isAssigningDelivery.value = true
  try {
    await ordersWorkflow.assignDeliveryCompany(data)
    closeAssignDeliveryModal()
    await refreshAll()
  } finally {
    isAssigningDelivery.value = false
  }
}

// Load data on mount - Vue Query handles automatic fetching
// Load worker config on mount (delivery companies, sub-delivery companies, and reasons auto-fetch via Vue Query)
onMounted(async () => {
  await workerConfigsService.refetchMyConfig()
  // Set page size for dropdown data
  deliveryCompaniesService.setPageSize(100)
  subDeliveryCompaniesService.setPageSize(100)
  reasonsService.setPageSize(100)
})
</script>
