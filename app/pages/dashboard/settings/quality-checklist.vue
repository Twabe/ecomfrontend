<script setup lang="ts">
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { useQualityChecklistItemsService, type QualityChecklistItemDto, type CreateQualityChecklistItemRequest, type UpdateQualityChecklistItemRequest } from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.QualityChecklistItems.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Service
const {
  items: checklistItems,
  isLoading,
  isMutating,
  create,
  update,
  remove,
} = useQualityChecklistItemsService()

// Modal state
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const selectedItem = ref<QualityChecklistItemDto | null>(null)
const isEditMode = ref(false)

// Form data
const formData = ref<CreateQualityChecklistItemRequest>({
  key: '',
  labelAr: '',
  labelFr: '',
  isRequired: true,
  displayOrder: 0,
  isActive: true,
})

// Open create modal
const openCreateModal = () => {
  selectedItem.value = null
  isEditMode.value = false
  formData.value = {
    key: '',
    labelAr: '',
    labelFr: '',
    isRequired: true,
    displayOrder: checklistItems.value.length, // Auto-set display order
    isActive: true,
  }
  showFormModal.value = true
}

// Open edit modal
const openEditModal = (item: QualityChecklistItemDto) => {
  selectedItem.value = item
  isEditMode.value = true
  formData.value = {
    key: item.key,
    labelAr: item.labelAr,
    labelFr: item.labelFr,
    isRequired: item.isRequired,
    displayOrder: item.displayOrder,
    isActive: item.isActive,
  }
  showFormModal.value = true
}

// Open delete modal
const openDeleteModal = (item: QualityChecklistItemDto) => {
  selectedItem.value = item
  showDeleteModal.value = true
}

