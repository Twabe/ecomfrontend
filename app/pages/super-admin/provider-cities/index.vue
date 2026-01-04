<!--
===================================================================================
ARCHITECTURE DOCUMENTATION - SUPER ADMIN PROVIDER CITIES MANAGEMENT
===================================================================================

🎯 PURPOSE:
This page allows Super Admin to manage the GLOBAL cities catalog for each
delivery provider (Ameex, ForceLog, Ozone, etc.).

📊 DATA MODEL:

  Super Admin manages:
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │  DeliveryProviderTemplate (ForceLog, Ameex, etc.)                          │
  │       │                                                                     │
  │       └──► ProviderCity (THIS PAGE MANAGES)                                │
  │               - Links template to our City table                           │
  │               - Stores ExternalCityId (provider's ID: "CAS", "123")        │
  │               - Stores DefaultFees (suggested shipping fees)               │
  │               - IsFromApi = true if synced from provider API               │
  └─────────────────────────────────────────────────────────────────────────────┘

📊 FEATURES:

1️⃣ SELECT PROVIDER:
   - Dropdown shows all DeliveryProviderTemplates
   - Selecting loads ProviderCity records for that template

2️⃣ ADD CITY MANUALLY:
   - Select from our City table
   - Enter external ID (what provider calls this city)
   - Set default fees (delivered, refused, canceled)

3️⃣ BULK IMPORT:
   - Paste CSV/JSON data to import multiple cities at once
   - Format: cityName, externalId, deliveredFee, refusedFee

4️⃣ SYNC FROM TENANT API:
   - Select a tenant who has connected to this provider
   - Use their credentials to fetch cities from provider API
   - Auto-match with our City table by name
   - Creates ProviderCity records with fees from API

📊 TENANT IMPACT:

When tenant connects to a provider:
  - They see cities from ProviderCity WHERE TemplateId = their connection's template
  - Default fees are copied to ShippingFees (tenant can customize)
  - This is managed globally here, shared by all tenants

===================================================================================
-->

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t('providerCities.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('providerCities.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Provider Selection -->
    <div class="card">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ $t('providerCities.selectProvider') }}
      </label>
      <select
        v-model="selectedTemplateId"
        class="w-full md:w-96 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">{{ $t('providerCities.selectProviderPlaceholder') }}</option>
        <option v-for="template in templates" :key="template.id" :value="template.id">
          {{ template.name }} ({{ template.code }})
        </option>
      </select>
    </div>

    <!-- Cities Management (when provider selected) -->
    <template v-if="selectedTemplateId">
      <!-- Actions Bar -->
      <div class="card">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ cities.length }} {{ $t('providerCities.citiesConfigured') }}
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              ({{ activeCities.length }} {{ $t('common.active') }})
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="showAddDialog = true"
              class="btn-primary flex items-center gap-2"
            >
              <PlusIcon class="w-4 h-4" />
              {{ $t('providerCities.addCity') }}
            </button>
            <button
              @click="showBulkImportDialog = true"
              class="btn-secondary flex items-center gap-2"
            >
              <ArrowUpTrayIcon class="w-4 h-4" />
              {{ $t('providerCities.bulkImport') }}
            </button>
            <button
              @click="openSyncFromTenantDialog"
              class="btn-secondary flex items-center gap-2"
              :disabled="isLoadingConnections"
            >
              <CloudArrowDownIcon class="w-4 h-4" :class="{ 'animate-spin': isLoadingConnections }" />
              {{ $t('providerCities.syncFromApi') }}
            </button>
            <button
              @click="refetch"
              class="btn-ghost flex items-center gap-2"
              :disabled="isFetching"
            >
              <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': isFetching }" />
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p class="mt-4 text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</p>
        </div>
      </div>

      <!-- Cities Table -->
      <div v-else class="card overflow-hidden p-0">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('providerCities.cityName') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('providerCities.externalId') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('providerCities.deliveredFee') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('providerCities.refusedFee') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('providerCities.canceledFee') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('common.status') }}
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('common.actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="!cities.length">
                <td colspan="7" class="px-6 py-12 text-center">
                  <MapPinIcon class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p class="text-gray-500 dark:text-gray-400">{{ $t('providerCities.noCities') }}</p>
                  <button
                    @click="showAddDialog = true"
                    class="mt-4 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                  >
                    {{ $t('providerCities.addFirstCity') }}
                  </button>
                </td>
              </tr>
              <tr
                v-for="city in cities"
                :key="city.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <MapPinIcon class="w-5 h-5 text-gray-400" />
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ city.cityName || city.externalCityName || '-' }}
                      </p>
                      <p v-if="city.externalCityName && city.cityName && city.externalCityName !== city.cityName" class="text-xs text-gray-500 dark:text-gray-400">
                        ({{ city.externalCityName }})
                      </p>
                      <p v-if="city.externalZone" class="text-xs text-gray-500 dark:text-gray-400">
                        {{ city.externalZone }}
                      </p>
                      <span v-if="!city.cityId" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        {{ $t('providerCities.notLinked') }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ city.externalCityId || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ formatCurrency(city.defaultDeliveredFee) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ formatCurrency(city.defaultRefusedFee) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ formatCurrency(city.defaultCanceledFee) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    @click="toggleCityActive(city)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors"
                    :class="city.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
                    :disabled="isUpdating"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="city.isActive ? 'bg-green-500' : 'bg-gray-400'" />
                    {{ city.isActive ? $t('common.active') : $t('common.inactive') }}
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="editCity(city)"
                      class="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      :title="$t('common.edit')"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="confirmDeleteCity(city)"
                      class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      :title="$t('common.delete')"
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
    </template>

    <!-- No Provider Selected -->
    <div v-else class="card flex flex-col items-center justify-center py-16">
      <TruckIcon class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ $t('providerCities.selectProviderFirst') }}
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ $t('providerCities.selectProviderDesc') }}
      </p>
    </div>

    <!-- Add/Edit City Dialog -->
    <TransitionRoot appear :show="showCityDialog" as="template">
      <Dialog as="div" @close="closeCityDialog" class="relative z-50">
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
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-lg transform rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ editingCity ? $t('providerCities.editCity') : $t('providerCities.addCity') }}
                </DialogTitle>

                <form @submit.prevent="saveCity" class="space-y-4">
                  <!-- City Selection (only for new) -->
                  <div v-if="!editingCity">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {{ $t('providerCities.city') }} *
                    </label>
                    <select
                      v-model="cityForm.cityId"
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      required
                    >
                      <option value="">{{ $t('providerCities.selectCity') }}</option>
                      <option v-for="city in availableCities" :key="city.id" :value="city.id">
                        {{ city.name }}
                      </option>
                    </select>
                  </div>

                  <!-- External City ID -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {{ $t('providerCities.externalCityId') }}
                    </label>
                    <input
                      v-model="cityForm.externalCityId"
                      type="text"
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      :placeholder="$t('providerCities.externalCityIdPlaceholder')"
                    />
                  </div>

                  <!-- External Zone -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {{ $t('providerCities.externalZone') }}
                    </label>
                    <input
                      v-model="cityForm.externalZone"
                      type="text"
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      :placeholder="$t('providerCities.externalZonePlaceholder')"
                    />
                  </div>

                  <!-- Fees Grid -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ $t('providerCities.deliveredFee') }}
                      </label>
                      <input
                        v-model.number="cityForm.defaultDeliveredFee"
                        type="number"
                        step="0.01"
                        class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ $t('providerCities.refusedFee') }}
                      </label>
                      <input
                        v-model.number="cityForm.defaultRefusedFee"
                        type="number"
                        step="0.01"
                        class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ $t('providerCities.canceledFee') }}
                      </label>
                      <input
                        v-model.number="cityForm.defaultCanceledFee"
                        type="number"
                        step="0.01"
                        class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ $t('providerCities.changedFee') }}
                      </label>
                      <input
                        v-model.number="cityForm.defaultChangedFee"
                        type="number"
                        step="0.01"
                        class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                  </div>

                  <!-- Active Status -->
                  <label class="flex items-center gap-2">
                    <input
                      v-model="cityForm.isActive"
                      type="checkbox"
                      class="rounded border-gray-300 dark:border-gray-600 text-indigo-600"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ $t('providerCities.isActive') }}</span>
                  </label>

                  <!-- Actions -->
                  <div class="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      @click="closeCityDialog"
                      class="btn-ghost"
                    >
                      {{ $t('common.cancel') }}
                    </button>
                    <button
                      type="submit"
                      class="btn-primary"
                      :disabled="isCreating || isUpdating"
                    >
                      <span v-if="isCreating || isUpdating" class="animate-spin mr-2">&#9696;</span>
                      {{ editingCity ? $t('common.save') : $t('common.add') }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Bulk Import Dialog -->
    <TransitionRoot appear :show="showBulkImportDialog" as="template">
      <Dialog as="div" @close="showBulkImportDialog = false; resetBulkImportForm()" class="relative z-50">
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
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-2xl transform rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {{ $t('providerCities.bulkImport') }}
                </DialogTitle>

                <div class="space-y-4">
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ $t('providerCities.bulkImportDesc') }}
                  </p>

                  <!-- Update Existing Option -->
                  <label class="flex items-center gap-2">
                    <input
                      v-model="bulkImportForm.updateExisting"
                      type="checkbox"
                      class="rounded border-gray-300 dark:border-gray-600 text-indigo-600"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ $t('providerCities.updateExisting') }}
                    </span>
                  </label>

                  <!-- Textarea for bulk data -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {{ $t('providerCities.citiesData') }}
                    </label>
                    <textarea
                      v-model="bulkImportForm.data"
                      rows="10"
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 font-mono text-sm"
                      :placeholder="$t('providerCities.bulkImportPlaceholder')"
                    />
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {{ $t('providerCities.bulkImportFormat') }}
                    </p>
                  </div>

                  <!-- Result (after import) -->
                  <div v-if="bulkImportResult" class="p-4 rounded-lg" :class="bulkImportResult.failed > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20'">
                    <p class="text-sm">
                      <span class="text-green-700 dark:text-green-300 font-medium">{{ bulkImportResult.created }} {{ $t('providerCities.created') }}</span>
                      <span v-if="bulkImportResult.updated > 0" class="ml-2 text-blue-700 dark:text-blue-300">{{ bulkImportResult.updated }} {{ $t('providerCities.updated') }}</span>
                      <span v-if="bulkImportResult.skipped > 0" class="ml-2 text-gray-700 dark:text-gray-300">{{ bulkImportResult.skipped }} {{ $t('providerCities.skipped') }}</span>
                      <span v-if="bulkImportResult.failed > 0" class="ml-2 text-red-700 dark:text-red-300">{{ bulkImportResult.failed }} {{ $t('providerCities.failed') }}</span>
                    </p>
                  </div>

                  <!-- Actions -->
                  <div class="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      @click="showBulkImportDialog = false; resetBulkImportForm()"
                      class="btn-ghost"
                    >
                      {{ $t('common.close') }}
                    </button>
                    <button
                      @click="executeBulkImport"
                      class="btn-primary"
                      :disabled="isBulkCreating || !bulkImportForm.data.trim()"
                    >
                      <span v-if="isBulkCreating" class="animate-spin mr-2">&#9696;</span>
                      {{ $t('providerCities.import') }}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Delete Confirmation Dialog -->
    <TransitionRoot appear :show="showDeleteDialog" as="template">
      <Dialog as="div" @close="showDeleteDialog = false" class="relative z-50">
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
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <div class="flex items-center gap-4 mb-4">
                  <div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <ExclamationTriangleIcon class="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ $t('providerCities.deleteConfirmTitle') }}
                  </DialogTitle>
                </div>

                <p class="text-gray-600 dark:text-gray-400 mb-6">
                  {{ $t('providerCities.deleteConfirmMessage', { city: cityToDelete?.cityName }) }}
                </p>

                <div class="flex justify-end gap-3">
                  <button
                    type="button"
                    @click="showDeleteDialog = false"
                    class="btn-ghost"
                  >
                    {{ $t('common.cancel') }}
                  </button>
                  <button
                    @click="deleteCity"
                    class="btn-danger"
                    :disabled="isDeleting"
                  >
                    <span v-if="isDeleting" class="animate-spin mr-2">&#9696;</span>
                    {{ $t('common.delete') }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Sync from Tenant Dialog -->
    <TransitionRoot appear :show="showSyncDialog" as="template">
      <Dialog as="div" @close="closeSyncDialog" class="relative z-50">
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
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-lg transform rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <CloudArrowDownIcon class="w-6 h-6 text-indigo-600" />
                  {{ $t('providerCities.syncFromApiTitle') }}
                </DialogTitle>

                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {{ $t('providerCities.syncFromApiDesc') }}
                </p>

                <!-- No connections available -->
                <div v-if="!tenantConnections.length && !isLoadingConnections" class="text-center py-8">
                  <ExclamationTriangleIcon class="w-12 h-12 text-amber-400 mx-auto mb-4" />
                  <p class="text-gray-600 dark:text-gray-400">
                    {{ $t('providerCities.noConnectionsForSync') }}
                  </p>
                </div>

                <!-- Connection selection -->
                <div v-else class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {{ $t('providerCities.selectConnection') }}
                    </label>
                    <select
                      v-model="syncForm.connectionId"
                      class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      :disabled="isLoadingConnections"
                    >
                      <option value="">{{ $t('providerCities.selectConnectionPlaceholder') }}</option>
                      <option v-for="conn in tenantConnections" :key="conn.connectionId" :value="conn.connectionId">
                        {{ conn.displayName }}
                      </option>
                    </select>
                  </div>

                  <!-- Update existing option -->
                  <label class="flex items-center gap-2">
                    <input
                      v-model="syncForm.updateExisting"
                      type="checkbox"
                      class="rounded border-gray-300 dark:border-gray-600 text-indigo-600"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ $t('providerCities.updateExisting') }}
                    </span>
                  </label>

                  <!-- Sync Result -->
                  <div v-if="syncResult" class="p-4 rounded-lg" :class="syncResult.failed > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20'">
                    <p class="text-sm font-medium mb-2">
                      {{ $t('providerCities.syncResultFrom', { source: syncResult.sourceTenantName }) }}
                    </p>
                    <p class="text-sm">
                      <span class="text-green-700 dark:text-green-300 font-medium">{{ syncResult.created }} {{ $t('providerCities.created') }}</span>
                      <span v-if="syncResult.updated > 0" class="ml-2 text-blue-700 dark:text-blue-300">{{ syncResult.updated }} {{ $t('providerCities.updated') }}</span>
                      <span v-if="syncResult.skipped > 0" class="ml-2 text-gray-700 dark:text-gray-300">{{ syncResult.skipped }} {{ $t('providerCities.skipped') }}</span>
                      <span v-if="syncResult.failed > 0" class="ml-2 text-red-700 dark:text-red-300">{{ syncResult.failed }} {{ $t('providerCities.failed') }}</span>
                    </p>
                    <div v-if="syncResult.errors?.length" class="mt-2 text-xs text-red-600 dark:text-red-400 max-h-32 overflow-y-auto">
                      <p v-for="(error, idx) in syncResult.errors.slice(0, 5)" :key="idx">{{ error }}</p>
                      <p v-if="syncResult.errors.length > 5" class="italic">
                        {{ $t('providerCities.andMoreErrors', { count: syncResult.errors.length - 5 }) }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    @click="closeSyncDialog"
                    class="btn-ghost"
                  >
                    {{ $t('common.close') }}
                  </button>
                  <button
                    v-if="tenantConnections.length"
                    @click="executeSyncFromTenant"
                    class="btn-primary"
                    :disabled="isSyncing || !syncForm.connectionId"
                  >
                    <span v-if="isSyncing" class="animate-spin mr-2">&#9696;</span>
                    {{ $t('providerCities.syncNow') }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import {
  PlusIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  MapPinIcon,
  TruckIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CloudArrowDownIcon,
} from '@heroicons/vue/24/outline'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'
import { useDeliveryProviderTemplatesService, useProviderCitiesService, useCitiesService } from '~/services'
import type { ProviderCityDto2, CreateProviderCityRequest, UpdateProviderCityRequest, BulkCreateResult } from '~/services'
import {
  useAdminProviderCitiesGetConnectionsForSync,
  useAdminProviderCitiesSyncFromTenant,
} from '~/api/generated/endpoints/admin-provider-cities/admin-provider-cities'
import type { SyncProviderCitiesFromTenantRequest } from '~/api/generated/models'

definePageMeta({
  layout: 'super-admin',
  middleware: ['auth', 'super-admin'],
})

const { t } = useI18n()
const { success: notifySuccess, error: notifyError } = useNotification()

// Services
const templatesService = useDeliveryProviderTemplatesService()
const citiesService = useCitiesService()
const { templates } = templatesService

// Selected template
const selectedTemplateId = ref<string>('')

// Provider Cities Service (reactive to selected template)
const providerCitiesService = useProviderCitiesService(selectedTemplateId)
const {
  cities,
  activeCities,
  isLoading,
  isFetching,
  isCreating,
  isUpdating,
  isDeleting,
  isBulkCreating,
  create,
  update,
  remove,
  bulkCreate,
  toggleActive,
  refetch,
} = providerCitiesService

// System cities for dropdown
const { items: systemCities } = citiesService

// Available cities (not yet mapped)
const availableCities = computed(() => {
  const mappedCityIds = new Set(cities.value.map(c => c.cityId))
  return systemCities.value.filter(c => !mappedCityIds.has(c.id))
})

// Dialogs
const showAddDialog = ref(false)
const showCityDialog = computed({
  get: () => showAddDialog.value || !!editingCity.value,
  set: (val) => {
    if (!val) {
      showAddDialog.value = false
      editingCity.value = null
    }
  },
})
const showBulkImportDialog = ref(false)
const showDeleteDialog = ref(false)

// Form state
const editingCity = ref<ProviderCityDto2 | null>(null)
const cityToDelete = ref<ProviderCityDto2 | null>(null)

const cityForm = reactive({
  cityId: '',
  externalCityId: '',
  externalCityName: '',
  externalZone: '',
  defaultDeliveredFee: null as number | null,
  defaultRefusedFee: null as number | null,
  defaultCanceledFee: null as number | null,
  defaultChangedFee: null as number | null,
  isActive: true,
})

const bulkImportForm = reactive({
  data: '',
  updateExisting: false,
})
const bulkImportResult = ref<BulkCreateResult | null>(null)

// Sync from Tenant state
const showSyncDialog = ref(false)
const syncForm = reactive({
  connectionId: '',
  updateExisting: false,
})
const syncResult = ref<{
  created: number
  updated: number
  skipped: number
  failed: number
  errors?: string[]
  sourceTenantName?: string
} | null>(null)

// Fetch tenant connections for sync
const connectionsQuery = useAdminProviderCitiesGetConnectionsForSync(
  selectedTemplateId,
  { query: { enabled: computed(() => !!selectedTemplateId.value && showSyncDialog.value) } }
)
const tenantConnections = computed(() => connectionsQuery.data.value ?? [])
const isLoadingConnections = computed(() => connectionsQuery.isLoading.value)

// Sync mutation
const syncMutation = useAdminProviderCitiesSyncFromTenant()
const isSyncing = computed(() => syncMutation.isPending.value)

// Methods
const resetCityForm = () => {
  cityForm.cityId = ''
  cityForm.externalCityId = ''
  cityForm.externalCityName = ''
  cityForm.externalZone = ''
  cityForm.defaultDeliveredFee = null
  cityForm.defaultRefusedFee = null
  cityForm.defaultCanceledFee = null
  cityForm.defaultChangedFee = null
  cityForm.isActive = true
}

const editCity = (city: ProviderCityDto2) => {
  editingCity.value = city
  cityForm.cityId = city.cityId || ''
  cityForm.externalCityId = city.externalCityId || ''
  cityForm.externalCityName = city.externalCityName || ''
  cityForm.externalZone = city.externalZone || ''
  cityForm.defaultDeliveredFee = city.defaultDeliveredFee ?? null
  cityForm.defaultRefusedFee = city.defaultRefusedFee ?? null
  cityForm.defaultCanceledFee = city.defaultCanceledFee ?? null
  cityForm.defaultChangedFee = city.defaultChangedFee ?? null
  cityForm.isActive = city.isActive ?? true
}

const closeCityDialog = () => {
  showAddDialog.value = false
  editingCity.value = null
  resetCityForm()
}

const saveCity = async () => {
  try {
    if (editingCity.value) {
      const data: UpdateProviderCityRequest = {
        id: editingCity.value.id!,
        externalCityId: cityForm.externalCityId || undefined,
        externalCityName: cityForm.externalCityName || undefined,
        externalZone: cityForm.externalZone || undefined,
        defaultDeliveredFee: cityForm.defaultDeliveredFee,
        defaultRefusedFee: cityForm.defaultRefusedFee,
        defaultCanceledFee: cityForm.defaultCanceledFee,
        defaultChangedFee: cityForm.defaultChangedFee,
        isActive: cityForm.isActive,
      }
      await update(editingCity.value.id!, data)
      notifySuccess(t('providerCities.cityUpdated'))
    } else {
      const data: CreateProviderCityRequest = {
        cityId: cityForm.cityId,
        externalCityId: cityForm.externalCityId || undefined,
        externalCityName: cityForm.externalCityName || undefined,
        externalZone: cityForm.externalZone || undefined,
        defaultDeliveredFee: cityForm.defaultDeliveredFee,
        defaultRefusedFee: cityForm.defaultRefusedFee,
        defaultCanceledFee: cityForm.defaultCanceledFee,
        defaultChangedFee: cityForm.defaultChangedFee,
        isActive: cityForm.isActive,
      }
      await create(data)
      notifySuccess(t('providerCities.cityAdded'))
    }
    closeCityDialog()
  } catch (error: any) {
    notifyError(error.message || t('common.error'))
  }
}

const toggleCityActive = async (city: ProviderCityDto2) => {
  try {
    await toggleActive(city.id!, !city.isActive)
    notifySuccess(city.isActive ? t('providerCities.cityDeactivated') : t('providerCities.cityActivated'))
  } catch (error: any) {
    notifyError(error.message || t('common.error'))
  }
}

const confirmDeleteCity = (city: ProviderCityDto2) => {
  cityToDelete.value = city
  showDeleteDialog.value = true
}

const deleteCity = async () => {
  if (!cityToDelete.value) return
  try {
    await remove(cityToDelete.value.id!)
    notifySuccess(t('providerCities.cityDeleted'))
    showDeleteDialog.value = false
    cityToDelete.value = null
  } catch (error: any) {
    notifyError(error.message || t('common.error'))
  }
}

const resetBulkImportForm = () => {
  bulkImportForm.data = ''
  bulkImportForm.updateExisting = false
  bulkImportResult.value = null
}

const executeBulkImport = async () => {
  try {
    // Parse the bulk data (simple format: cityName,externalId,deliveredFee,refusedFee per line)
    const lines = bulkImportForm.data.trim().split('\n').filter(l => l.trim())

    if (lines.length === 0) {
      notifyError(t('providerCities.noDataToImport'))
      return
    }

    const parseErrors: string[] = []
    const items = lines.map((line, index) => {
      const parts = line.split(',').map(s => s.trim())

      // Validate minimum columns (at least city name)
      if (parts.length < 1 || !parts[0]) {
        parseErrors.push(t('providerCities.parseErrorLine', { line: index + 1, error: t('providerCities.missingCityName') }))
        return null
      }

      const [cityName, externalId, deliveredFee, refusedFee] = parts

      // Find city by name
      const city = systemCities.value.find(c => c.name?.toLowerCase() === cityName.toLowerCase())
      if (!city) {
        parseErrors.push(t('providerCities.parseErrorLine', { line: index + 1, error: t('providerCities.cityNotFound', { city: cityName }) }))
        return null
      }

      // Validate fee formats if provided
      const parsedDeliveredFee = deliveredFee ? parseFloat(deliveredFee) : undefined
      const parsedRefusedFee = refusedFee ? parseFloat(refusedFee) : undefined

      if (deliveredFee && isNaN(parsedDeliveredFee!)) {
        parseErrors.push(t('providerCities.parseErrorLine', { line: index + 1, error: t('providerCities.invalidDeliveredFee') }))
        return null
      }
      if (refusedFee && isNaN(parsedRefusedFee!)) {
        parseErrors.push(t('providerCities.parseErrorLine', { line: index + 1, error: t('providerCities.invalidRefusedFee') }))
        return null
      }

      return {
        cityId: city.id!,
        externalCityId: externalId || undefined,
        defaultDeliveredFee: parsedDeliveredFee,
        defaultRefusedFee: parsedRefusedFee,
      }
    }).filter((item): item is NonNullable<typeof item> => item !== null)

    // Show parse errors if any
    if (parseErrors.length > 0) {
      notifyError(parseErrors.slice(0, 3).join('\n') + (parseErrors.length > 3 ? `\n... ${t('providerCities.andMoreErrors', { count: parseErrors.length - 3 })}` : ''))
      return
    }

    if (items.length === 0) {
      notifyError(t('providerCities.noValidCities'))
      return
    }

    const result = await bulkCreate({
      items,
      updateExisting: bulkImportForm.updateExisting,
    })
    bulkImportResult.value = result
    notifySuccess(t('providerCities.bulkImportSuccess', { count: result.created }))

    // Reset form data after successful import
    bulkImportForm.data = ''
  } catch (error: any) {
    notifyError(error.message || t('common.error'))
  }
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-'
  return `${value.toFixed(2)} DH`
}

// Sync from Tenant methods
const openSyncFromTenantDialog = () => {
  syncForm.connectionId = ''
  syncForm.updateExisting = false
  syncResult.value = null
  showSyncDialog.value = true
  // Refetch connections when dialog opens
  connectionsQuery.refetch()
}

const closeSyncDialog = () => {
  showSyncDialog.value = false
  syncForm.connectionId = ''
  syncForm.updateExisting = false
  syncResult.value = null
}

const executeSyncFromTenant = async () => {
  if (!syncForm.connectionId || !selectedTemplateId.value) return

  try {
    const request: SyncProviderCitiesFromTenantRequest = {
      templateId: selectedTemplateId.value,
      connectionId: syncForm.connectionId,
      updateExisting: syncForm.updateExisting,
    }

    const result = await syncMutation.mutateAsync({
      templateId: selectedTemplateId.value,
      data: request,
    })

    syncResult.value = result
    notifySuccess(t('providerCities.syncSuccess', { created: result.created, updated: result.updated }))

    // Refresh cities list
    refetch()
  } catch (error: any) {
    notifyError(error?.response?.data?.message || error?.message || t('common.error'))
  }
}
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700;
}

.btn-primary {
  @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.btn-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.btn-ghost {
  @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.btn-danger {
  @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}
</style>
