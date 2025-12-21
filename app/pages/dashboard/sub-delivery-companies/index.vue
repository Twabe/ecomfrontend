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
                  {{ editingSubDeliveryCompany ? $t('common.edit') : $t('common.create') }} {{ $t('nav.subDeliveryCompanies') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="col-span-2 sm:col-span-1">
                        <label class="label">{{ $t('common.name') }} *</label>
                        <input
                          v-model="form.name"
                          type="text"
                          class="input"
                          required
                          maxlength="200"
                          :placeholder="$t('common.name')"
                        />
                      </div>

                      <div class="col-span-2 sm:col-span-1">
                        <label class="label">{{ $t('nav.deliveryCompanies') }} *</label>
                        <select v-model="form.deliveryCompanyId" class="input" required>
                          <option value="">{{ $t('common.select') }}...</option>
                          <option v-for="company in deliveryCompaniesList" :key="company.id" :value="company.id">
                            {{ company.name }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label class="label">{{ $t('subDeliveryCompanies.contactPerson') }}</label>
                      <input
                        v-model="form.contactPerson"
                        type="text"
                        class="input"
                        maxlength="100"
                        :placeholder="$t('subDeliveryCompanies.contactPersonPlaceholder')"
                      />
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.subDeliveryCompanies') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.subDeliveryCompanies') }}</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        {{ $t('common.create') }}
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-3 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="subDeliveryCompanies.length === 0" class="text-center py-12">
        <TruckIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.name') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('nav.deliveryCompanies') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('subDeliveryCompanies.contactPerson') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.phone') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="subCompany in subDeliveryCompanies" :key="subCompany.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="font-medium text-gray-900 dark:text-white">{{ subCompany.name }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {{ subCompany.deliveryCompanyName }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-700 dark:text-gray-300">{{ subCompany.contactPerson || '-' }}</span>
              </td>
              <td class="py-3 px-4">
                <div class="text-sm">
                  <a v-if="subCompany.phone" :href="'tel:' + subCompany.phone" class="text-gray-700 dark:text-gray-300 hover:text-primary-600">
                    {{ subCompany.phone }}
                  </a>
                  <span v-else class="text-gray-400">-</span>
                </div>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(subCompany)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(subCompany)"
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
import { useSubDeliveryCompaniesService, useDeliveryCompaniesService, type SubDeliveryCompanyDto } from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.SubDeliveryCompanies.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Sub delivery companies service
const {
  items: subDeliveryCompanies,
  pagination,
  isLoading,
  isMutating,
  setPage,
  setKeyword,
  setFilters,
  create,
  update,
  remove,
} = useSubDeliveryCompaniesService()

// Delivery companies for dropdown (using service's items which auto-fetch)
const { items: deliveryCompaniesList } = useDeliveryCompaniesService()

// Modal state
const showModal = ref(false)
const editingSubDeliveryCompany = ref<SubDeliveryCompanyDto | null>(null)
const defaultForm = () => ({
  name: '',
  deliveryCompanyId: '',
  phone: '',
  whatsAppPhone: '',
  email: '',
  address: '',
  contactPerson: ''
})
const form = ref(defaultForm())

// Search & Filter
const searchKeyword = ref('')
const filterDeliveryCompanyId = ref('')

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    setKeyword(searchKeyword.value)
  }, 300)
}

// Handle filter change
const handleFilterChange = () => {
  setFilters({
    deliveryCompanyId: filterDeliveryCompanyId.value || undefined
  })
}

// Open create modal
const openCreateModal = () => {
  editingSubDeliveryCompany.value = null
  form.value = defaultForm()
  showModal.value = true
}

// Open edit modal
const openEditModal = (subCompany: SubDeliveryCompanyDto) => {
  editingSubDeliveryCompany.value = subCompany
  form.value = {
    name: subCompany.name || '',
    deliveryCompanyId: subCompany.deliveryCompanyId || '',
    phone: subCompany.phone || '',
    whatsAppPhone: subCompany.whatsAppPhone || '',
    email: subCompany.email || '',
    address: subCompany.address || '',
    contactPerson: subCompany.contactPerson || ''
  }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingSubDeliveryCompany.value = null
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.name.trim() || !form.value.deliveryCompanyId) return

  try {
    const data = {
      name: form.value.name,
      deliveryCompanyId: form.value.deliveryCompanyId,
      phone: form.value.phone || undefined,
      whatsAppPhone: form.value.whatsAppPhone || undefined,
      email: form.value.email || undefined,
      address: form.value.address || undefined,
      contactPerson: form.value.contactPerson || undefined
    }

    if (editingSubDeliveryCompany.value) {
      await update(editingSubDeliveryCompany.value.id!, {
        id: editingSubDeliveryCompany.value.id!,
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
const handleDelete = async (subCompany: SubDeliveryCompanyDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await remove(subCompany.id!)
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}
</script>
