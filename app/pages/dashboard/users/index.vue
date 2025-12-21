<template>
  <div>
    <!-- Modals -->
    <CreateUserModal
      :is-open="showCreateModal"
      @close="closeCreateModal"
      @submit="handleUserCreated"
    />

    <AssignRolesModal
      :is-open="showRolesModal"
      :user="selectedUser"
      @close="closeRolesModal"
      @submit="handleRolesUpdated"
    />

    <EditUserModal
      :is-open="showEditModal"
      :user="selectedUser"
      @close="closeEditModal"
      @submit="handleUserUpdated"
    />

    <SetPasswordModal
      :is-open="showPasswordModal"
      :user="selectedUser"
      @close="closePasswordModal"
      @submit="handlePasswordUpdated"
    />

    <UserHistoryModal
      :show="showHistoryModal"
      :user-id="selectedUser?.id ?? null"
      :user-name="selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : null"
      @close="closeHistoryModal"
    />

    <!-- Worker Config Modal -->
    <SupervisorWorkerConfigModal
      v-model="showConfigModal"
      :config="selectedConfig"
      :users="activeUsers"
      :configured-user-ids="configuredUserIds"
      :preselected-user="selectedUserForConfig"
      @created="handleConfigCreated"
      @updated="handleConfigUpdated"
    />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('users.title') }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">{{ stats.total }} {{ $t('users.users') }}</p>
      </div>
      <button v-if="activeTab === 'users'" @click="showCreateModal = true" class="btn-primary">
        <PlusIcon class="w-5 h-5 ltr:mr-2 rtl:ml-2" />
        {{ $t('users.createUser') }}
      </button>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav class="-mb-px flex gap-4">
        <button
          @click="activeTab = 'users'"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === 'users'
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'"
        >
          {{ $t('users.users') }}
          <span class="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
            {{ stats.total }}
          </span>
        </button>
        <button
          @click="activeTab = 'configs'"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === 'configs'
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'"
        >
          {{ $t('users.workerConfigs') }}
          <span class="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
            {{ workerConfigs.length }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Users Tab -->
    <div v-if="activeTab === 'users'">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="card">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('users.totalUsers') }}</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('users.active') }}</p>
          <p class="text-2xl font-bold text-green-600 dark:text-green-500">{{ stats.active }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('users.inactive') }}</p>
          <p class="text-2xl font-bold text-red-600 dark:text-red-500">{{ stats.inactive }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('users.emailConfirmed') }}</p>
          <p class="text-2xl font-bold text-blue-600 dark:text-blue-500">{{ stats.emailConfirmed }}</p>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="card mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex-1 max-w-md">
            <div class="relative">
              <MagnifyingGlassIcon class="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('users.searchPlaceholder')"
                class="input ltr:pl-10 rtl:pr-10"
              />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <select v-model="statusFilter" class="input">
              <option value="all">{{ $t('users.allStatus') }}</option>
              <option value="active">{{ $t('users.active') }}</option>
              <option value="inactive">{{ $t('users.inactive') }}</option>
            </select>
            <select v-model="emailFilter" class="input">
              <option value="all">{{ $t('users.allEmails') }}</option>
              <option value="confirmed">{{ $t('users.confirmed') }}</option>
              <option value="not-confirmed">{{ $t('users.notConfirmed') }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <!-- Loading state -->
        <div v-if="isLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">{{ $t('users.loading') }}</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredUsers.length === 0" class="text-center py-12">
          <UserGroupIcon class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ searchQuery ? $t('users.noUsersFound') : $t('users.noUsersYet') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ searchQuery ? $t('users.adjustSearch') : $t('users.createFirst') }}
          </p>
          <button v-if="!searchQuery" @click="showCreateModal = true" class="btn-primary">
            {{ $t('users.createUser') }}
          </button>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b dark:border-gray-700">
                <th class="text-left ltr:text-left rtl:text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('users.user') }}</th>
                <th class="text-left ltr:text-left rtl:text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('users.email') }}</th>
                <th class="text-left ltr:text-left rtl:text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('users.phone') }}</th>
                <th class="text-left ltr:text-left rtl:text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('users.status') }}</th>
                <th class="text-left ltr:text-left rtl:text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('users.emailStatus') }}</th>
                <th class="text-right ltr:text-right rtl:text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="user in filteredUsers" :key="user.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <div v-if="user.imageUrl" class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <img :src="user.imageUrl" :alt="user.userName" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-700 flex items-center justify-center flex-shrink-0">
                      <span class="text-white font-medium text-sm">
                        {{ user.firstName?.[0] }}{{ user.lastName?.[0] }}
                      </span>
                    </div>
                    <div class="min-w-0">
                      <p class="font-medium text-gray-900 dark:text-white truncate">{{ user.firstName }} {{ user.lastName }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400 truncate">@{{ user.userName }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                  <span class="truncate block max-w-xs">{{ user.email }}</span>
                </td>
                <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{{ user.phoneNumber || '-' }}</td>
                <td class="py-3 px-4">
                  <span :class="user.isActive ? 'badge-success' : 'badge-danger'">
                    {{ user.isActive ? $t('users.active') : $t('users.inactive') }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span :class="user.emailConfirmed ? 'badge-success' : 'badge-warning'">
                    {{ user.emailConfirmed ? $t('users.confirmed') : $t('users.pending') }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center justify-end ltr:justify-end rtl:justify-start gap-2">
                    <button
                      @click="openHistoryModal(user)"
                      class="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded transition-colors"
                      :title="$t('users.activityHistory')"
                    >
                      <ClockIcon class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </button>
                    <button
                      @click="openEditModal(user)"
                      class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                      :title="$t('users.editUser')"
                    >
                      <PencilSquareIcon class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      @click="openRolesModal(user)"
                      class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                      :title="$t('users.assignRoles')"
                    >
                      <ShieldCheckIcon class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      @click="openPasswordModal(user)"
                      class="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded transition-colors"
                      :title="$t('users.setPassword')"
                    >
                      <KeyIcon class="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </button>
                    <button
                      @click="toggleStatus(user)"
                      class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                      :title="user.isActive ? $t('users.deactivate') : $t('users.activate')"
                    >
                      <component :is="user.isActive ? 'NoSymbolIcon' : 'CheckCircleIcon'"
                                 class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      @click="handleDeleteUser(user)"
                      class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      :title="$t('users.deleteUser')"
                    >
                      <TrashIcon class="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Worker Configs Tab -->
    <div v-if="activeTab === 'configs'">
      <div v-if="isLoadingConfigs" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>

      <div v-else>
        <!-- Configured Workers -->
        <div v-if="workerConfigs.length > 0" class="space-y-4 mb-6">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ $t('supervisor.configuredWorkers') }} ({{ workerConfigs.length }})
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div
              v-for="config in workerConfigs"
              :key="config.id"
              class="card p-4"
            >
              <!-- Header with Avatar, Name -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <span class="text-primary-600 dark:text-primary-400 font-medium">
                      {{ config.userName?.charAt(0) || '?' }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ config.userName }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ config.userEmail }}</p>
                  </div>
                </div>
              </div>

              <!-- Services -->
              <div class="flex flex-wrap gap-1 mb-3">
                <span
                  v-if="config.canDoConfirmation"
                  class="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                >
                  {{ $t('worker.confirmation') }}
                </span>
                <span
                  v-if="config.canDoSuivi"
                  class="px-2 py-0.5 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded"
                >
                  {{ $t('worker.suivi') }}
                </span>
                <span
                  v-if="config.canDoQuality"
                  class="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded"
                >
                  {{ $t('worker.quality') }}
                </span>
                <span
                  v-if="config.canDoCallback"
                  class="px-2 py-0.5 text-xs bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 rounded"
                >
                  {{ $t('worker.callbacks') }}
                </span>
              </div>

              <!-- Priority -->
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {{ $t('supervisor.priority') }}: {{ config.autoAssignPriority || 100 }}
              </div>

              <!-- Edit Button -->
              <button
                @click="openEditConfigModal(config)"
                class="w-full btn-secondary text-sm py-1.5"
              >
                <PencilSquareIcon class="w-4 h-4 mr-1" />
                {{ $t('common.edit') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Unconfigured Users -->
        <div v-if="availableUsersForConfig.length > 0">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {{ $t('supervisor.unconfiguredUsers') }} ({{ availableUsersForConfig.length }})
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="user in availableUsersForConfig"
              :key="user.id"
              class="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span class="text-gray-500 dark:text-gray-400 font-medium">
                    {{ user.firstName?.charAt(0) || '?' }}{{ user.lastName?.charAt(0) || '' }}
                  </span>
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ user.firstName }} {{ user.lastName }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 mb-3">
                <ExclamationTriangleIcon class="w-4 h-4" />
                {{ $t('supervisor.notConfigured') }}
              </div>
              <button
                @click="openCreateConfigModalForUser(user)"
                class="w-full btn-primary text-sm py-1.5"
              >
                <PlusIcon class="w-4 h-4 mr-1" />
                {{ $t('supervisor.configure') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="workerConfigs.length === 0 && availableUsersForConfig.length === 0" class="text-center py-8">
          <UserGroupIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400">{{ $t('supervisor.noWorkers') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  PencilSquareIcon,
  TrashIcon,
  KeyIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import {
  useUsersService,
  useWorkerServiceConfigsService,
  type UserDetailsDto,
  type WorkerServiceConfigDto
} from '~/services'
import CreateUserModal from '~/components/user/CreateUserModal.vue'
import AssignRolesModal from '~/components/user/AssignRolesModal.vue'
import EditUserModal from '~/components/user/EditUserModal.vue'
import SetPasswordModal from '~/components/user/SetPasswordModal.vue'
import UserHistoryModal from '~/components/user/UserHistoryModal.vue'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Users.View'
})

const { t } = useI18n()
const { notify } = useNotification()
const {
  users,
  isLoading,
  toggleStatus: toggleUserStatus,
  remove: deleteUser,
  invalidate: fetchUsers
} = useUsersService()

const workerConfigsService = useWorkerServiceConfigsService({ fetchAll: true })

// Active tab
const activeTab = ref<'users' | 'configs'>('users')

// State
const showCreateModal = ref(false)
const showRolesModal = ref(false)
const showEditModal = ref(false)
const showPasswordModal = ref(false)
const showHistoryModal = ref(false)
const selectedUser = ref<UserDetailsDto | null>(null)
const searchQuery = ref('')
const statusFilter = ref('all')
const emailFilter = ref('all')

// Worker config state
const showConfigModal = ref(false)
const selectedConfig = ref<WorkerServiceConfigDto | null>(null)
const selectedUserForConfig = ref<UserDetailsDto | null>(null)

// Worker configs
const workerConfigs = computed(() => workerConfigsService.items.value)
const isLoadingConfigs = computed(() => workerConfigsService.isLoading.value)

// Active users (for config selection)
const activeUsers = computed(() => (users.value ?? []).filter((u: UserDetailsDto) => u.isActive))

// Configured user IDs
const configuredUserIds = computed(() => workerConfigs.value.map(c => c.userId ?? '').filter(id => id !== '') as string[])

// Users available for configuration (active users not yet configured)
const availableUsersForConfig = computed(() =>
  activeUsers.value.filter((u: UserDetailsDto) => !configuredUserIds.value.includes(u.id))
)

// Computed stats from users list
const stats = computed(() => {
  const list = users.value ?? []
  return {
    total: list.length,
    active: list.filter(u => u.isActive).length,
    inactive: list.filter(u => !u.isActive).length,
    emailConfirmed: list.filter(u => u.emailConfirmed).length
  }
})

const filteredUsers = computed(() => {
  let filtered = users.value ?? []

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.userName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
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

// User Handlers
const closeCreateModal = () => {
  showCreateModal.value = false
}

const handleUserCreated = async () => {
  await fetchUsers()
  closeCreateModal()
}

const openRolesModal = (user: UserDetailsDto) => {
  selectedUser.value = user
  showRolesModal.value = true
}

const closeRolesModal = () => {
  showRolesModal.value = false
  selectedUser.value = null
}

const handleRolesUpdated = async () => {
  closeRolesModal()
}

const openEditModal = (user: UserDetailsDto) => {
  selectedUser.value = user
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedUser.value = null
}

const handleUserUpdated = async () => {
  closeEditModal()
}

const openPasswordModal = (user: UserDetailsDto) => {
  selectedUser.value = user
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  selectedUser.value = null
}

const handlePasswordUpdated = async () => {
  closePasswordModal()
}

const openHistoryModal = (user: UserDetailsDto) => {
  selectedUser.value = user
  showHistoryModal.value = true
}

const closeHistoryModal = () => {
  showHistoryModal.value = false
  selectedUser.value = null
}

const handleDeleteUser = async (user: UserDetailsDto) => {
  if (confirm(t('users.confirmDelete', { name: `${user.firstName} ${user.lastName}` }))) {
    try {
      await deleteUser(user.id!)
      notify({ type: 'success', message: t('users.deleteSuccess') })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('users.deleteFailed') })
    }
  }
}

const toggleStatus = async (user: UserDetailsDto) => {
  const action = user.isActive ? 'deactivate' : 'activate'
  if (confirm(t('users.confirmToggle', { action, name: `${user.firstName} ${user.lastName}` }))) {
    try {
      await toggleUserStatus({ userId: user.id!, activateUser: !user.isActive })
      notify({ type: 'success', message: t('users.toggleSuccess', { action }) })
    } catch (error: any) {
      notify({ type: 'error', message: error.message || t('users.toggleFailed', { action }) })
    }
  }
}

// Worker Config Handlers
const openCreateConfigModalForUser = (user: UserDetailsDto) => {
  selectedConfig.value = null
  selectedUserForConfig.value = user
  showConfigModal.value = true
}

const openEditConfigModal = (config: WorkerServiceConfigDto) => {
  selectedConfig.value = config
  selectedUserForConfig.value = null
  showConfigModal.value = true
}

const handleConfigCreated = async () => {
  await workerConfigsService.refetchAll()
}

const handleConfigUpdated = async () => {
  await workerConfigsService.refetchAll()
}
</script>
