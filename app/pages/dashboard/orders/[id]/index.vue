<script setup lang="ts">
import {
  ArrowLeftIcon,
  PhoneIcon,
  ClipboardDocumentIcon,
  TruckIcon,
  PrinterIcon,
  PencilSquareIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChatBubbleLeftIcon,
  BanknotesIcon,
  ArchiveBoxIcon,
} from '@heroicons/vue/24/outline'
import { useOrdersWorkflowService, useDeliveryCompaniesService, useReasonsService } from '~/services'
import { useOrderHistoriesService, type OrderHistoryDto } from '~/services/order-histories/useOrderHistoriesService'
import { OrderStateColors, OrderPhaseColors } from '~/types/order'
import { OrderPhase, OrderState } from '~/constants/order'
import type { OrderDto } from '~/api/generated/models'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Orders.View'
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { notify } = useNotification()

// Get order ID from route
const orderId = computed(() => route.params.id as string)

// Services
const {
  useOrder,
  confirmOrder,
  cancelOrder,
  markAsDelivered,
  markAsReturned,
  assignDeliveryCompany,
  isMutating
} = useOrdersWorkflowService()

const { items: deliveryCompanies } = useDeliveryCompaniesService()
const { items: reasons } = useReasonsService()

// Fetch order
const { data: order, isLoading, error, refetch } = useOrder(orderId)

// Fetch history
const { getByOrderId, getActionLabel, parseMetadata } = useOrderHistoriesService()
const { data: history, isLoading: isHistoryLoading } = getByOrderId(orderId)

// State
const showAssignDeliveryModal = ref(false)
const showCancelModal = ref(false)
const showHistoryExpanded = ref(false)
const selectedReasonId = ref<string | undefined>(undefined)
const cancelComment = ref('')

// Orders array for unified modal (single order)
const ordersForDeliveryModal = computed(() => {
  if (!order.value) return []
  return [{
    id: order.value.id!,
    code: order.value.code,
    fullName: order.value.fullName,
    phone: order.value.phone,
    cityName: order.value.cityName,
    providerCityId: order.value.providerCityId,
    providerCityName: order.value.providerCityName,
    state: order.value.state
  }]
})

// Copy to clipboard helper
const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text)
    notify({ type: 'success', message: `${label} copié` })
  } catch {
    notify({ type: 'error', message: 'Échec de la copie' })
  }
}

// Format helpers
const formatCurrency = (amount?: number | null) => {
  if (amount === undefined || amount === null) return '-'
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)
}

const formatDate = (date?: string | null) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const formatDateShort = (date?: string | null) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const getStateColor = (state?: string | null) => OrderStateColors[state?.toLowerCase() || ''] || 'bg-gray-100 text-gray-800'
const getPhaseColor = (phase?: string | null) => OrderPhaseColors[phase?.toLowerCase() || ''] || 'bg-gray-100 text-gray-800'

// Computed
const canConfirm = computed(() => {
  // Archived orders cannot be modified
  if (order.value?.isArchived) return false
  return order.value?.phase === OrderPhase.New || (order.value?.phase === OrderPhase.Confirmation && order.value?.state === OrderState.New)
})

const canCancel = computed(() => {
  // Archived orders cannot be modified
  if (order.value?.isArchived) return false
  return order.value?.state !== OrderState.Delivered && order.value?.state !== OrderState.Cancelled && order.value?.state !== OrderState.Returned
})

const canAssignDelivery = computed(() => {
  // Archived orders cannot be modified
  if (order.value?.isArchived) return false
  return order.value?.state === OrderState.Confirmed && !order.value?.deliveryCompanyId
})

const canMarkDelivered = computed(() => {
  // Archived orders cannot be modified
  if (order.value?.isArchived) return false
  return order.value?.phase === OrderPhase.Shipping && order.value?.state !== OrderState.Delivered && order.value?.state !== OrderState.Returned
})

