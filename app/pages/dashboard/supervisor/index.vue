<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('supervisor.title') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ $t('supervisor.subtitle') }}</p>
      </div>
      <div class="flex gap-3">
        <button @click="loadAllData" class="btn-secondary">
          <ArrowPathIcon class="w-5 h-5 mr-2" />
          {{ $t('common.refresh') }}
        </button>
        <button
          @click="openReassignModal"
          class="btn-primary"
          :disabled="selectedOrders.length === 0"
        >
          <UserGroupIcon class="w-5 h-5 mr-2" />
          {{ activeTab === 'new' ? $t('supervisor.assign') : $t('supervisor.reassign') }} ({{ selectedOrders.length }})
        </button>
      </div>
    </div>

    <!-- Tabs: new, confirmations, quality, suivi, ready, callbacks -->
    <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav class="-mb-px flex gap-4 overflow-x-auto">
        <button
          @click="activeTab = 'new'"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === 'new'
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'"
        >
          {{ $t('supervisor.newOrders') }}
          <span class="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
            {{ newOrdersPagination.totalCount }}
          </span>
        </button>
        <button
          @click="activeTab = 'confirmations'"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === 'confirmations'
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'"
        >
          {{ $t('supervisor.confirmationsInProgress') }}
          <span class="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
            {{ confirmationOrders.length }}
          </span>
        </button>
        <button
          v-if="isQualityEnabled"
          @click="activeTab = ServiceTypes.Quality"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === ServiceTypes.Quality
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'"
        >
          {{ $t('supervisor.qualityOrders') }}
          <span class="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
            {{ qualityOrders.length }}
          </span>
        </button>
        <button
          @click="activeTab = ServiceTypes.Suivi"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === ServiceTypes.Suivi
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'"
        >
          {{ $t('supervisor.suiviOrders') }}
          <span class="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full">
            {{ suiviOrders.length }}
          </span>
        </button>
        <button
          @click="activeTab = 'callbacks'"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === 'callbacks'
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'"
        >
          {{ $t('supervisor.callbacks') }}
          <span
            v-if="allCallbacksCount > 0"
            :class="[
              'ml-2 px-2 py-0.5 text-xs rounded-full',
              overdueCallbacksCount > 0
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            ]"
          >
            {{ allCallbacksCount }}
          </span>
        </button>
      </nav>
    </div>

    <!-- New Orders Tab -->
    <div v-if="activeTab === 'new'" class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('supervisor.newOrders') }}
        </h2>
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="selectAllNew"
            @change="toggleSelectAllNew"
            class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('common.all') }}</span>
        </div>
      </div>

      <div v-if="isLoadingNew" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>

      <div v-else-if="newOrders.length === 0" class="text-center py-8">
        <InboxIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('supervisor.noNewOrders') }}</p>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    :checked="selectAllNew"
                    @change="toggleSelectAllNew"
                    class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('orders.code') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.name') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.phone') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.city') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.products') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('orders.price') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('sources.source') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.store') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.age') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="order in newOrders"
                :key="order.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                :class="{
                  'bg-primary-50 dark:bg-primary-900/20': selectedOrders.includes(order.id) && !order.isBlacklisted,
                  'bg-red-50 dark:bg-red-900/20': order.isBlacklisted
                }"
              >
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedOrders.includes(order.id)"
                    @change="toggleSelectOrder(order.id)"
                    class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-medium text-primary-600 dark:text-primary-400">{{ order.code }}</span>
                    <!-- Blacklist Warning Icon -->
                    <ExclamationTriangleIcon
                      v-if="order.isBlacklisted"
                      class="w-4 h-4 text-red-500"
                      :title="$t('supervisor.blacklisted')"
                    />
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-900 dark:text-white">{{ order.fullName }}</td>
                <td class="px-4 py-3">
                  <a :href="'tel:' + order.phone" class="text-blue-600 dark:text-blue-400 hover:underline">
                    {{ order.phone }}
                  </a>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ order.cityName }}</td>
                <td class="px-4 py-3">
                  <!-- Products with tooltip -->
                  <div v-if="order.items && order.items.length > 0" class="relative group">
                    <span class="text-sm text-gray-700 dark:text-gray-300 cursor-help">
                      {{ order.items[0].productName }}
                      <span v-if="order.items.length > 1" class="text-xs text-gray-500 ml-1">
                        +{{ order.items.length - 1 }}
                      </span>
                    </span>
                    <!-- Tooltip -->
                    <div
                      v-if="order.items.length > 1"
                      class="hidden group-hover:block absolute z-10 left-0 top-full mt-1 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 min-w-[200px]"
                    >
                      <div v-for="(item, idx) in order.items" :key="idx" class="py-1">
                        {{ item.productName }} <span class="text-gray-400">x{{ item.quantity }}</span>
                      </div>
                    </div>
                  </div>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">{{ formatCurrency(order.price) }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ order.sourceName || '-' }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ order.storeName || '-' }}</td>
                <td class="px-4 py-3">
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ timeAgo(order.createdOn) }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <!-- View Order Details -->
                    <NuxtLink
                      :to="`/dashboard/orders/${order.id}?from=supervisor`"
                      class="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      :title="$t('supervisor.viewDetails')"
                    >
                      <EyeIcon class="w-4 h-4" />
                    </NuxtLink>
                    <!-- Assign -->
                    <button
                      @click="openSingleReassign(order)"
                      class="p-1.5 text-primary-600 hover:text-primary-800 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                      :title="$t('supervisor.assign')"
                    >
                      <ArrowsRightLeftIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="newOrdersPagination.totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('common.showing') }} {{ newOrders.length }} {{ $t('common.of') }} {{ newOrdersPagination.totalCount }}
          </p>
        </div>
      </div>
    </div>

    <!-- Confirmations In Progress Tab (UNIFIED) -->
    <div v-if="activeTab === 'confirmations'" class="card">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('supervisor.confirmationsInProgress') }}
        </h2>
        <div class="flex items-center gap-4">
          <!-- Status Filter -->
          <select
            v-model="confirmationStatusFilter"
            @change="loadConfirmationOrders"
            class="input text-sm w-40"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option value="unassigned">{{ $t('supervisor.statusUnassigned') }}</option>
            <option :value="AssignmentStatus.Pending">{{ $t('supervisor.statusPending') }}</option>
            <option :value="AssignmentStatus.Taken">{{ $t('supervisor.statusTaken') }}</option>
          </select>
          <!-- Select All -->
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="selectAllConfirmations"
              @change="toggleSelectAllConfirmations"
              class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('common.all') }}</span>
          </div>
        </div>
      </div>

      <div v-if="isLoadingConfirmations" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>

      <div v-else-if="confirmationOrders.length === 0" class="text-center py-8">
        <ClockIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('supervisor.noConfirmationOrders') }}</p>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    :checked="selectAllConfirmations"
                    @change="toggleSelectAllConfirmations"
                    class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('orders.code') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.name') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.phone') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.city') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('orders.price') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.serviceType') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.assignmentStatus') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.worker') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.duration') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="order in confirmationOrders"
                :key="order.orderId"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedOrders.includes(order.orderId) }"
              >
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedOrders.includes(order.orderId)"
                    @change="toggleSelectOrder(order.orderId)"
                    class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td class="px-4 py-3">
                  <span class="font-mono font-medium text-primary-600 dark:text-primary-400">{{ order.orderCode }}</span>
                </td>
                <td class="px-4 py-3 text-gray-900 dark:text-white">{{ order.customerName }}</td>
                <td class="px-4 py-3">
                  <a :href="'tel:' + order.customerPhone" class="text-blue-600 dark:text-blue-400 hover:underline">
                    {{ order.customerPhone }}
                  </a>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ order.cityName || '-' }}</td>
                <td class="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">{{ formatCurrency(order.orderPrice) }}</td>
                <td class="px-4 py-3">
                  <!-- Service Type Badge -->
                  <span
                    v-if="order.serviceType"
                    class="px-2 py-1 text-xs rounded"
                    :class="getServiceTypeBadgeClass(order.serviceType)"
                  >
                    {{ order.serviceType }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getStatusBadgeClass(order.assignmentStatus)"
                  >
                    {{ getStatusLabel(order.assignmentStatus) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="order.workerName" class="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                    {{ order.workerName }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3">
                  <!-- Duration since assigned/taken -->
                  <span
                    v-if="order.takenAt || order.assignedAt"
                    class="text-sm"
                    :class="getDurationClass(order.takenAt || order.assignedAt)"
                  >
                    {{ timeAgo(order.takenAt || order.assignedAt) }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <!-- View Order Details -->
                    <NuxtLink
                      :to="`/dashboard/orders/${order.orderId}?from=supervisor`"
                      class="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      :title="$t('supervisor.viewDetails')"
                    >
                      <EyeIcon class="w-4 h-4" />
                    </NuxtLink>
                    <!-- Assign/Reassign -->
                    <button
                      @click="openSingleReassignFromConfirmation(order)"
                      class="p-1.5 text-primary-600 hover:text-primary-800 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                      :title="order.assignmentStatus === 'unassigned' ? $t('supervisor.assign') : $t('supervisor.reassign')"
                    >
                      <ArrowsRightLeftIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Quality Tab -->
    <div v-if="activeTab === ServiceTypes.Quality" class="card">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('supervisor.qualityOrders') }}
        </h2>
        <div class="flex items-center gap-4">
          <!-- Status Filter -->
          <select
            v-model="qualityStatusFilter"
            @change="loadQualityOrders"
            class="input text-sm w-40"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option value="unassigned">{{ $t('supervisor.statusUnassigned') }}</option>
            <option :value="AssignmentStatus.Pending">{{ $t('supervisor.statusPending') }}</option>
            <option :value="AssignmentStatus.Taken">{{ $t('supervisor.statusTaken') }}</option>
          </select>
          <!-- Select All -->
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="selectAllQuality"
              @change="toggleSelectAllQuality"
              class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('common.all') }}</span>
          </div>
        </div>
      </div>

      <div v-if="isLoadingQuality" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>

      <div v-else-if="qualityOrders.length === 0" class="text-center py-8">
        <ShieldCheckIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('supervisor.noQualityOrders') }}</p>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    :checked="selectAllQuality"
                    @change="toggleSelectAllQuality"
                    class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('orders.code') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.name') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.phone') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.city') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('orders.price') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.assignmentStatus') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.worker') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.duration') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="order in qualityOrders"
                :key="order.orderId"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedOrders.includes(order.orderId) }"
              >
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedOrders.includes(order.orderId)"
                    @change="toggleSelectOrder(order.orderId)"
                    class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td class="px-4 py-3">
                  <span class="font-mono font-medium text-primary-600 dark:text-primary-400">{{ order.orderCode }}</span>
                </td>
                <td class="px-4 py-3 text-gray-900 dark:text-white">{{ order.customerName }}</td>
                <td class="px-4 py-3">
                  <a :href="'tel:' + order.customerPhone" class="text-blue-600 dark:text-blue-400 hover:underline">
                    {{ order.customerPhone }}
                  </a>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ order.cityName || '-' }}</td>
                <td class="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">{{ formatCurrency(order.orderPrice) }}</td>
                <td class="px-4 py-3">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getStatusBadgeClass(order.assignmentStatus)"
                  >
                    {{ getStatusLabel(order.assignmentStatus) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="order.workerName" class="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                    {{ order.workerName }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3">
                  <span
                    v-if="order.takenAt || order.assignedAt"
                    class="text-sm"
                    :class="getDurationClass(order.takenAt || order.assignedAt)"
                  >
                    {{ timeAgo(order.takenAt || order.assignedAt) }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <!-- View Order Details -->
                    <NuxtLink
                      :to="`/dashboard/orders/${order.orderId}?from=supervisor`"
                      class="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      :title="$t('supervisor.viewDetails')"
                    >
                      <EyeIcon class="w-4 h-4" />
                    </NuxtLink>
                    <!-- Assign/Reassign -->
                    <button
                      @click="openSingleReassignFromQuality(order)"
                      class="p-1.5 text-primary-600 hover:text-primary-800 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                      :title="order.assignmentStatus === 'unassigned' ? $t('supervisor.assign') : $t('supervisor.reassign')"
                    >
                      <ArrowsRightLeftIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Suivi Tab -->
    <div v-if="activeTab === ServiceTypes.Suivi" class="card">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('supervisor.suiviOrders') }}
        </h2>
        <div class="flex items-center gap-4">
          <!-- Status Filter -->
          <select
            v-model="suiviStatusFilter"
            @change="loadSuiviOrders"
            class="input text-sm w-40"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option value="unassigned">{{ $t('supervisor.statusUnassigned') }}</option>
            <option :value="AssignmentStatus.Pending">{{ $t('supervisor.statusPending') }}</option>
            <option :value="AssignmentStatus.Taken">{{ $t('supervisor.statusTaken') }}</option>
          </select>
          <!-- Select All -->
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="selectAllSuivi"
              @change="toggleSelectAllSuivi"
              class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('common.all') }}</span>
          </div>
        </div>
      </div>

      <div v-if="isLoadingSuivi" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>

      <div v-else-if="suiviOrders.length === 0" class="text-center py-8">
        <ClipboardDocumentListIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('supervisor.noSuiviOrders') }}</p>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    :checked="selectAllSuivi"
                    @change="toggleSelectAllSuivi"
                    class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('orders.code') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.name') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.phone') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.city') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('orders.price') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.assignmentStatus') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.worker') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.duration') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="order in suiviOrders"
                :key="order.orderId"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedOrders.includes(order.orderId) }"
              >
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedOrders.includes(order.orderId)"
                    @change="toggleSelectOrder(order.orderId)"
                    class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td class="px-4 py-3">
                  <span class="font-mono font-medium text-primary-600 dark:text-primary-400">{{ order.orderCode }}</span>
                </td>
                <td class="px-4 py-3 text-gray-900 dark:text-white">{{ order.customerName }}</td>
                <td class="px-4 py-3">
                  <a :href="'tel:' + order.customerPhone" class="text-blue-600 dark:text-blue-400 hover:underline">
                    {{ order.customerPhone }}
                  </a>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ order.cityName || '-' }}</td>
                <td class="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">{{ formatCurrency(order.orderPrice) }}</td>
                <td class="px-4 py-3">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getStatusBadgeClass(order.assignmentStatus)"
                  >
                    {{ getStatusLabel(order.assignmentStatus) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="order.workerName" class="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                    {{ order.workerName }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3">
                  <span
                    v-if="order.takenAt || order.assignedAt"
                    class="text-sm"
                    :class="getDurationClass(order.takenAt || order.assignedAt)"
                  >
                    {{ timeAgo(order.takenAt || order.assignedAt) }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <!-- View Order Details -->
                    <NuxtLink
                      :to="`/dashboard/orders/${order.orderId}?from=supervisor`"
                      class="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      :title="$t('supervisor.viewDetails')"
                    >
                      <EyeIcon class="w-4 h-4" />
                    </NuxtLink>
                    <!-- Reassign -->
                    <button
                      @click="openSingleReassignFromSuivi(order)"
                      class="p-1.5 text-primary-600 hover:text-primary-800 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                      :title="$t('supervisor.reassign')"
                    >
                      <ArrowsRightLeftIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>


    <!-- Callbacks Tab -->
    <div v-if="activeTab === 'callbacks'" class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('supervisor.callbacksOverview') }}
        </h2>
      </div>

      <!-- Callback Filters -->
      <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          v-for="f in callbackFilters"
          :key="f.value ?? 'all'"
          @click="callbackFilter = f.value"
          :class="[
            'px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
            callbackFilter === f.value
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isLoadingCallbacks" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="allCallbacks.length === 0" class="text-center py-8">
        <PhoneArrowUpRightIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('supervisor.noCallbacks') }}</p>
      </div>

      <!-- Callbacks Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('orders.code') }}</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.name') }}</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.phone') }}</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('customers.city') }}</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('orders.price') }}</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.agent') }}</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.scheduledFor') }}</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.attempt') }}</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('supervisor.notes') }}</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('common.status') }}</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="cb in allCallbacks"
              :key="cb.assignmentId"
              :class="cb.isCallbackOverdue ? 'bg-red-50 dark:bg-red-900/20' : ''"
            >
              <td class="py-3 px-4">
                <span class="font-mono font-medium text-primary-600 dark:text-primary-400">{{ cb.orderCode }}</span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-900 dark:text-white">{{ cb.customerName }}</td>
              <td class="py-3 px-4">
                <a :href="'tel:' + cb.customerPhone" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  {{ cb.customerPhone }}
                </a>
              </td>
              <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{{ cb.cityName || '-' }}</td>
              <td class="py-3 px-4 font-medium text-emerald-600 dark:text-emerald-400">{{ formatCurrency(cb.orderPrice) }}</td>
              <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{{ cb.workerName }}</td>
              <td class="py-3 px-4 text-sm" :class="cb.isCallbackOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'">
                {{ formatCallbackDateTime(cb.callbackScheduledAt) }}
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                  x{{ cb.callbackAttemptNumber }}
                </span>
              </td>
              <td class="py-3 px-4">
                <!-- Notes preview with tooltip -->
                <div v-if="cb.notes" class="relative group max-w-[150px]">
                  <span class="text-sm text-gray-500 dark:text-gray-400 truncate block cursor-help">
                    {{ cb.notes.substring(0, 30) }}{{ cb.notes.length > 30 ? '...' : '' }}
                  </span>
                  <!-- Tooltip for full note -->
                  <div
                    v-if="cb.notes.length > 30"
                    class="hidden group-hover:block absolute z-10 left-0 top-full mt-1 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 min-w-[200px] max-w-[300px] whitespace-pre-wrap"
                  >
                    {{ cb.notes }}
                  </div>
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="py-3 px-4">
                <span
                  :class="[
                    'px-2 py-0.5 text-xs rounded-full',
                    cb.isCallbackOverdue
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  ]"
                >
                  {{ cb.isCallbackOverdue ? $t('worker.overdue') : $t('supervisor.scheduled') }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <!-- View Order Details -->
                  <NuxtLink
                    :to="`/dashboard/orders/${cb.orderId}?from=supervisor`"
                    class="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    :title="$t('supervisor.viewDetails')"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </NuxtLink>
                  <!-- Reassign Callback -->
                  <button
                    @click="openCallbackReassign(cb)"
                    class="p-1.5 text-primary-600 hover:text-primary-800 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                    :title="$t('supervisor.reassignCallback')"
                  >
                    <ArrowsRightLeftIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Simple Assign Modal (for new orders tab only) -->
    <SimpleAssignModal
      :show="showReassignModal && activeTab === 'new'"
      :orders="selectedOrdersForAssign"
      :workers="workers"
      @close="closeReassignModal"
      @confirm="handleSimpleAssignConfirm"
    />

    <!-- Reassign Modal (for other tabs) -->
    <TransitionRoot :show="showReassignModal && activeTab !== 'new'" as="template">
      <Dialog as="div" class="relative z-50" @close="closeReassignModal">
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
                  {{ $t('supervisor.reassignOrders') }}
                </DialogTitle>

                <form @submit.prevent="submitReassign">
                  <!-- Order Count -->
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {{ $t('supervisor.reassigningCount', { count: selectedOrders.length }) }}
                  </p>

                  <!-- Service Selection for existing assignments -->
                  <div class="mb-4">
                    <!-- Loading state -->
                    <div v-if="isLoadingActiveServices" class="text-center py-4">
                      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                      <p class="text-sm text-gray-500 mt-2">{{ $t('common.loading') }}...</p>
                    </div>

                    <!-- Services to reassign -->
                    <div v-else-if="activeServicesForReassign.length > 0">
                      <label class="label">{{ $t('supervisor.servicesToReassign') }} *</label>
                      <p class="text-xs text-gray-500 mb-2">{{ $t('supervisor.selectServicesToReassign') }}</p>
                      <div class="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <label
                          v-for="service in activeServicesForReassign"
                          :key="service.serviceType"
                          class="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600/50"
                        >
                          <input
                            type="checkbox"
                            :value="service.serviceType"
                            v-model="selectedServicesToReassign"
                            class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div class="flex-1">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {{ service.serviceType }}
                            </span>
                            <span
                              v-if="service.workerName"
                              class="ml-2 text-xs text-gray-500"
                            >
                              ({{ service.workerName }} - {{ getStatusLabel(service.status) }})
                            </span>
                          </div>
                        </label>
                      </div>
                      <p class="text-xs text-gray-500 mt-1">
                        {{ $t('supervisor.reassignHint') }}
                      </p>
                    </div>

                    <!-- No active services -->
                    <div v-else class="text-center py-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <ExclamationTriangleIcon class="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p class="text-sm text-yellow-700 dark:text-yellow-300">{{ $t('supervisor.noActiveServices') }}</p>
                    </div>
                  </div>

                  <!-- Worker Selection -->
                  <div class="mb-4">
                    <label class="label">{{ $t('supervisor.selectWorker') }} *</label>
                    <select v-model="reassignForm.workerId" class="input" required>
                      <option value="">{{ $t('common.select') }}...</option>
                      <option
                        v-for="worker in workers"
                        :key="worker.id"
                        :value="worker.id"
                      >
                        {{ worker.firstName }} {{ worker.lastName }}
                      </option>
                    </select>
                  </div>

                  <!-- Notes -->
                  <div class="mb-4">
                    <label class="label">{{ $t('supervisor.notes') }}</label>
                    <textarea v-model="reassignForm.notes" class="input" rows="2"></textarea>
                  </div>

                  <div class="flex justify-end gap-3">
                    <button type="button" class="btn-secondary" @click="closeReassignModal">
                      {{ $t('common.cancel') }}
                    </button>
                    <button
                      type="submit"
                      class="btn-primary"
                      :disabled="isSubmitting || isSubmitDisabled"
                    >
                      {{ isSubmitting ? $t('common.loading') : $t('supervisor.reassign') }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import {
  ArrowPathIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
  InboxIcon,
  PlusIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  PhoneArrowUpRightIcon,
  EyeIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon
} from '@heroicons/vue/24/outline'
import SimpleAssignModal from '~/components/supervisor/SimpleAssignModal.vue'
import {
  useOrdersWorkflowService,
  useOrderAssignmentsService,
  useUsersService,
  useWorkerServiceConfigsService,
  useAutoAssignmentSettingsService,
  useOrdersService,
  type OrderDto,
  type ConfirmationOrderDto,
  type UserDetailsDto,
  type WorkerServiceConfigDto,
  type WorkerStatsSummary
} from '~/services'
import { ServiceTypes, AssignmentStatus, OrderPhase, OrderState, type ServiceType } from '~/constants/order'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.SupervisorDashboard.View'
})

