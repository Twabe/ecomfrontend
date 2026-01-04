/*
===================================================================================
ARCHITECTURE DOCUMENTATION - ORDER CREATION CITY SELECTION
===================================================================================

🎯 CITY SELECTION - 3 MODES:

This form handles 3 different ways a city can be specified for an order:

┌─────────────────────────────────────────────────────────────────────────────────┐
│ MODE 1: SOURCE CITY (Read-only, from external platforms)                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ When orders come from webhooks (Youcan, WooCommerce, etc.):                     │
│   - Field: formData.sourceCity (string)                                         │
│   - Display: Read-only amber box showing raw city name                          │
│   - Contains: Raw text like "casa", "الدار البيضاء", "Casablanca"              │
│   - Purpose: Reference only, may have typos or different language               │
│   - NOT used for delivery company routing                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ MODE 2: INTERNAL CITY (No delivery company selected)                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│ When user creates order WITHOUT selecting a delivery company:                   │
│   - Selector: Shows cities from props.cities (City table)                       │
│   - Field: formData.cityId → Order.CityId                                       │
│   - Fees: Loaded from ShippingFees API by cityId                               │
│   - Use case: Manual orders, local delivery, no API integration                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ MODE 3: DELIVERY COMPANY CITY (Delivery company selected)                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│ When user selects a delivery company (ForceLog, Ameex, etc.):                   │
│   - Selector: Shows cities from ProviderCities for that company                 │
│   - API call: GET /api/v1/deliverycompanies/{id}/cities                         │
│   - Field: formData.providerCityId → ProviderCity.Id                            │
│   - Fees: From selected city's DefaultDeliveredFee                              │
│   - Use case: Integrated delivery with provider API                             │
│                                                                                  │
│   ✅ NEW ARCHITECTURE (ProviderCity):                                           │
│   - Cities loaded from: ProviderCity (global, synced by Super Admin)            │
│   - Connection found via: DeliveryCompany.Id → TenantDeliveryConnection         │
│   - Fees from: ProviderCity.DefaultDeliveredFee (or ShippingFees if customized) │
└─────────────────────────────────────────────────────────────────────────────────┘

📊 FLOW DIAGRAM:

  User opens Order Form
         │
         ├──► sourceCity displayed (if from webhook) [READ-ONLY]
         │
         └──► User selects Delivery Company?
                │
                ├── NO ──► Show City dropdown (from City table)
                │              │
                │              └──► User selects city
                │                      │
                │                      └──► Load fees from ShippingFees API
                │
                └── YES ─► Load cities from ProviderCities
                               │
                               └──► Show ProviderCity dropdown
                                       │
                                       └──► User selects city
                                               │
                                               └──► Use ProviderCity.DefaultDeliveredFee

===================================================================================
*/

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { TrashIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { shippingFeesSearch } from '~/api/generated/endpoints/shipping-fees/shipping-fees'
import { useProductVariantsByProduct } from '~/services'
import type { Order, CreateOrderRequest, UpdateOrderRequest, CreateOrderItemRequest } from '~/types/order'
import type { City } from '~/types/city'
import type { Product } from '~/types/product'
import type { DeliveryCompany } from '~/types/deliverycompany'
import { customInstance } from '~/api/axios-instance'

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
  defaultCanceledFee?: number | null
  defaultChangedFee?: number | null
  isActive: boolean
  isFromApi: boolean
  lastSyncedAt?: string | null
}

// Fetch delivery cities from ProviderCities (NEW architecture)
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

const props = withDefaults(defineProps<{
  show: boolean
  order: Order | null
  cities: City[]
  products: Product[]
  deliveryCompanies: DeliveryCompany[]
  /** Whether items can be edited (false for confirmed/delivered orders) */
  canEditItems?: boolean
}>(), {
  canEditItems: true
})

const emit = defineEmits<{
  close: []
  create: [data: CreateOrderRequest]
  update: [id: string, data: UpdateOrderRequest]
  'manage-items': []
}>()

const { t } = useI18n()

const isEdit = computed(() => !!props.order)

const formData = ref<Partial<CreateOrderRequest & { providerCityId?: string; sourceCity?: string }>>({
  code: '',
  fullName: '',
  phone: '',
  cityId: '',
  address: '',
  items: [],
  price: 0,
  fees: 0,
  deliveryCompanyId: '',
  providerCityId: '',
  sourceCity: ''
})

