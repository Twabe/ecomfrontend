<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50 lg:hidden" @close="$emit('close')">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/50" />
      </TransitionChild>

      <!-- Drawer -->
      <div class="fixed inset-0 flex" :class="$i18n.locale === 'ar' ? 'justify-end' : 'justify-start'">
        <TransitionChild
          as="template"
          enter="transform transition ease-out duration-300"
          :enter-from="$i18n.locale === 'ar' ? 'translate-x-full' : '-translate-x-full'"
          enter-to="translate-x-0"
          leave="transform transition ease-in duration-200"
          leave-from="translate-x-0"
          :leave-to="$i18n.locale === 'ar' ? 'translate-x-full' : '-translate-x-full'"
        >
          <DialogPanel class="relative w-72 max-w-full bg-white dark:bg-gray-800 flex flex-col h-full shadow-xl">
            <!-- Header -->
            <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-lg">E</span>
                </div>
                <span class="font-semibold text-gray-900 dark:text-white">E-Commerce</span>
              </div>
              <button
                @click="$emit('close')"
                class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 overflow-y-auto py-4 px-3">
              <ul class="space-y-1">
                <!-- Dashboard -->
                <li v-if="canAccessDashboard">
                  <NuxtLink to="/dashboard" class="nav-link" active-class="active" @click="$emit('close')">
                    <HomeIcon class="nav-link-icon" />
                    <span>{{ $t('nav.dashboard') }}</span>
                  </NuxtLink>
                </li>

                <!-- Orders Section -->
                <li v-if="canAccessOrders">
                  <button
                    @click="toggleSection('orders')"
                    class="nav-link w-full justify-between"
                  >
                    <div class="flex items-center gap-3">
                      <ShoppingCartIcon class="nav-link-icon" />
                      <span>{{ $t('nav.orders') }}</span>
                    </div>
                    <ChevronDownIcon
                      class="w-4 h-4 transition-transform"
                      :class="{ 'rotate-180': expandedSections.orders }"
                    />
                  </button>
                  <ul v-if="expandedSections.orders" class="mt-1 ml-4 space-y-1">
                    <!-- Phase: NEW -->
                    <li>
                      <NuxtLink to="/dashboard/orders?phase=new" class="nav-link text-sm py-2" @click="$emit('close')">
                        <InboxArrowDownIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.nouvelles') }}
                      </NuxtLink>
                    </li>
                    <!-- Phase: CONFIRMATION -->
                    <li class="pt-2">
                      <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2">
                        {{ $t('nav.phaseConfirmation') }}
                      </span>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?phase=confirmation" class="nav-link text-sm py-2 ml-2" @click="$emit('close')">
                        <PhoneIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.enConfirmation') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?phase=confirmation&state=callback" class="nav-link text-sm py-2 ml-2" @click="$emit('close')">
                        <ClockIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.callbacks') }}
                      </NuxtLink>
                    </li>
                    <!-- Confirmed Orders -->
                    <li class="pt-2">
                      <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2">
                        {{ $t('nav.confirmedOrders') }}
                      </span>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?state=confirmed" class="nav-link text-sm py-2 ml-2" @click="$emit('close')">
                        <CheckCircleIcon class="w-4 h-4 mr-2 text-cyan-500" />
                        {{ $t('nav.confirmed') }}
                      </NuxtLink>
                    </li>
                    <!-- Phase: SHIPPING -->
                    <li class="pt-2">
                      <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2">
                        {{ $t('nav.phaseShipping') }}
                      </span>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?phase=shipping&trackingState=in_progress" class="nav-link text-sm py-2 ml-2" @click="$emit('close')">
                        <TruckIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.inDelivery') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?phase=shipping&trackingState=no_answer" class="nav-link text-sm py-2 ml-2" @click="$emit('close')">
                        <PhoneXMarkIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.noAnswer') }}
                      </NuxtLink>
                    </li>
                    <!-- Final States -->
                    <li class="pt-2">
                      <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2">
                        {{ $t('nav.finalStates') }}
                      </span>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?state=delivered" class="nav-link text-sm py-2 ml-2" @click="$emit('close')">
                        <CheckCircleIcon class="w-4 h-4 mr-2 text-green-500" />
                        {{ $t('nav.delivered') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?state=returned" class="nav-link text-sm py-2 ml-2" @click="$emit('close')">
                        <ArrowUturnLeftIcon class="w-4 h-4 mr-2 text-orange-500" />
                        {{ $t('nav.returnedOrders') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?state=cancelled" class="nav-link text-sm py-2 ml-2" @click="$emit('close')">
                        <XCircleIcon class="w-4 h-4 mr-2 text-red-500" />
                        {{ $t('nav.cancelled') }}
                      </NuxtLink>
                    </li>
                    <!-- All Orders -->
                    <li class="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                      <NuxtLink to="/dashboard/orders" class="nav-link text-sm py-2" @click="$emit('close')">
                        <QueueListIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.allOrders') }}
                      </NuxtLink>
                    </li>
                  </ul>
                </li>

                <!-- Worker Dashboard -->
                <li v-if="canAccessWorkerDashboard">
                  <NuxtLink to="/dashboard/worker" class="nav-link" active-class="active" @click="$emit('close')">
                    <ClipboardDocumentListIcon class="nav-link-icon" />
                    <span>{{ $t('nav.workerDashboard') }}</span>
                  </NuxtLink>
                </li>

                <!-- Supervisor Dashboard -->
                <li v-if="canAccessSupervisorDashboard">
                  <NuxtLink to="/dashboard/supervisor" class="nav-link" active-class="active" @click="$emit('close')">
                    <ShieldCheckIcon class="nav-link-icon" />
                    <span>{{ $t('nav.supervisorDashboard') }}</span>
                  </NuxtLink>
                </li>

                <!-- Products -->
                <li v-if="canAccessProducts">
                  <NuxtLink to="/dashboard/products" class="nav-link" active-class="active" @click="$emit('close')">
                    <CubeIcon class="nav-link-icon" />
                    <span>{{ $t('nav.products') }}</span>
                  </NuxtLink>
                </li>

                <!-- Customers -->
                <li v-if="canAccessCustomers">
                  <NuxtLink to="/dashboard/customers" class="nav-link" active-class="active" @click="$emit('close')">
                    <UsersIcon class="nav-link-icon" />
                    <span>{{ $t('nav.customers') }}</span>
                  </NuxtLink>
                </li>

                <!-- Team Management / Users -->
                <li v-if="canAccessUsers">
                  <NuxtLink to="/dashboard/users" class="nav-link" active-class="active" @click="$emit('close')">
                    <UserGroupIcon class="nav-link-icon" />
                    <span>{{ $t('nav.users') }}</span>
                  </NuxtLink>
                </li>

                <!-- Inventory Section -->
                <li v-if="canAccessInventorySection">
                  <button
                    @click="toggleSection('inventory')"
                    class="nav-link w-full justify-between"
                  >
                    <div class="flex items-center gap-3">
                      <ArchiveBoxIcon class="nav-link-icon" />
                      <span>{{ $t('nav.inventory') }}</span>
                    </div>
                    <ChevronDownIcon
                      class="w-4 h-4 transition-transform"
                      :class="{ 'rotate-180': expandedSections.inventory }"
                    />
                  </button>
                  <ul v-if="expandedSections.inventory" class="mt-1 ml-8 space-y-1">
                    <li v-if="canAccessStocks">
                      <NuxtLink to="/dashboard/stocks" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.stocks') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessPurchases">
                      <NuxtLink to="/dashboard/purchases" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.purchases') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessStocks">
                      <NuxtLink to="/dashboard/stock-transactions" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.stockTransactions') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessShipments">
                      <NuxtLink to="/dashboard/shipments" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.shipments') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessDropshippings">
                      <NuxtLink to="/dashboard/dropshippings" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.dropshippings') }}
                      </NuxtLink>
                    </li>
                  </ul>
                </li>

                <!-- Delivery Section -->
                <li v-if="canAccessDeliverySection">
                  <button
                    @click="toggleSection('delivery')"
                    class="nav-link w-full justify-between"
                  >
                    <div class="flex items-center gap-3">
                      <TruckIcon class="nav-link-icon" />
                      <span>{{ $t('nav.delivery') }}</span>
                    </div>
                    <ChevronDownIcon
                      class="w-4 h-4 transition-transform"
                      :class="{ 'rotate-180': expandedSections.delivery }"
                    />
                  </button>
                  <ul v-if="expandedSections.delivery" class="mt-1 ml-8 space-y-1">
                    <li>
                      <NuxtLink to="/dashboard/delivery-providers" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.providerConnections') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessShippingFees">
                      <NuxtLink to="/dashboard/shipping-fees" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.shippingFees') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessDeliveryNotes">
                      <NuxtLink to="/dashboard/delivery-notes" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.deliveryNotes') }}
                      </NuxtLink>
                    </li>
                  </ul>
                </li>

                <!-- Finance Section -->
                <li v-if="canAccessFinanceSection">
                  <button
                    @click="toggleSection('finance')"
                    class="nav-link w-full justify-between"
                  >
                    <div class="flex items-center gap-3">
                      <BanknotesIcon class="nav-link-icon" />
                      <span>{{ $t('nav.finance') }}</span>
                    </div>
                    <ChevronDownIcon
                      class="w-4 h-4 transition-transform"
                      :class="{ 'rotate-180': expandedSections.finance }"
                    />
                  </button>
                  <ul v-if="expandedSections.finance" class="mt-1 ml-8 space-y-1">
                    <li v-if="canAccessPayments">
                      <NuxtLink to="/dashboard/payments" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.payments') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessInvoices">
                      <NuxtLink to="/dashboard/invoices" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.invoices') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessLegalInvoices">
                      <NuxtLink to="/dashboard/legal-invoices" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.legalInvoices') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessExpenses">
                      <NuxtLink to="/dashboard/expenses" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.expenses') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessOrderFees">
                      <NuxtLink to="/dashboard/order-fees" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.orderFees') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessOrderCosts">
                      <NuxtLink to="/dashboard/order-costs" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.orderCosts') }}
                      </NuxtLink>
                    </li>
                  </ul>
                </li>

                <!-- Marketing Section -->
                <li v-if="canAccessMarketingSection">
                  <button
                    @click="toggleSection('marketing')"
                    class="nav-link w-full justify-between"
                  >
                    <div class="flex items-center gap-3">
                      <MegaphoneIcon class="nav-link-icon" />
                      <span>{{ $t('nav.marketing') }}</span>
                    </div>
                    <ChevronDownIcon
                      class="w-4 h-4 transition-transform"
                      :class="{ 'rotate-180': expandedSections.marketing }"
                    />
                  </button>
                  <ul v-if="expandedSections.marketing" class="mt-1 ml-8 space-y-1">
                    <li v-if="canAccessSpentAds">
                      <NuxtLink to="/dashboard/spent-ads" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.spentAds') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessMediaBuyerExpenses">
                      <NuxtLink to="/dashboard/media-buyer-expenses" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.mediaBuyerExpenses') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessMediaBuyerInvoices">
                      <NuxtLink to="/dashboard/media-buyer-invoices" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.mediaBuyerInvoices') }}
                      </NuxtLink>
                    </li>
                  </ul>
                </li>

                <!-- Master Data Section -->
                <li v-if="canAccessMasterDataSection">
                  <button
                    @click="toggleSection('masterData')"
                    class="nav-link w-full justify-between"
                  >
                    <div class="flex items-center gap-3">
                      <CircleStackIcon class="nav-link-icon" />
                      <span>{{ $t('nav.masterData') }}</span>
                    </div>
                    <ChevronDownIcon
                      class="w-4 h-4 transition-transform"
                      :class="{ 'rotate-180': expandedSections.masterData }"
                    />
                  </button>
                  <ul v-if="expandedSections.masterData" class="mt-1 ml-8 space-y-1">
                    <li v-if="canAccessCities">
                      <NuxtLink to="/dashboard/cities" class="nav-link text-sm py-2" @click="$emit('close')">
                        <BuildingOfficeIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.cities') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessBrands">
                      <NuxtLink to="/dashboard/brands" class="nav-link text-sm py-2" @click="$emit('close')">
                        <TagIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.brands') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessSources">
                      <NuxtLink to="/dashboard/sources" class="nav-link text-sm py-2" @click="$emit('close')">
                        <MegaphoneIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.sources') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessReasons">
                      <NuxtLink to="/dashboard/reasons" class="nav-link text-sm py-2" @click="$emit('close')">
                        <ExclamationTriangleIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.reasons') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessExtraTags">
                      <NuxtLink to="/dashboard/extratags" class="nav-link text-sm py-2" @click="$emit('close')">
                        <HashtagIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.extraTags') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessTrackingStates">
                      <NuxtLink to="/dashboard/trackingstates" class="nav-link text-sm py-2" @click="$emit('close')">
                        <SignalIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.trackingStates') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessExpenseTypes">
                      <NuxtLink to="/dashboard/expensetypes" class="nav-link text-sm py-2" @click="$emit('close')">
                        <CurrencyDollarIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.expenseTypes') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessSuppliers">
                      <NuxtLink to="/dashboard/suppliers" class="nav-link text-sm py-2" @click="$emit('close')">
                        <TruckIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.suppliers') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessStores">
                      <NuxtLink to="/dashboard/stores" class="nav-link text-sm py-2" @click="$emit('close')">
                        <BuildingStorefrontIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.stores') }}
                      </NuxtLink>
                    </li>
                  </ul>
                </li>

                <!-- Reports/Statistics -->
                <li v-if="canAccessStatistics">
                  <NuxtLink to="/dashboard/statistics" class="nav-link" active-class="active" @click="$emit('close')">
                    <ChartBarIcon class="nav-link-icon" />
                    <span>{{ $t('nav.reports') }}</span>
                  </NuxtLink>
                </li>

                <!-- Divider -->
                <li v-if="canAccessConfigSection" class="my-4 border-t border-gray-200 dark:border-gray-700"></li>

                <!-- Configuration Section -->
                <li v-if="canAccessConfigSection">
                  <button
                    @click="toggleSection('config')"
                    class="nav-link w-full justify-between"
                  >
                    <div class="flex items-center gap-3">
                      <Cog6ToothIcon class="nav-link-icon" />
                      <span>{{ $t('nav.configuration') }}</span>
                    </div>
                    <ChevronDownIcon
                      class="w-4 h-4 transition-transform"
                      :class="{ 'rotate-180': expandedSections.config }"
                    />
                  </button>
                  <ul v-if="expandedSections.config" class="mt-1 ml-8 space-y-1">
                    <li v-if="canAccessSettings">
                      <NuxtLink to="/dashboard/settings" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.settings') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessAutoAssignment">
                      <NuxtLink to="/dashboard/settings/auto-assignment" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.autoAssignment') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessQualityChecklist">
                      <NuxtLink to="/dashboard/settings/quality-checklist" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.qualityChecklist') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessStockSettings">
                      <NuxtLink to="/dashboard/settings/stock" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.stockSettings') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessDeliveryCompanies">
                      <NuxtLink to="/dashboard/settings/provider-cities" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.providerCities', 'Provider Cities') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessRoles">
                      <NuxtLink to="/dashboard/roles" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.roles') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessSmsTemplates">
                      <NuxtLink to="/dashboard/sms-templates" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.smsTemplates') }}
                      </NuxtLink>
                    </li>
                    <li v-if="canAccessPlatformIntegrations">
                      <NuxtLink to="/dashboard/platform-integrations" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.platformIntegrations') }}
                      </NuxtLink>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>

            <!-- User Section -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-medium">{{ userInitials }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ user?.userName }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ user?.email }}</p>
                </div>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'
import {
  XMarkIcon,
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  TruckIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  CircleStackIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  TagIcon,
  MegaphoneIcon,
  ExclamationTriangleIcon,
  HashtagIcon,
  SignalIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  InboxArrowDownIcon,
  PhoneIcon,
  PhoneXMarkIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  QueueListIcon,
  ArrowUturnLeftIcon
} from '@heroicons/vue/24/outline'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  close: []
}>()

const { user, hasPermission } = useAuth()

// Permission checks - matching desktop sidebar
const canAccessDashboard = computed(() =>
  hasPermission('Permissions.Dashboard.View')
)
const canAccessOrders = computed(() =>
  hasPermission('Permissions.Orders.View')
)
const canAccessProducts = computed(() =>
  hasPermission('Permissions.Products.View')
)
const canAccessCustomers = computed(() =>
  hasPermission('Permissions.Customers.View')
)
const canAccessUsers = computed(() =>
  hasPermission('Permissions.Users.View')
)
const canAccessWorkerDashboard = computed(() =>
  hasPermission('Permissions.WorkerDashboard.View')
)
const canAccessSupervisorDashboard = computed(() =>
  hasPermission('Permissions.SupervisorDashboard.View')
)
// Inventory section
const canAccessStocks = computed(() =>
  hasPermission('Permissions.Stocks.View')
)
const canAccessPurchases = computed(() =>
  hasPermission('Permissions.Purchases.View')
)
const canAccessShipments = computed(() =>
  hasPermission('Permissions.Shipments.View')
)
const canAccessDropshippings = computed(() =>
  hasPermission('Permissions.Dropshippings.View')
)
const canAccessInventorySection = computed(() =>
  canAccessStocks.value || canAccessPurchases.value || canAccessShipments.value || canAccessDropshippings.value
)
// Delivery section
const canAccessDeliveryCompanies = computed(() =>
  hasPermission('Permissions.DeliveryCompanies.View')
)
const canAccessShippingFees = computed(() =>
  hasPermission('Permissions.ShippingFees.View')
)
const canAccessDeliveryNotes = computed(() =>
  hasPermission('Permissions.DeliveryNotes.View')
)
const canAccessProviderConnections = computed(() =>
  hasPermission('Permissions.TenantDeliveryConnections.View')
)
const canAccessDeliverySection = computed(() =>
  canAccessDeliveryCompanies.value || canAccessShippingFees.value || canAccessDeliveryNotes.value || canAccessProviderConnections.value
)
// Finance section
const canAccessPayments = computed(() =>
  hasPermission('Permissions.Payments.View')
)
const canAccessInvoices = computed(() =>
  hasPermission('Permissions.Invoices.View')
)
const canAccessExpenses = computed(() =>
  hasPermission('Permissions.Expenses.View')
)
const canAccessLegalInvoices = computed(() =>
  hasPermission('Permissions.LegalInvoices.View')
)
const canAccessOrderFees = computed(() =>
  hasPermission('Permissions.OrderFees.View')
)
const canAccessOrderCosts = computed(() =>
  hasPermission('Permissions.OrderCosts.View')
)
const canAccessFinanceSection = computed(() =>
  canAccessPayments.value || canAccessInvoices.value || canAccessExpenses.value || canAccessLegalInvoices.value || canAccessOrderFees.value || canAccessOrderCosts.value
)
// Marketing section
const canAccessSpentAds = computed(() =>
  hasPermission('Permissions.SpentAds.View')
)
const canAccessMediaBuyerExpenses = computed(() =>
  hasPermission('Permissions.MediaBuyerExpenses.View')
)
const canAccessMediaBuyerInvoices = computed(() =>
  hasPermission('Permissions.MediaBuyerInvoices.View')
)
const canAccessMarketingSection = computed(() =>
  canAccessSpentAds.value || canAccessMediaBuyerExpenses.value || canAccessMediaBuyerInvoices.value
)
// Master Data section
const canAccessCities = computed(() =>
  hasPermission('Permissions.Cities.View')
)
const canAccessBrands = computed(() =>
  hasPermission('Permissions.Brands.View')
)
const canAccessSources = computed(() =>
  hasPermission('Permissions.Sources.View')
)
const canAccessReasons = computed(() =>
  hasPermission('Permissions.Reasons.View')
)
const canAccessExtraTags = computed(() =>
  hasPermission('Permissions.ExtraTags.View')
)
const canAccessTrackingStates = computed(() =>
  hasPermission('Permissions.TrackingStates.View')
)
const canAccessExpenseTypes = computed(() =>
  hasPermission('Permissions.ExpenseTypes.View')
)
const canAccessSuppliers = computed(() =>
  hasPermission('Permissions.Suppliers.View')
)
const canAccessStores = computed(() =>
  hasPermission('Permissions.Stores.View')
)
const canAccessMasterDataSection = computed(() =>
  canAccessCities.value || canAccessBrands.value || canAccessSources.value || canAccessReasons.value ||
  canAccessExtraTags.value || canAccessTrackingStates.value || canAccessExpenseTypes.value || canAccessSuppliers.value || canAccessStores.value
)
// Reports & Config
const canAccessStatistics = computed(() =>
  hasPermission('Permissions.Statistics.View')
)
const canAccessSettings = computed(() =>
  hasPermission('Permissions.Settings.View')
)
const canAccessRoles = computed(() =>
  hasPermission('Permissions.Roles.View')
)
const canAccessSmsTemplates = computed(() =>
  hasPermission('Permissions.SmsTemplates.View')
)
const canAccessPlatformIntegrations = computed(() =>
  hasPermission('Permissions.PlatformIntegrations.View')
)
const canAccessAutoAssignment = computed(() =>
  hasPermission('Permissions.AutoAssignmentSettings.View')
)
const canAccessQualityChecklist = computed(() =>
  hasPermission('Permissions.QualityChecklistItems.View')
)
const canAccessStockSettings = computed(() =>
  hasPermission('Permissions.StockSettings.View')
)
const canAccessConfigSection = computed(() =>
  canAccessSettings.value || canAccessRoles.value || canAccessSmsTemplates.value || canAccessPlatformIntegrations.value || canAccessAutoAssignment.value || canAccessQualityChecklist.value || canAccessStockSettings.value
)

const expandedSections = ref({
  orders: true,
  inventory: false,
  delivery: false,
  finance: false,
  marketing: false,
  masterData: false,
  config: false
})

const toggleSection = (section: keyof typeof expandedSections.value) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const userInitials = computed(() => {
  if (!user.value) return 'U'
  const firstName = user.value.firstName || user.value.userName || ''
  const lastName = user.value.lastName || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U'
})
</script>
