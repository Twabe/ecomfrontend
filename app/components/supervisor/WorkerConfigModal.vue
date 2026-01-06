<template>
  <TransitionRoot :show="modelValue" as="template">
    <Dialog as="div" class="relative z-50" @close="emit('update:modelValue', false)">
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
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Cog6ToothIcon class="w-5 h-5 text-primary-600" />
                {{ isEdit ? $t('supervisor.editWorkerConfig') : $t('supervisor.createWorkerConfig') }}
              </DialogTitle>

              <form @submit.prevent="handleSubmit">
                <!-- User Info (read-only) -->
                <div v-if="selectedUser" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span class="text-primary-600 dark:text-primary-400 font-medium">
                        {{ getUserInitials(selectedUser) }}
                      </span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ getUserDisplayName(selectedUser) }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ selectedUser.email }}</p>
                    </div>
                  </div>
                </div>

                <!-- User selection for create mode -->
                <div v-else-if="!isEdit" class="mb-4">
                  <label class="label">{{ $t('supervisor.selectUser') }} *</label>
                  <select v-model="form.userId" class="input" required>
                    <option value="">{{ $t('common.select') }}...</option>
                    <option
                      v-for="user in availableUsers"
                      :key="user.id"
                      :value="user.id"
                    >
                      {{ getUserDisplayName(user) }} ({{ user.email }})
                    </option>
                  </select>
                </div>

                <!-- Services Section -->
                <div class="mb-4">
                  <label class="label mb-2">{{ $t('supervisor.services') }}</label>
                  <div class="space-y-2">
                    <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        v-model="form.canDoConfirmation"
                        type="checkbox"
                        class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ $t('worker.confirmation') }}
                        </span>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('supervisor.canDoConfirmationDesc') }}
                        </p>
                      </div>
                    </label>

                    <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        v-model="form.canDoSuivi"
                        type="checkbox"
                        class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ $t('worker.suivi') }}
                        </span>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('supervisor.canDoSuiviDesc') }}
                        </p>
                      </div>
                    </label>

                    <!-- Quality option only shown if EnableQualityCheck is true in settings -->
                    <label v-if="isQualityEnabled" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        v-model="form.canDoQuality"
                        type="checkbox"
                        class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ $t('worker.quality') }}
                        </span>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('supervisor.canDoQualityDesc') }}
                        </p>
                      </div>
                    </label>

                    <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        v-model="form.canDoCallback"
                        type="checkbox"
                        class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ $t('worker.callbacks') }}
                        </span>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('supervisor.canDoCallbackDesc') }}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Priority Section -->
                <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label class="label mb-3">{{ $t('supervisor.priority') }}</label>
                  <input
                    v-model.number="form.autoAssignPriority"
                    type="number"
                    min="1"
                    max="1000"
                    class="input"
                    placeholder="100"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {{ $t('supervisor.priorityHint') }}
                  </p>
                </div>

                <!-- Max Concurrent Assignments -->
                <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label class="label mb-3 flex items-center gap-2">
                    <ChartBarIcon class="w-4 h-4 text-blue-500" />
                    {{ $t('supervisor.maxConcurrentAssignments') }}
                  </label>
                  <input
                    v-model.number="form.maxConcurrentAssignments"
                    type="number"
                    min="0"
                    max="100"
                    class="input"
                    placeholder="0"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {{ $t('supervisor.maxConcurrentDescription') }}
                  </p>
                </div>

                <!-- Commission Section (only shown if canDoConfirmation is enabled) -->
                <div v-if="form.canDoConfirmation" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <label class="label mb-3 flex items-center gap-2">
                    <BanknotesIcon class="w-4 h-4 text-blue-600" />
                    {{ $t('supervisor.commission') }}
                  </label>

                  <!-- Commission Type Selection -->
                  <div class="flex gap-4 mb-3">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="form.confirmationCommissionType"
                        type="radio"
                        value="fixed"
                        class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span class="text-sm text-gray-700 dark:text-gray-300">
                        {{ $t('supervisor.fixedPerOrder') }}
                      </span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="form.confirmationCommissionType"
                        type="radio"
                        value="percentage"
                        class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span class="text-sm text-gray-700 dark:text-gray-300">
                        {{ $t('supervisor.percentage') }}
                      </span>
                    </label>
                  </div>

                  <!-- Commission Value Input -->
                  <div class="relative">
                    <input
                      v-model.number="form.confirmationCommissionValue"
                      type="number"
                      min="0"
                      :max="form.confirmationCommissionType === 'percentage' ? 100 : undefined"
                      step="0.01"
                      class="input pr-12"
                      placeholder="0"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                      {{ form.confirmationCommissionType === 'fixed' ? 'MAD' : '%' }}
                    </span>
                  </div>

                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {{ form.confirmationCommissionType === 'fixed'
                        ? $t('supervisor.fixedCommissionHint')
                        : $t('supervisor.percentageCommissionHint') }}
                  </p>
                </div>

                <!-- Product Restrictions - Searchable Multi-Select -->
                <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label class="label mb-3 flex items-center gap-2">
                    <CubeIcon class="w-4 h-4 text-orange-500" />
                    {{ $t('supervisor.restrictedProducts') }}
                  </label>

                  <!-- Selected Products Tags -->
                  <div v-if="form.restrictedProductIds.length > 0" class="flex flex-wrap gap-2 mb-3">
                    <span
                      v-for="productId in form.restrictedProductIds"
                      :key="productId"
                      class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full"
                    >
                      {{ getProductName(productId) }}
                      <button
                        type="button"
                        @click="removeProduct(productId)"
                        class="hover:text-orange-600 dark:hover:text-orange-300"
                      >
                        <XMarkIcon class="w-3 h-3" />
                      </button>
                    </span>
                    <button
                      v-if="form.restrictedProductIds.length > 0"
                      type="button"
                      @click="form.restrictedProductIds = []"
                      class="text-xs text-gray-500 hover:text-red-500"
                    >
                      {{ $t('common.clearAll') }}
                    </button>
                  </div>

                  <!-- Search Input with Dropdown -->
                  <div class="relative">
                    <div class="relative">
                      <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        v-model="productSearch"
                        type="text"
                        class="input pl-9"
                        :placeholder="$t('supervisor.searchProducts')"
                        @focus="showProductDropdown = true"
                        @blur="closeProductDropdown"
                      />
                    </div>

                    <!-- Dropdown -->
                    <div
                      v-if="showProductDropdown && filteredProducts.length > 0"
                      class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      <button
                        v-for="product in filteredProducts"
                        :key="product.id"
                        type="button"
                        class="w-full flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                        @click="toggleProduct(product.id!)"
                      >
                        <input
                          type="checkbox"
                          :checked="form.restrictedProductIds.includes(product.id!)"
                          class="w-4 h-4 rounded border-gray-300 text-primary-600 pointer-events-none"
                        />
                        <img
                          v-if="product.imagePath"
                          :src="product.imagePath"
                          :alt="product.name"
                          class="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                        <div v-else class="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <CubeIcon class="w-4 h-4 text-gray-400" />
                        </div>
                        <span class="text-sm text-gray-900 dark:text-white truncate">{{ product.name }}</span>
                      </button>
                    </div>
                  </div>

                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {{ $t('supervisor.restrictedProductsDescription') }}
                    <span class="font-medium">({{ form.restrictedProductIds.length }} {{ $t('common.selected') }})</span>
                  </p>
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    class="btn-secondary"
                    @click="emit('update:modelValue', false)"
                  >
                    {{ $t('common.cancel') }}
                  </button>
                  <button
                    type="submit"
                    class="btn-primary"
                    :disabled="isSubmitting || (!isEdit && !form.userId)"
                  >
                    <span v-if="isSubmitting" class="flex items-center gap-2">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {{ $t('common.loading') }}
                    </span>
                    <span v-else>{{ $t('common.save') }}</span>
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { Cog6ToothIcon, BanknotesIcon, CubeIcon, ChartBarIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useWorkerServiceConfigsService, useAutoAssignmentSettingsService, useProductsService, type WorkerServiceConfigDto, type CreateWorkerConfigRequest, type UpdateWorkerConfigRequest, type UserDetailsDto, type ProductDto } from '~/services'

