<template>
  <div class="card">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ $t('customers.lookup') }}
    </h3>

    <!-- Search Form -->
    <form @submit.prevent="handleSearch" class="flex gap-3 mb-4">
      <div class="flex-1">
        <input
          v-model="phoneNumber"
          type="tel"
          :placeholder="$t('customers.enterPhone')"
          class="input"
          pattern="[0-9+\-\s]+"
          required
        />
      </div>
      <button type="submit" class="btn-primary" :disabled="isSearching">
        <MagnifyingGlassIcon class="w-5 h-5 mr-2" />
        {{ isSearching ? $t('common.loading') : $t('common.search') }}
      </button>
    </form>

    <!-- No Results -->
    <div v-if="searched && !customer && !isSearching" class="text-center py-8">
      <UserIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p class="text-gray-500 dark:text-gray-400">{{ $t('customers.notFound') }}</p>
      <button @click="emit('createNew', phoneNumber)" class="btn-primary mt-4">
        <PlusIcon class="w-5 h-5 mr-2" />
        {{ $t('customers.createNew') }}
      </button>
    </div>

    <!-- Customer Card -->
    <div v-if="customer" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <span class="text-primary-600 dark:text-primary-400 font-semibold text-lg">
              {{ customer.fullName?.charAt(0) || '?' }}
            </span>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-white">{{ customer.fullName }}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ customer.email || '-' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span
            v-if="customer.isBlacklisted"
            class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded"
          >
            {{ $t('customers.blacklisted') }}
          </span>
          <span
            v-else
            class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded"
          >
            {{ $t('common.active') }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label class="text-gray-500 dark:text-gray-400">{{ $t('customers.phone') }}</label>
          <p class="font-medium text-gray-900 dark:text-white">
            <a :href="'tel:' + customer.phone" class="text-blue-600 dark:text-blue-400 hover:underline">
              {{ customer.phone }}
            </a>
          </p>
        </div>
        <div>
          <label class="text-gray-500 dark:text-gray-400">{{ $t('customers.city') }}</label>
          <p class="font-medium text-gray-900 dark:text-white">{{ customer.cityName || '-' }}</p>
        </div>
        <div class="col-span-2">
          <label class="text-gray-500 dark:text-gray-400">{{ $t('customers.address') }}</label>
          <p class="font-medium text-gray-900 dark:text-white">{{ customer.address || '-' }}</p>
        </div>
      </div>

      <!-- Customer Stats -->
      <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="text-center">
          <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ customer.totalOrders || 0 }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('customers.totalOrders') }}</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ customer.deliveredOrders || 0 }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('customers.delivered') }}</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ customer.cancelledOrders || 0 }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('customers.cancelled') }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button @click="emit('viewHistory', customer)" class="btn-secondary flex-1">
          <ClockIcon class="w-5 h-5 mr-2" />
          {{ $t('customers.orderHistory') }}
        </button>
        <button @click="emit('select', customer)" class="btn-primary flex-1">
          <CheckIcon class="w-5 h-5 mr-2" />
          {{ $t('customers.selectCustomer') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  MagnifyingGlassIcon,
  UserIcon,
  PlusIcon,
  ClockIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'
import type { Customer } from '~/types/customer'

const emit = defineEmits<{
  select: [customer: Customer]
  viewHistory: [customer: Customer]
  createNew: [phone: string]
}>()

const { getCustomerByPhone } = useCustomers()

const phoneNumber = ref('')
const customer = ref<Customer | null>(null)
const isSearching = ref(false)
const searched = ref(false)

const handleSearch = async () => {
  if (!phoneNumber.value.trim()) return

  isSearching.value = true
  searched.value = false
  customer.value = null

  try {
    const result = await getCustomerByPhone(phoneNumber.value.trim())
    customer.value = result
    searched.value = true
  } finally {
    isSearching.value = false
  }
}

// Clear customer when phone changes
watch(phoneNumber, () => {
  if (searched.value) {
    searched.value = false
    customer.value = null
  }
})
</script>