const { t } = useI18n()
const notification = useNotification()

// Services
const ordersWorkflow = useOrdersWorkflowService()
const orderAssignments = useOrderAssignmentsService()
const usersService = useUsersService()
const workerConfigsService = useWorkerServiceConfigsService()
const autoAssignmentSettingsService = useAutoAssignmentSettingsService()
const ordersService = useOrdersService()

// Check if Quality is enabled in auto-assignment settings
const isQualityEnabled = computed(() => autoAssignmentSettingsService.settings.value?.enableQualityCheck ?? false)

// Active tab
const activeTab = ref<'new' | 'confirmations' | 'quality' | 'suivi' | 'callbacks'>('new')

// State
const newOrders = ref<OrderDto[]>([])
const confirmationOrders = ref<ConfirmationOrderDto[]>([])
const qualityOrders = ref<ConfirmationOrderDto[]>([])
const suiviOrders = ref<ConfirmationOrderDto[]>([])
const selectedOrders = ref<string[]>([])
const isLoadingNew = ref(false)
const isLoadingConfirmations = ref(false)
const isLoadingQuality = ref(false)
const isLoadingSuivi = ref(false)
const isSubmitting = ref(false)

// Filter for confirmations tab
const confirmationStatusFilter = ref<string>('')

// Filter for quality tab
const qualityStatusFilter = ref<string>('')

