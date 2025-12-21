<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <!-- Header -->
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 mb-4"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span>{{ isEditMode ? 'Edit Role' : 'Create New Role' }}</span>
                  </div>
                  <button
                    @click="closeModal"
                    class="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </DialogTitle>

              <!-- Form -->
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Role Name -->
                <div>
                  <label for="roleName" class="block text-sm font-medium text-gray-700 mb-2">
                    Role Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    id="roleName"
                    required
                    placeholder="Enter role name (e.g., Manager, Customer Service)"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    A unique name for this role
                  </p>
                </div>

                <!-- Description -->
                <div>
                  <label for="roleDescription" class="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    v-model="form.description"
                    id="roleDescription"
                    rows="3"
                    placeholder="Describe the purpose of this role..."
                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                  ></textarea>
                  <p class="mt-1 text-xs text-gray-500">
                    Optional description to help identify this role's purpose
                  </p>
                </div>

                <!-- Info Box -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div class="flex items-start space-x-2">
                    <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="flex-1">
                      <p class="text-xs font-medium text-blue-900">
                        About Roles & Permissions
                      </p>
                      <p class="text-xs text-blue-700 mt-1">
                        After creating the role, you can assign specific permissions to control what users with this role can do.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="isLoading || !form.name"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Role' : 'Create Role') }}
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
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import type { Role, CreateOrUpdateRoleRequest } from '~/types/role'

interface Props {
  isOpen: boolean
  role: Role | null
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: CreateOrUpdateRoleRequest): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isLoading = ref(false)

// Determine if we're in edit mode
const isEditMode = computed(() => !!props.role)

// Form data
const form = reactive<CreateOrUpdateRoleRequest>({
  id: undefined,
  name: '',
  description: ''
})

// Watch role prop to populate form in edit mode
watch(() => props.role, (newRole) => {
  if (newRole) {
    form.id = newRole.id
    form.name = newRole.name
    form.description = newRole.description || ''
  } else {
    form.id = undefined
    form.name = ''
    form.description = ''
  }
}, { immediate: true })

// Close modal
const closeModal = () => {
  if (!isLoading.value) {
    emit('close')
    // Reset form
    form.id = undefined
    form.name = ''
    form.description = ''
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!form.name) return

  isLoading.value = true

  try {
    emit('submit', {
      id: form.id,
      name: form.name,
      description: form.description || undefined
    })

    // Close modal after a short delay
    setTimeout(() => {
      closeModal()
      isLoading.value = false
    }, 500)
  } catch (error) {
    console.error('Failed to save role:', error)
    isLoading.value = false
  }
}

// Reset form when modal closes
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    form.id = undefined
    form.name = ''
    form.description = ''
  }
})
</script>
