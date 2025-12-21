<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import {
  useStatisticsService,
  useDeliveryCompaniesService,
  useCitiesService,
  useProductsService,
  type StatisticDto,
  type CreateStatisticRequest,
  type UpdateStatisticRequest
} from '~/services'

definePageMeta({
  layout: 'tenant',
  middleware: ['auth', 'tenant', 'permission'],
  requiredPermission: 'Permissions.Statistics.View'
})

const { t } = useI18n()
const { notify } = useNotification()

// Services
const {
  items: statistics,
  isLoading,
  isMutating,
  pagination,
  setPage,
  setKeyword,
  setFilters,
  create: createStatistic,
  update: updateStatistic,
  remove: deleteStatistic
} = useStatisticsService()

const { items: deliveryCompanies } = useDeliveryCompaniesService()
const { items: cities } = useCitiesService()
const { items: products } = useProductsService()

// Search & Filters
const searchQuery = ref('')
const filters = ref({
  deliveryCompanyId: '',
  cityId: '',
  productId: ''
})

// Modals
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const selectedStatistic = ref<StatisticDto | null>(null)
const isEditMode = ref(false)

// Watch filters
watch([searchQuery, filters], () => {
  setFilters({
    deliveryCompanyId: filters.value.deliveryCompanyId || undefined,
    cityId: filters.value.cityId || undefined,
    productId: filters.value.productId || undefined
  })
  setKeyword(searchQuery.value)
}, { deep: true })

// CRUD handlers
const openCreateModal = () => {
  selectedStatistic.value = null
  isEditMode.value = false
  showFormModal.value = true
}

const openEditModal = (stat: StatisticDto) => {
  selectedStatistic.value = stat
  isEditMode.value = true
  showFormModal.value = true
}

const openDeleteModal = (stat: StatisticDto) => {
  selectedStatistic.value = stat
  showDeleteModal.value = true
}

const handleCreate = async (data: CreateStatisticRequest) => {
  try {
    await createStatistic(data)
    notify({ type: 'success', message: t('messages.createSuccess') })
    showFormModal.value = false
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleUpdate = async (id: string, data: UpdateStatisticRequest) => {
  try {
    await updateStatistic(id, data)
    notify({ type: 'success', message: t('messages.updateSuccess') })
    showFormModal.value = false
    selectedStatistic.value = null
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

const handleDelete = async () => {
  if (!selectedStatistic.value) return
  try {
    await deleteStatistic(selectedStatistic.value.id!)
    notify({ type: 'success', message: t('messages.deleteSuccess') })
    showDeleteModal.value = false
    selectedStatistic.value = null
  } catch (error: any) {
    notify({ type: 'error', message: error.message || t('messages.error') })
  }
}

// Pagination
const changePage = (page: number) => {
  setPage(page)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('statistics.title') }}
      </h1>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        @click="openCreateModal"
      >
        <PlusIcon class="h-5 w-5" />
        {{ t('statistics.createStatistic') }}
      </button>
    </div>

    <!-- Filters -->
    <StatisticsStatisticFilters
      v-model:search-query="searchQuery"
      v-model:filters="filters"
      :delivery-companies="deliveryCompanies"
      :cities="cities"
      :products="products"
    />

    <!-- Table -->
    <StatisticsStatisticTable
      :statistics="statistics"
      :is-loading="isLoading"
      :pagination="pagination"
      @edit="openEditModal"
      @delete="openDeleteModal"
      @page-change="changePage"
    />

    <!-- Modals -->
    <StatisticsStatisticFormModal
      :show="showFormModal"
      :statistic="isEditMode ? selectedStatistic : null"
      :delivery-companies="deliveryCompanies"
      :cities="cities"
      :products="products"
      @close="showFormModal = false"
      @create="handleCreate"
      @update="handleUpdate"
    />

    <StatisticsStatisticDeleteModal
      :show="showDeleteModal"
      @close="showDeleteModal = false"
      @confirm="handleDelete"
    />
  </div>
</template>
