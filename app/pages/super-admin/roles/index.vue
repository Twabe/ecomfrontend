<template>
  <div>
    <!-- Create/Edit Role Modal -->
    <RoleCreateEditRoleModal
      :is-open="showRoleModal"
      :role="selectedRole"
      @close="closeRoleModal"
      @submit="handleRoleSubmit"
    />

    <!-- Manage Permissions Modal -->
    <RoleManagePermissionsModal
      :is-open="showPermissionsModal"
      :role="selectedRole"
      @close="closePermissionsModal"
      @update="handlePermissionsUpdate"
    />

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Roles</h2>
        <p class="text-gray-600 mt-1">Manage roles and permissions in the system</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create Role
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Total Roles</p>
        <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">With Permissions</p>
        <p class="text-2xl font-bold text-green-600">{{ stats.withPermissions }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Without Permissions</p>
        <p class="text-2xl font-bold text-amber-600">{{ stats.withoutPermissions }}</p>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="card mb-6">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search roles..."
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading roles...</p>
      </div>

      <div v-else-if="filteredRoles.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery ? 'No roles found' : 'No roles yet' }}
        </h3>
        <p class="text-gray-600 mb-4">
          {{ searchQuery ? 'Try adjusting your search' : 'Get started by creating your first role.' }}
        </p>
        <button v-if="!searchQuery" @click="openCreateModal" class="btn-primary">
          Create Role
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="role in filteredRoles" :key="role.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ role.name }}</div>
                    <div class="text-xs text-gray-500">ID: {{ role.id.substring(0, 8) }}...</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-600 max-w-xs truncate">
                  {{ role.description || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="text-sm text-gray-600 mr-2">
                    {{ role.permissions?.length || 0 }} permissions
                  </span>
                  <span
                    v-if="role.permissions && role.permissions.length > 0"
                    class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                  >
                    Configured
                  </span>
                  <span
                    v-else
                    class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800"
                  >
                    Not Configured
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="openPermissionsModal(role)"
                    class="text-purple-600 hover:text-purple-900"
                    title="Manage Permissions"
                  >
                    Permissions
                  </button>
                  <button
                    @click="openEditModal(role)"
                    class="text-indigo-600 hover:text-indigo-900"
                    title="Edit Role"
                  >
                    Edit
                  </button>
                  <button
                    @click="handleDelete(role.id, role.name)"
                    class="text-red-600 hover:text-red-900"
                    title="Delete Role"
                  >
                    Delete
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
import { useRolesService, type RoleDto, type CreateOrUpdateRoleRequest } from '~/services'

definePageMeta({
  layout: 'super-admin',
  middleware: ['auth', 'super-admin']
})

const {
  roles,
  isLoading,
  registerRole: createOrUpdateRole,
  updatePermissions: updateRolePermissions,
  remove: deleteRole,
  invalidate: fetchRoles
} = useRolesService()

// Modal states
const showRoleModal = ref(false)
const showPermissionsModal = ref(false)
const selectedRole = ref<RoleDto | null>(null)

// Search state
const searchQuery = ref('')

// Computed stats from roles list
const stats = computed(() => {
  const list = roles.value ?? []
  return {
    total: list.length,
    withPermissions: list.filter(r => r.permissions && r.permissions.length > 0).length,
    withoutPermissions: list.filter(r => !r.permissions || r.permissions.length === 0).length
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
  await createOrUpdateRole(data)
  closeRoleModal()
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
  await updateRolePermissions(roleId, { permissions })
  closePermissionsModal()
}

// Handle delete role
const handleDelete = async (id: string, name: string) => {
  if (confirm(`Are you sure you want to delete the role "${name}"? This action cannot be undone.`)) {
    await deleteRole(id)
  }
}
</script>