// Filter for suivi tab
const suiviStatusFilter = ref<string>('')

// Callbacks state
const callbackFilter = ref<string | undefined>(undefined)
const callbackFilterRef = computed(() => callbackFilter.value)
const allCallbacksQuery = orderAssignments.useAllCallbacks(callbackFilterRef)
const allCallbacks = computed(() => allCallbacksQuery.data.value ?? [])
const isLoadingCallbacks = computed(() => allCallbacksQuery.isLoading.value)
const allCallbacksCount = computed(() => allCallbacks.value.length)
const overdueCallbacksCount = computed(() => allCallbacks.value.filter(cb => cb.isCallbackOverdue).length)

// Workers stats state (batch stats for all workers)
const workersStatsQuery = orderAssignments.useWorkersStats()
const workersStats = computed(() => workersStatsQuery.data.value?.workers ?? [])
const overallStats = computed(() => workersStatsQuery.data.value?.overall)
const isLoadingWorkersStats = computed(() => workersStatsQuery.isLoading.value)

// Get stats for a specific worker by userId
const getWorkerStats = (userId: string): WorkerStatsSummary | undefined => {
  return workersStats.value.find(w => w.workerId === userId)
}

const callbackFilters = computed(() => [
  { value: undefined, label: t('common.all') },
  { value: 'overdue', label: t('worker.overdueCallbacks') },
  { value: 'today', label: t('worker.todayCallbacks') },
  { value: 'upcoming', label: t('worker.upcomingCallbacks') }
])

