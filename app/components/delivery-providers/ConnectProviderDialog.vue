<template>
  <TransitionRoot :show="modelValue" as="template">
    <Dialog as="div" class="relative z-50" @close="handleClose">
      <TransitionChild
        enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl">
              <!-- Header -->
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    {{ $t('deliveryProviders.connectWith', { name: template?.name }) }}
                  </DialogTitle>
                  <button
                    type="button"
                    class="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    @click="handleClose"
                  >
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <!-- Content -->
              <form @submit.prevent="handleSubmit">
                <div class="px-6 py-6 space-y-6">
                  <!-- Store Selector -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {{ $t('deliveryProviders.store') }} *
                    </label>
                    <select
                      v-model="formData.storeId"
                      class="input w-full"
                      required
                    >
                      <option :value="null">{{ $t('deliveryProviders.allStores') }}</option>
                      <option v-for="store in stores" :key="store.id" :value="store.id">
                        {{ store.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Hub City Selector (from Provider Cities) - Searchable Autocomplete -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <div class="flex items-center gap-2">
                        <MapPinIcon class="w-4 h-4" />
                        {{ $t('deliveryProviders.hubCity') }}
                      </div>
                    </label>
                    <UiSearchableSelect
                      v-model="formData.hubCityId"
                      :options="hubCityOptions"
                      :placeholder="isLoadingCities ? $t('common.loading') : $t('deliveryProviders.searchHubCity', 'Rechercher une ville...')"
                      :disabled="isLoadingCities"
                    />
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {{ $t('deliveryProviders.hubCityHelp') }}
                    </p>
                    <p v-if="linkedTemplateCities.length === 0 && !isLoadingCities" class="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      {{ $t('deliveryProviders.noCitiesLinked', 'No cities linked yet. Ask Super Admin to link provider cities to local cities.') }}
                    </p>
                  </div>

                  <!-- Dynamic Credential Fields -->
                  <div
                    v-for="field in template?.credentialSchema"
                    :key="field.name"
                    class="w-full"
                    :class="getFieldContainerClass(field)"
                  >
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {{ field.label }} {{ field.required ? '*' : '' }}
                    </label>
                    <input
                      v-if="field.type === 'password'"
                      v-model="formData.credentials[field.name!]"
                      type="password"
                      class="input w-full"
                      :placeholder="field.placeholder || ''"
                      :required="field.required"
                    />
                    <input
                      v-else
                      v-model="formData.credentials[field.name!]"
                      type="text"
                      class="input w-full"
                      :placeholder="field.placeholder || ''"
                      :required="field.required"
                    />
                    <p v-if="field.helpText" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {{ field.helpText }}
                    </p>
                  </div>

                  <!-- Webhook Info (if provider has webhook) -->
                  <div v-if="template?.hasWebhook" class="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div class="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <InformationCircleIcon class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p class="text-sm font-medium text-blue-800 dark:text-blue-200">
                          {{ $t('deliveryProviders.webhookAvailableAfterConnect') }}
                        </p>
                        <p class="mt-1 text-xs text-blue-600 dark:text-blue-300">
                          {{ $t('deliveryProviders.webhookHelp') }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Connection Mode -->
                  <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {{ $t('deliveryProviders.connectionModeLabel') }}
                    </label>
                    <div class="flex flex-wrap gap-4">
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          v-model="formData.mode"
                          type="radio"
                          :value="ConnectionMode.Default"
                          class="w-4 h-4 text-primary-600"
                        />
                        <span class="text-sm text-gray-700 dark:text-gray-300">
                          {{ $t('deliveryProviders.connectionMode.default') }}
                        </span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          v-model="formData.mode"
                          type="radio"
                          :value="ConnectionMode.ByCity"
                          class="w-4 h-4 text-primary-600"
                        />
                        <span class="text-sm text-gray-700 dark:text-gray-300">
                          {{ $t('deliveryProviders.connectionMode.byCity') }}
                        </span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          v-model="formData.mode"
                          type="radio"
                          :value="ConnectionMode.ByProduct"
                          class="w-4 h-4 text-primary-600"
                        />
                        <span class="text-sm text-gray-700 dark:text-gray-300">
                          {{ $t('deliveryProviders.connectionMode.byProduct') }}
                        </span>
                      </label>
                    </div>
                  </div>

                  <!-- Copy Default Fees Option -->
                  <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <label class="flex items-center gap-3 cursor-pointer">
                      <input
                        v-model="formData.copyDefaultFees"
                        type="checkbox"
                        class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <div>
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {{ $t('deliveryProviders.copyDefaultFees') }}
                        </span>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('deliveryProviders.copyDefaultFeesHelp') }}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Footer -->
                <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    class="btn-secondary"
                    @click="handleClose"
                  >
                    {{ $t('common.close') }}
                  </button>
                  <button
                    type="submit"
                    class="btn-primary flex items-center gap-2"
                    :disabled="isConnecting"
                  >
                    <div v-if="isConnecting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <LinkIcon v-else class="w-4 h-4" />
                    {{ $t('deliveryProviders.connect') }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon, LinkIcon, InformationCircleIcon, MapPinIcon } from '@heroicons/vue/24/outline'
import { ConnectionMode } from '~/api/generated/models'
import type { DeliveryProviderTemplateDto, StoreDto, ConnectDeliveryProviderRequest, CredentialFieldDto } from '~/api/generated/models'
import { useDeliveryProviderTemplatesGetTemplateCities, type ProviderCityDto } from '~/api/generated/endpoints/delivery-provider-templates/delivery-provider-templates'

const props = defineProps<{
  modelValue: boolean
  template?: DeliveryProviderTemplateDto
  stores: StoreDto[]
  isConnecting?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'connect', data: ConnectDeliveryProviderRequest): void
}>()

