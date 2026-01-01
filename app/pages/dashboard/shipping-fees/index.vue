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
                  {{ editingShippingFee ? $t('common.edit') : $t('common.create') }} {{ $t('nav.shippingFees') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="label">{{ $t('nav.deliveryCompanies') }} *</label>
                        <select v-model="form.deliveryCompanyId" class="input" required>
                          <option value="">{{ $t('common.select') }}...</option>
                          <option v-for="company in deliveryCompaniesList" :key="company.id" :value="company.id">
                            {{ company.name }}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label class="label">{{ $t('nav.cities') }} *</label>
                        <UiSearchableSelect
                          v-model="form.cityId"
                          :options="citiesList"
                          :placeholder="$t('orders.searchCity', 'Rechercher une ville...')"
                          :required="true"
                        />
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="label">{{ $t('shippingFees.deliveredFees') }} *</label>
                        <input
                          v-model.number="form.deliveredFees"
                          type="number"
                          class="input"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label class="label">{{ $t('shippingFees.canceledFees') }} *</label>
                        <input
                          v-model.number="form.canceledFees"
                          type="number"
                          class="input"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label class="label">{{ $t('shippingFees.refusedFees') }} *</label>
                        <input
                          v-model.number="form.refusedFees"
                          type="number"
                          class="input"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label class="label">{{ $t('shippingFees.changedFees') }} *</label>
                        <input
                          v-model.number="form.changedFees"
                          type="number"
                          class="input"
                          required
                          min="0"
                          step="0.01"
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.shippingFees') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.shippingFees') }}</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        {{ $t('common.create') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div>
          <select v-model="filterDeliveryCompanyId" class="input" @change="handleFilterChange">
            <option value="">{{ $t('common.all') }} {{ $t('nav.deliveryCompanies') }}</option>
            <option v-for="company in deliveryCompaniesList" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </div>
        <div class="min-w-[200px]">
          <UiSearchableSelect
            v-model="filterCityId"
            :options="citiesList"
            :placeholder="$t('common.all') + ' ' + $t('nav.cities')"
            @update:model-value="handleFilterChange"
          />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-3 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="shippingFees.length === 0" class="text-center py-12">
        <CurrencyDollarIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('nav.cities') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('nav.deliveryCompanies') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('shippingFees.deliveredFees') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('shippingFees.canceledFees') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('shippingFees.refusedFees') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('shippingFees.changedFees') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="fee in shippingFees" :key="fee.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="font-medium text-gray-900 dark:text-white">{{ fee.cityName }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {{ fee.deliveryCompanyName }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="text-green-600 dark:text-green-400 font-medium">{{ formatPrice(fee.deliveredFees) }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="text-red-600 dark:text-red-400">{{ formatPrice(fee.canceledFees) }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="text-orange-600 dark:text-orange-400">{{ formatPrice(fee.refusedFees) }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <span class="text-yellow-600 dark:text-yellow-400">{{ formatPrice(fee.changedFees) }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(fee)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(fee)"
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
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'
import { useShippingFeesService, useDeliveryCompaniesService, useCitiesService, type ShippingFeeDto } from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.ShippingFees.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Shipping fees service
const {
  items: shippingFees,
  pagination,
  isLoading,
  isMutating,
  setPage,
  setKeyword,
  setFilters,
  create,
  update,
  remove,
} = useShippingFeesService()

// Delivery companies and cities for dropdowns (using services which auto-fetch, large page size for dropdown)
const { items: deliveryCompaniesList } = useDeliveryCompaniesService({ initialParams: { pageSize: 100, pageNumber: 1 } })
const { items: citiesList } = useCitiesService({ initialParams: { pageSize: 1000, pageNumber: 1 } })

// Modal state
const showModal = ref(false)
const editingShippingFee = ref<ShippingFeeDto | null>(null)
const form = ref({
  deliveryCompanyId: '',
  cityId: '',
  deliveredFees: 0,
  canceledFees: 0,
  refusedFees: 0,
  changedFees: 0
})

// Search & Filters
const searchKeyword = ref('')
const filterDeliveryCompanyId = ref('')
const filterCityId = ref('')

// Format price
const formatPrice = (price?: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(price || 0)
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => setKeyword(searchKeyword.value), 300)
}

// Handle filter change
const handleFilterChange = () => {
  setFilters({
    deliveryCompanyId: filterDeliveryCompanyId.value || undefined,
    cityId: filterCityId.value || undefined
  })
}

// Open create modal
const openCreateModal = () => {
  editingShippingFee.value = null
  form.value = {
    deliveryCompanyId: '',
    cityId: '',
    deliveredFees: 0,
    canceledFees: 0,
    refusedFees: 0,
    changedFees: 0
  }
  showModal.value = true
}

// Open edit modal
const openEditModal = (fee: ShippingFeeDto) => {
  editingShippingFee.value = fee
  form.value = {
    deliveryCompanyId: fee.deliveryCompanyId || '',
    cityId: fee.cityId || '',
    deliveredFees: fee.deliveredFees || 0,
    canceledFees: fee.canceledFees || 0,
    refusedFees: fee.refusedFees || 0,
    changedFees: fee.changedFees || 0
  }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingShippingFee.value = null
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.deliveryCompanyId || !form.value.cityId) return

  try {
    const data = {
      deliveryCompanyId: form.value.deliveryCompanyId,
      cityId: form.value.cityId,
      deliveredFees: form.value.deliveredFees,
      canceledFees: form.value.canceledFees,
      refusedFees: form.value.refusedFees,
      changedFees: form.value.changedFees
    }

    if (editingShippingFee.value) {
      await update(editingShippingFee.value.id!, {
        id: editingShippingFee.value.id!,
        ...data
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await create(data)
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle delete
const handleDelete = async (fee: ShippingFeeDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await remove(fee.id!)
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}
</script>