// Delivery company cities (loaded when delivery company is selected)
// Now uses ProviderCities from the connection's template
const deliveryCities = ref<ProviderCityDto[]>([])
const isLoadingDeliveryCities = ref(false)

// Convert delivery cities to format expected by UiSearchableSelect ({ id, name })
const deliveryCitiesOptions = computed(() => {
  return deliveryCities.value.map(city => ({
    id: city.id || '',
    name: city.cityName || city.externalCityName || city.externalCityId || ''
  }))
})

const newItem = ref<CreateOrderItemRequest>({
  productId: '',
  productVariantId: undefined,
  quantity: 1,
  unitPrice: 0,
  discountAmount: 0,
  discountReason: '',
  note: ''
})

// Variants for selected product
const selectedProductIdForVariants = computed(() => newItem.value.productId || undefined)
const { variants: productVariants, isLoading: isLoadingVariants } = useProductVariantsByProduct(selectedProductIdForVariants)

// Check if selected product has variants
const selectedProduct = computed(() => {
  if (!newItem.value.productId) return null
  return props.products.find(p => p.id === newItem.value.productId)
})

const productHasVariants = computed(() => {
  if (!selectedProduct.value) return false
  return selectedProduct.value.hasVariants === true
})

const selectedVariant = computed(() => {
  if (!newItem.value.productVariantId) return null
  return productVariants.value.find(v => v.id === newItem.value.productVariantId)
})

// Watch for modal open/close
watch(() => props.show, (val) => {
  if (val) {
    if (props.order) {
      // Edit mode - Load order data INCLUDING items for total calculation
      // Convert order.items (OrderItem[]) to CreateOrderItemRequest[] format
      const orderItems: CreateOrderItemRequest[] = props.order.items?.map(item => ({
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount || 0,
        discountReason: item.discountReason || '',
        note: item.note || '',
        // Store display names from backend data
        _productName: item.productName,
        _variantName: item.variantName,
        _variantSku: item.variantSku
      })) || []

      formData.value = {
        code: props.order.code,
        fullName: props.order.fullName,
        phone: props.order.phone,
        cityId: props.order.cityId || '',
        address: props.order.address || '',
        items: orderItems,  // Load items for total calculation
        price: props.order.price,
        fees: props.order.fees,
        storeId: props.order.storeId || '',
        sourceId: props.order.sourceId || '',
        deliveryCompanyId: props.order.deliveryCompanyId || '',
        providerCityId: props.order.providerCityId || '',
        sourceCity: props.order.sourceCity || ''
      }

      // If order has a delivery company, load its cities for the dropdown
      if (props.order.deliveryCompanyId) {
        isLoadingDeliveryCities.value = true
        fetchDeliveryCities(props.order.deliveryCompanyId)
          .then(cities => {
            deliveryCities.value = cities
          })
          .catch(() => {
            deliveryCities.value = []
          })
          .finally(() => {
            isLoadingDeliveryCities.value = false
          })
      }
    } else {
      // Create mode
      formData.value = {
        code: generateOrderCode(),
        fullName: '',
        phone: '',
        cityId: '',
        address: '',
        items: [],
        price: 0,
        fees: 0,
        deliveryCompanyId: ''
      }
    }
  }
})

// Watch for product selection to auto-fill price and reset variant
watch(() => newItem.value.productId, (productId) => {
  // Reset variant when product changes
  newItem.value.productVariantId = undefined
  if (productId) {
    const product = props.products.find(p => p.id === productId)
    if (product) {
      newItem.value.unitPrice = product.rate
    }
  }
})

// Update price when variant is selected
watch(() => newItem.value.productVariantId, (variantId) => {
  if (variantId) {
    const variant = productVariants.value.find(v => v.id === variantId)
    if (variant?.price) {
      newItem.value.unitPrice = variant.price
    }
  } else if (newItem.value.productId) {
    // Fallback to product price
    const product = props.products.find(p => p.id === newItem.value.productId)
    if (product) {
      newItem.value.unitPrice = product.rate
    }
  }
})

// Watch for city changes to auto-fill shipping fees (when no delivery company)
watch(
  () => formData.value.cityId,
  async (cityId) => {
    if (cityId && !formData.value.deliveryCompanyId && !isEdit.value) {
      try {
        const response = await shippingFeesSearch({
          cityId,
          pageSize: 1,
          pageNumber: 1
        })
        if (response.data && response.data.length > 0) {
          formData.value.fees = response.data[0].deliveredFees
          calculateTotal()
        }
      } catch {
        // Silent fail - user can enter manually
      }
    }
  }
)

