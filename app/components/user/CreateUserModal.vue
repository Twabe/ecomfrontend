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
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span>Create New User</span>
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
                    <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.firstName"
                      type="text"
                      id="firstName"
                      required
                      placeholder="Enter first name"
                      class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.lastName"
                      type="text"
                      id="lastName"
                      required
                      placeholder="Enter last name"
                      class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>

                <!-- Email -->
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.email"
                    type="email"
                    id="email"
                    required
                    placeholder="user@example.com"
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <!-- Username & Phone -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="userName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.userName"
                      type="text"
                      id="userName"
                      required
                      placeholder="username"
                      class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label for="phoneNumber" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      v-model="form.phoneNumber"
                      type="tel"
                      id="phoneNumber"
                      placeholder="0612345678"
                      class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>

                <!-- Password & Confirm Password -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.password"
                      type="password"
                      id="password"
                      required
                      minlength="6"
                      placeholder="Minimum 6 characters"
                      class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      At least 6 characters
                    </p>
                  </div>

                  <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.confirmPassword"
                      type="password"
                      id="confirmPassword"
                      required
                      minlength="6"
                      placeholder="Re-enter password"
                      class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <p v-if="passwordError" class="mt-1 text-xs text-red-600 dark:text-red-400">
                      {{ passwordError }}
                    </p>
                  </div>
                </div>

                <!-- Info Box -->
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div class="flex items-start space-x-2 rtl:space-x-reverse">
                    <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="flex-1">
                      <p class="text-xs font-medium text-blue-900 dark:text-blue-300">
                        About User Creation
                      </p>
                      <p class="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        After creating the user, you can assign roles to control their permissions and access levels.
                      </p>
                    </div>
                  </div>
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
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {{ isLoading ? 'Creating...' : 'Create User' }}
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
import { useUsersService, type CreateUserRequest } from '~/services'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: CreateUserRequest): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const usersService = useUsersService()
const isLoading = ref(false)

// Form data
const form = reactive<CreateUserRequest>({
  firstName: '',
  lastName: '',
  email: '',
  userName: '',
  password: '',
  confirmPassword: '',
  phoneNumber: ''
})

// Password validation
const passwordError = computed(() => {
  if (!form.password || !form.confirmPassword) return ''
  if (form.password !== form.confirmPassword) {
    return 'Passwords do not match'
  }
  return ''
})

// Form validation
const isFormValid = computed(() => {
  return (
    form.firstName.trim() !== '' &&
    form.lastName.trim() !== '' &&
    form.email.trim() !== '' &&
    form.userName.trim() !== '' &&
    form.password.length >= 6 &&
    form.confirmPassword.length >= 6 &&
    form.password === form.confirmPassword
  )
})

// Close modal
const closeModal = () => {
  if (!isLoading.value) {
    emit('close')
    // Reset form
    form.firstName = ''
    form.lastName = ''
    form.email = ''
    form.userName = ''
    form.password = ''
    form.confirmPassword = ''
    form.phoneNumber = ''
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true

  try {
    await usersService.create(form)
    emit('submit', { ...form })

    // Close modal after success
    setTimeout(() => {
      closeModal()
      isLoading.value = false
    }, 500)
  } catch (error) {
    console.error('Failed to create user:', error)
    isLoading.value = false
  }
}

// Reset form when modal closes
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    form.firstName = ''
    form.lastName = ''
    form.email = ''
    form.userName = ''
    form.password = ''
    form.confirmPassword = ''
    form.phoneNumber = ''
  }
})
</script>