// Format callback datetime
const formatCallbackDateTime = (isoDate: string) => {
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

// Pagination
const newOrdersPagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  pageSize: 100
})

// From services
const users = computed(() => usersService.users.value)
const workerConfigs = computed(() => workerConfigsService.items.value)

// Computed
const workers = computed(() => users.value.filter((u: UserDetailsDto) => u.isActive))
const workerOrderCounts = computed(() => {
  const counts: Record<string, number> = {}
  // Count from confirmation orders
  confirmationOrders.value.forEach(o => {
    if (o.workerId) {
      counts[o.workerId] = (counts[o.workerId] || 0) + 1
    }
  })
  return counts
})

// Computed: orders for SimpleAssignModal (for new tab)
const selectedOrdersForAssign = computed(() => {
  return newOrders.value
    .filter(o => selectedOrders.value.includes(o.id))
    .map(o => ({ id: o.id, code: o.code }))
})

const selectAllNew = computed(() =>
  newOrders.value.length > 0 &&
  newOrders.value.every(o => selectedOrders.value.includes(o.id))
)

const selectAllConfirmations = computed(() =>
  confirmationOrders.value.length > 0 &&
  confirmationOrders.value.every(o => selectedOrders.value.includes(o.orderId))
)

const selectAllQuality = computed(() =>
  qualityOrders.value.length > 0 &&
  qualityOrders.value.every(o => selectedOrders.value.includes(o.orderId))
)