// Watch for provider city changes to auto-fill fees from ProviderCities
watch(
  () => formData.value.providerCityId,
  (providerCityId) => {
    if (providerCityId && formData.value.deliveryCompanyId) {
      // Find the selected city in deliveryCities to get its fee
      const selectedCity = deliveryCities.value.find(c => c.id === providerCityId)
      if (selectedCity?.defaultDeliveredFee) {
        formData.value.fees = selectedCity.defaultDeliveredFee
        calculateTotal()
      }
    }
  }
)

// Watch for delivery company changes to load delivery cities
watch(
  () => formData.value.deliveryCompanyId,
  async (deliveryCompanyId, oldDeliveryCompanyId) => {
    // Reset selections when switching between modes
    if (deliveryCompanyId) {
      // Switching TO delivery company mode - reset cityId, use providerCityId
      formData.value.cityId = ''

      // Only reset providerCityId if user is actively switching companies (not initial load in edit mode)
      // In edit mode, the modal open handler already sets providerCityId from the order
      if (oldDeliveryCompanyId && oldDeliveryCompanyId !== deliveryCompanyId) {
        formData.value.providerCityId = ''
      }

      deliveryCities.value = []

      // Load delivery company cities
      isLoadingDeliveryCities.value = true
      try {
        const cities = await fetchDeliveryCities(deliveryCompanyId)
        deliveryCities.value = cities
      } catch {
        deliveryCities.value = []
      } finally {
        isLoadingDeliveryCities.value = false
      }
    } else if (oldDeliveryCompanyId) {
      // Switching FROM delivery company mode - reset providerCityId, use cityId
      formData.value.providerCityId = ''
      deliveryCities.value = []
    }
  }
)

const generateOrderCode = () => {
  const prefix = 'CMD'
  const timestamp = Date.now().toString(36).toUpperCase()
  return `${prefix}-${timestamp}`
}

const getItemDisplayName = (item: CreateOrderItemRequest) => {
  // For newly added items, we store the names in local fields
  if (item._variantName) {
    return `${item._productName || getProductNameById(item.productId)} - ${item._variantName}${item._variantSku ? ` (${item._variantSku})` : ''}`
  }
  return item._productName || getProductNameById(item.productId)
}

const getProductNameById = (productId: string) => {
  const product = props.products.find(p => p.id === productId)
  return product?.name || productId
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)
}

// Computed for items total (with discounts)
const itemsTotal = computed(() => {
  if (!formData.value.items) return 0
  return formData.value.items.reduce((sum, item) => {
    const itemTotal = (item.quantity * item.unitPrice) - (item.discountAmount || 0)
    return sum + itemTotal
  }, 0)
})

const addItem = () => {
  if (!newItem.value.productId) return

  // If product has variants, require variant selection
  if (productHasVariants.value && !newItem.value.productVariantId) {
    return
  }

  const product = props.products.find(p => p.id === newItem.value.productId)
  if (!product) return

  // Get variant info if selected
  const variant = newItem.value.productVariantId
    ? productVariants.value.find(v => v.id === newItem.value.productVariantId)
    : null

  if (!formData.value.items) formData.value.items = []
  formData.value.items.push({
    productId: newItem.value.productId,
    productVariantId: newItem.value.productVariantId || undefined,
    quantity: newItem.value.quantity,
    unitPrice: newItem.value.unitPrice || product.rate,
    discountAmount: newItem.value.discountAmount || 0,
    discountReason: newItem.value.discountReason || '',
    note: newItem.value.note || '',
    // Store display names for UI rendering
    _productName: product.name,
    _variantName: variant?.name,
    _variantSku: variant?.sku
  })

  // Reset form
  newItem.value = {
    productId: '',
    productVariantId: undefined,
    quantity: 1,
    unitPrice: 0,
    discountAmount: 0,
    discountReason: '',
    note: ''
  }
  calculateTotal()
}

const removeItem = (index: number) => {
  formData.value.items?.splice(index, 1)
  calculateTotal()
}

const calculateTotal = () => {
  formData.value.price = itemsTotal.value + (formData.value.fees || 0)
}

