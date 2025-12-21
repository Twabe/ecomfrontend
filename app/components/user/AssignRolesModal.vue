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
              class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all"
            >
              <!-- Header -->
              <div class="bg-indigo-600 dark:bg-indigo-700 px-6 py-4">
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-white"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3 rtl:space-x-reverse">
                      <div class="w-10 h-10 bg-indigo-500 dark:bg-indigo-600 rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <span class="block">Assign Roles</span>
                        <span v-if="user" class="block text-sm text-indigo-100 font-normal">
                          {{ user.firstName }} {{ user.lastName }}
                        </span>
                      </div>
                    </div>
                    <button
                      @click="closeModal"
                      class="text-indigo-100 hover:text-white transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </DialogTitle>
              </div>

              <!-- Content -->
              <div class="p-6">
                <!-- Loading State -->
                <div v-if="isLoadingRoles" class="text-center py-12">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
                  <p class="mt-4 text-gray-600 dark:text-gray-400">Loading roles...</p>
                </div>

                <!-- Roles List -->
                <div v-else class="space-y-4">
                  <!-- Quick Actions -->
                  <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ selectedCount }} of {{ availableRoles.length }} roles assigned
                    </p>
                    <div class="flex items-center space-x-2 rtl:space-x-reverse">
                      <button
                        @click="selectAll"
                        class="text-xs px-3 py-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        @click="deselectAll"
                        class="text-xs px-3 py-1.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div v-if="availableRoles.length === 0" class="text-center py-12">
                    <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No roles available
                    </h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">
                      Create roles first before assigning them to users.
                    </p>
                  </div>

                  <!-- Roles Grid -->
                  <div v-else class="max-h-96 overflow-y-auto space-y-2">
                    <label
                      v-for="role in availableRoles"
                      :key="role.id"
                      class="flex items-start space-x-3 rtl:space-x-reverse p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div class="flex items-center h-5">
                        <input
                          type="checkbox"
                          :checked="isRoleSelected(role.id)"
                          @change="toggleRole(role)"
                          class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                          <p class="text-sm font-medium text-gray-900 dark:text-white">
                            {{ role.name }}
                          </p>
                          <span
                            v-if="isRoleSelected(role.id)"
                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                          >
                            Assigned
                          </span>
                        </div>
                        <p v-if="role.description" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {{ role.description }}
                        </p>
                        <div v-if="role.permissions && role.permissions.length > 0" class="flex items-center space-x-1 rtl:space-x-reverse mt-2">
                          <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span class="text-xs text-gray-500 dark:text-gray-400">
                            {{ role.permissions.length }} permission{{ role.permissions.length !== 1 ? 's' : '' }}
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex items-center justify-end space-x-3 rtl:space-x-reverse">
                <button
                  @click="closeModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="handleSubmit"
                  :disabled="isLoading || availableRoles.length === 0"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg v-if="isLoading" class="animate-spin ltr:-ml-1 rtl:-mr-1 ltr:mr-2 rtl:ml-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isLoading ? 'Saving...' : 'Save Roles' }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { useUsersService, useRolesService, type UserDetailsDto, type UserRoleDto, type RoleDto, type UserRolesRequest } from '~/services'

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

const rolesService = useRolesService()
const usersService = useUsersService()

// Use the service data
const availableRoles = rolesService.roles

const isLoading = ref(false)
const selectedRoles = ref<UserRoleDto[]>([])

// Reactive userId for getUserRoles query
const userId = ref<string | null>(null)
const userRolesQuery = usersService.getUserRoles(userId)

// Loading state combines roles loading and user roles loading
const isLoadingRoles = computed(() => rolesService.isLoading.value || userRolesQuery.isLoading.value)

// Calculate selected count
const selectedCount = computed(() => {
  return selectedRoles.value.filter(r => r.enabled).length
})

// Check if role is selected
const isRoleSelected = (roleId: string): boolean => {
  const role = selectedRoles.value.find(r => r.roleId === roleId)
  return role ? role.enabled : false
}

// Toggle role selection
const toggleRole = (role: RoleDto) => {
  const existingRole = selectedRoles.value.find(r => r.roleId === role.id)

  if (existingRole) {
    existingRole.enabled = !existingRole.enabled
  } else {
    selectedRoles.value.push({
      roleId: role.id,
      roleName: role.name,
      description: role.description,
      enabled: true
    })
  }
}

// Select all roles
const selectAll = () => {
  selectedRoles.value = availableRoles.value.map(role => ({
    roleId: role.id,
    roleName: role.name,
    description: role.description,
    enabled: true
  }))
}

// Deselect all roles
const deselectAll = () => {
  selectedRoles.value = selectedRoles.value.map(role => ({
    ...role,
    enabled: false
  }))
}

// Sync selected roles when user roles data is loaded
watch(() => userRolesQuery.data.value, (userRoles) => {
  if (userRoles && availableRoles.value.length > 0) {
    // Create a map of all available roles with their current status
    selectedRoles.value = availableRoles.value.map(role => {
      const existingRole = userRoles.find((ur: UserRoleDto) => ur.roleId === role.id)
      return {
        roleId: role.id,
        roleName: role.name,
        description: role.description,
        enabled: existingRole ? existingRole.enabled : false
      }
    })
  }
}, { immediate: true })

// Watch for modal open and user changes - set userId to trigger query
watch(() => [props.isOpen, props.user], ([isOpen, user]) => {
  if (isOpen && user) {
    userId.value = (user as UserDetailsDto).id
  } else {
    userId.value = null
  }
}, { immediate: true })

// Close modal
const closeModal = () => {
  if (!isLoading.value) {
    emit('close')
    selectedRoles.value = []
    userId.value = null
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!props.user) return

  isLoading.value = true

  try {
    const request: UserRolesRequest = {
      userRoles: selectedRoles.value
    }
    await usersService.assignRoles(props.user.id, request)
    emit('submit')

    // Close modal after success
    setTimeout(() => {
      closeModal()
      isLoading.value = false
    }, 500)
  } catch (error) {
    console.error('Failed to assign roles:', error)
    isLoading.value = false
  }
}

// Reset when modal closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    selectedRoles.value = []
    userId.value = null
  }
})
</script>
