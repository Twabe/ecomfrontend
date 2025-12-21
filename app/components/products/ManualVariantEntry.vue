<template>
  <div class="space-y-4">
    <!-- Variant Rows -->
    <div
      v-for="(variant, index) in variants"
      :key="index"
      class="border rounded-lg p-4 dark:border-gray-600"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- Variant Name -->
        <div>
          <label class="label text-sm">{{ $t('products.variantName') }} *</label>
          <input
            v-model="variant.name"
            type="text"
            class="input"
            required
            :placeholder="$t('products.variantNamePlaceholder')"
            @input="emitUpdate"
          />
        </div>

        <!-- SKU -->
        <div>
          <label class="label text-sm">SKU *</label>
          <input
            v-model="variant.sku"
            type="text"
            class="input"
            required
            :placeholder="suggestSku(index)"
            @focus="autoFillSku(variant, index)"
            @input="emitUpdate"
          />
        </div>

        <!-- Price -->
        <div>
          <label class="label text-sm">{{ $t('products.sellingPrice') }}</label>
          <input
            v-model.number="variant.price"
            type="number"
            class="input"
            min="0"
            step="0.01"
            :placeholder="$t('products.leaveEmptyForProductPrice')"
            @input="emitUpdate"
          />
        </div>
      </div>

      <!-- Second Row: Barcode, Buying Price, Actions -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
        <!-- Barcode -->
        <div>
          <label class="label text-sm">{{ $t('products.barcode') }}</label>
          <input
            v-model="variant.barcode"
            type="text"
            class="input"
            placeholder="EAN/UPC"
            @input="emitUpdate"
          />
        </div>

        <!-- Buying Price -->
        <div>
          <label class="label text-sm">{{ $t('products.buyingPrice') }}</label>
          <input
            v-model.number="variant.buyingPrice"
            type="number"
            class="input"
            min="0"
            step="0.01"
            :placeholder="$t('products.leaveEmptyForProductPrice')"
            @input="emitUpdate"
          />
        </div>

        <!-- Weight -->
        <div>
          <label class="label text-sm">{{ $t('products.weight') }}</label>
          <input
            v-model.number="variant.weight"
            type="number"
            class="input"
            min="0"
            placeholder="g"
            @input="emitUpdate"
          />
        </div>

        <!-- Remove Button -->
        <div class="flex items-end">
          <button
            type="button"
            @click="removeVariant(index)"
            class="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 w-full"
          >
            <TrashIcon class="w-4 h-4 mr-1" />
            {{ $t('products.removeVariant') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add Variant Button -->
    <button
      type="button"
      @click="addVariant"
      class="btn-secondary w-full"
    >
      <PlusIcon class="w-4 h-4 mr-2" />
      {{ $t('products.addVariant') }}
    </button>

    <!-- Summary -->
    <div v-if="variants.length > 0" class="flex items-center justify-between pt-2 border-t dark:border-gray-600">
      <span class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t('products.totalVariants', { count: variants.length }) }}
      </span>
      <span
        v-if="hasValidationErrors"
        class="text-sm text-red-500"
      >
        {{ validationMessage }}
      </span>
    </div>

    <!-- Empty State -->
    <div v-if="variants.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <Squares2X2Icon class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p class="text-sm">{{ $t('products.noVariantsAdded') }}</p>
      <p class="text-xs mt-1">{{ $t('products.hasVariantsHint') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, TrashIcon, Squares2X2Icon } from '@heroicons/vue/24/outline'

interface ManualVariant {
  name: string
  sku: string
  barcode?: string
  price?: number
  buyingPrice?: number
  weight?: number
  sortOrder: number
  isActive: boolean
  options?: string
}

const props = defineProps<{
  parentSku: string
  variants: ManualVariant[]
}>()

const emit = defineEmits<{
  (e: 'update:variants', variants: ManualVariant[]): void
}>()

const { t } = useI18n()

// Local copy of variants for two-way binding
const variants = ref<ManualVariant[]>(props.variants || [])

// Sync with parent
watch(() => props.variants, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(variants.value)) {
    variants.value = newVal || []
  }
}, { deep: true })

// Normalize string for SKU
const normalizeSku = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Suggest SKU based on parent and index
const suggestSku = (index: number): string => {
  const parentPart = props.parentSku ? normalizeSku(props.parentSku) : 'PROD'
  return `${parentPart}-V${index + 1}`
}

// Auto-fill SKU if empty when focused
const autoFillSku = (variant: ManualVariant, index: number) => {
  if (!variant.sku) {
    variant.sku = suggestSku(index)
    emitUpdate()
  }
}

// Add new variant
const addVariant = () => {
  const newIndex = variants.value.length
  variants.value.push({
    name: '',
    sku: '',
    barcode: undefined,
    price: undefined,
    buyingPrice: undefined,
    weight: undefined,
    sortOrder: newIndex,
    isActive: true,
    options: undefined
  })
  emitUpdate()
}

// Remove variant
const removeVariant = (index: number) => {
  variants.value.splice(index, 1)
  // Update sort orders
  variants.value.forEach((v, i) => {
    v.sortOrder = i
  })
  emitUpdate()
}

// Emit update to parent
const emitUpdate = () => {
  emit('update:variants', [...variants.value])
}

// Validation
const hasValidationErrors = computed(() => {
  return variants.value.some(v => !v.name?.trim() || !v.sku?.trim())
})

const validationMessage = computed(() => {
  const missingFields: string[] = []
  variants.value.forEach((v, i) => {
    if (!v.name?.trim()) missingFields.push(`Variant ${i + 1}: Name`)
    if (!v.sku?.trim()) missingFields.push(`Variant ${i + 1}: SKU`)
  })
  if (missingFields.length > 0) {
    return `Missing: ${missingFields.slice(0, 2).join(', ')}${missingFields.length > 2 ? '...' : ''}`
  }
  return ''
})

// Initialize with one empty variant if starting fresh
onMounted(() => {
  if (variants.value.length === 0) {
    addVariant()
  }
})
</script>
