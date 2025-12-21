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
                  {{ editingTrackingState ? $t('common.edit') : $t('common.create') }} {{ $t('nav.trackingStates') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <div class="mb-4">
                    <label class="label">{{ $t('trackingStates.state') }} *</label>
                    <input
                      v-model="form.state"
                      type="text"
                      class="input"
                      required
                      maxlength="100"
                      :placeholder="$t('trackingStates.state')"
                    />
                  </div>

                  <div class="mb-4">
                    <label class="label">{{ $t('trackingStates.color') }} *</label>
                    <div class="flex gap-3">
                      <input
                        v-model="form.color"
                        type="color"
                        class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <input
                        v-model="form.color"
                        type="text"
                        class="input flex-1"
                        required
                        maxlength="20"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="label">{{ $t('trackingStates.phases') }} *</label>
                    <select v-model="form.phases" class="input" required>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>

                  <div class="mb-4">
                    <label class="label">{{ $t('trackingStates.groupStates') }}</label>
                    <input
                      v-model="form.groupStates"
                      type="text"
                      class="input"
                      maxlength="200"
                      :placeholder="$t('trackingStates.groupStates')"
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.trackingStates') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.trackingStates') }}</p>
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

      <div v-else-if="trackingStates.length === 0" class="text-center py-12">
        <ArrowPathIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('trackingStates.state') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('trackingStates.color') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('trackingStates.phases') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="trackingState in trackingStates" :key="trackingState.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="font-medium text-gray-900 dark:text-white">{{ trackingState.state }}</span>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <span
                    class="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600"
                    :style="{ backgroundColor: trackingState.color }"
                  ></span>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ trackingState.color }}</span>
                </div>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {{ trackingState.phases }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(trackingState)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(trackingState)"
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
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { useTrackingStatesService, type TrackingStateDto } from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.TrackingStates.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Service provides all CRUD operations with caching
const {
  items: trackingStates,
  pagination,
  isLoading,
  isMutating,
  setPage,
  setKeyword,
  create,
  update,
  remove,
} = useTrackingStatesService()

// Local UI state
const searchKeyword = ref('')
const showModal = ref(false)
const editingTrackingState = ref<TrackingStateDto | null>(null)
const form = ref({
  state: '',
  color: '#3498db',
  phases: 'Pending',
  groupStates: ''
})

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => setKeyword(searchKeyword.value), 300)
}

// Modal handlers
const openCreateModal = () => {
  editingTrackingState.value = null
  form.value = {
    state: '',
    color: '#3498db',
    phases: 'Pending',
    groupStates: ''
  }
  showModal.value = true
}

const openEditModal = (trackingState: TrackingStateDto) => {
  editingTrackingState.value = trackingState
  form.value = {
    state: trackingState.state || '',
    color: trackingState.color || '#3498db',
    phases: trackingState.phases || 'Pending',
    groupStates: trackingState.groupStates || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTrackingState.value = null
  form.value = {
    state: '',
    color: '#3498db',
    phases: 'Pending',
    groupStates: ''
  }
}

// CRUD handlers - simplified with service
const handleSubmit = async () => {
  if (!form.value.state.trim() || !form.value.color.trim() || !form.value.phases) return

  try {
    const data = {
      state: form.value.state,
      color: form.value.color,
      phases: form.value.phases,
      groupStates: form.value.groupStates || undefined
    }

    if (editingTrackingState.value) {
      await update(editingTrackingState.value.id!, {
        id: editingTrackingState.value.id!,
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

const handleDelete = async (trackingState: TrackingStateDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await remove(trackingState.id!)
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}
</script>
