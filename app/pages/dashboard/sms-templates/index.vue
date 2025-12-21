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
                  {{ editingTemplate ? $t('common.edit') : $t('common.create') }} {{ $t('nav.smsTemplates') }}
                </DialogTitle>

                <form @submit.prevent="handleSubmit">
                  <!-- Content -->
                  <div class="mb-4">
                    <label class="label">{{ $t('common.content') }} *</label>
                    <textarea
                      v-model="form.content"
                      class="input min-h-[120px]"
                      required
                      maxlength="500"
                      :placeholder="$t('smsTemplates.contentPlaceholder')"
                    />
                    <p class="text-xs text-gray-500 mt-1">{{ form.content.length }}/500</p>
                  </div>

                  <!-- State -->
                  <div class="mb-4">
                    <label class="label">{{ $t('smsTemplates.state') }}</label>
                    <select v-model="form.state" class="input">
                      <option :value="null">{{ $t('common.select') }}...</option>
                      <option v-for="state in trackingStates" :key="state.id" :value="state.state">
                        {{ state.state }}
                      </option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">{{ $t('smsTemplates.stateHelp') }}</p>
                  </div>

                  <!-- Phase -->
                  <div class="mb-4">
                    <label class="label">{{ $t('smsTemplates.phase') }}</label>
                    <select v-model="form.phase" class="input">
                      <option :value="null">{{ $t('common.select') }}...</option>
                      <option value="Confirmation">Confirmation</option>
                      <option value="Preparation">Preparation</option>
                      <option value="Expedition">Expedition</option>
                      <option value="Livraison">Livraison</option>
                      <option value="Retour">Retour</option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">{{ $t('smsTemplates.phaseHelp') }}</p>
                  </div>

                  <!-- Is Active -->
                  <div class="mb-4">
                    <label class="flex items-center gap-3 cursor-pointer">
                      <input
                        v-model="form.isActive"
                        type="checkbox"
                        class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span class="text-gray-700 dark:text-gray-300">{{ $t('common.active') }}</span>
                    </label>
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('nav.smsTemplates') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagination.totalCount }} {{ $t('nav.smsTemplates') }}</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        {{ $t('common.create') }}
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <select v-model="filterState" class="input" @change="applyFilters">
          <option :value="null">{{ $t('smsTemplates.allStates') }}</option>
          <option v-for="state in trackingStates" :key="state.id" :value="state.state">
            {{ state.state }}
          </option>
        </select>
        <select v-model="filterPhase" class="input" @change="applyFilters">
          <option :value="null">{{ $t('smsTemplates.allPhases') }}</option>
          <option value="Confirmation">Confirmation</option>
          <option value="Preparation">Preparation</option>
          <option value="Expedition">Expedition</option>
          <option value="Livraison">Livraison</option>
          <option value="Retour">Retour</option>
        </select>
        <select v-model="filterActive" class="input" @change="applyFilters">
          <option :value="null">{{ $t('common.all') }}</option>
          <option :value="true">{{ $t('common.active') }}</option>
          <option :value="false">{{ $t('common.inactive') }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-3 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="smsTemplates.length === 0" class="text-center py-12">
        <ChatBubbleLeftRightIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('common.noData') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.content') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('smsTemplates.state') }}</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('smsTemplates.phase') }}</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.status') }}</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="template in smsTemplates" :key="template.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-3 px-4">
                <span class="text-gray-900 dark:text-white text-sm line-clamp-2">{{ template.content }}</span>
              </td>
              <td class="py-3 px-4">
                <span v-if="template.state" class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                  {{ template.state }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="py-3 px-4">
                <span v-if="template.phase" class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                  {{ template.phase }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded',
                    template.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  ]"
                >
                  {{ template.isActive ? $t('common.active') : $t('common.inactive') }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <!-- Toggle Active -->
                  <button
                    v-if="template.isActive"
                    @click="handleDeactivate(template)"
                    class="p-2 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                    :title="$t('common.deactivate')"
                  >
                    <PauseIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-else
                    @click="handleActivate(template)"
                    class="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                    :title="$t('common.activate')"
                  >
                    <PlayIcon class="w-4 h-4" />
                  </button>
                  <!-- Edit -->
                  <button
                    @click="openEditModal(template)"
                    class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    :title="$t('common.edit')"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <!-- Delete -->
                  <button
                    @click="handleDelete(template)"
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
            @click="changePage(pagination.currentPage - 1)"
            :disabled="!pagination.hasPreviousPage"
            class="btn-secondary text-sm px-3 py-1"
          >
            {{ $t('common.previous') }}
          </button>
          <button
            @click="changePage(pagination.currentPage + 1)"
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
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/vue/24/outline'
import {
  useSmsTemplatesService,
  useTrackingStatesService,
  type SmsTemplateDto
} from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.SmsTemplates.View'
})

