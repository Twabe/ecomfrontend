<template>
  <div class="space-y-6">
    <!-- Platform Header -->
    <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center"
        :style="{ backgroundColor: platform.bgColor }"
      >
        <component :is="platformIcon" class="w-6 h-6" :style="{ color: platform.color }" />
      </div>
      <div>
        <h3 class="font-semibold text-gray-900 dark:text-white">{{ platform.name }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t(platform.description) }}</p>
      </div>
    </div>

    <!-- Form -->
    <div class="space-y-4">
      <!-- Integration Name -->
      <div>
        <label class="label">{{ $t('integrations.wizard.name') }} *</label>
        <input
          v-model="form.name"
          type="text"
          class="input"
          :placeholder="$t('integrations.wizard.namePlaceholder')"
          required
        />
      </div>

      <!-- Default Store -->
      <div>
        <label class="label">{{ $t('integrations.wizard.store') }}</label>
        <select v-model="form.defaultStoreId" class="input">
          <option :value="null">{{ $t('common.select') }}...</option>
          <option v-for="store in stores" :key="store.id" :value="store.id">
            {{ store.name }}
          </option>
        </select>
      </div>

      <!-- Default Media Buyer -->
      <div>
        <label class="label">{{ $t('integrations.wizard.mediaBuyer') }}</label>
        <select v-model="form.defaultMediaBuyerId" class="input">
          <option :value="null">{{ $t('common.none') }}</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.firstName }} {{ user.lastName }}
          </option>
        </select>
      </div>

      <!-- Options -->
      <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          {{ $t('integrations.wizard.options') }}
        </h4>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="form.canOpen"
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t('integrations.wizard.canOpen') }}
            </span>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ $t('integrations.wizard.canOpenDesc') }}
            </p>
          </div>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="form.trackStock"
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t('integrations.wizard.trackStock') }}
            </span>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ $t('integrations.wizard.trackStockDesc') }}
            </p>
          </div>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="form.enableRamassage"
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t('integrations.wizard.enableRamassage') }}
            </span>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ $t('integrations.wizard.enableRamassageDesc') }}
            </p>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CloudIcon,
  ShoppingCartIcon,
  TableCellsIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  BoltIcon
} from '@heroicons/vue/24/outline'
import type { PlatformConfig } from '~/composables/usePlatformConfig'
import type { StoreDto, UserDetailsDto } from '~/api/generated/models'

export interface StepConfigData {
  name: string
  defaultStoreId: string | null
  defaultMediaBuyerId: string | null
  canOpen: boolean
  trackStock: boolean
  enableRamassage: boolean
}

const props = defineProps<{
  platform: PlatformConfig
  modelValue: StepConfigData
  stores: StoreDto[]
  users: UserDetailsDto[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', data: StepConfigData): void
}>()

const form = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const platformIcon = computed(() => {
  switch (props.platform.icon) {
    case 'youcan':
      return ShoppingCartIcon
    case 'shopify':
      return ShoppingCartIcon
    case 'woocommerce':
      return GlobeAltIcon
    case 'lightfunnels':
      return RocketLaunchIcon
    case 'storeep':
      return CloudIcon
    case 'sheets':
      return TableCellsIcon
    default:
      return BoltIcon
  }
})
</script>