// Fetch cities for the selected template (provider's cities, not local cities)
const templateId = computed(() => props.template?.id || '')
const { data: templateCities, isLoading: isLoadingCities } = useDeliveryProviderTemplatesGetTemplateCities(
  templateId,
  { isActive: true },
  { query: { enabled: computed(() => !!props.template?.id && props.modelValue) } }
)

// Filter to only cities that have been linked to a local city (have cityId)
// Show ALL provider cities (including zones/regions) - no deduplication
const linkedTemplateCities = computed(() => {
  return (templateCities.value || []).filter(city => city.cityId)
})

// Map provider city ID -> local city ID for submission
// Backend expects cityId (FK to City table), but we need unique IDs for the dropdown
const providerCityToCityIdMap = computed(() => {
  const map = new Map<string, string>()
  linkedTemplateCities.value.forEach(city => {
    if (city.id && city.cityId) {
      map.set(city.id, city.cityId)
    }
  })
  return map
})

// Convert to options format for UiSearchableSelect
// Use provider city ID (unique) as option id for proper filtering/display
// Display = externalCityName to show zones/regions for user clarity
const hubCityOptions = computed(() => {
  return linkedTemplateCities.value.map(city => ({
    id: city.id || '',  // Provider city ID (unique per zone)
    name: city.externalCityName || city.cityName || city.externalCityId || ''
  }))
})

// Form data
const formData = ref<{
  storeId: string | null
  hubCityId: string | null
  credentials: Record<string, string>
  mode: ConnectionMode
  priority: number
  notes: string | null
  copyDefaultFees: boolean
}>({
  storeId: null,
  hubCityId: null,
  credentials: {},
  mode: ConnectionMode.Default,
  priority: 1,
  notes: null,
  copyDefaultFees: true,
})

// Reset form when dialog opens with new template
watch(() => [props.modelValue, props.template], ([isOpen, template]) => {
  if (isOpen && template) {
    formData.value = {
      storeId: null,
      hubCityId: null,
      credentials: {},
      mode: ConnectionMode.Default,
      priority: 1,
      notes: null,
      copyDefaultFees: true,
    }
    // Initialize credential fields
    template.credentialSchema?.forEach((field: CredentialFieldDto) => {
      if (field.name) {
        formData.value.credentials[field.name] = field.defaultValue || ''
      }
    })
  }
}, { immediate: true })

// Get field container class based on field layout hints
const getFieldContainerClass = (field: CredentialFieldDto) => {
  // If we have 2+ fields of same row, use half width
  const schema = props.template?.credentialSchema || []
  const fieldIndex = schema.findIndex(f => f.name === field.name)
  const nextField = schema[fieldIndex + 1]

  // Simple heuristic: if two consecutive short fields, display side by side
  if (nextField && schema.length > 2) {
    return 'inline-block w-[calc(50%-0.5rem)] mr-2 align-top'
  }
  return ''
}

// Handle close
const handleClose = () => {
  if (!props.isConnecting) {
    emit('update:modelValue', false)
  }
}

// Handle submit
const handleSubmit = () => {
  if (!props.template?.id) return

  // Map provider city ID (from dropdown) to local city ID (what backend expects)
  // formData.hubCityId contains provider city ID, we need to convert to local cityId
  const localCityId = formData.value.hubCityId
    ? providerCityToCityIdMap.value.get(formData.value.hubCityId) || null
    : null

  const data: ConnectDeliveryProviderRequest = {
    templateId: props.template.id,
    storeId: formData.value.storeId,
    displayName: props.template.name,
    credentials: formData.value.credentials,
    mode: formData.value.mode,
    priority: formData.value.priority,
    notes: formData.value.notes,
    hubCityId: localCityId,  // Send local city ID to backend
    copyDefaultFees: formData.value.copyDefaultFees,
  }

  emit('connect', data)
}
</script>

<style scoped>
.input {
  @apply block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
         text-gray-900 placeholder-gray-400
         focus:border-primary-500 focus:ring-1 focus:ring-primary-500
         dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
         dark:focus:border-primary-400 dark:focus:ring-primary-400;
}

.btn-primary {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg font-medium
         hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
         disabled:opacity-50 disabled:cursor-not-allowed
         dark:focus:ring-offset-gray-800;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium bg-white
         hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
         disabled:opacity-50 disabled:cursor-not-allowed
         dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700
         dark:focus:ring-offset-gray-800;
}
</style>
