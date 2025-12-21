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
              <DialogPanel class="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ editingExpenseType ? $t('common.edit') : $t('common.create') }} {{ $t('nav.expenseTypes') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <div class="mb-4">
                    <label class="label">{{ $t('common.name') }} *</label>
                    <input
                      v-model="form.title"
                      type="text"
                      class="input"
                      required
                      maxlength="200"
                      :placeholder="$t('common.name')"
                    />
                  </div>

                  <div class="flex justify-end gap-3">
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.expenseTypes') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.expenseTypes') }}</p>
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

      <div v-else-if="expenseTypes.length === 0" class="text-center py-12">
        <CurrencyDollarIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.name') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="expenseType in expenseTypes" :key="expenseType.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="font-medium text-gray-900 dark:text-white">{{ expenseType.title }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(expenseType)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(expenseType)"
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
import { useExpenseTypesService, type ExpenseTypeDto } from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.ExpenseTypes.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Service provides all CRUD operations with caching
const {
  items: expenseTypes,
  pagination,
  isLoading,
  isMutating,
  setPage,
  setKeyword,
  create,
  update,
  remove,
} = useExpenseTypesService()

// Local UI state
const searchKeyword = ref('')
const showModal = ref(false)
const editingExpenseType = ref<ExpenseTypeDto | null>(null)
const form = ref({ title: '' })

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => setKeyword(searchKeyword.value), 300)
}

// Modal handlers
const openCreateModal = () => {
  editingExpenseType.value = null
  form.value = { title: '' }
  showModal.value = true
}

const openEditModal = (expenseType: ExpenseTypeDto) => {
  editingExpenseType.value = expenseType
  form.value = { title: expenseType.title || '' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingExpenseType.value = null
  form.value = { title: '' }
}

// CRUD handlers - simplified with service
const handleSubmit = async () => {
  if (!form.value.title.trim()) return

  try {
    if (editingExpenseType.value) {
      await update(editingExpenseType.value.id!, {
        id: editingExpenseType.value.id!,
        title: form.value.title
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await create({
        title: form.value.title
      })
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleDelete = async (expenseType: ExpenseTypeDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await remove(expenseType.id!)
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}
</script>
