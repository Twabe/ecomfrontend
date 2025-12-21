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
              <DialogPanel class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ editingDeliveryCompany ? $t('common.edit') : $t('common.create') }} {{ $t('nav.deliveryCompanies') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <!-- Tabs -->
                  <div class="border-b dark:border-gray-700 mb-4">
                    <nav class="flex gap-4">
                      <button
                        type="button"
                        @click="activeTab = 'basic'"
                        :class="[
                          'py-2 px-1 text-sm font-medium border-b-2 -mb-px',
                          activeTab === 'basic'
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        ]"
                      >
                        {{ $t('deliveryCompanies.basicInfo') }}
                      </button>
                      <button
                        type="button"
                        @click="activeTab = 'credentials'"
                        :class="[
                          'py-2 px-1 text-sm font-medium border-b-2 -mb-px',
                          activeTab === 'credentials'
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        ]"
                      >
                        {{ $t('deliveryCompanies.apiCredentials') }}
                      </button>
                      <button
                        type="button"
                        @click="activeTab = 'payment'"
                        :class="[
                          'py-2 px-1 text-sm font-medium border-b-2 -mb-px',
                          activeTab === 'payment'
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        ]"
                      >
                        {{ $t('deliveryCompanies.paymentTerms') }}
                      </button>
                    </nav>
                  </div>

                  <!-- Basic Info Tab -->
                  <div v-show="activeTab === 'basic'" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="col-span-2 sm:col-span-1">
                        <label class="label">{{ $t('common.name') }} *</label>
                        <input
                          v-model="form.name"
                          type="text"
                          class="input"
                          required
                          maxlength="200"
                        />
                      </div>

                      <div class="col-span-2 sm:col-span-1">
                        <label class="label">{{ $t('deliveryCompanies.type') }} *</label>
                        <select v-model="form.type" class="input">
                          <option v-for="(label, value) in DeliveryCompanyTypeLabels" :key="value" :value="Number(value)">
                            {{ label }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="label">{{ $t('common.phone') }}</label>
                        <input
                          v-model="form.phone"
                          type="tel"
                          class="input"
                          maxlength="50"
                          placeholder="0600000000"
                        />
                      </div>

                      <div>
                        <label class="label">{{ $t('common.whatsapp') }}</label>
                        <input
                          v-model="form.whatsAppPhone"
                          type="tel"
                          class="input"
                          maxlength="50"
                          placeholder="0600000000"
                        />
                      </div>
                    </div>

                    <div>
                      <label class="label">{{ $t('common.email') }}</label>
                      <input
                        v-model="form.email"
                        type="email"
                        class="input"
                        maxlength="100"
                      />
                    </div>

                    <div>
                      <label class="label">{{ $t('common.address') }}</label>
                      <textarea
                        v-model="form.address"
                        class="input"
                        rows="2"
                        maxlength="500"
                      ></textarea>
                    </div>
                  </div>

                  <!-- API Credentials Tab -->
                  <div v-show="activeTab === 'credentials'" class="space-y-4">
                    <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                      <p class="text-sm text-yellow-700 dark:text-yellow-400">
                        {{ $t('deliveryCompanies.credentialsNote') }}
                      </p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="label">{{ $t('deliveryCompanies.customerId') }}</label>
                        <input
                          v-model="form.customerId"
                          type="text"
                          class="input"
                          :placeholder="$t('deliveryCompanies.customerIdPlaceholder')"
                        />
                      </div>

                      <div>
                        <label class="label">{{ $t('deliveryCompanies.apiKey') }}</label>
                        <input
                          v-model="form.apiKey"
                          type="password"
                          class="input"
                          :placeholder="$t('deliveryCompanies.apiKeyPlaceholder')"
                        />
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="label">{{ $t('deliveryCompanies.bearerToken') }}</label>
                        <input
                          v-model="form.bearerToken"
                          type="password"
                          class="input"
                          :placeholder="$t('deliveryCompanies.bearerTokenPlaceholder')"
                        />
                      </div>

                      <div>
                        <label class="label">{{ $t('deliveryCompanies.baseUrl') }}</label>
                        <input
                          v-model="form.baseUrl"
                          type="url"
                          class="input"
                          placeholder="https://api.example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Payment Terms Tab -->
                  <div v-show="activeTab === 'payment'" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="label">{{ $t('deliveryCompanies.paymentTermDays') }}</label>
                        <input
                          v-model.number="form.paymentTermDays"
                          type="number"
                          class="input"
                          min="0"
                          max="90"
                        />
                      </div>

                      <div>
                        <label class="label">{{ $t('deliveryCompanies.paymentFrequency') }}</label>
                        <select v-model="form.paymentFrequency" class="input">
                          <option value="">{{ $t('common.select') }}</option>
                          <option v-for="opt in PaymentFrequencyOptions" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="label">{{ $t('deliveryCompanies.paymentDayOfWeek') }}</label>
                        <select v-model="form.paymentDayOfWeek" class="input">
                          <option :value="null">{{ $t('common.select') }}</option>
                          <option v-for="opt in DayOfWeekOptions" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label class="label">{{ $t('deliveryCompanies.paymentDayOfMonth') }}</label>
                        <input
                          v-model.number="form.paymentDayOfMonth"
                          type="number"
                          class="input"
                          min="1"
                          max="31"
                          :placeholder="$t('deliveryCompanies.dayOfMonthPlaceholder')"
                        />
                      </div>
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

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.deliveryCompanies') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.deliveryCompanies') }}</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        {{ $t('common.create') }}
      </button>
    </div>

    <!-- Search -->
    <div class="card mb-6">
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
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-3 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="deliveryCompanies.length === 0" class="text-center py-12">
        <TruckIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.name') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('deliveryCompanies.type') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.phone') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('deliveryCompanies.active') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('deliveryCompanies.paymentTermDays') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="company in deliveryCompanies" :key="company.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="font-medium text-gray-900 dark:text-white">{{ company.name }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {{ DeliveryCompanyTypeLabels[company.type] || 'Manual' }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-700 dark:text-gray-300">{{ company.phone || '-' }}</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    company.active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  ]"
                >
                  {{ company.active ? $t('common.yes') : $t('common.no') }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="text-gray-700 dark:text-gray-300">{{ company.paymentTermDays }} {{ $t('common.days') }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(company)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(company)"
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
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, TruckIcon } from '@heroicons/vue/24/outline'
import { useDeliveryCompaniesService, type DeliveryCompanyDto } from '~/services'
import { DeliveryCompanyType, DeliveryCompanyTypeLabels, PaymentFrequencyOptions, DayOfWeekOptions } from '~/types/deliverycompany'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.DeliveryCompanies.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Delivery companies service provides all CRUD operations with caching
const {
  items: deliveryCompanies,
  pagination,
  isLoading,
  isMutating,
  setPage,
  setKeyword,
  create,
  update,
  remove,
  updateCredentials,
  updatePaymentTerms,
} = useDeliveryCompaniesService()

// Modal state
const showModal = ref(false)
const activeTab = ref<'basic' | 'credentials' | 'payment'>('basic')
const editingDeliveryCompany = ref<DeliveryCompanyDto | null>(null)

const defaultForm = () => ({
  name: '',
  type: DeliveryCompanyType.Manual,
  phone: '',
  whatsAppPhone: '',
  email: '',
  address: '',
  customerId: '',
  apiKey: '',
  bearerToken: '',
  baseUrl: '',
  paymentTermDays: 15,
  paymentFrequency: '',
  paymentDayOfWeek: null as number | null,
  paymentDayOfMonth: null as number | null
})

const form = ref(defaultForm())

// Search
const searchKeyword = ref('')

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => setKeyword(searchKeyword.value), 300)
}