const canMarkReturned = computed(() => {
  // Archived orders cannot be modified
  if (order.value?.isArchived) return false
  return order.value?.phase === OrderPhase.Shipping && order.value?.state !== OrderState.Delivered && order.value?.state !== OrderState.Returned
})

// Actions
const handleConfirm = async () => {
  if (!order.value?.id) return
  try {
    await confirmOrder({ orderId: order.value.id })
    notify({ type: 'success', message: 'Commande confirmée' })
    refetch()
  } catch (err: any) {
    notify({ type: 'error', message: err.message || 'Erreur lors de la confirmation' })
  }
}

const handleCancel = async () => {
  if (!order.value?.id) return
  try {
    await cancelOrder({
      orderId: order.value.id,
      reasonId: selectedReasonId.value,
      comment: cancelComment.value || undefined
    })
    notify({ type: 'success', message: 'Commande annulée' })
    showCancelModal.value = false
    selectedReasonId.value = undefined
    cancelComment.value = ''
    refetch()
  } catch (err: any) {
    notify({ type: 'error', message: err.message || 'Erreur lors de l\'annulation' })
  }
}

const handleAssignDelivery = async (data: { orderIds: string[]; deliveryCompanyId: string; providerCityId?: string }) => {
  if (!order.value?.id) return
  try {
    await assignDeliveryCompany({
      orderId: order.value.id,
      deliveryCompanyId: data.deliveryCompanyId,
      providerCityId: data.providerCityId
    })
    notify({ type: 'success', message: 'Société de livraison assignée' })
    showAssignDeliveryModal.value = false
    refetch()
  } catch (err: any) {
    notify({ type: 'error', message: err.message || 'Erreur lors de l\'assignation' })
  }
}

const handleMarkDelivered = async () => {
  if (!order.value?.id) return
  try {
    await markAsDelivered({ orderIds: [order.value.id] })
    notify({ type: 'success', message: 'Commande marquée comme livrée' })
    refetch()
  } catch (err: any) {
    notify({ type: 'error', message: err.message || 'Erreur' })
  }
}

const handleMarkReturned = async () => {
  if (!order.value?.id) return
  try {
    await markAsReturned({ orderIds: [order.value.id] })
    notify({ type: 'success', message: 'Commande marquée comme retournée' })
    refetch()
  } catch (err: any) {
    notify({ type: 'error', message: err.message || 'Erreur' })
  }
}

// Print label - opens professional A6 label in new window
const printLabel = () => {
  window.open(`/dashboard/orders/${orderId.value}/label`, '_blank')
}

// WhatsApp link
const getWhatsAppLink = (phone?: string | null) => {
  if (!phone) return '#'
  const cleanPhone = phone.replace(/\D/g, '')
  const internationalPhone = cleanPhone.startsWith('0') ? '212' + cleanPhone.slice(1) : cleanPhone
  return `https://wa.me/${internationalPhone}`
}

// Handle print query param - redirect to label page
onMounted(() => {
  if (route.query.print === 'label') {
    // Redirect to label page for professional printing
    navigateTo(`/dashboard/orders/${orderId.value}/label`)
  }
})

// Go back
const goBack = () => {
  const from = route.query.from as string
  if (from === 'supervisor') {
    router.push('/dashboard/supervisor')
  } else {
    router.push('/dashboard/orders')
  }
}

// History action colors
const actionColors: Record<string, { bg: string; text: string }> = {
  order_created: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  state_change: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  phase_change: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  assignment_created: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  assignment_taken: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300' },
  assignment_released: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
  assignment_completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  assignment_reassigned: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  delivery_assigned: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300' },
  stock_deducted: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  stock_restored: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
  cod_collected: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
}

