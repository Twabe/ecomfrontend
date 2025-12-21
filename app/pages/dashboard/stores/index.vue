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
                  {{ editingStore ? $t('common.edit') : $t('common.create') }} {{ $t('nav.stores') }}
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
                        />
                      </div>

                      <div class="col-span-2 sm:col-span-1">
                        <label class="label">{{ $t('stores.type') }} *</label>
                        <select v-model="form.type" class="input">
                          <option v-for="(label, value) in StoreTypeLabels" :key="value" :value="Number(value)">
                            {{ label }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label class="label">{{ $t('stores.storeUrl') }}</label>
                      <input
                        v-model="form.storeUrl"
                        type="url"
                        class="input"
                        placeholder="https://mystore.com"
                      />
                    </div>

                    <div>
                      <label class="label">{{ $t('stores.externalStoreId') }}</label>
                      <input
                        v-model="form.externalStoreId"
                        type="text"
                        class="input"
                        :placeholder="$t('stores.externalStoreIdPlaceholder')"
                      />
                    </div>

                    <div class="flex items-center gap-2">
                      <input
                        v-model="form.isActive"
                        type="checkbox"
                        id="isActive"
                        class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label for="isActive" class="text-sm text-gray-700 dark:text-gray-300">
                        {{ $t('stores.isActive') }}
                      </label>
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.stores') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.stores') }}</p>
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

      <div v-else-if="stores.length === 0" class="text-center py-12">
        <BuildingStorefrontIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.name') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('stores.type') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('stores.storeUrl') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.status') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="store in stores" :key="store.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="font-medium text-gray-900 dark:text-white">{{ store.name }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {{ StoreTypeLabels[store.type] || 'Generic' }}
                </span>
              </td>
              <td class="py-3 px-4">
                <a v-if="store.storeUrl" :href="store.storeUrl" target="_blank" class="text-primary-600 hover:underline text-sm">
                  {{ store.storeUrl }}
                </a>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    store.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  ]"
                >
                  {{ store.isActive ? $t('common.active') : $t('common.inactive') }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(store)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(store)"
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
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, BuildingStorefrontIcon } from '@heroicons/vue/24/outline'
import { useStoresService, type StoreDto } from '~/services'
import { StoreType, StoreTypeLabels } from '~/types/store'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Stores.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Stores service provides all CRUD operations with caching
const {
  items: stores,
  pagination,
  isLoading,
  isMutating,
  setPage,
  setKeyword,
  create,
  update,
  remove,
} = useStoresService()

// Modal state
const showModal = ref(false)
const editingStore = ref<StoreDto | null>(null)

const defaultForm = () => ({
  name: '',
  type: StoreType.Generic,
  storeUrl: '',
  externalStoreId: '',
  isActive: true
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
  editingStore.value = null
  form.value = defaultForm()
  showModal.value = true
}

// Open edit modal
const openEditModal = (store: StoreDto) => {
  editingStore.value = store
  form.value = {
    name: store.name || '',
    type: store.type ?? StoreType.Generic,
    storeUrl: store.storeUrl || '',
    externalStoreId: store.externalStoreId || '',
    isActive: store.isActive ?? true
  }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingStore.value = null
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.name.trim()) return

  try {
    const data = {
      name: form.value.name,
      type: form.value.type,
      storeUrl: form.value.storeUrl || undefined,
      externalStoreId: form.value.externalStoreId || undefined,
      isActive: form.value.isActive
    }

    if (editingStore.value) {
      await update(editingStore.value.id!, {
        id: editingStore.value.id!,
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
const handleDelete = async (store: StoreDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await remove(store.id!)
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}
</script>