// Open create modal
const openCreateModal = () => {
  editingDeliveryCompany.value = null
  form.value = defaultForm()
  activeTab.value = 'basic'
  showModal.value = true
}

// Open edit modal
const openEditModal = (company: DeliveryCompanyDto) => {
  editingDeliveryCompany.value = company
  form.value = {
    name: company.name || '',
    type: company.type ?? DeliveryCompanyType.Manual,
    phone: company.phone || '',
    whatsAppPhone: company.whatsAppPhone || '',
    email: company.email || '',
    address: company.address || '',
    customerId: company.customerId || '',
    apiKey: company.apiKey || '',
    bearerToken: company.bearerToken || '',
    baseUrl: company.baseUrl || '',
    paymentTermDays: company.paymentTermDays ?? 15,
    paymentFrequency: company.paymentFrequency || '',
    paymentDayOfWeek: company.paymentDayOfWeek ?? null,
    paymentDayOfMonth: company.paymentDayOfMonth ?? null
  }
  activeTab.value = 'basic'
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingDeliveryCompany.value = null
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.name.trim()) return

  try {
    const basicData = {
      name: form.value.name,
      type: form.value.type,
      phone: form.value.phone || undefined,
      whatsAppPhone: form.value.whatsAppPhone || undefined,
      email: form.value.email || undefined,
      address: form.value.address || undefined
    }

    if (editingDeliveryCompany.value) {
      // Update basic info
      await update(editingDeliveryCompany.value.id!, {
        id: editingDeliveryCompany.value.id!,
        ...basicData
      })

      // Update credentials if any changed
      if (form.value.customerId || form.value.apiKey || form.value.bearerToken || form.value.baseUrl) {
        await updateCredentials(editingDeliveryCompany.value.id!, {
          id: editingDeliveryCompany.value.id!,
          customerId: form.value.customerId || undefined,
          apiKey: form.value.apiKey || undefined,
          bearerToken: form.value.bearerToken || undefined,
          baseUrl: form.value.baseUrl || undefined
        })
      }

      // Update payment terms
      await updatePaymentTerms(editingDeliveryCompany.value.id!, {
        id: editingDeliveryCompany.value.id!,
        paymentTermDays: form.value.paymentTermDays,
        paymentFrequency: form.value.paymentFrequency || undefined,
        paymentDayOfWeek: form.value.paymentDayOfWeek ?? undefined,
        paymentDayOfMonth: form.value.paymentDayOfMonth ?? undefined
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await create(basicData)
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle delete
const handleDelete = async (company: DeliveryCompanyDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await remove(company.id!)
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}
</script>
