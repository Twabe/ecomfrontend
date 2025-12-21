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
              class="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all"
            >
              <!-- Header -->
              <div class="bg-purple-600 px-6 py-4">
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-white"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <span class="block">Manage Permissions</span>
                        <span v-if="role" class="block text-sm text-purple-100 font-normal">{{ role.name }}</span>
                      </div>
                    </div>
                    <button
                      @click="closeModal"
                      class="text-purple-100 hover:text-white transition-colors"
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
                <div v-if="isLoadingPermissions" class="text-center py-12">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p class="mt-4 text-gray-600">Loading permissions...</p>
                </div>

                <!-- Permissions List -->
                <div v-else class="space-y-4">
                  <!-- Quick Actions -->
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm font-medium text-gray-700">
                      {{ selectedCount }} of {{ totalCount }} permissions selected
                    </p>
                    <div class="flex items-center space-x-2">
                      <button
                        @click="selectAll"
                        class="text-xs px-3 py-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        @click="deselectAll"
                        class="text-xs px-3 py-1.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <!-- Permission Groups -->
                  <div class="max-h-96 overflow-y-auto space-y-3">
                    <div
                      v-for="group in permissionGroups"
                      :key="group.resource"
                      class="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <!-- Group Header -->
                      <button
                        @click="toggleGroup(group.resource)"
                        class="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                      >
                        <div class="flex items-center space-x-3">
                          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <span class="font-medium text-gray-900">{{ group.resource }}</span>
                          <span class="text-xs text-gray-500">
                            ({{ getGroupSelectedCount(group.resource) }}/{{ group.permissions.length }})
                          </span>
                        </div>
                        <svg
                          class="w-5 h-5 text-gray-500 transition-transform"
                          :class="{ 'rotate-180': expandedGroups[group.resource] }"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <!-- Group Permissions -->
                      <div
                        v-show="expandedGroups[group.resource]"
                        class="bg-white p-4 space-y-2"
                      >
                        <label
                          v-for="permission in group.permissions"
                          :key="permission.name"
                          class="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            :checked="selectedPermissions.includes(permission.name)"
                            @change="togglePermission(permission.name)"
                            class="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900">
                              {{ permission.description }}
                            </p>
                            <p class="text-xs text-gray-500 font-mono">
                              {{ permission.name }}
                            </p>
                            <div v-if="permission.isRoot || permission.isBasic" class="flex items-center space-x-1 mt-1">
                              <span
                                v-if="permission.isRoot"
                                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                              >
                                Root Only
                              </span>
                              <span
                                v-if="permission.isBasic"
                                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                Basic
                              </span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
                <button
                  @click="closeModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="handleSubmit"
                  :disabled="isLoading"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isLoading ? 'Saving...' : 'Save Permissions' }}
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
import { rolesGetByIdWithPermissions } from '~/api/generated/endpoints/roles/roles'
import type { RoleDto } from '~/api/generated/models'

interface Props {
  isOpen: boolean
  role: RoleDto | null
  filterRoot?: boolean  // NEW: Filter out root-only permissions
}

interface Emits {
  (e: 'close'): void
  (e: 'update', roleId: string, permissions: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { fetchAllPermissions, getPermissionGroups } = usePermissions()

const isLoading = ref(false)
const isLoadingPermissions = ref(false)
const selectedPermissions = ref<string[]>([])
const expandedGroups = ref<{ [key: string]: boolean }>({})
const permissionGroups = ref<any[]>([])

// Load all permissions from backend
const loadPermissions = async () => {
  try {
    await fetchAllPermissions()
    let groups = await getPermissionGroups()

    // Filter out root-only permissions if filterRoot is true
    if (props.filterRoot) {
      groups = groups.map(group => ({
        ...group,
        permissions: group.permissions.filter(p => !p.isRoot)
      })).filter(group => group.permissions.length > 0) // Remove empty groups
    }

    permissionGroups.value = groups
  } catch (error) {
    console.error('Failed to load permissions:', error)
  }
}

// Calculate selected count
const selectedCount = computed(() => selectedPermissions.value.length)
const totalCount = computed(() => {
  return permissionGroups.value.reduce((acc, group) => acc + group.permissions.length, 0)
})

// Get group selected count
const getGroupSelectedCount = (resource: string) => {
  const group = permissionGroups.value.find(g => g.resource === resource)
  if (!group) return 0

  return group.permissions.filter(p => selectedPermissions.value.includes(p.name)).length
}

// Toggle group expansion
const toggleGroup = (resource: string) => {
  expandedGroups.value[resource] = !expandedGroups.value[resource]
}

// Toggle permission
const togglePermission = (permissionName: string) => {
  const index = selectedPermissions.value.indexOf(permissionName)
  if (index > -1) {
    selectedPermissions.value.splice(index, 1)
  } else {
    selectedPermissions.value.push(permissionName)
  }
}

// Select all permissions
const selectAll = () => {
  const allPermissionNames = permissionGroups.value.flatMap(g => g.permissions.map(p => p.name))
  selectedPermissions.value = [...allPermissionNames]
}

// Deselect all permissions
const deselectAll = () => {
  selectedPermissions.value = []
}

// Load role permissions
const loadRolePermissions = async () => {
  if (!props.role?.id) return

  isLoadingPermissions.value = true
  try {
    const roleWithPermissions = await rolesGetByIdWithPermissions(props.role.id)
    if (roleWithPermissions && roleWithPermissions.permissions) {
      selectedPermissions.value = [...roleWithPermissions.permissions]
    }
  } catch (error) {
    console.error('Failed to load role permissions:', error)
  } finally {
    isLoadingPermissions.value = false
  }
}

// Load permissions on mount
onMounted(async () => {
  await loadPermissions()
})

// Watch for role changes
watch(() => props.role, async (newRole) => {
  if (newRole && props.isOpen) {
    await loadPermissions()
    await loadRolePermissions()
    // Expand all groups by default
    permissionGroups.value.forEach(group => {
      expandedGroups.value[group.resource] = true
    })
  }
}, { immediate: true })

// Watch for modal open
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && props.role) {
    await loadPermissions()
    await loadRolePermissions()
  }
})

// Close modal
const closeModal = () => {
  if (!isLoading.value) {
    emit('close')
    selectedPermissions.value = []
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!props.role) return

  isLoading.value = true

  try {
    emit('update', props.role.id, selectedPermissions.value)

    // Close modal after a short delay
    setTimeout(() => {
      closeModal()
      isLoading.value = false
    }, 500)
  } catch (error) {
    console.error('Failed to update permissions:', error)
    isLoading.value = false
  }
}
</script>
