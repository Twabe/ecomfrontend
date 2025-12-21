<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Users</h2>
        <p class="text-gray-600 mt-1">Manage all users in the system</p>
      </div>
      <button @click="showCreateModal = true" class="btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create User
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Total Users</p>
        <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Active</p>
        <p class="text-2xl font-bold text-green-600">{{ stats.active }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Inactive</p>
        <p class="text-2xl font-bold text-red-600">{{ stats.inactive }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Email Confirmed</p>
        <p class="text-2xl font-bold text-blue-600">{{ stats.emailConfirmed }}</p>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="card mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex-1 max-w-md">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            v-model="emailFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Emails</option>
            <option value="confirmed">Confirmed</option>
            <option value="not-confirmed">Not Confirmed</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading users...</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery ? 'No users found' : 'No users yet' }}
        </h3>
        <p class="text-gray-600 mb-4">
          {{ searchQuery ? 'Try adjusting your search or filters' : 'Get started by creating your first user.' }}
        </p>
        <button v-if="!searchQuery" @click="showCreateModal = true" class="btn-primary">
          Create User
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email Status
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div v-if="user.imageUrl" class="h-10 w-10 rounded-full overflow-hidden">
                      <img :src="user.imageUrl" :alt="user.userName" class="h-full w-full object-cover" />
                    </div>
                    <div v-else class="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span class="text-sm font-medium text-white">{{ getUserInitials(user) }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : user.userName }}
                    </div>
                    <div class="text-sm text-gray-500">@{{ user.userName }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-600">{{ user.phoneNumber || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="user.emailConfirmed ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ user.emailConfirmed ? 'Confirmed' : 'Pending' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <NuxtLink
                    :to="`/super-admin/users/${user.id}`"
                    class="text-indigo-600 hover:text-indigo-900"
                    title="View Details"
                  >
                    View
                  </NuxtLink>
                  <button
                    @click="openRolesModal(user)"
                    class="text-purple-600 hover:text-purple-900"
                    title="Manage Roles"
                  >
                    Roles
                  </button>
                  <button
                    v-if="!user.isActive"
                    @click="handleToggleStatus(user.id, true)"
                    class="text-green-600 hover:text-green-900"
                    title="Activate User"
                  >
                    Activate
                  </button>
                  <button
                    v-else
                    @click="handleToggleStatus(user.id, false)"
                    class="text-red-600 hover:text-red-900"
                    title="Deactivate User"
                  >
                    Deactivate
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
import { useUsersService, type UserDetailsDto } from '~/services'

definePageMeta({
  layout: 'super-admin',
  middleware: ['auth', 'super-admin']
})

const usersService = useUsersService()
const { users, isLoading, toggleStatus, refetch } = usersService

// Computed stats from users list
const stats = computed(() => {
  const usersList = users.value
  return {
    total: usersList.length,
    active: usersList.filter(u => u.isActive).length,
    inactive: usersList.filter(u => !u.isActive).length,
    emailConfirmed: usersList.filter(u => u.emailConfirmed).length
  }
})

// Modal states
const showCreateModal = ref(false)
const showRolesModal = ref(false)
const selectedUser = ref<UserDetailsDto | null>(null)

// Filter states
const searchQuery = ref('')
const statusFilter = ref('all')
const emailFilter = ref('all')


// Filtered users based on search and filters
const filteredUsers = computed(() => {
  let filtered = users.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.userName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value === 'active') {
    filtered = filtered.filter(user => user.isActive)
  } else if (statusFilter.value === 'inactive') {
    filtered = filtered.filter(user => !user.isActive)
  }

  // Email filter
  if (emailFilter.value === 'confirmed') {
    filtered = filtered.filter(user => user.emailConfirmed)
  } else if (emailFilter.value === 'not-confirmed') {
    filtered = filtered.filter(user => !user.emailConfirmed)
  }

  return filtered
})

// Get user initials
const getUserInitials = (user: UserDetailsDto) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
  }
  if (user.userName) {
    return user.userName.substring(0, 2).toUpperCase()
  }
  return 'U'
}

// Handle toggle user status
const handleToggleStatus = async (id: string, activate: boolean) => {
  const action = activate ? 'activate' : 'deactivate'
  if (confirm(`Are you sure you want to ${action} this user?`)) {
    await toggleStatus({ userId: id, activateUser: activate })
  }
}

// Open roles modal
const openRolesModal = (user: UserDetailsDto) => {
  selectedUser.value = user
  showRolesModal.value = true
}
</script>