const { t } = useI18n()
const { notify } = useNotification()

const {
  items: smsTemplates,
  isLoading,
  isMutating,
  pagination,
  setPage,
  setKeyword,
  setFilters,
  create: createSmsTemplate,
  update: updateSmsTemplate,
  remove: deleteSmsTemplate,
  activate: activateSmsTemplate,
  deactivate: deactivateSmsTemplate
} = useSmsTemplatesService()

// Get tracking states for dropdown (auto-fetch)
const { items: trackingStates } = useTrackingStatesService()

// Modal state
const showModal = ref(false)
const editingTemplate = ref<SmsTemplateDto | null>(null)
const form = ref({
  content: '',
  state: null as string | null,
  phase: null as string | null,
  isActive: true
})

// Search & Filters
const searchKeyword = ref('')
const filterState = ref<string | null>(null)
const filterPhase = ref<string | null>(null)
const filterActive = ref<boolean | null>(null)

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 300)
}

// Apply filters
const applyFilters = () => {
  setFilters({
    state: filterState.value || undefined,
    phase: filterPhase.value || undefined,
    isActive: filterActive.value ?? undefined
  })
  setKeyword(searchKeyword.value)
}

// Open create modal
const openCreateModal = () => {
  editingTemplate.value = null
  form.value = {
    content: '',
    state: null,
    phase: null,
    isActive: true
  }
  showModal.value = true
}

// Open edit modal
const openEditModal = (template: SmsTemplateDto) => {
  editingTemplate.value = template
  form.value = {
    content: template.content,
    state: template.state,
    phase: template.phase,
    isActive: template.isActive
  }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  editingTemplate.value = null
  form.value = {
    content: '',
    state: null,
    phase: null,
    isActive: true
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!form.value.content.trim()) return

  try {
    if (editingTemplate.value) {
      await updateSmsTemplate(editingTemplate.value.id!, {
        id: editingTemplate.value.id!,
        content: form.value.content,
        state: form.value.state || undefined,
        phase: form.value.phase || undefined,
        isActive: form.value.isActive
      })
      notify({ type: 'success', message: t('messages.updateSuccess') })
    } else {
      await createSmsTemplate({
        content: form.value.content,
        state: form.value.state || undefined,
        phase: form.value.phase || undefined,
        isActive: form.value.isActive
      })
      notify({ type: 'success', message: t('messages.createSuccess') })
    }
    closeModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle delete
const handleDelete = async (template: SmsTemplateDto) => {
  if (confirm(t('messages.confirmDelete'))) {
    try {
      await deleteSmsTemplate(template.id!)
      notify({ type: 'success', message: t('messages.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('messages.error') })
    }
  }
}

// Handle activate
const handleActivate = async (template: SmsTemplateDto) => {
  try {
    await activateSmsTemplate(template.id!)
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Handle deactivate
const handleDeactivate = async (template: SmsTemplateDto) => {
  try {
    await deactivateSmsTemplate(template.id!)
    notify({ type: 'success', message: t('messages.updateSuccess') })
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Change page
const changePage = (page: number) => {
  setPage(page)
}
</script>
