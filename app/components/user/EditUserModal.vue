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
        <div class="fixed inset-0 bg-black/50 dark:bg-black/70" />
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
              class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all"
            >
              <!-- Header -->
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3 rtl:space-x-reverse">
                    <div class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <span>Edit User</span>
                  </div>
                  <button
                    @click="closeModal"
                    class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </DialogTitle>

              <!-- Form -->
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- First Name & Last Name -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="edit-firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.firstName"
                      type="text"
                      id="edit-firstName"
                      required
                      placeholder="Enter first name"
                      class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label for="edit-lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.lastName"
                      type="text"
                      id="edit-lastName"
                      required
                      placeholder="Enter last name"
                      class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>

                <!-- Email -->
                <div>
                  <label for="edit-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.email"
                    type="email"
                    id="edit-email"
                    required
                    placeholder="user@example.com"
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <!-- Phone Number -->
                <div>
                  <label for="edit-phoneNumber" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    v-model="form.phoneNumber"
                    type="tel"
                    id="edit-phoneNumber"
                    placeholder="0612345678"
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-4">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="isLoading || !isFormValid"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg v-if="isLoading" class="animate-spin ltr:-ml-1 rtl:-mr-1 ltr:mr-2 rtl:ml-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 ltr:mr-2 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ isLoading ? 'Saving...' : 'Save Changes' }}
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
import { useUsersService, type UpdateUserRequest, type UserDetailsDto } from '~/services'

interface Props {
  isOpen: boolean
  user: UserDetailsDto | null
}

interface Emits {
  (e: 'close'): void
  (e: 'submit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const usersService = useUsersService()
const isLoading = ref(false)

// Form data
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: ''
})

// Form validation
const isFormValid = computed(() => {
  return (
    form.firstName.trim() !== '' &&
    form.lastName.trim() !== '' &&
    form.email.trim() !== ''
  )
})

// Close modal
const closeModal = () => {
  if (!isLoading.value) {
    emit('close')
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!isFormValid.value || !props.user) return

  isLoading.value = true

  try {
    const request: UpdateUserRequest = {
      id: props.user.id,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phoneNumber: form.phoneNumber || undefined
    }

    await usersService.update(props.user.id, request)
    emit('submit')
    closeModal()
  } catch (error) {
    console.error('Failed to update user:', error)
  } finally {
    isLoading.value = false
  }
}

// Initialize form when user changes
watch(() => props.user, (newUser) => {
  if (newUser) {
    form.firstName = newUser.firstName || ''
    form.lastName = newUser.lastName || ''
    form.email = newUser.email || ''
    form.phoneNumber = newUser.phoneNumber || ''
  }
}, { immediate: true })

// Reset form when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.user) {
    form.firstName = props.user.firstName || ''
    form.lastName = props.user.lastName || ''
    form.email = props.user.email || ''
    form.phoneNumber = props.user.phoneNumber || ''
  }
})
</script>
