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
                <li>
                  <NuxtLink to="/dashboard" class="nav-link" active-class="active" @click="$emit('close')">
                    <HomeIcon class="nav-link-icon" />
                    <span>{{ $t('nav.dashboard') }}</span>
                  </NuxtLink>
                </li>

                <!-- Orders Section -->
                <li>
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
                  <ul v-if="expandedSections.orders" class="mt-1 ml-8 space-y-1">
                    <li>
                      <NuxtLink to="/dashboard/orders?phase=new" class="nav-link text-sm py-2" @click="$emit('close')">
                        <InboxArrowDownIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.nouvelles') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?phase=confirmation" class="nav-link text-sm py-2" @click="$emit('close')">
                        <PhoneIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.confirmation') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?phase=shipping" class="nav-link text-sm py-2" @click="$emit('close')">
                        <TruckIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.suivi') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?state=in_progress" class="nav-link text-sm py-2" @click="$emit('close')">
                        <ClockIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.inProgress') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?state=no_answer" class="nav-link text-sm py-2" @click="$emit('close')">
                        <PhoneXMarkIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.noAnswer') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?state=cancelled" class="nav-link text-sm py-2" @click="$emit('close')">
                        <XCircleIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.cancelled') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?state=confirmed" class="nav-link text-sm py-2" @click="$emit('close')">
                        <CheckCircleIcon class="w-4 h-4 mr-2 text-cyan-500" />
                        {{ $t('nav.confirmed') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?state=delivered" class="nav-link text-sm py-2" @click="$emit('close')">
                        <CheckCircleIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.delivered') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/orders?state=returned" class="nav-link text-sm py-2" @click="$emit('close')">
                        <ArrowUturnLeftIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.returnedOrders') }}
                      </NuxtLink>
                    </li>
                    <li>
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
                <li>
                  <NuxtLink to="/dashboard/products" class="nav-link" active-class="active" @click="$emit('close')">
                    <CubeIcon class="nav-link-icon" />
                    <span>{{ $t('nav.products') }}</span>
                  </NuxtLink>
                </li>

                <!-- Customers -->
                <li>
                  <NuxtLink to="/dashboard/customers" class="nav-link" active-class="active" @click="$emit('close')">
                    <UsersIcon class="nav-link-icon" />
                    <span>{{ $t('nav.customers') }}</span>
                  </NuxtLink>
                </li>

                <!-- Team Management / Users -->
                <li>
                  <NuxtLink to="/dashboard/users" class="nav-link" active-class="active" @click="$emit('close')">
                    <UserGroupIcon class="nav-link-icon" />
                    <span>{{ $t('nav.users') }}</span>
                  </NuxtLink>
                </li>

                <!-- Inventory Section -->
                <li>
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
                    <li>
                      <NuxtLink to="/dashboard/stocks" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.stocks') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/purchases" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.purchases') }}
                      </NuxtLink>
                    </li>
                  </ul>
                </li>

                <!-- Delivery Section -->
                <li>
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
                      <NuxtLink to="/dashboard/delivery-companies" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.deliveryCompanies') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/delivery-notes" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.deliveryNotes') }}
                      </NuxtLink>
                    </li>
                  </ul>
                </li>

                <!-- Finance Section -->
                <li>
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
                    <li>
                      <NuxtLink to="/dashboard/payments" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.payments') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/invoices" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.invoices') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/expenses" class="nav-link text-sm py-2" @click="$emit('close')">
                        {{ $t('nav.expenses') }}
                      </NuxtLink>
                    </li>
                  </ul>
                </li>

                <!-- Master Data Section -->
                <li>
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
                    <li>
                      <NuxtLink to="/dashboard/cities" class="nav-link text-sm py-2" @click="$emit('close')">
                        <BuildingOfficeIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.cities') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/brands" class="nav-link text-sm py-2" @click="$emit('close')">
                        <TagIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.brands') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/sources" class="nav-link text-sm py-2" @click="$emit('close')">
                        <MegaphoneIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.sources') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/reasons" class="nav-link text-sm py-2" @click="$emit('close')">
                        <ExclamationTriangleIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.reasons') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/extratags" class="nav-link text-sm py-2" @click="$emit('close')">
                        <HashtagIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.extraTags') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/trackingstates" class="nav-link text-sm py-2" @click="$emit('close')">
                        <SignalIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.trackingStates') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/expensetypes" class="nav-link text-sm py-2" @click="$emit('close')">
                        <CurrencyDollarIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.expenseTypes') }}
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/suppliers" class="nav-link text-sm py-2" @click="$emit('close')">
                        <TruckIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.suppliers') }}
                      </NuxtLink>
                    </li>
                  </ul>
                </li>

                <!-- Reports/Statistics -->
                <li>
                  <NuxtLink to="/dashboard/statistics" class="nav-link" active-class="active" @click="$emit('close')">
                    <ChartBarIcon class="nav-link-icon" />
                    <span>{{ $t('nav.reports') }}</span>
                  </NuxtLink>
                </li>

                <!-- Divider -->
                <li class="my-4 border-t border-gray-200 dark:border-gray-700"></li>

                <!-- Settings -->
                <li>
                  <NuxtLink to="/dashboard/settings" class="nav-link" active-class="active" @click="$emit('close')">
                    <Cog6ToothIcon class="nav-link-icon" />
                    <span>{{ $t('nav.settings') }}</span>
                  </NuxtLink>
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

// Permission checks for dashboard access
const canAccessWorkerDashboard = computed(() =>
  hasPermission('Permissions.WorkerDashboard.View')
)
const canAccessSupervisorDashboard = computed(() =>
  hasPermission('Permissions.SupervisorDashboard.View')
)

const expandedSections = ref({
  orders: true,
  inventory: false,
  delivery: false,
  finance: false,
  masterData: true
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
