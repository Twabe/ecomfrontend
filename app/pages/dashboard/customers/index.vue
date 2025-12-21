<template>
  <div>
    <!-- Create/Edit Modal -->
    <TransitionRoot :show="showModal" as="template">
      <Dialog as="div" class="relative z-50" @close="closeModal">
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
              <DialogPanel class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ editingCustomer ? $t('common.edit') : $t('common.create') }} {{ $t('nav.customers') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="col-span-2 sm:col-span-1">
                        <label class="label">{{ $t('customers.name') }} *</label>
                        <input
                          v-model="form.fullName"
                          type="text"
                          class="input"
                          required
                          maxlength="200"
                        />
                      </div>

                      <div class="col-span-2 sm:col-span-1">
                        <label class="label">{{ $t('customers.phone') }} *</label>
                        <input
                          v-model="form.phone"
                          type="tel"
                          class="input"
                          required
                          :disabled="!!editingCustomer"
                          placeholder="0607070000"
                        />
                      </div>
                    </div>

                    <div v-if="!editingCustomer">
                      <label class="label">{{ $t('customers.phoneInternational') }}</label>
                      <input
                        v-model="form.phoneInternational"
                        type="tel"
                        class="input"
                        placeholder="+212607070000"
                      />
                    </div>

                    <div>
                      <label class="label">{{ $t('customers.email') }}</label>
                      <input
                        v-model="form.email"
                        type="email"
                        class="input"
                      />
                    </div>

                    <div>
                      <label class="label">{{ $t('customers.city') }}</label>
                      <select v-model="form.defaultCityId" class="input">
                        <option value="">{{ $t('common.select') }}</option>
                        <option v-for="city in citiesList" :key="city.id" :value="city.id">
                          {{ city.name }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="label">{{ $t('customers.address') }}</label>
                      <textarea
                        v-model="form.defaultAddress"
                        class="input"
                        rows="2"
                      ></textarea>
                    </div>
                  </div>

                  <div class="flex justify-end gap-3 mt-6">
                    <button type="button" class="btn-secondary" @click="closeModal">
                      {{ $t('common.cancel') }}
                    </button>
                    <button type="submit" class="btn-primary" :disabled="isMutating">
                      {{ isMutating ? $t('common.loading') : $t('common.save') }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Blacklist Modal -->
    <TransitionRoot :show="showBlacklistModal" as="template">
      <Dialog as="div" class="relative z-50" @close="showBlacklistModal = false">
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
                  {{ $t('customers.blacklist') }}
                </DialogTitle>

                <div class="mb-4">
                  <label class="label">{{ $t('customers.blacklistReason') }} *</label>
                  <textarea
                    v-model="blacklistReason"
                    class="input"
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div class="flex justify-end gap-3">
                  <button type="button" class="btn-secondary" @click="showBlacklistModal = false">
                    {{ $t('common.cancel') }}
                  </button>
                  <button
                    type="button"
                    class="btn-danger"
                    :disabled="!blacklistReason.trim()"
                    @click="handleBlacklist"
                  >
                    {{ $t('customers.blacklist') }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.customers') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.customers') }}</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        {{ $t('common.create') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchKeyword"
            type="text"
            class="input pl-10"
            :placeholder="$t('common.search') + '...'"
            @input="debouncedSearch"
          />
        </div>
        <select v-model="filterCity" class="input" @change="applyFilters">
          <option value="">{{ $t('common.all') }} {{ $t('nav.cities') }}</option>
          <option v-for="city in citiesList" :key="city.id" :value="city.id">
            {{ city.name }}
          </option>
        </select>
        <select v-model="filterBlacklist" class="input" @change="applyFilters">
          <option value="">{{ $t('common.all') }}</option>
          <option value="false">{{ $t('common.active') }}</option>
          <option value="true">{{ $t('customers.blacklisted') }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-3 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="customers.length === 0" class="text-center py-12">
        <UserGroupIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('customers.name') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('customers.phone') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('customers.city') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('customers.totalOrders') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('customers.totalSpent') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.status') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="customer in customers" :key="customer.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <div>
                  <span class="font-medium text-gray-900 dark:text-white">{{ customer.fullName }}</span>
                  <div v-if="customer.isHighValue" class="text-xs text-yellow-600">VIP</div>
                </div>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-600 dark:text-gray-300">{{ customer.phone }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-600 dark:text-gray-300">{{ customer.defaultCityName || '-' }}</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="text-gray-900 dark:text-white">{{ customer.totalOrders }}</span>
                <div v-if="customer.isProblematic" class="text-xs text-red-600">
                  {{ customer.cancellationRate?.toFixed(0) }}% {{ $t('customers.cancelled') }}
                </div>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="font-medium text-gray-900 dark:text-white">{{ customer.totalSpent?.toFixed(2) }}</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    customer.isBlacklisted
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  ]"
                >
                  {{ customer.isBlacklisted ? $t('customers.blacklisted') : $t('common.active') }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(customer)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="!customer.isBlacklisted"
                    @click="openBlacklistModal(customer)"
                    class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    :title="$t('customers.blacklist')"
                  >
                    <NoSymbolIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-else
                    @click="handleRemoveBlacklist(customer)"
                    class="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                    :title="$t('customers.removeBlacklist')"
                  >
                    <CheckCircleIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(customer)"
                    class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    :title="$t('common.delete')"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Page {{ pagination.currentPage }} / {{ pagination.totalPages }}
        </p>
        <div class="flex gap-2">
          <button
            @click="setPage(pagination.currentPage - 1)"
            :disabled="!pagination.hasPreviousPage"
            class="btn-secondary text-sm px-3 py-1"
          >
            {{ $t('common.previous') }}
          </button>
          <button
            @click="setPage(pagination.currentPage + 1)"
            :disabled="!pagination.hasNextPage"
            class="btn-secondary text-sm px-3 py-1"
          >
            {{ $t('common.next') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, UserGroupIcon, NoSymbolIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useCustomersService, useCitiesService, type CustomerDto } from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Customers.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Customers service provides all CRUD operations with caching
const {
  items: customers,
  pagination,
  isLoading,
  isMutating,
  setPage,
  setKeyword,
  setFilters,
  create,
  update,
  remove,
  blacklist,
  removeFromBlacklist,
} = useCustomersService()

// Cities for dropdown (using service's items which auto-fetch)
const { items: citiesList } = useCitiesService()

// Modal state
const showModal = ref(false)
const showBlacklistModal = ref(false)
const editingCustomer = ref<CustomerDto | null>(null)
const blacklistingCustomer = ref<CustomerDto | null>(null)
const blacklistReason = ref('')

const defaultForm = () => ({
  fullName: '',
  phone: '',
  phoneInternational: '',
  email: '',
  defaultCityId: '',
  defaultAddress: ''
})

const form = ref(defaultForm())

// Filters
const searchKeyword = ref('')
const filterCity = ref('')
const filterBlacklist = ref('')

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => applyFilters(), 300)
}

const applyFilters = () => {
  setKeyword(searchKeyword.value)
  setFilters({
    cityId: filterCity.value || undefined,
    isBlacklisted: filterBlacklist.value ? filterBlacklist.value === 'true' : undefined
  })
}

// Open create modal
const openCreateModal = () => {
  editingCustomer.value = null
  form.value = defaultForm()
  showModal.value = true
}

// Open edit modal
const openEditModal = (customer: CustomerDto) => {
  editingCustomer.value = customer
  form.value = {
    fullName: customer.fullName || '',
    phone: customer.phone || '',
    phoneInternational: customer.phoneInternational || '',
    email: customer.email || '',
    defaultCityId: customer.defaultCityId || '',
    defaultAddress: customer.defaultAddress || ''
  }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingCustomer.value = null
}

// Open blacklist modal
const openBlacklistModal = (customer: CustomerDto) => {
  blacklistingCustomer.value = customer
  blacklistReason.value = ''
  showBlacklistModal.value = true
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.fullName.trim() || !form.value.phone.trim()) return

  try {
    if (editingCustomer.value) {
      await update(editingCustomer.value.id!, {
        id: editingCustomer.value.id!,
        fullName: form.value.fullName,
        email: form.value.email || undefined,
        defaultCityId: form.value.defaultCityId || undefined,
        defaultAddress: form.value.defaultAddress || undefined
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await create({
        phone: form.value.phone,
        phoneInternational: form.value.phoneInternational || `+212${form.value.phone.substring(1)}`,
        fullName: form.value.fullName,
        email: form.value.email || undefined,
        defaultCityId: form.value.defaultCityId || undefined,
        defaultAddress: form.value.defaultAddress || undefined
      })
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle blacklist
const handleBlacklist = async () => {
  if (!blacklistingCustomer.value || !blacklistReason.value.trim()) return

  try {
    await blacklist(blacklistingCustomer.value.id!, { reason: blacklistReason.value })
    notify({ type: 'success', message: t('messages.success') })
    showBlacklistModal.value = false
    blacklistingCustomer.value = null
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle remove blacklist
const handleRemoveBlacklist = async (customer: CustomerDto) => {
  if (confirm(t('customers.confirmRemoveBlacklist'))) {
    try {
      await removeFromBlacklist(customer.id!)
      notify({ type: 'success', message: t('messages.success') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}

// Handle delete
const handleDelete = async (customer: CustomerDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await remove(customer.id!)
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}
</script>