const props = defineProps<{
  modelValue: boolean
  config?: WorkerServiceConfigDto | null
  users: UserDetailsDto[]
  configuredUserIds: string[]
  preselectedUser?: UserDetailsDto | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', config: WorkerServiceConfigDto): void
  (e: 'updated', config: WorkerServiceConfigDto): void
}>()

const workerConfigsService = useWorkerServiceConfigsService()
const autoAssignmentSettingsService = useAutoAssignmentSettingsService()
// Load all products for multi-select dropdown
const productsService = useProductsService({
  initialParams: { pageNumber: 1, pageSize: 1000 }
})

// Products list for multi-select
const productOptions = computed(() => productsService.items.value || [])

// Product search state
const productSearch = ref('')
const showProductDropdown = ref(false)

// Filtered products based on search
const filteredProducts = computed(() => {
  const search = productSearch.value.toLowerCase()
  if (!search) return productOptions.value.slice(0, 50) // Show first 50 when no search
  return productOptions.value.filter(p =>
    p.name?.toLowerCase().includes(search)
  ).slice(0, 50) // Limit to 50 results
})

// Get product name by ID
const getProductName = (productId: string) => {
  const product = productOptions.value.find(p => p.id === productId)
  return product?.name || productId.substring(0, 8) + '...'
}

