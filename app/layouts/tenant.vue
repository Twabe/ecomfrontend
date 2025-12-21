<template>
  <div :dir="direction" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Notification Toast -->
    <UiNotificationToast />

    <!-- Mobile Menu Overlay -->
    <TenantMobileMenu
      :is-open="isMobileMenuOpen"
      @close="isMobileMenuOpen = false"
    />

    <!-- Sidebar - Desktop -->
    <TenantSidebar
      :is-collapsed="isSidebarCollapsed"
      class="hidden lg:flex"
      @toggle="isSidebarCollapsed = !isSidebarCollapsed"
    />

    <!-- Main Content Area -->
    <div
      class="lg:transition-all lg:duration-300"
      :class="[
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64',
        direction === 'rtl' ? 'lg:ml-0' : '',
        direction === 'rtl' && !isSidebarCollapsed ? 'lg:mr-64' : '',
        direction === 'rtl' && isSidebarCollapsed ? 'lg:mr-20' : ''
      ]"
    >
      <!-- Header -->
      <TenantHeader
        @toggle-mobile-menu="isMobileMenuOpen = true"
        @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed"
      />

      <!-- Page Content -->
      <main class="p-4 md:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()

// Sidebar state
const isSidebarCollapsed = ref(false)
const isMobileMenuOpen = ref(false)

// RTL direction based on locale
const direction = computed(() => locale.value === 'ar' ? 'rtl' : 'ltr')

// Close mobile menu on route change
const route = useRoute()
watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})

// Handle resize - collapse sidebar on tablet
const handleResize = () => {
  if (window.innerWidth < 1024 && window.innerWidth >= 768) {
    isSidebarCollapsed.value = true
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
