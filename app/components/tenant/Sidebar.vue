<template>
  <aside
    class="fixed top-0 bottom-0 z-40 flex flex-col transition-all duration-300 border-gray-200 dark:border-gray-700"
    :class="[
      isCollapsed ? 'w-20' : 'w-64',
      'bg-white dark:bg-gray-800 border-r',
      $i18n.locale === 'ar' ? 'right-0 border-l border-r-0' : 'left-0'
    ]"
  >
    <!-- Logo Section -->
    <div class="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="flex-shrink-0 w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">E</span>
        </div>
        <Transition name="fade">
          <span v-if="!isCollapsed" class="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            E-Commerce
          </span>
        </Transition>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-3">
      <ul class="space-y-1">
        <!-- Dashboard -->
        <li v-if="canAccessDashboard">
          <NuxtLink
            to="/dashboard"
            class="nav-link"
            :class="{ 'active': isActive('/dashboard') && !isActive('/dashboard/') }"
          >
            <HomeIcon class="nav-link-icon" />
            <span v-if="!isCollapsed">{{ $t('nav.dashboard') }}</span>
          </NuxtLink>
        </li>

        <!-- Orders Section -->
        <li v-if="canAccessOrders">
          <button
            @click="toggleSection('orders')"
            class="nav-link w-full justify-between"
            :class="{ 'active': isActive('/dashboard/orders') }"
          >
            <div class="flex items-center gap-3">
              <ShoppingCartIcon class="nav-link-icon" />
              <span v-if="!isCollapsed">{{ $t('nav.orders') }}</span>
            </div>
            <ChevronDownIcon
              v-if="!isCollapsed"
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': expandedSections.orders }"
            />
          </button>
          <Transition name="slide">
            <ul v-if="expandedSections.orders && !isCollapsed" class="mt-1 ml-4 space-y-1">
              <!-- Phase: NEW -->
              <li>
                <NuxtLink to="/dashboard/orders?phase=new" class="nav-link text-sm py-2">
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
                <NuxtLink to="/dashboard/orders?phase=confirmation" class="nav-link text-sm py-2 ml-2">
                  <PhoneIcon class="w-4 h-4 mr-2" />
                  {{ $t('nav.enConfirmation') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/dashboard/orders?phase=confirmation&state=callback" class="nav-link text-sm py-2 ml-2">
                  <ClockIcon class="w-4 h-4 mr-2" />
                  {{ $t('nav.callbacks') }}
                </NuxtLink>
              </li>

              <!-- Confirmed Orders (between Confirmation and Shipping) -->
              <li class="pt-2">
                <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2">
                  {{ $t('nav.confirmedOrders') }}
                </span>
              </li>
              <li>
                <NuxtLink to="/dashboard/orders?state=confirmed" class="nav-link text-sm py-2 ml-2">
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
                <NuxtLink to="/dashboard/orders?phase=shipping&trackingState=in_progress" class="nav-link text-sm py-2 ml-2">
                  <TruckIcon class="w-4 h-4 mr-2" />
                  {{ $t('nav.inDelivery') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/dashboard/orders?phase=shipping&trackingState=no_answer" class="nav-link text-sm py-2 ml-2">
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
                <NuxtLink to="/dashboard/orders?state=delivered" class="nav-link text-sm py-2 ml-2">
                  <CheckCircleIcon class="w-4 h-4 mr-2 text-green-500" />
                  {{ $t('nav.delivered') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/dashboard/orders?state=returned" class="nav-link text-sm py-2 ml-2">
                  <ArrowUturnLeftIcon class="w-4 h-4 mr-2 text-orange-500" />
                  {{ $t('nav.returnedOrders') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/dashboard/orders?state=cancelled" class="nav-link text-sm py-2 ml-2">
                  <XCircleIcon class="w-4 h-4 mr-2 text-red-500" />
                  {{ $t('nav.cancelled') }}
                </NuxtLink>
              </li>

              <!-- All Orders -->
              <li class="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                <NuxtLink to="/dashboard/orders" class="nav-link text-sm py-2">
                  <QueueListIcon class="w-4 h-4 mr-2" />
                  {{ $t('nav.allOrders') }}
                </NuxtLink>
              </li>
            </ul>
          </Transition>
        </li>

        <!-- Worker Dashboard -->
        <li v-if="canAccessWorkerDashboard">
          <NuxtLink to="/dashboard/worker" class="nav-link" :class="{ 'active': isActive('/dashboard/worker') }">
            <ClipboardDocumentListIcon class="nav-link-icon" />
            <span v-if="!isCollapsed">{{ $t('nav.workerDashboard') }}</span>
          </NuxtLink>
        </li>

        <!-- Supervisor Dashboard -->
        <li v-if="canAccessSupervisorDashboard">
          <NuxtLink to="/dashboard/supervisor" class="nav-link" :class="{ 'active': isActive('/dashboard/supervisor') }">
            <ShieldCheckIcon class="nav-link-icon" />
            <span v-if="!isCollapsed">{{ $t('nav.supervisorDashboard') }}</span>
          </NuxtLink>
        </li>

        <!-- Products -->
        <li v-if="canAccessProducts">
          <NuxtLink to="/dashboard/products" class="nav-link" :class="{ 'active': isActive('/dashboard/products') }">
            <CubeIcon class="nav-link-icon" />
            <span v-if="!isCollapsed">{{ $t('nav.products') }}</span>
          </NuxtLink>
        </li>

        <!-- Customers -->
        <li v-if="canAccessCustomers">
          <NuxtLink to="/dashboard/customers" class="nav-link" :class="{ 'active': isActive('/dashboard/customers') }">
            <UsersIcon class="nav-link-icon" />
            <span v-if="!isCollapsed">{{ $t('nav.customers') }}</span>
          </NuxtLink>
        </li>

        <!-- Team Management / Users -->
        <li v-if="canAccessUsers">
          <NuxtLink to="/dashboard/users" class="nav-link" :class="{ 'active': isActive('/dashboard/users') }">
            <UserGroupIcon class="nav-link-icon" />
            <span v-if="!isCollapsed">{{ $t('nav.users') }}</span>
          </NuxtLink>
        </li>

        <!-- Inventory Section -->
        <li v-if="canAccessInventorySection">
          <button
            @click="toggleSection('inventory')"
            class="nav-link w-full justify-between"
            :class="{ 'active': isActive('/dashboard/stocks') || isActive('/dashboard/purchases') || isActive('/dashboard/stock-transactions') || isActive('/dashboard/shipments') || isActive('/dashboard/dropshippings') }"
          >
            <div class="flex items-center gap-3">
              <ArchiveBoxIcon class="nav-link-icon" />
              <span v-if="!isCollapsed">{{ $t('nav.inventory') }}</span>
            </div>
            <ChevronDownIcon
              v-if="!isCollapsed"
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': expandedSections.inventory }"
            />
          </button>
          <Transition name="slide">
            <ul v-if="expandedSections.inventory && !isCollapsed" class="mt-1 ml-8 space-y-1">
              <li v-if="canAccessStocks">
                <NuxtLink to="/dashboard/stocks" class="nav-link text-sm py-2">
                  {{ $t('nav.stocks') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessPurchases">
                <NuxtLink to="/dashboard/purchases" class="nav-link text-sm py-2">
                  {{ $t('nav.purchases') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessStocks">
                <NuxtLink to="/dashboard/stock-transactions" class="nav-link text-sm py-2">
                  {{ $t('nav.stockTransactions') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessShipments">
                <NuxtLink to="/dashboard/shipments" class="nav-link text-sm py-2">
                  {{ $t('nav.shipments') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessDropshippings">
                <NuxtLink to="/dashboard/dropshippings" class="nav-link text-sm py-2">
                  {{ $t('nav.dropshippings') }}
                </NuxtLink>
              </li>
            </ul>
          </Transition>
        </li>

        <!-- Delivery Section -->
        <li v-if="canAccessDeliverySection">
          <button
            @click="toggleSection('delivery')"
            class="nav-link w-full justify-between"
            :class="{ 'active': isActive('/dashboard/delivery') }"
          >
            <div class="flex items-center gap-3">
              <TruckIcon class="nav-link-icon" />
              <span v-if="!isCollapsed">{{ $t('nav.delivery') }}</span>
            </div>
            <ChevronDownIcon
              v-if="!isCollapsed"
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': expandedSections.delivery }"
            />
          </button>
          <Transition name="slide">
            <ul v-if="expandedSections.delivery && !isCollapsed" class="mt-1 ml-8 space-y-1">
              <li v-if="canAccessDeliveryCompanies">
                <NuxtLink to="/dashboard/delivery-companies" class="nav-link text-sm py-2">
                  {{ $t('nav.deliveryCompanies') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessSubDeliveryCompanies">
                <NuxtLink to="/dashboard/sub-delivery-companies" class="nav-link text-sm py-2">
                  {{ $t('nav.subDeliveryCompanies') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessShippingFees">
                <NuxtLink to="/dashboard/shipping-fees" class="nav-link text-sm py-2">
                  {{ $t('nav.shippingFees') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessDeliveryNotes">
                <NuxtLink to="/dashboard/delivery-notes" class="nav-link text-sm py-2">
                  {{ $t('nav.deliveryNotes') }}
                </NuxtLink>
              </li>
            </ul>
          </Transition>
        </li>

        <!-- Finance Section -->
        <li v-if="canAccessFinanceSection">
          <button
            @click="toggleSection('finance')"
            class="nav-link w-full justify-between"
            :class="{ 'active': isActive('/dashboard/payments') || isActive('/dashboard/invoices') || isActive('/dashboard/expenses') || isActive('/dashboard/legal-invoices') || isActive('/dashboard/order-fees') || isActive('/dashboard/order-costs') }"
          >
            <div class="flex items-center gap-3">
              <BanknotesIcon class="nav-link-icon" />
              <span v-if="!isCollapsed">{{ $t('nav.finance') }}</span>
            </div>
            <ChevronDownIcon
              v-if="!isCollapsed"
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': expandedSections.finance }"
            />
          </button>
          <Transition name="slide">
            <ul v-if="expandedSections.finance && !isCollapsed" class="mt-1 ml-8 space-y-1">
              <li v-if="canAccessPayments">
                <NuxtLink to="/dashboard/payments" class="nav-link text-sm py-2">
                  {{ $t('nav.payments') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessInvoices">
                <NuxtLink to="/dashboard/invoices" class="nav-link text-sm py-2">
                  {{ $t('nav.invoices') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessLegalInvoices">
                <NuxtLink to="/dashboard/legal-invoices" class="nav-link text-sm py-2">
                  {{ $t('nav.legalInvoices') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessExpenses">
                <NuxtLink to="/dashboard/expenses" class="nav-link text-sm py-2">
                  {{ $t('nav.expenses') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessOrderFees">
                <NuxtLink to="/dashboard/order-fees" class="nav-link text-sm py-2">
                  {{ $t('nav.orderFees') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessOrderCosts">
                <NuxtLink to="/dashboard/order-costs" class="nav-link text-sm py-2">
                  {{ $t('nav.orderCosts') }}
                </NuxtLink>
              </li>
            </ul>
          </Transition>
        </li>

        <!-- Marketing Section -->
        <li v-if="canAccessMarketingSection">
          <button
            @click="toggleSection('marketing')"
            class="nav-link w-full justify-between"
            :class="{ 'active': isActive('/dashboard/spent-ads') || isActive('/dashboard/media-buyer-expenses') || isActive('/dashboard/media-buyer-invoices') }"
          >
            <div class="flex items-center gap-3">
              <MegaphoneIcon class="nav-link-icon" />
              <span v-if="!isCollapsed">{{ $t('nav.marketing') }}</span>
            </div>
            <ChevronDownIcon
              v-if="!isCollapsed"
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': expandedSections.marketing }"
            />
          </button>
          <Transition name="slide">
            <ul v-if="expandedSections.marketing && !isCollapsed" class="mt-1 ml-8 space-y-1">
              <li v-if="canAccessSpentAds">
                <NuxtLink to="/dashboard/spent-ads" class="nav-link text-sm py-2">
                  {{ $t('nav.spentAds') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessMediaBuyerExpenses">
                <NuxtLink to="/dashboard/media-buyer-expenses" class="nav-link text-sm py-2">
                  {{ $t('nav.mediaBuyerExpenses') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessMediaBuyerInvoices">
                <NuxtLink to="/dashboard/media-buyer-invoices" class="nav-link text-sm py-2">
                  {{ $t('nav.mediaBuyerInvoices') }}
                </NuxtLink>
              </li>
            </ul>
          </Transition>
        </li>

        <!-- Master Data Section -->
        <li v-if="canAccessMasterDataSection">
          <button
            @click="toggleSection('masterData')"
            class="nav-link w-full justify-between"
            :class="{ 'active': isActive('/dashboard/cities') || isActive('/dashboard/brands') || isActive('/dashboard/sources') || isActive('/dashboard/reasons') || isActive('/dashboard/extratags') || isActive('/dashboard/trackingstates') || isActive('/dashboard/expensetypes') || isActive('/dashboard/suppliers') }"
          >
            <div class="flex items-center gap-3">
              <CircleStackIcon class="nav-link-icon" />
              <span v-if="!isCollapsed">{{ $t('nav.masterData') }}</span>
            </div>
            <ChevronDownIcon
              v-if="!isCollapsed"
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': expandedSections.masterData }"
            />
          </button>
          <Transition name="slide">
            <ul v-if="expandedSections.masterData && !isCollapsed" class="mt-1 ml-8 space-y-1">
              <li v-if="canAccessCities">
                <NuxtLink to="/dashboard/cities" class="nav-link text-sm py-2">
                  <BuildingOfficeIcon class="w-4 h-4 mr-2" />
                  {{ $t('nav.cities') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessBrands">
                <NuxtLink to="/dashboard/brands" class="nav-link text-sm py-2">
                  <TagIcon class="w-4 h-4 mr-2" />
                  {{ $t('nav.brands') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessSources">
                <NuxtLink to="/dashboard/sources" class="nav-link text-sm py-2">
                  <MegaphoneIcon class="w-4 h-4 mr-2" />
                  {{ $t('nav.sources') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessReasons">
                <NuxtLink to="/dashboard/reasons" class="nav-link text-sm py-2">
                  <ExclamationTriangleIcon class="w-4 h-4 mr-2" />
                  {{ $t('nav.reasons') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessExtraTags">
                <NuxtLink to="/dashboard/extratags" class="nav-link text-sm py-2">
                  <HashtagIcon class="w-4 h-4 mr-2" />
                  {{ $t('nav.extraTags') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessTrackingStates">
                <NuxtLink to="/dashboard/trackingstates" class="nav-link text-sm py-2">
                  <SignalIcon class="w-4 h-4 mr-2" />
                  {{ $t('nav.trackingStates') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessExpenseTypes">
                <NuxtLink to="/dashboard/expensetypes" class="nav-link text-sm py-2">
                  <CurrencyDollarIcon class="w-4 h-4 mr-2" />
                  {{ $t('nav.expenseTypes') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessSuppliers">
                <NuxtLink to="/dashboard/suppliers" class="nav-link text-sm py-2">
                  <TruckIcon class="w-4 h-4 mr-2" />
                  {{ $t('nav.suppliers') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessStores">
                <NuxtLink to="/dashboard/stores" class="nav-link text-sm py-2">
                  <BuildingStorefrontIcon class="w-4 h-4 mr-2" />
                  {{ $t('nav.stores') }}
                </NuxtLink>
              </li>
            </ul>
          </Transition>
        </li>

        <!-- Reports/Statistics -->
        <li v-if="canAccessStatistics">
          <NuxtLink to="/dashboard/statistics" class="nav-link" :class="{ 'active': isActive('/dashboard/statistics') }">
            <ChartBarIcon class="nav-link-icon" />
            <span v-if="!isCollapsed">{{ $t('nav.reports') }}</span>
          </NuxtLink>
        </li>

        <!-- Divider -->
        <li v-if="canAccessConfigSection" class="my-4 border-t border-gray-200 dark:border-gray-700"></li>

        <!-- Configuration Section -->
        <li v-if="canAccessConfigSection">
          <button
            @click="toggleSection('config')"
            class="nav-link w-full justify-between"
            :class="{ 'active': isActive('/dashboard/sms-templates') || isActive('/dashboard/platform-integrations') || isActive('/dashboard/settings') }"
          >
            <div class="flex items-center gap-3">
              <Cog6ToothIcon class="nav-link-icon" />
              <span v-if="!isCollapsed">{{ $t('nav.configuration') }}</span>
            </div>
            <ChevronDownIcon
              v-if="!isCollapsed"
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': expandedSections.config }"
            />
          </button>
          <Transition name="slide">
            <ul v-if="expandedSections.config && !isCollapsed" class="mt-1 ml-8 space-y-1">
              <li v-if="canAccessSettings">
                <NuxtLink to="/dashboard/settings" class="nav-link text-sm py-2">
                  {{ $t('nav.settings') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessAutoAssignment">
                <NuxtLink to="/dashboard/settings/auto-assignment" class="nav-link text-sm py-2">
                  {{ $t('nav.autoAssignment') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessQualityChecklist">
                <NuxtLink to="/dashboard/settings/quality-checklist" class="nav-link text-sm py-2">
                  {{ $t('nav.qualityChecklist') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessStockSettings">
                <NuxtLink to="/dashboard/settings/stock" class="nav-link text-sm py-2">
                  {{ $t('nav.stockSettings') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessRoles">
                <NuxtLink to="/dashboard/roles" class="nav-link text-sm py-2">
                  {{ $t('nav.roles') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessSmsTemplates">
                <NuxtLink to="/dashboard/sms-templates" class="nav-link text-sm py-2">
                  {{ $t('nav.smsTemplates') }}
                </NuxtLink>
              </li>
              <li v-if="canAccessPlatformIntegrations">
                <NuxtLink to="/dashboard/platform-integrations" class="nav-link text-sm py-2">
                  {{ $t('nav.platformIntegrations') }}
                </NuxtLink>
              </li>
            </ul>
          </Transition>
        </li>
      </ul>
    </nav>

    <!-- Collapse Toggle Button -->
    <div class="p-3 border-t border-gray-200 dark:border-gray-700">
      <button
        @click="$emit('toggle')"
        class="nav-link w-full justify-center"
        :title="isCollapsed ? 'Expand' : 'Collapse'"
      >
        <ChevronDoubleLeftIcon
          class="w-5 h-5 transition-transform"
          :class="{ 'rotate-180': isCollapsed, 'rtl-flip': $i18n.locale === 'ar' }"
        />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
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
  ChevronDoubleLeftIcon,
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
  isCollapsed: boolean
}>()

defineEmits<{
  toggle: []
}>()

const route = useRoute()
const { hasPermission } = useAuth()

// Permission checks for menu visibility
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
const canAccessSubDeliveryCompanies = computed(() =>
  hasPermission('Permissions.SubDeliveryCompanies.View')
)
const canAccessDeliverySection = computed(() =>
  canAccessDeliveryCompanies.value || canAccessShippingFees.value || canAccessDeliveryNotes.value || canAccessSubDeliveryCompanies.value
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
  masterData: true,
  config: false
})

const isActive = (path: string) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path.startsWith(path)
}

const toggleSection = (section: keyof typeof expandedSections.value) => {
  expandedSections.value[section] = !expandedSections.value[section]
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
