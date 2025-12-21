<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <LayoutSuperAdminSidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <LayoutSuperAdminHeader />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Layout for Super Admin pages
</script>
