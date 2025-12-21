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
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all"
            >
              <!-- Header -->
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3 rtl:space-x-reverse">
                    <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <span>Set Password</span>
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

              <!-- User Info -->
              <div v-if="user" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center gap-3">
                  <div v-if="user.imageUrl" class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img :src="user.imageUrl" :alt="user.userName" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-700 flex items-center justify-center flex-shrink-0">
                    <span class="text-white font-medium text-sm">
                      {{ user.firstName?.[0] }}{{ user.lastName?.[0] }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ user.firstName }} {{ user.lastName }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">@{{ user.userName }}</p>
                  </div>
                </div>
              </div>

              <!-- Form -->
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- New Password -->
                <div>
                  <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.newPassword"
                    type="password"
                    id="newPassword"
                    required
                    minlength="6"
                    placeholder="Minimum 6 characters"
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <!-- Confirm Password -->
                <div>
                  <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.confirmNewPassword"
                    type="password"
                    id="confirmNewPassword"
                    required
                    minlength="6"
                    placeholder="Re-enter password"
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <p v-if="passwordError" class="mt-1 text-xs text-red-600 dark:text-red-400">
                    {{ passwordError }}
                  </p>
                </div>

                <!-- Warning -->
                <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div class="flex items-start space-x-2 rtl:space-x-reverse">
                    <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p class="text-xs text-amber-700 dark:text-amber-400">
                      This will immediately change the user's password. The user will need to use the new password to login.
                    </p>
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
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg v-if="isLoading" class="animate-spin ltr:-ml-1 rtl:-mr-1 ltr:mr-2 rtl:ml-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 ltr:mr-2 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    {{ isLoading ? 'Setting...' : 'Set Password' }}
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
import { useUsersService, type AdminSetPasswordRequest, type UserDetailsDto } from '~/services'

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
const form = reactive<AdminSetPasswordRequest>({
  newPassword: '',
  confirmNewPassword: ''
})

// Password validation
const passwordError = computed(() => {
  if (!form.newPassword || !form.confirmNewPassword) return ''
  if (form.newPassword !== form.confirmNewPassword) {
    return 'Passwords do not match'
  }
  return ''
})

// Form validation
const isFormValid = computed(() => {
  return (
    form.newPassword.length >= 6 &&
    form.confirmNewPassword.length >= 6 &&
    form.newPassword === form.confirmNewPassword
  )
})

// Close modal
const closeModal = () => {
  if (!isLoading.value) {
    emit('close')
    resetForm()
  }
}

// Reset form
const resetForm = () => {
  form.newPassword = ''
  form.confirmNewPassword = ''
}

// Handle submit
const handleSubmit = async () => {
  if (!isFormValid.value || !props.user) return

  isLoading.value = true

  try {
    await usersService.setPassword(props.user.id, form)
    emit('submit')
    closeModal()
  } catch (error) {
    console.error('Failed to set password:', error)
  } finally {
    isLoading.value = false
  }
}

// Reset form when modal closes
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>
