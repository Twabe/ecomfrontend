<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Page Title / Breadcrumbs -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h1>
        <div class="flex items-center space-x-2 text-sm text-gray-600 mt-1">
          <NuxtLink to="/super-admin" class="hover:text-indigo-600">Home</NuxtLink>
          <span v-if="breadcrumbs.length > 0">/</span>
          <template v-for="(crumb, index) in breadcrumbs" :key="index">
            <NuxtLink
              v-if="crumb.to"
              :to="crumb.to"
              class="hover:text-indigo-600"
            >
              {{ crumb.label }}
            </NuxtLink>
            <span v-else>{{ crumb.label }}</span>
            <span v-if="index < breadcrumbs.length - 1">/</span>
          </template>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center space-x-4">
        <!-- Notifications (placeholder) -->
        <button class="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <!-- Notification badge -->
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <!-- User Menu -->
        <div class="relative">
          <button
            @click="toggleUserMenu"
            class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span class="text-sm font-bold text-white">{{ userInitials }}</span>
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium text-gray-900">{{ user?.userName }}</p>
              <p class="text-xs text-gray-500">Super Admin</p>
            </div>
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-show="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          >
            <NuxtLink
              to="/super-admin/profile"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="showUserMenu = false"
            >
              Profile
            </NuxtLink>
            <NuxtLink
              to="/super-admin/settings"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="showUserMenu = false"
            >
              Settings
            </NuxtLink>
            <hr class="my-1 border-gray-200">
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const { user, logout } = useAuth()

const showUserMenu = ref(false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showUserMenu.value = false
    }
  })
})

const handleLogout = async () => {
  await logout()
}

const userInitials = computed(() => {
  if (!user.value) return 'SA'
  const firstName = user.value.firstName || user.value.userName || ''
  const lastName = user.value.lastName || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'SA'
})

// Dynamic page title based on route
const pageTitle = computed(() => {
  const path = route.path
  if (path === '/super-admin') return 'Dashboard'
  if (path.includes('/tenants/create')) return 'Create Tenant'
  if (path.includes('/tenants')) return 'Tenants'
  if (path.includes('/users')) return 'Users'
  if (path.includes('/system')) return 'System'
  return 'Admin Panel'
})

// Breadcrumbs
const breadcrumbs = computed(() => {
  const path = route.path
  const crumbs: Array<{ label: string; to?: string }> = []

  if (path === '/super-admin') return []

  const segments = path.split('/').filter(s => s && s !== 'super-admin')

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1
    const to = isLast ? undefined : `/super-admin/${segments.slice(0, index + 1).join('/')}`

    crumbs.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
      to
    })
  })

  return crumbs
})
</script>