// Handle create/update
const handleSubmit = async () => {
  try {
    if (isEditMode.value && selectedItem.value) {
      await update(selectedItem.value.id, formData.value as UpdateQualityChecklistItemRequest)
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await create(formData.value)
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    showFormModal.value = false
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle delete
const handleDelete = async () => {
  if (!selectedItem.value) return
  try {
    await remove(selectedItem.value.id)
    showDeleteModal.value = false
    selectedItem.value = null
    notify({ type: 'success', message: t('messages.deleteSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Toggle item active status
const toggleActive = async (item: QualityChecklistItemDto) => {
  try {
    await update(item.id, { id: item.id, isActive: !item.isActive } as UpdateQualityChecklistItemRequest)
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('settings.qualityChecklist') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ $t('settings.qualityChecklistDescription') }}</p>
      </div>
      <button
        class="btn-primary mt-4 sm:mt-0 inline-flex items-center gap-2"
        @click="openCreateModal"
      >
        <PlusIcon class="w-5 h-5" />
        {{ $t('settings.addChecklistItem') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="card p-8 text-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
      <p class="text-gray-500 dark:text-gray-400 mt-4">{{ $t('common.loading') }}...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="checklistItems.length === 0" class="card p-8 text-center">
      <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircleIcon class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">{{ $t('settings.noChecklistItems') }}</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">{{ $t('settings.noChecklistItemsDescription') }}</p>
      <button class="btn-primary" @click="openCreateModal">
        {{ $t('settings.addChecklistItem') }}
      </button>
    </div>

    <!-- Checklist Items List -->
    <div v-else class="card divide-y divide-gray-200 dark:divide-gray-700">
      <div
        v-for="(item, index) in checklistItems"
        :key="item.id"
        class="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <!-- Order Number -->
        <div class="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ index + 1 }}</span>
        </div>

        <!-- Item Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-mono text-sm text-gray-500 dark:text-gray-400">{{ item.key }}</span>
            <span
              v-if="item.isRequired"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            >
              {{ $t('settings.required') }}
            </span>
            <span
              v-if="!item.isActive"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            >
              {{ $t('common.inactive') }}
            </span>
          </div>
          <div class="mt-1 flex flex-col sm:flex-row sm:gap-4">
            <p class="text-sm text-gray-900 dark:text-white" dir="rtl">{{ item.labelAr }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.labelFr }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex-shrink-0 flex items-center gap-2">
          <!-- Toggle Active -->
          <button
            :class="[
              'p-2 rounded-full transition-colors',
              item.isActive
                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
            :title="item.isActive ? $t('common.deactivate') : $t('common.activate')"
            @click="toggleActive(item)"
          >
            <CheckCircleIcon v-if="item.isActive" class="w-5 h-5" />
            <XCircleIcon v-else class="w-5 h-5" />
          </button>

          <!-- Edit -->
          <button
            class="p-2 rounded-full text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
            :title="$t('common.edit')"
            @click="openEditModal(item)"
          >
            <PencilIcon class="w-5 h-5" />
          </button>

          <!-- Delete -->
          <button
            class="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            :title="$t('common.delete')"
            @click="openDeleteModal(item)"
          >
            <TrashIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <TransitionRoot :show="showFormModal" as="template">
      <Dialog as="div" class="relative z-50" @close="showFormModal = false">
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
                  {{ isEditMode ? $t('settings.editChecklistItem') : $t('settings.addChecklistItem') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                  <!-- Key -->
                  <div>
                    <label class="label">{{ $t('settings.checklistItemKey') }} *</label>
                    <input
                      v-model="formData.key"
                      type="text"
                      class="input"
                      placeholder="e.g., name_verified"
                      pattern="^[a-z0-9_]+$"
                      :disabled="isEditMode"
                      required
                    />
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ $t('settings.keyHint') }}</p>
                  </div>

                  <!-- Arabic Label -->
                  <div>
                    <label class="label">{{ $t('settings.checklistItemLabelAr') }} *</label>
                    <input
                      v-model="formData.labelAr"
                      type="text"
                      class="input"
                      dir="rtl"
                      placeholder="e.g., التحقق من الاسم"
                      required
                    />
                  </div>

                  <!-- French Label -->
                  <div>
                    <label class="label">{{ $t('settings.checklistItemLabelFr') }} *</label>
                    <input
                      v-model="formData.labelFr"
                      type="text"
                      class="input"
                      placeholder="e.g., Vérifier le nom"
                      required
                    />
                  </div>

                  <!-- Display Order -->
                  <div>
                    <label class="label">{{ $t('settings.displayOrder') }}</label>
                    <input
                      v-model.number="formData.displayOrder"
                      type="number"
                      min="0"
                      class="input w-24"
                    />
                  </div>

                  <!-- Is Required Toggle -->
                  <div class="flex items-center gap-3">
                    <input
                      v-model="formData.isRequired"
                      type="checkbox"
                      class="checkbox"
                      id="isRequired"
                    />
                    <label for="isRequired" class="text-sm text-gray-700 dark:text-gray-300">
                      {{ $t('settings.isRequired') }}
                    </label>
                  </div>

                  <!-- Is Active Toggle -->
                  <div class="flex items-center gap-3">
                    <input
                      v-model="formData.isActive"
                      type="checkbox"
                      class="checkbox"
                      id="isActive"
                    />
                    <label for="isActive" class="text-sm text-gray-700 dark:text-gray-300">
                      {{ $t('common.active') }}
                    </label>
                  </div>

                  <!-- Actions -->
                  <div class="flex justify-end gap-3 pt-4">
                    <button type="button" class="btn-secondary" @click="showFormModal = false">
                      {{ $t('common.cancel') }}
                    </button>
                    <button type="submit" class="btn-primary" :disabled="isMutating">
                      {{ isEditMode ? $t('common.save') : $t('common.create') }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Delete Confirmation Modal -->
    <TransitionRoot :show="showDeleteModal" as="template">
      <Dialog as="div" class="relative z-50" @close="showDeleteModal = false">
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
              <DialogPanel class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {{ $t('common.confirmDelete') }}
                </DialogTitle>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                  {{ $t('settings.deleteChecklistItemConfirm') }}
                </p>
                <div class="flex justify-end gap-3">
                  <button class="btn-secondary" @click="showDeleteModal = false">
                    {{ $t('common.cancel') }}
                  </button>
                  <button class="btn-danger" :disabled="isMutating" @click="handleDelete">
                    {{ $t('common.delete') }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