const selectAllSuivi = computed(() =>
  suiviOrders.value.length > 0 &&
  suiviOrders.value.every(o => selectedOrders.value.includes(o.orderId))
)

// Modal
const showReassignModal = ref(false)
const reassignForm = ref({
  workerId: '',
  serviceTypes: [ServiceTypes.Confirmation] as ServiceType[],
  notes: ''
})

// Reassign Mode: Service selection for existing assignments
interface ActiveServiceInfo {
  serviceType: string
  workerName: string | null
  status: string
  orderId: string
}
const activeServicesForReassign = ref<ActiveServiceInfo[]>([])
const selectedServicesToReassign = ref<string[]>([])
const isLoadingActiveServices = ref(false)

// Computed for submit validation (reassign modal only - new tab uses SimpleAssignModal)
const isSubmitDisabled = computed(() => {
  // Reassign mode: worker required + at least one service selected
  return !reassignForm.value.workerId || selectedServicesToReassign.value.length === 0
})

// Format helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount)
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Time ago helper (relative time: "2h", "15min", "3j")
const timeAgo = (date?: string) => {
  if (!date) return '-'
  const now = Date.now()
  const then = new Date(date).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return t('supervisor.justNow')
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}j`
}

// Status badge helpers
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'unassigned':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case AssignmentStatus.Pending:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case AssignmentStatus.Taken:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

// Service type badge helper
const getServiceTypeBadgeClass = (serviceType: string) => {
  switch (serviceType?.toLowerCase()) {
    case ServiceTypes.Confirmation:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case ServiceTypes.Suivi:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case ServiceTypes.Quality:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case ServiceTypes.Callback:
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

// Duration class helper (color based on how long since assigned)
const getDurationClass = (date?: string) => {
  if (!date) return 'text-gray-500'
  const now = Date.now()
  const then = new Date(date).getTime()
  const minutes = Math.floor((now - then) / 60000)

  // Over 30 minutes: red (too long)
  if (minutes > 30) return 'text-red-600 dark:text-red-400 font-medium'
  // 15-30 minutes: orange (warning)
  if (minutes > 15) return 'text-orange-600 dark:text-orange-400'
  // Under 15 minutes: gray (normal)
  return 'text-gray-500 dark:text-gray-400'
}

const getStatusLabel = (status: string) => {
  return t(`supervisor.status${status.charAt(0).toUpperCase() + status.slice(1)}`)
}

// Load new orders (Phase = "new")
const loadNewOrders = async () => {
  isLoadingNew.value = true
  try {
    const response = await ordersWorkflow.getNewOrders({
      limit: 100
    })
    newOrders.value = response || []
    newOrdersPagination.value = {
      currentPage: 1,
      totalPages: 1,
      totalCount: newOrders.value.length,
      pageSize: newOrders.value.length
    }
  } catch {
    newOrders.value = []
    console.warn('New orders API not available')
  } finally {
    isLoadingNew.value = false
  }
}

// Load confirmation orders (unified view)
const loadConfirmationOrders = async () => {
  isLoadingConfirmations.value = true
  try {
    const response = await ordersWorkflow.getConfirmationOrders({
      AssignmentStatus: confirmationStatusFilter.value || undefined,
      Limit: 100
    })
    confirmationOrders.value = response || []
  } catch {
    confirmationOrders.value = []
    console.warn('Confirmation orders API not available')
  } finally {
    isLoadingConfirmations.value = false
  }
}

// Load quality orders (unified view)
const loadQualityOrders = async () => {
  isLoadingQuality.value = true
  try {
    const response = await ordersWorkflow.getQualityOrders({
      AssignmentStatus: qualityStatusFilter.value || undefined,
      Limit: 100
    })
    qualityOrders.value = response || []
  } catch {
    qualityOrders.value = []
    console.warn('Quality orders API not available')
  } finally {
    isLoadingQuality.value = false
  }
}

// Load suivi orders (unified view)
const loadSuiviOrders = async () => {
  isLoadingSuivi.value = true
  try {
    const response = await ordersWorkflow.getSuiviOrders({
      AssignmentStatus: suiviStatusFilter.value || undefined,
      Limit: 100
    })
    suiviOrders.value = response || []
  } catch {
    suiviOrders.value = []
    console.warn('Suivi orders API not available')
  } finally {
    isLoadingSuivi.value = false
  }
}

// Selection handlers
const toggleSelectOrder = (id: string) => {
  const index = selectedOrders.value.indexOf(id)
  if (index === -1) {
    selectedOrders.value.push(id)
  } else {
    selectedOrders.value.splice(index, 1)
  }
}

const toggleSelectAllNew = () => {
  if (selectAllNew.value) {
    selectedOrders.value = selectedOrders.value.filter(
      id => !newOrders.value.some(o => o.id === id)
    )
  } else {
    const newIds = newOrders.value.map(o => o.id)
    selectedOrders.value = [...new Set([...selectedOrders.value, ...newIds])]
  }
}

const toggleSelectAllConfirmations = () => {
  if (selectAllConfirmations.value) {
    selectedOrders.value = selectedOrders.value.filter(
      id => !confirmationOrders.value.some(o => o.orderId === id)
    )
  } else {
    const confirmationIds = confirmationOrders.value.map(o => o.orderId)
    selectedOrders.value = [...new Set([...selectedOrders.value, ...confirmationIds])]
  }
}

const toggleSelectAllQuality = () => {
  if (selectAllQuality.value) {
    selectedOrders.value = selectedOrders.value.filter(
      id => !qualityOrders.value.some(o => o.orderId === id)
    )
  } else {
    const qualityIds = qualityOrders.value.map(o => o.orderId)
    selectedOrders.value = [...new Set([...selectedOrders.value, ...qualityIds])]
  }
}

const toggleSelectAllSuivi = () => {
  if (selectAllSuivi.value) {
    selectedOrders.value = selectedOrders.value.filter(
      id => !suiviOrders.value.some(o => o.orderId === id)
    )
  } else {
    const suiviIds = suiviOrders.value.map(o => o.orderId)
    selectedOrders.value = [...new Set([...selectedOrders.value, ...suiviIds])]
  }
}

// Reassign modal (for non-new tabs - new tab uses SimpleAssignModal)
const openReassignModal = async () => {
  if (selectedOrders.value.length === 0) return
  reassignForm.value = { workerId: '', serviceTypes: [ServiceTypes.Confirmation], notes: '' }

  // For reassign tabs: get active services from the correct data source
  if (activeTab.value !== 'new') {
    activeServicesForReassign.value = []
    selectedServicesToReassign.value = []

    const servicesMap = new Map<string, ActiveServiceInfo>()
    const activeStatuses = [AssignmentStatus.Pending, AssignmentStatus.Taken]

    if (activeTab.value === 'confirmations') {
      // Tab Confirmations: get active confirmation services + offer Quality/Suivi for assignment
      for (const orderId of selectedOrders.value) {
        const matchingOrders = confirmationOrders.value.filter(o => o.orderId === orderId)

        for (const confOrder of matchingOrders) {
          const status = confOrder.assignmentStatus || 'unassigned'
          const isActiveOrUnassigned = activeStatuses.includes(status) || status === 'unassigned'

          if (isActiveOrUnassigned) {
            // For confirmation tab, service type should be "confirmation" even if not set
            const key = confOrder.serviceType || ServiceTypes.Confirmation
            if (!servicesMap.has(key)) {
              servicesMap.set(key, {
                serviceType: key,
                workerName: confOrder.workerName || null,
                status: status,
                orderId: confOrder.orderId || ''
              })
            }
          }
        }

        // Always add Confirmation option for this tab if not already present
        if (!servicesMap.has(ServiceTypes.Confirmation)) {
          servicesMap.set(ServiceTypes.Confirmation, {
            serviceType: ServiceTypes.Confirmation,
            workerName: null,
            status: 'new',
            orderId: orderId
          })
        }

        // Add Quality option if enabled and not already assigned
        if (isQualityEnabled.value && !servicesMap.has(ServiceTypes.Quality)) {
          servicesMap.set(ServiceTypes.Quality, {
            serviceType: ServiceTypes.Quality,
            workerName: null,
            status: 'new',
            orderId: orderId
          })
        }

        // Add Suivi option if not already assigned
        if (!servicesMap.has(ServiceTypes.Suivi)) {
          servicesMap.set(ServiceTypes.Suivi, {
            serviceType: ServiceTypes.Suivi,
            workerName: null,
            status: 'new',
            orderId: orderId
          })
        }
      }
    } else if (activeTab.value === ServiceTypes.Quality) {
      // Tab Quality: get services from qualityOrders
      for (const orderId of selectedOrders.value) {
        const matchingOrders = qualityOrders.value.filter(o => o.orderId === orderId)

        for (const qualOrder of matchingOrders) {
          const isActiveStatus = activeStatuses.includes(qualOrder.assignmentStatus || '')
          if (qualOrder.serviceType && isActiveStatus) {
            const key = qualOrder.serviceType
            if (!servicesMap.has(key)) {
              servicesMap.set(key, {
                serviceType: qualOrder.serviceType,
                workerName: qualOrder.workerName || null,
                status: qualOrder.assignmentStatus || 'unknown',
                orderId: qualOrder.orderId || ''
              })
            }
          }
        }
        // Also show suivi as an option since quality → suivi is the next step
        if (!servicesMap.has(ServiceTypes.Suivi)) {
          servicesMap.set(ServiceTypes.Suivi, {
            serviceType: ServiceTypes.Suivi,
            workerName: null,
            status: 'new',
            orderId: orderId
          })
        }
      }
    } else if (activeTab.value === ServiceTypes.Suivi) {
      // Tab Suivi: get active suivi services from suiviOrders
      // Include 'unassigned' orders so supervisor can assign them
      for (const orderId of selectedOrders.value) {
        const matchingOrders = suiviOrders.value.filter(o => o.orderId === orderId)

        for (const suiviOrder of matchingOrders) {
          const status = suiviOrder.assignmentStatus || 'unassigned'
          const isActiveOrUnassigned = activeStatuses.includes(status) || status === 'unassigned'

          if (isActiveOrUnassigned) {
            const key = suiviOrder.serviceType || ServiceTypes.Suivi
            if (!servicesMap.has(key)) {
              servicesMap.set(key, {
                serviceType: key,
                workerName: suiviOrder.workerName || null,
                status: status,
                orderId: suiviOrder.orderId || ''
              })
            }
          }
        }
      }
    }

    activeServicesForReassign.value = Array.from(servicesMap.values())
    selectedServicesToReassign.value = activeServicesForReassign.value.map(s => s.serviceType)
  }

  showReassignModal.value = true
}

const openSingleReassign = (order: OrderDto) => {
  selectedOrders.value = [order.id]
  openReassignModal()
}

const openSingleReassignFromConfirmation = (order: ConfirmationOrderDto) => {
  selectedOrders.value = [order.orderId]
  openReassignModal()
}

const openSingleReassignFromQuality = (order: ConfirmationOrderDto) => {
  selectedOrders.value = [order.orderId]
  openReassignModal()
}

// Open reassign for a single suivi order
const openSingleReassignFromSuivi = (order: ConfirmationOrderDto) => {
  selectedOrders.value = [order.orderId]
  openReassignModal()
}

// Open reassign for a callback (from callbacks tab)
const openCallbackReassign = (callback: { orderId?: string }) => {
  if (!callback.orderId) return
  selectedOrders.value = [callback.orderId]
  // Pre-select callback service for reassignment
  activeServicesForReassign.value = [{
    serviceType: ServiceTypes.Callback,
    workerName: null,
    status: ServiceTypes.Callback,
    orderId: callback.orderId
  }]
  selectedServicesToReassign.value = [ServiceTypes.Callback]
  reassignForm.value = { workerId: '', serviceTypes: [ServiceTypes.Callback], notes: '' }
  showReassignModal.value = true
}

const closeReassignModal = () => {
  showReassignModal.value = false
}

// Handler for SimpleAssignModal (new orders tab)
const handleSimpleAssignConfirm = async (data: {
  orderIds: string[]
  confirmationWorkerId?: string
  suiviWorkerId?: string
}) => {
  isSubmitting.value = true
  try {
    // Build service chain based on selected workers
    const serviceTypes: ServiceType[] = []
    const individualAssignments: Record<string, string> = {}

    if (data.confirmationWorkerId) {
      serviceTypes.push(ServiceTypes.Confirmation)
      individualAssignments[ServiceTypes.Confirmation] = data.confirmationWorkerId
    }
    if (data.suiviWorkerId) {
      serviceTypes.push(ServiceTypes.Suivi)
      individualAssignments[ServiceTypes.Suivi] = data.suiviWorkerId
    }

    // Use individual assign for each order/service combination
    for (const orderId of data.orderIds) {
      for (const [serviceType, workerId] of Object.entries(individualAssignments)) {
        await orderAssignments.assign({
          orderId,
          workerId,
          serviceType,
          allowReassignment: true
        })
      }
    }

    notification.success(t('supervisor.assignmentSuccess'))
    closeReassignModal()
    selectedOrders.value = []
    await loadAllData()
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : t('common.error')
    notification.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// Submit reassign (for non-new tabs only - new tab uses SimpleAssignModal)
const submitReassign = async () => {
  isSubmitting.value = true
  try {
    if (!reassignForm.value.workerId) return
    if (selectedServicesToReassign.value.length === 0) return

    // Bulk-reassign existing active assignments
    await orderAssignments.bulkReassign({
      orderIds: selectedOrders.value,
      toWorkerId: reassignForm.value.workerId,
      serviceTypes: selectedServicesToReassign.value,
      notes: reassignForm.value.notes || undefined
    })

    notification.success(t('supervisor.reassignSuccess', { count: selectedOrders.value.length }))
    closeReassignModal()
    selectedOrders.value = []
    await loadAllData()
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : t('common.error')
    notification.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// Load all data
const loadAllData = async () => {
  await Promise.all([
    loadNewOrders(),
    loadConfirmationOrders(),
    isQualityEnabled.value ? loadQualityOrders() : Promise.resolve(),
    loadSuiviOrders(),
    usersService.refetch(),
    workerConfigsService.refetchAll()
  ])
}

// Watch tab changes to clear selection
watch(activeTab, () => {
  selectedOrders.value = []
})

// Watch for isQualityEnabled becoming true (settings loaded)
// This handles the race condition where settings load after initial data fetch
watch(isQualityEnabled, (enabled) => {
  if (enabled && qualityOrders.value.length === 0 && !isLoadingQuality.value) {
    loadQualityOrders()
  }
})

// Load data on mount
onMounted(() => {
  loadAllData()
})
</script>