// Remove product from selection
const removeProduct = (productId: string) => {
  form.value.restrictedProductIds = form.value.restrictedProductIds.filter(id => id !== productId)
}

// Toggle product selection
const toggleProduct = (productId: string) => {
  const index = form.value.restrictedProductIds.indexOf(productId)
  if (index === -1) {
    form.value.restrictedProductIds.push(productId)
  } else {
    form.value.restrictedProductIds.splice(index, 1)
  }
}

// Close dropdown with delay (to allow clicking on items)
const closeProductDropdown = () => {
  setTimeout(() => {
    showProductDropdown.value = false
  }, 200)
}

// Check if Quality is enabled in auto-assignment settings
const isQualityEnabled = computed(() => autoAssignmentSettingsService.settings.value?.enableQualityCheck ?? false)

// Helper functions for user display
const getUserDisplayName = (user: UserDetailsDto) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  if (user.firstName) return user.firstName
  if (user.lastName) return user.lastName
  return user.userName || user.email
}

const getUserInitials = (user: UserDetailsDto) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
  }
  if (user.firstName) return user.firstName.charAt(0)
  if (user.lastName) return user.lastName.charAt(0)
  if (user.userName) return user.userName.charAt(0).toUpperCase()
  return user.email.charAt(0).toUpperCase()
}

// Computed
const isEdit = computed(() => !!props.config)

const selectedUser = computed(() => {
  // If preselected user is provided (from "Configurer" button), use it
  if (props.preselectedUser) {
    return props.preselectedUser
  }
  // If in edit mode, find user by config userId
  if (isEdit.value && props.config) {
    return props.users.find(u => u.id === props.config?.userId)
  }
  return null
})

const availableUsers = computed(() => {
  return props.users.filter(u => !props.configuredUserIds.includes(u.id))
})

// Form state
const form = ref({
  userId: '',
  canDoConfirmation: true,
  canDoSuivi: false,
  canDoQuality: false,
  canDoCallback: false,
  autoAssignPriority: 100,
  maxConcurrentAssignments: 0,
  restrictedProductIds: [] as string[],
  confirmationCommissionType: 'fixed' as 'fixed' | 'percentage',
  confirmationCommissionValue: 0
})

