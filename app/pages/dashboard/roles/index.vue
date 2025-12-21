<template>
  <div>
    <!-- Create/Edit Role Modal -->
    <RoleCreateEditRoleModal
      :is-open="showRoleModal"
      :role="selectedRole"
      @close="closeRoleModal"
      @submit="handleRoleSubmit"
    />

    <!-- Manage Permissions Modal (with root filtering) -->
    <RoleManagePermissionsModal
      :is-open="showPermissionsModal"
      :role="selectedRole"
      :filter-root="!isSuperAdmin"
      @close="closePermissionsModal"
      @update="handlePermissionsUpdate"
    />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Manage roles and permissions for your team</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <PlusIcon class="w-5 h-5 ltr:mr-2 rtl:ml-2" />
        Create Role
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="card">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Roles</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">With Permissions</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-500">{{ stats.withPermissions }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Without Permissions</p>
        <p class="text-2xl font-bold text-amber-600 dark:text-amber-500">{{ stats.withoutPermissions }}</p>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="card mb-6">
      <div class="relative">
        <div class="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search roles..."
          class="input ltr:pl-10 rtl:pr-10"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading roles...</p>
      </div>

      <div v-else-if="filteredRoles.length === 0" class="text-center py-12">
        <ShieldCheckIcon class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ searchQuery ? 'No roles found' : 'No roles yet' }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ searchQuery ? 'Try adjusting your search' : 'Get started by creating your first role.' }}
        </p>
        <button v-if="!searchQuery" @click="openCreateModal" class="btn-primary">
          Create Role
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b dark:border-gray-700">
              <th class="text-left ltr:text-left rtl:text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Role Name
              </th>
              <th class="text-left ltr:text-left rtl:text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Description
              </th>
              <th class="text-left ltr:text-left rtl:text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Permissions
              </th>
              <th class="text-right ltr:text-right rtl:text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="role in filteredRoles" :key="role.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-indigo-600 dark:bg-indigo-700 flex items-center justify-center">
                      <ShieldCheckIcon class="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ role.name }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">ID: {{ role.id.substring(0, 8) }}...</div>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                  {{ role.description || '-' }}
                </div>
              </td>
              <td class="py-3 px-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600 dark:text-gray-300">
                    {{ role.permissions?.length || 0 }} permissions
                  </span>
                  <span
                    v-if="role.permissions && role.permissions.length > 0"
                    class="badge-success"
                  >
                    Configured
                  </span>
                  <span
                    v-else
                    class="badge-warning"
                  >
                    Not Configured
                  </span>
                </div>
              </td>
              <td class="py-3 px-4 whitespace-nowrap">
                <div class="flex items-center justify-end ltr:justify-end rtl:justify-start gap-2">
                  <button
                    @click="openPermissionsModal(role)"
                    class="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Manage Permissions"
                  >
                    <LockClosedIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="openEditModal(role)"
                    class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Edit Role"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(role.id, role.name)"
                    class="p-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Delete Role"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import {
  useRolesService,
  type RoleDto,
  type CreateOrUpdateRoleRequest
} from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Roles.View'
})

const { notify } = useNotification()
const { user } = useAuth()
const {
  roles,
  isLoading,
  registerRole: createOrUpdateRole,
  updatePermissions: updateRolePermissions,
  remove: deleteRole,
  invalidate: fetchRoles
} = useRolesService()

// Check if user is super admin (from root tenant)
const isSuperAdmin = computed(() => {
  // Super admins can see all permissions including root-only
  return user.value?.permissions?.some(p =>
    p === 'Permissions.Tenants.View' ||
    p === 'Permissions.Tenants.Create'
  ) ?? false
})

// Modal states
const showRoleModal = ref(false)
const showPermissionsModal = ref(false)
const selectedRole = ref<RoleDto | null>(null)

// Search state
const searchQuery = ref('')

// Computed stats from roles list
const stats = computed(() => {
  const list = roles.value ?? []
  const withPerms = list.filter(r => r.permissions && r.permissions.length > 0).length
  return {
    total: list.length,
    withPermissions: withPerms,
    withoutPermissions: list.length - withPerms
  }
})

// Filtered roles based on search
const filteredRoles = computed(() => {
  const list = roles.value ?? []
  if (!searchQuery.value) return list

  const query = searchQuery.value.toLowerCase()
  return list.filter(role =>
    role.name.toLowerCase().includes(query) ||
    role.description?.toLowerCase().includes(query)
  )
})

// Open create modal
const openCreateModal = () => {
  selectedRole.value = null
  showRoleModal.value = true
}

// Open edit modal
const openEditModal = (role: RoleDto) => {
  selectedRole.value = role
  showRoleModal.value = true
}

// Close role modal
const closeRoleModal = () => {
  showRoleModal.value = false
  selectedRole.value = null
}

// Handle role submit (create or update)
const handleRoleSubmit = async (data: CreateOrUpdateRoleRequest) => {
  try {
    await createOrUpdateRole(data)
    notify({ type: 'success', message: 'Role saved successfully' })
    closeRoleModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || 'Failed to save role' })
  }
}

// Open permissions modal
const openPermissionsModal = (role: RoleDto) => {
  selectedRole.value = role
  showPermissionsModal.value = true
}

// Close permissions modal
const closePermissionsModal = () => {
  showPermissionsModal.value = false
  selectedRole.value = null
}

// Handle permissions update
const handlePermissionsUpdate = async (roleId: string, permissions: string[]) => {
  try {
    await updateRolePermissions(roleId, { roleId, permissions })
    await fetchRoles() // Refresh roles list
    notify({ type: 'success', message: 'Permissions updated successfully' })
    closePermissionsModal()
  } catch (error: any) {
    notify({ type: 'error', message: error.message || 'Failed to update permissions' })
  }
}

// Handle delete role
const handleDelete = async (id: string, name: string) => {
  if (confirm(`Are you sure you want to delete the role "${name}"? This action cannot be undone.`)) {
    try {
      await deleteRole(id)
      notify({ type: 'success', message: 'Role deleted successfully' })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || 'Failed to delete role' })
    }
  }
}
</script>
