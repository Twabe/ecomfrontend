<template>
  <aside class="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
    <!-- Logo/Brand -->
    <div class="p-6 border-b border-gray-800">
      <h1 class="text-2xl font-bold">Admin Panel</h1>
      <p class="text-xs text-gray-400 mt-1">Super Admin</p>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-2">
      <!-- Dashboard -->
      <NuxtLink
        to="/super-admin"
        class="nav-item"
        :class="{ 'active': isActive('/super-admin') }"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Dashboard</span>
      </NuxtLink>

      <!-- Tenants -->
      <div>
        <button
          @click="toggleSection('tenants')"
          class="nav-item w-full"
          :class="{ 'active': isActive('/super-admin/tenants') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>Tenants</span>
          <svg
            class="w-4 h-4 ml-auto transition-transform"
            :class="{ 'rotate-180': expandedSections.tenants }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Tenants Submenu -->
        <div v-show="expandedSections.tenants" class="ml-6 mt-2 space-y-1">
          <NuxtLink
            to="/super-admin/tenants"
            class="nav-subitem"
            :class="{ 'active': isActive('/super-admin/tenants') }"
          >
            All Tenants
          </NuxtLink>
          <NuxtLink
            to="/super-admin/tenants/create"
            class="nav-subitem"
            :class="{ 'active': isActive('/super-admin/tenants/create') }"
          >
            Create Tenant
          </NuxtLink>
        </div>
      </div>

      <!-- Users -->
      <NuxtLink
        to="/super-admin/users"
        class="nav-item"
        :class="{ 'active': isActive('/super-admin/users') }"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span>Users</span>
      </NuxtLink>

      <!-- Roles -->
      <NuxtLink
        to="/super-admin/roles"
        class="nav-item"
        :class="{ 'active': isActive('/super-admin/roles') }"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Roles</span>
      </NuxtLink>

      <!-- Delivery Providers -->
      <NuxtLink
        to="/super-admin/delivery-providers"
        class="nav-item"
        :class="{ 'active': isActive('/super-admin/delivery-providers') }"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
        <span>Delivery Providers</span>
      </NuxtLink>

      <!-- City Mappings -->
      <NuxtLink
        to="/super-admin/city-mappings"
        class="nav-item"
        :class="{ 'active': isActive('/super-admin/city-mappings') }"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>City Mappings</span>
      </NuxtLink>

      <!-- System -->
      <div>
        <button
          @click="toggleSection('system')"
          class="nav-item w-full"
          :class="{ 'active': isActive('/super-admin/system') }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
          <span>System</span>
          <svg
            class="w-4 h-4 ml-auto transition-transform"
            :class="{ 'rotate-180': expandedSections.system }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- System Submenu -->
        <div v-show="expandedSections.system" class="ml-6 mt-2 space-y-1">
          <NuxtLink
            to="/super-admin/system/settings"
            class="nav-subitem"
            :class="{ 'active': isActive('/super-admin/system/settings') }"
          >
            Settings
          </NuxtLink>
          <NuxtLink
            to="/super-admin/system/logs"
            class="nav-subitem"
            :class="{ 'active': isActive('/super-admin/system/logs') }"
          >
            Logs
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- User Section -->
    <div class="p-4 border-t border-gray-800">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
          <span class="text-sm font-bold">{{ userInitials }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">{{ user?.userName }}</p>
          <p class="text-xs text-gray-400 truncate">{{ user?.email }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const { user } = useAuth()

const expandedSections = ref({
  tenants: true,
  system: false
})

const isActive = (path: string) => {
  if (path === '/super-admin') {
    return route.path === path
  }
  return route.path.startsWith(path)
}

const toggleSection = (section: keyof typeof expandedSections.value) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const userInitials = computed(() => {
  if (!user.value) return 'SA'
  const firstName = user.value.firstName || user.value.userName || ''
  const lastName = user.value.lastName || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'SA'
})
</script>

<style scoped>
.nav-item {
  @apply flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200;
}

.nav-item.active {
  @apply bg-indigo-600 text-white;
}

.nav-subitem {
  @apply block px-4 py-2 rounded text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-200;
}

.nav-subitem.active {
  @apply bg-gray-800 text-white;
}
</style>