const isSubmitting = ref(false)

// Helper to parse comma-separated string to array
const parseCommaSeparated = (value: string | null | undefined): string[] => {
  if (!value) return []
  return value.split(',').map(s => s.trim()).filter(s => s.length > 0)
}

// Reset form when modal opens or config changes
watch(() => [props.modelValue, props.config, props.preselectedUser], ([open, config, preselectedUser]) => {
  if (open) {
    if (config) {
      // Edit mode - populate from existing config
      const c = config as WorkerServiceConfigDto
      form.value = {
        userId: c.userId ?? '',
        canDoConfirmation: c.canDoConfirmation ?? true,
        canDoSuivi: c.canDoSuivi ?? false,
        canDoQuality: c.canDoQuality ?? false,
        canDoCallback: c.canDoCallback ?? false,
        autoAssignPriority: c.autoAssignPriority ?? 100,
        maxConcurrentAssignments: c.maxConcurrentAssignments ?? 0,
        restrictedProductIds: parseCommaSeparated(c.restrictedProductIds),
        confirmationCommissionType: (c.confirmationCommissionType as 'fixed' | 'percentage') ?? 'fixed',
        confirmationCommissionValue: c.confirmationCommissionValue ?? 0
      }
    } else {
      // Create mode - reset to defaults, but set userId if preselected
      form.value = {
        userId: (preselectedUser as UserDetailsDto | null)?.id || '',
        canDoConfirmation: true,
        canDoSuivi: false,
        canDoQuality: false,
        canDoCallback: false,
        autoAssignPriority: 100,
        maxConcurrentAssignments: 0,
        restrictedProductIds: [],
        confirmationCommissionType: 'fixed',
        confirmationCommissionValue: 0
      }
    }
  }
}, { immediate: true })

// Handle form submission
const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    // Convert array to comma-separated string (empty array = empty string = no restrictions)
    const restrictedProductIdsString = form.value.restrictedProductIds.length > 0
      ? form.value.restrictedProductIds.join(',')
      : ''

    if (isEdit.value && props.config) {
      // Update existing config
      const updateRequest: UpdateWorkerConfigRequest = {
        id: props.config.id!,
        canDoConfirmation: form.value.canDoConfirmation,
        canDoSuivi: form.value.canDoSuivi,
        canDoQuality: form.value.canDoQuality,
        canDoCallback: form.value.canDoCallback,
        autoAssignPriority: form.value.autoAssignPriority,
        maxConcurrentAssignments: form.value.maxConcurrentAssignments,
        restrictedProductIds: restrictedProductIdsString,
        confirmationCommissionType: form.value.confirmationCommissionType,
        confirmationCommissionValue: form.value.confirmationCommissionValue
      }
      await workerConfigsService.update(props.config.id!, updateRequest)
      // Emit the updated config (can be constructed from form data for immediate UI update)
      emit('updated', { ...props.config, ...updateRequest, restrictedProductIds: restrictedProductIdsString } as WorkerServiceConfigDto)
    } else {
      // Create new config
      const createRequest: CreateWorkerConfigRequest = {
        userId: form.value.userId,
        canDoConfirmation: form.value.canDoConfirmation,
        canDoSuivi: form.value.canDoSuivi,
        canDoQuality: form.value.canDoQuality,
        canDoCallback: form.value.canDoCallback,
        autoAssignPriority: form.value.autoAssignPriority,
        maxConcurrentAssignments: form.value.maxConcurrentAssignments,
        restrictedProductIds: restrictedProductIdsString,
        confirmationCommissionType: form.value.confirmationCommissionType,
        confirmationCommissionValue: form.value.confirmationCommissionValue
      }
      const configId = await workerConfigsService.create(createRequest)
      // Emit the created config (construct from form data + returned id)
      emit('created', { id: configId, ...createRequest } as WorkerServiceConfigDto)
    }
    emit('update:modelValue', false)
  } finally {
    isSubmitting.value = false
  }
}
</script>
