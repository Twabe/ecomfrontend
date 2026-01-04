<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { customInstance } from '~/api/axios-instance'
import type { Order } from '~/types/order'
import { ServiceTypes, OrderPhase, OrderState } from '~/constants/order'

// ProviderCity DTO from backend
interface ProviderCityDto {
  id: string
  templateId: string
  templateName?: string | null
  cityId?: string | null
  cityName?: string | null
  externalCityId?: string | null
  externalCityName?: string | null
  externalZone?: string | null
  defaultDeliveredFee?: number | null
  defaultRefusedFee?: number | null
  isActive: boolean
}

interface DeliveryCompany {
  id: string
  name: string
}

// Fetch provider cities from DeliveryCompany
const fetchDeliveryCities = async (deliveryCompanyId: string): Promise<ProviderCityDto[]> => {
  try {
    const result = await customInstance<ProviderCityDto[]>({
      url: `/api/v1/deliverycompanies/${deliveryCompanyId}/cities`,
      method: 'GET'
    })
    return result || []
  } catch (error) {
    console.error('Failed to fetch delivery cities:', error)
    return []
  }
}

const props = defineProps<{
  show: boolean
  orders: Order[]
  deliveryCompanies: DeliveryCompany[]
}>()

const emit = defineEmits<{
  close: []
  confirm: [data: { orderIds: string[]; deliveryCompanyId: string; providerCityId?: string }]
}>()

const { t } = useI18n()

const deliveryCompanyId = ref('')
const providerCityId = ref('')
const isSubmitting = ref(false)

// Delivery cities for selected company (from ProviderCities)
const deliveryCities = ref<ProviderCityDto[]>([])
const isLoadingCities = ref(false)

// Convert to options format for UiSearchableSelect
const deliveryCitiesOptions = computed(() => {
  return deliveryCities.value.map(city => ({
    id: city.id || '',
    name: city.cityName || city.externalCityName || city.externalCityId || ''
  }))
})

// Filter orders that can have delivery assigned
const validOrders = computed(() => {
  return props.orders.filter(order => {
    const phase = order.phase?.toLowerCase()
    const state = order.state?.toLowerCase()
    // Block terminal states
    if ([OrderState.Cancelled, 'canceled', OrderState.Delivered, OrderState.Returned].includes(state || '')) return false
    // Only allow for shipping phase or confirmed orders
    return [ServiceTypes.Suivi, OrderPhase.Shipping, ServiceTypes.Quality].includes(phase as any) || state === OrderState.Confirmed
  })
})

const invalidOrders = computed(() => {
  return props.orders.filter(order => !validOrders.value.includes(order))
})

// Check if single order with existing provider city
const isSingleOrderWithCity = computed(() => {
  return validOrders.value.length === 1 && validOrders.value[0].providerCityId
})

// Get the single order's existing city info
const singleOrderCity = computed(() => {
  if (!isSingleOrderWithCity.value) return null
  const order = validOrders.value[0]
  return {
    id: order.providerCityId,
    name: order.providerCityName || order.sourceCity || order.cityName || ''
  }
})

// Reset form when modal opens
watch(() => props.show, (val) => {
  if (val) {
    deliveryCompanyId.value = ''
    providerCityId.value = ''
    deliveryCities.value = []
    isSubmitting.value = false
  }
})

// Load cities when delivery company changes
watch(deliveryCompanyId, async (newId) => {
  providerCityId.value = ''
  deliveryCities.value = []

  if (newId) {
    isLoadingCities.value = true
    try {
      const cities = await fetchDeliveryCities(newId)
      deliveryCities.value = cities || []
    } catch (error) {
      console.error('Failed to load delivery cities:', error)
      deliveryCities.value = []
    } finally {
      isLoadingCities.value = false
    }
  }
})

const canSubmit = computed(() => {
  return deliveryCompanyId.value && validOrders.value.length > 0 && !isSubmitting.value
})

const handleConfirm = () => {
  if (!canSubmit.value) return
  isSubmitting.value = true

  // For single order with existing city, use that city
  // For bulk or new city selection, use the selected value
  const finalProviderCityId = isSingleOrderWithCity.value
    ? singleOrderCity.value?.id
    : (providerCityId.value || undefined)

  emit('confirm', {
    orderIds: validOrders.value.map(o => o.id),
    deliveryCompanyId: deliveryCompanyId.value,
    providerCityId: finalProviderCityId
  })
}

const handleClose = () => {
  if (!isSubmitting.value) {
    emit('close')
  }
}
</script>

<template>
  <TransitionRoot :show="show" as="template">
    <Dialog class="relative z-50" @close="handleClose">
      <TransitionChild
        enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-300" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t('orders.assignDelivery') }}
              </DialogTitle>

              <div class="mt-4 space-y-4">
                <!-- Summary -->
                <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    {{ t('orders.assignDeliveryToOrders', { count: validOrders.length }) }}
                  </p>
                </div>

                <!-- Warning for invalid orders -->
                <div v-if="invalidOrders.length > 0" class="flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                  <ExclamationTriangleIcon class="h-5 w-5 flex-shrink-0 text-amber-500" />
                  <div class="text-sm text-amber-700 dark:text-amber-300">
                    <p class="font-medium">{{ t('orders.someOrdersCannotAssign') }}</p>
                    <p class="mt-1">
                      {{ invalidOrders.length }} {{ t('orders.ordersSkipped') }}
                    </p>
                  </div>
                </div>

                <!-- Delivery Company -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('orders.deliveryCompany') }} *
                  </label>
                  <select
                    v-model="deliveryCompanyId"
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    :disabled="isSubmitting"
                  >
                    <option value="">{{ t('common.select') }}</option>
                    <option v-for="dc in deliveryCompanies" :key="dc.id" :value="dc.id">
                      {{ dc.name }}
                    </option>
                  </select>
                </div>

                <!-- Delivery City - Show existing city for single order (readonly) -->
                <div v-if="isSingleOrderWithCity && singleOrderCity">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('orders.deliveryCity', 'Ville de livraison') }}
                  </label>
                  <div class="mt-1 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-green-800 dark:border-green-600 dark:bg-green-900/20 dark:text-green-200">
                    {{ singleOrderCity.name }}
                  </div>
                  <p class="mt-1 text-xs text-gray-500">{{ t('orders.cityAlreadySelected', 'Ville déjà sélectionnée par le confirmateur') }}</p>
                </div>

                <!-- Delivery City selector (for bulk orders or orders without city) -->
                <div v-else-if="deliveryCompanyId">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('orders.deliveryCity', 'Ville de livraison') }}
                  </label>
                  <UiSearchableSelect
                    v-model="providerCityId"
                    :options="deliveryCitiesOptions"
                    :placeholder="isLoadingCities ? t('common.loading') : t('orders.searchDeliveryCity', 'Rechercher une ville...')"
                    :disabled="isSubmitting || isLoadingCities"
                    class="mt-1"
                  />
                  <p v-if="deliveryCities.length > 0" class="mt-1 text-xs text-gray-500">
                    {{ deliveryCities.length }} {{ t('orders.citiesAvailable', 'villes disponibles') }}
                  </p>
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
                  :disabled="isSubmitting"
                  @click="handleClose"
                >
                  {{ t('common.cancel') }}
                </button>
                <button
                  type="button"
                  class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                  :disabled="!canSubmit"
                  @click="handleConfirm"
                >
                  <span v-if="isSubmitting">{{ t('common.processing') }}</span>
                  <span v-else>{{ t('orders.assign') }}</span>
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
