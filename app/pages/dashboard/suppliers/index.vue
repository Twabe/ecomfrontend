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
                  {{ editingSupplier ? $t('common.edit') : $t('common.create') }} {{ $t('nav.suppliers') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="md:col-span-2">
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

                    <div>
                      <label class="label">{{ $t('suppliers.contactPerson') }}</label>
                      <input
                        v-model="form.contactPerson"
                        type="text"
                        class="input"
                        maxlength="100"
                        :placeholder="$t('suppliers.contactPerson')"
                      />
                    </div>

                    <div>
                      <label class="label">{{ $t('common.email') }}</label>
                      <input
                        v-model="form.email"
                        type="email"
                        class="input"
                        maxlength="100"
                        :placeholder="$t('common.email')"
                      />
                    </div>

                    <div>
                      <label class="label">{{ $t('common.phone') }}</label>
                      <input
                        v-model="form.phone"
                        type="tel"
                        class="input"
                        maxlength="20"
                        :placeholder="$t('common.phone')"
                      />
                    </div>

                    <div>
                      <label class="label">{{ $t('common.status') }}</label>
                      <select v-model="form.isActive" class="input">
                        <option :value="true">{{ $t('common.active') }}</option>
                        <option :value="false">{{ $t('common.inactive') }}</option>
                      </select>
                    </div>

                    <div class="md:col-span-2">
                      <label class="label">{{ $t('common.address') }}</label>
                      <input
                        v-model="form.address"
                        type="text"
                        class="input"
                        maxlength="500"
                        :placeholder="$t('common.address')"
                      />
                    </div>

                    <div class="md:col-span-2">
                      <label class="label">{{ $t('common.note') }}</label>
                      <textarea
                        v-model="form.note"
                        class="input"
                        rows="3"
                        maxlength="1000"
                        :placeholder="$t('common.note')"
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.suppliers') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.suppliers') }}</p>
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

      <div v-else-if="suppliers.length === 0" class="text-center py-12">
        <TruckIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.name') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('suppliers.contactPerson') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.phone') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.status') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="supplier in suppliers" :key="supplier.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <div>
                  <span class="font-medium text-gray-900 dark:text-white">{{ supplier.name }}</span>
                  <p v-if="supplier.email" class="text-sm text-gray-500 dark:text-gray-400">{{ supplier.email }}</p>
                </div>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-700 dark:text-gray-300">{{ supplier.contactPerson || '-' }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-700 dark:text-gray-300">{{ supplier.phone || '-' }}</span>
              </td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="supplier.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                >
                  {{ supplier.isActive ? $t('common.active') : $t('common.inactive') }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(supplier)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(supplier)"
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
import { useSuppliersService, type SupplierDto } from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Suppliers.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Service provides all CRUD operations with caching
const {
  items: suppliers,
  pagination,
  isLoading,
  isMutating,
  setPage,
  setKeyword,
  create,
  update,
  remove,
} = useSuppliersService()

// Local UI state
const searchKeyword = ref('')
const showModal = ref(false)
const editingSupplier = ref<SupplierDto | null>(null)
const form = ref({
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  note: '',
  isActive: true
})

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => setKeyword(searchKeyword.value), 300)
}

// Modal handlers
const openCreateModal = () => {
  editingSupplier.value = null
  form.value = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    note: '',
    isActive: true
  }
  showModal.value = true
}

const openEditModal = (supplier: SupplierDto) => {
  editingSupplier.value = supplier
  form.value = {
    name: supplier.name || '',
    contactPerson: supplier.contactPerson || '',
    email: supplier.email || '',
    phone: supplier.phone || '',
    address: supplier.address || '',
    note: supplier.note || '',
    isActive: supplier.isActive ?? true
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingSupplier.value = null
  form.value = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    note: '',
    isActive: true
  }
}

// CRUD handlers - simplified with service
const handleSubmit = async () => {
  if (!form.value.name.trim()) return

  try {
    const data = {
      name: form.value.name,
      contactPerson: form.value.contactPerson || undefined,
      email: form.value.email || undefined,
      phone: form.value.phone || undefined,
      address: form.value.address || undefined,
      note: form.value.note || undefined,
      isActive: form.value.isActive
    }

    if (editingSupplier.value) {
      await update(editingSupplier.value.id!, {
        id: editingSupplier.value.id!,
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

const handleDelete = async (supplier: SupplierDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await remove(supplier.id!)
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}
</script>
