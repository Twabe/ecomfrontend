<template>
  <header class="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between h-full px-4">
      <!-- Left Side -->
      <div class="flex items-center gap-4">
        <!-- Mobile Menu Button -->
        <button
          @click="$emit('toggle-mobile-menu')"
          class="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Bars3Icon class="w-6 h-6" />
        </button>

        <!-- Sidebar Toggle (Desktop) -->
        <button
          @click="$emit('toggle-sidebar')"
          class="hidden lg:flex p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Bars3Icon class="w-6 h-6" />
        </button>

        <!-- Page Title / Breadcrumb -->
        <div class="hidden sm:block">
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ pageTitle }}
          </h1>
        </div>
      </div>

      <!-- Right Side -->
      <div class="flex items-center gap-2">
        <!-- Language Switcher -->
        <Menu as="div" class="relative">
          <MenuButton class="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
            <GlobeAltIcon class="w-5 h-5" />
            <span class="hidden sm:inline text-sm font-medium">{{ currentLanguage.name }}</span>
            <ChevronDownIcon class="w-4 h-4" />
          </MenuButton>
          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none">
              <div class="py-1">
                <MenuItem v-for="lang in languages" :key="lang.code" v-slot="{ active }">
                  <button
                    @click="switchLanguage(lang.code)"
                    class="w-full px-4 py-2 text-sm text-left flex items-center gap-2"
                    :class="[
                      active ? 'bg-gray-100 dark:bg-gray-700' : '',
                      locale === lang.code ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                    ]"
                  >
                    <span>{{ lang.flag }}</span>
                    <span>{{ lang.name }}</span>
                    <CheckIcon v-if="locale === lang.code" class="w-4 h-4 ml-auto" />
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </Transition>
        </Menu>

        <!-- Dark Mode Toggle -->
        <button
          @click="toggleDarkMode"
          class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          :title="isDark ? $t('settings.lightMode') : $t('settings.darkMode')"
        >
          <SunIcon v-if="isDark" class="w-5 h-5" />
          <MoonIcon v-else class="w-5 h-5" />
        </button>

        <!-- Notifications -->
        <button class="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
          <BellIcon class="w-5 h-5" />
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <!-- User Menu -->
        <Menu as="div" class="relative">
          <MenuButton class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">{{ userInitials }}</span>
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ user?.userName }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ user?.email }}</p>
            </div>
            <ChevronDownIcon class="hidden md:block w-4 h-4 text-gray-500" />
          </MenuButton>
          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none">
              <div class="py-1">
                <MenuItem v-slot="{ active }">
                  <NuxtLink
                    to="/dashboard/profile"
                    class="flex items-center gap-2 px-4 py-2 text-sm"
                    :class="active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'"
                  >
                    <UserCircleIcon class="w-5 h-5" />
                    {{ $t('nav.profile') }}
                  </NuxtLink>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <NuxtLink
                    to="/dashboard/settings"
                    class="flex items-center gap-2 px-4 py-2 text-sm"
                    :class="active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'"
                  >
                    <Cog6ToothIcon class="w-5 h-5" />
                    {{ $t('nav.settings') }}
                  </NuxtLink>
                </MenuItem>
                <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <MenuItem v-slot="{ active }">
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400"
                    :class="active ? 'bg-gray-100 dark:bg-gray-700' : ''"
                  >
                    <ArrowRightOnRectangleIcon class="w-5 h-5" />
                    {{ $t('auth.logout') }}
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  Bars3Icon,
  GlobeAltIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ChevronDownIcon,
  CheckIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

defineEmits<{
  'toggle-mobile-menu': []
  'toggle-sidebar': []
}>()

const { t, locale, setLocale } = useI18n()
const { user, logout } = useAuth()
const route = useRoute()

// Languages config
const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' }
]

const currentLanguage = computed(() => {
  return languages.find(l => l.code === locale.value) || languages[0]
})

const switchLanguage = async (code: string) => {
  await setLocale(code)
  localStorage.setItem('locale', code)

  // Update document direction for RTL
  document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
}

// Dark mode
const isDark = ref(false)

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// Initialize dark mode from localStorage
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }

  // Initialize locale direction
  if (locale.value === 'ar') {
    document.documentElement.dir = 'rtl'
  }
})

// Page title based on route
const pageTitle = computed(() => {
  const path = route.path

  if (path === '/dashboard') return t('nav.dashboard')
  if (path.includes('/orders')) return t('nav.orders')
  if (path.includes('/products')) return t('nav.products')
  if (path.includes('/customers')) return t('nav.customers')
  if (path.includes('/stocks')) return t('nav.stocks')
  if (path.includes('/purchases')) return t('nav.purchases')
  if (path.includes('/delivery')) return t('nav.delivery')
  if (path.includes('/payments')) return t('nav.payments')
  if (path.includes('/invoices')) return t('nav.invoices')
  if (path.includes('/expenses')) return t('nav.expenses')
  if (path.includes('/reports')) return t('nav.reports')
  if (path.includes('/settings')) return t('nav.settings')
  if (path.includes('/profile')) return t('nav.profile')

  return t('nav.dashboard')
})

// User initials
const userInitials = computed(() => {
  if (!user.value) return 'U'
  const firstName = user.value.firstName || user.value.userName || ''
  const lastName = user.value.lastName || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'
})

// Logout
const handleLogout = async () => {
  await logout()
  navigateTo('/auth/login')
}
</script>