const getActionColor = (actionType: string) => actionColors[actionType] ?? actionColors.state_change
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">Erreur lors du chargement</p>
        <button @click="goBack" class="mt-4 btn-secondary">
          Retour
        </button>
      </div>
    </div>

    <!-- Order Details -->
    <div v-else-if="order" class="max-w-6xl mx-auto px-4 py-6">
      <!-- Header -->
      <div class="mb-6">
        <button @click="goBack" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4">
          <ArrowLeftIcon class="h-5 w-5" />
          <span>Retour</span>
        </button>

        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {{ order.code }}
              <button
                @click="copyToClipboard(order.code || '', 'Code')"
                class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ClipboardDocumentIcon class="h-5 w-5" />
              </button>
            </h1>
            <span class="inline-flex rounded-full px-3 py-1 text-sm font-medium" :class="getPhaseColor(order.phase)">
              {{ order.phase || 'new' }}
            </span>
            <span class="inline-flex rounded-full px-3 py-1 text-sm font-medium" :class="getStateColor(order.state)">
              {{ order.state || 'new' }}
            </span>
            <span v-if="order.isBlacklisted" class="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
              <ExclamationTriangleIcon class="h-4 w-4" />
              Blacklisté
            </span>
            <span v-if="order.isArchived" class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              <ArchiveBoxIcon class="h-4 w-4" />
              Archivée
            </span>
          </div>

          <div class="flex flex-wrap gap-2">
            <button @click="printLabel" class="btn-secondary flex items-center gap-2">
              <PrinterIcon class="h-4 w-4" />
              Imprimer
            </button>
          </div>
        </div>

        <!-- Archived Warning Banner -->
        <div v-if="order.isArchived" class="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-800">
          <div class="flex items-center gap-3">
            <ArchiveBoxIcon class="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <h4 class="text-sm font-medium text-amber-800 dark:text-amber-300">Commande archivée</h4>
              <p class="text-sm text-amber-700 dark:text-amber-400">Cette commande est archivée. Les actions de modification sont désactivées.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Customer Card -->
        <div class="card" :class="{ 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20': order.isBlacklisted }">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserIcon class="h-5 w-5" />
            Client
          </h3>
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Nom</dt>
              <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ order.fullName }}</dd>
            </div>
            <div class="flex justify-between items-center">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Téléphone</dt>
              <dd class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900 dark:text-white font-mono">{{ order.phone }}</span>
                <a :href="`tel:${order.phone}`" class="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                  <PhoneIcon class="h-4 w-4" />
                </a>
                <a :href="getWhatsAppLink(order.phone)" target="_blank" class="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <button @click="copyToClipboard(order.phone || '', 'Téléphone')" class="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                  <ClipboardDocumentIcon class="h-4 w-4" />
                </button>
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Ville</dt>
              <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ order.cityName || '-' }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500 dark:text-gray-400 mb-1">Adresse</dt>
              <dd class="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                {{ order.address || '-' }}
              </dd>
            </div>
            <div v-if="order.email" class="flex justify-between">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Email</dt>
              <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ order.email }}</dd>
            </div>
          </dl>
        </div>

        <!-- Delivery Card -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TruckIcon class="h-5 w-5" />
            Livraison
          </h3>
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Société</dt>
              <dd class="text-sm font-medium text-gray-900 dark:text-white">
                {{ order.deliveryCompanyName || '-' }}
              </dd>
            </div>
            <div v-if="order.trackingCode" class="flex justify-between items-center">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Code suivi</dt>
              <dd class="flex items-center gap-2">
                <span class="text-sm font-medium font-mono text-gray-900 dark:text-white">{{ order.trackingCode }}</span>
                <button @click="copyToClipboard(order.trackingCode || '', 'Code suivi')" class="p-1 text-gray-400 hover:text-gray-600">
                  <ClipboardDocumentIcon class="h-4 w-4" />
                </button>
              </dd>
            </div>
            <div v-if="order.deliveryStatus" class="flex justify-between">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Statut</dt>
              <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ order.deliveryStatus }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Frais livraison</dt>
              <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ formatCurrency(order.fees) }}</dd>
            </div>
          </dl>

          <!-- Assign Delivery Button -->
          <button
            v-if="canAssignDelivery"
            @click="showAssignDeliveryModal = true"
            class="mt-4 w-full btn-primary flex items-center justify-center gap-2"
          >
            <TruckIcon class="h-4 w-4" />
            Assigner société de livraison
          </button>
        </div>
      </div>

      <!-- Products Table -->
      <div class="card mt-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Produits</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Produit</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qté</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Prix U.</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Remise</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="!order.items || order.items.length === 0">
                <td colspan="5" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aucun produit dans cette commande
                </td>
              </tr>
              <tr v-for="item in order.items" :key="item.id">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ item.productName }}</td>
                <td class="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{{ item.quantity }}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{{ formatCurrency(item.unitPrice) }}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                  {{ item.discountAmount ? formatCurrency(item.discountAmount) : '-' }}
                </td>
                <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ formatCurrency(item.total) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <td colspan="4" class="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">Sous-total</td>
                <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                  {{ formatCurrency((order.price || 0) - (order.fees || 0)) }}
                </td>
              </tr>
              <tr>
                <td colspan="4" class="px-4 py-2 text-sm text-right text-gray-500 dark:text-gray-400">Livraison</td>
                <td class="px-4 py-2 text-sm text-right font-medium text-gray-900 dark:text-white">{{ formatCurrency(order.fees) }}</td>
              </tr>
              <tr class="border-t-2 border-gray-300 dark:border-gray-600">
                <td colspan="4" class="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">TOTAL</td>
                <td class="px-4 py-3 text-lg text-right font-bold text-primary-600">{{ formatCurrency(order.price) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Info Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <!-- COD Payment Card -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BanknotesIcon class="h-5 w-5" />
            Paiement COD
          </h3>
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Montant à collecter</dt>
              <dd class="text-sm font-bold text-primary-600">{{ formatCurrency(order.price) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Statut</dt>
              <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ order.codPaymentStatus || 'En attente' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Montant collecté</dt>
              <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ formatCurrency(order.codAmountCollected) }}</dd>
            </div>
          </dl>
        </div>

        <!-- Order Info Card -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ClockIcon class="h-5 w-5" />
            Informations
          </h3>
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Source</dt>
              <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ order.sourceName || '-' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Magasin</dt>
              <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ order.storeName || '-' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Créée le</dt>
              <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ formatDate(order.createdOn) }}</dd>
            </div>
            <div v-if="order.extraTagName" class="flex justify-between">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Tag</dt>
              <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ order.extraTagName }}</dd>
            </div>
            <div v-if="order.reasonName" class="flex justify-between">
              <dt class="text-sm text-gray-500 dark:text-gray-400">Raison</dt>
              <dd class="text-sm font-medium text-red-600">{{ order.reasonName }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="order.note" class="card mt-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ChatBubbleLeftIcon class="h-5 w-5" />
          Notes
        </h3>
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
          {{ order.note }}
        </div>
      </div>

      <!-- History Timeline -->
      <div class="card mt-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ClockIcon class="h-5 w-5" />
            Historique
          </h3>
          <button
            v-if="history && history.length > 3"
            @click="showHistoryExpanded = !showHistoryExpanded"
            class="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            {{ showHistoryExpanded ? 'Réduire' : 'Voir tout' }}
            <component :is="showHistoryExpanded ? ChevronDownIcon : ChevronRightIcon" class="h-4 w-4" />
          </button>
        </div>

        <div v-if="isHistoryLoading" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>

        <div v-else-if="history && history.length > 0" class="space-y-3">
          <div
            v-for="(item, index) in (showHistoryExpanded ? history : history.slice(0, 3))"
            :key="item.id"
            class="flex gap-3"
          >
            <div
              class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              :class="getActionColor(item.actionType).bg"
            >
              <CheckCircleIcon v-if="item.actionType.includes('completed') || item.actionType.includes('created')" class="h-4 w-4" :class="getActionColor(item.actionType).text" />
              <ArrowPathIcon v-else-if="item.actionType.includes('reassigned') || item.actionType.includes('change')" class="h-4 w-4" :class="getActionColor(item.actionType).text" />
              <TruckIcon v-else-if="item.actionType.includes('delivery')" class="h-4 w-4" :class="getActionColor(item.actionType).text" />
              <UserIcon v-else-if="item.actionType.includes('assignment')" class="h-4 w-4" :class="getActionColor(item.actionType).text" />
              <ClockIcon v-else class="h-4 w-4" :class="getActionColor(item.actionType).text" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ getActionLabel(item.actionType).label }}
                </span>
                <span v-if="item.state" class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium" :class="getStateColor(item.state)">
                  {{ item.state }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <span>{{ formatDateShort(item.createdOn) }}</span>
                <span v-if="item.agentName">• {{ item.agentName }}</span>
              </div>
              <p v-if="item.comment" class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ item.comment }}</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400">
          Aucun historique disponible
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="card mt-6 sticky bottom-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg">
        <div class="flex flex-wrap gap-3 justify-center">
          <button
            v-if="canConfirm"
            @click="handleConfirm"
            :disabled="isMutating"
            class="btn-primary flex items-center gap-2"
          >
            <CheckCircleIcon class="h-5 w-5" />
            Confirmer
          </button>

          <button
            v-if="canCancel"
            @click="showCancelModal = true"
            :disabled="isMutating"
            class="btn-danger flex items-center gap-2"
          >
            <XCircleIcon class="h-5 w-5" />
            Annuler
          </button>

          <button
            v-if="canAssignDelivery"
            @click="showAssignDeliveryModal = true"
            :disabled="isMutating"
            class="btn-secondary flex items-center gap-2"
          >
            <TruckIcon class="h-5 w-5" />
            Assigner livreur
          </button>

          <button
            v-if="canMarkDelivered"
            @click="handleMarkDelivered"
            :disabled="isMutating"
            class="btn-primary flex items-center gap-2"
          >
            <CheckCircleIcon class="h-5 w-5" />
            Marquer livré
          </button>

          <button
            v-if="canMarkReturned"
            @click="handleMarkReturned"
            :disabled="isMutating"
            class="btn-warning flex items-center gap-2"
          >
            <ArrowPathIcon class="h-5 w-5" />
            Marquer retourné
          </button>

          <button
            @click="printLabel"
            class="btn-secondary flex items-center gap-2"
          >
            <PrinterIcon class="h-5 w-5" />
            Imprimer étiquette
          </button>
        </div>
      </div>
    </div>

    <!-- Assign Delivery Modal -->
    <OrdersUnifiedAssignDeliveryModal
      :show="showAssignDeliveryModal"
      :orders="ordersForDeliveryModal"
      :delivery-companies="deliveryCompanies"
      :is-submitting="isMutating"
      @close="showAssignDeliveryModal = false"
      @confirm="handleAssignDelivery"
    />

    <!-- Cancel Modal -->
    <Teleport to="body">
      <div v-if="showCancelModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/50" @click="showCancelModal = false"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Annuler la commande</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Raison d'annulation
              </label>
              <select
                v-model="selectedReasonId"
                class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              >
                <option :value="undefined">Sélectionner une raison...</option>
                <option v-for="reason in reasons" :key="reason.id" :value="reason.id">
                  {{ reason.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Commentaire (optionnel)
              </label>
              <textarea
                v-model="cancelComment"
                rows="3"
                class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                placeholder="Ajouter un commentaire..."
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button @click="showCancelModal = false" class="btn-secondary">
              Fermer
            </button>
            <button
              @click="handleCancel"
              :disabled="isMutating"
              class="btn-danger"
            >
              Confirmer l'annulation
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.card {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6;
}

.btn-primary {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium;
}

.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium;
}

.btn-warning {
  @apply px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium;
}
</style>