const handleSubmit = () => {
  // Clean data: convert empty strings to undefined for optional fields
  const cleanData = {
    ...formData.value,
    // CityId is required - keep it or use undefined (backend validates)
    cityId: formData.value.cityId || undefined,
    deliveryCompanyId: formData.value.deliveryCompanyId || undefined,
    providerCityId: formData.value.providerCityId || undefined,
    storeId: formData.value.storeId || undefined,
    sourceId: formData.value.sourceId || undefined,
    trackingStateId: formData.value.trackingStateId || undefined,
    sourceCity: formData.value.sourceCity || undefined,
    // Clean items: remove empty optional fields
    items: formData.value.items?.map(item => ({
      ...item,
      discountAmount: item.discountAmount || undefined,
      discountReason: item.discountReason || undefined,
      note: item.note || undefined
    }))
  }

  if (isEdit.value && props.order) {
    // Include 'id' in update request body - REQUIRED by backend API
    const updateData: UpdateOrderRequest = {
      id: props.order.id,  // Required by backend
      ...cleanData
    } as UpdateOrderRequest
    emit('update', props.order.id, updateData)
  } else {
    emit('create', cleanData as CreateOrderRequest)
  }
}

const handleClose = () => {
  emit('close')
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
            <DialogPanel class="w-full max-w-3xl transform rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <DialogTitle class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ isEdit ? t('orders.editOrder') : t('orders.createOrder') }}
              </DialogTitle>

              <form class="mt-4 space-y-4" @submit.prevent="handleSubmit">
                <!-- Order Code -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('orders.orderNumber') }} <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.code"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <!-- Customer Info -->
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('orders.customer') }} <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.fullName"
                      type="text"
                      required
                      class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('orders.phone') }} <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.phone"
                      type="tel"
                      required
                      class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <!-- Source City (readonly display - only in edit mode when exists) -->
                <div v-if="isEdit && props.order?.sourceCity">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('orders.sourceCity', 'Ville (source)') }}
                  </label>
                  <div class="mt-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-200">
                    {{ props.order.sourceCity }}
                  </div>
                  <p class="mt-1 text-xs text-gray-500">{{ t('orders.sourceCityHint', 'Ville reçue de la plateforme (lecture seule)') }}</p>
                </div>

                <!-- Address -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('common.address') }} <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.address"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <!-- Delivery Company & Delivery City -->
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('nav.deliveryCompanies') }}
                    </label>
                    <select
                      v-model="formData.deliveryCompanyId"
                      class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">{{ t('orders.noDeliveryCompany', 'Sans société de livraison') }}</option>
                      <option v-for="dc in deliveryCompanies" :key="dc.id" :value="dc.id">{{ dc.name }}</option>
                    </select>
                  </div>

                  <!-- Delivery City - Always shown, switches between Cities table and ProviderCities -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ t('orders.deliveryCity', 'Ville de livraison') }} <span class="text-red-500">*</span>
                    </label>
                    <!-- When delivery company is selected: show ProviderCities -->
                    <UiSearchableSelect
                      v-if="formData.deliveryCompanyId"
                      v-model="formData.providerCityId"
                      :options="deliveryCitiesOptions"
                      :placeholder="isLoadingDeliveryCities ? t('common.loading') : t('orders.searchDeliveryCity', 'Rechercher une ville...')"
                      :disabled="isLoadingDeliveryCities"
                      class="mt-1"
                    />
                    <!-- When NO delivery company: show Cities table -->
                    <UiSearchableSelect
                      v-else
                      v-model="formData.cityId"
                      :options="cities"
                      :placeholder="t('orders.searchCity', 'Rechercher une ville...')"
                      :required="true"
                      class="mt-1"
                    />
                  </div>
                </div>

                <!-- Items Section - Show in both Create and Edit modes -->
                <div class="rounded-lg border border-gray-200 dark:border-gray-700">
                  <!-- Header -->
                  <div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-700/50">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ t('orders.items') }} <span v-if="!isEdit" class="text-red-500">*</span>
                    </h4>
                    <!-- Edit mode: Show button to manage items (only if items can be edited) -->
                    <button
                      v-if="isEdit && canEditItems"
                      type="button"
                      class="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
                      @click="$emit('manage-items')"
                    >
                      <PlusIcon class="h-4 w-4" />
                      {{ t('orders.manageItems') }}
                    </button>
                  </div>

                  <!-- Existing Items List -->
                  <div v-if="formData.items && formData.items.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
                    <div v-for="(item, idx) in formData.items" :key="idx" class="p-4">
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <div class="font-medium text-gray-900 dark:text-white">
                            {{ getItemDisplayName(item) }}
                          </div>
                          <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                            <span>{{ t('orders.quantity') }}: {{ item.quantity }}</span>
                            <span>{{ t('orders.price') }}: {{ formatCurrency(item.unitPrice) }}</span>
                            <span v-if="item.discountAmount && item.discountAmount > 0" class="text-red-600">
                              {{ t('orders.discount') }}: -{{ formatCurrency(item.discountAmount) }}
                            </span>
                            <span class="font-medium text-gray-900 dark:text-white">
                              {{ t('orders.total') }}: {{ formatCurrency((item.quantity * item.unitPrice) - (item.discountAmount || 0)) }}
                            </span>
                          </div>
                          <div v-if="item.note" class="mt-1 text-sm text-gray-400">{{ item.note }}</div>
                        </div>
                        <!-- Only show delete button in Create mode -->
                        <button v-if="!isEdit" type="button" class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" @click="removeItem(idx)">
                          <TrashIcon class="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div v-else class="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {{ t('orders.noItems') }}
                  </div>

                  <!-- Items Summary -->
                  <div class="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700/50">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600 dark:text-gray-400">{{ t('orders.itemsTotal') }}</span>
                      <span class="font-medium text-gray-900 dark:text-white">{{ formatCurrency(itemsTotal) }}</span>
                    </div>
                  </div>

                  <!-- Add New Item Section (Create mode only) -->
                  <div v-if="!isEdit" class="border-t border-gray-200 p-4 dark:border-gray-700">
                    <h5 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">{{ t('orders.addItem') }}</h5>

                    <!-- Product + Quantity Row -->
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">
                          {{ t('orders.product') }} <span class="text-red-500">*</span>
                        </label>
                        <select
                          v-model="newItem.productId"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">{{ t('common.select') }}</option>
                          <option v-for="product in products" :key="product.id" :value="product.id">
                            {{ product.name }} - {{ formatCurrency(product.rate) }}
                            {{ product.hasVariants ? `(${product.variantCount || 0} ${t('products.variants')?.toLowerCase() || 'variants'})` : '' }}
                          </option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('orders.quantity') }}</label>
                        <input
                          v-model.number="newItem.quantity"
                          type="number"
                          min="1"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <!-- Variant Selection (shown only when product has variants) -->
                    <div v-if="productHasVariants" class="mt-3 grid grid-cols-1 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">
                          {{ t('products.variant') || 'Variant' }} <span class="text-red-500">*</span>
                        </label>
                        <select
                          v-model="newItem.productVariantId"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          :class="{ 'border-red-300': productHasVariants && !newItem.productVariantId }"
                        >
                          <option :value="undefined">{{ isLoadingVariants ? t('common.loading') : t('common.select') }}</option>
                          <option v-for="variant in productVariants" :key="variant.id" :value="variant.id">
                            {{ variant.name }} ({{ variant.sku }})
                            {{ variant.price ? `- ${formatCurrency(variant.price)}` : '' }}
                          </option>
                        </select>
                        <p v-if="productHasVariants && !newItem.productVariantId" class="mt-1 text-xs text-red-500">
                          {{ t('products.variantRequired') || 'Please select a variant' }}
                        </p>
                      </div>
                    </div>

                    <!-- Price + Discount Row -->
                    <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('orders.price') }}</label>
                        <input
                          v-model.number="newItem.unitPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('orders.discount') }}</label>
                        <input
                          v-model.number="newItem.discountAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('orders.discountReason') }}</label>
                        <input
                          v-model="newItem.discountReason"
                          type="text"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <!-- Note Row -->
                    <div class="mt-3">
                      <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">{{ t('common.note') }}</label>
                      <input
                        v-model="newItem.note"
                        type="text"
                        class="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <!-- Add Button -->
                    <div class="mt-3 flex justify-end">
                      <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                        :disabled="!newItem.productId || (productHasVariants && !newItem.productVariantId)"
                        @click="addItem"
                      >
                        <PlusIcon class="h-4 w-4" />
                        {{ t('orders.addItem') }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Pricing Summary -->
                <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {{ t('orders.shipping') }}
                      </label>
                      <input
                        v-model.number="formData.fees"
                        type="number"
                        min="0"
                        step="0.01"
                        class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        @input="calculateTotal"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {{ t('orders.total') }}
                      </label>
                      <input
                        v-model.number="formData.price"
                        type="number"
                        min="0"
                        step="0.01"
                        class="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 font-semibold dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div class="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
                    @click="handleClose"
                  >
                    {{ t('common.cancel') }}
                  </button>
                  <button
                    type="submit"
                    class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    {{ t('common.save') }}
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
