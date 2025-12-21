<template>
  <div class="space-y-4">
    <!-- Option Types List -->
    <div v-for="(option, index) in options" :key="index" class="border rounded-lg p-4 dark:border-gray-600">
      <div class="flex items-center gap-3 mb-3">
        <div class="flex-1">
          <label class="label text-sm">{{ $t('products.optionName') }}</label>
          <input
            v-model="option.name"
            type="text"
            class="input"
            :placeholder="$t('products.optionNamePlaceholder')"
            @input="generateVariants"
          />
        </div>
        <button
          type="button"
          @click="removeOption(index)"
          class="mt-6 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded dark:hover:bg-red-900/20"
        >
          <TrashIcon class="w-4 h-4" />
        </button>
      </div>

      <div>
        <label class="label text-sm">{{ $t('products.optionValues') }}</label>
        <input
          v-model="option.valuesText"
          type="text"
          class="input"
          :placeholder="$t('products.optionValuesPlaceholder')"
          @input="parseValues(option); generateVariants()"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ $t('products.optionValuesHint') }}
        </p>
      </div>

      <!-- Value chips preview -->
      <div v-if="option.values.length > 0" class="flex flex-wrap gap-1 mt-2">
        <span
          v-for="value in option.values"
          :key="value"
          class="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs"
        >
          {{ value }}
        </span>
      </div>
    </div>

    <!-- Add Option Button -->
    <button
      type="button"
      @click="addOption"
      class="btn-secondary w-full"
    >
      <PlusIcon class="w-4 h-4 mr-2" />
      {{ $t('products.addOption') }}
    </button>

    <!-- Preview Section -->
    <div v-if="generatedVariants.length > 0" class="mt-4 border-t pt-4 dark:border-gray-600">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-medium text-gray-900 dark:text-white">
          {{ $t('products.generatePreview') }}
        </h4>
        <span class="text-sm text-primary-600 dark:text-primary-400 font-medium">
          {{ $t('products.variantsToGenerate', { count: generatedVariants.length }) }}
        </span>
      </div>

      <div class="max-h-48 overflow-y-auto border rounded-lg dark:border-gray-600">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">
                {{ $t('products.variantName') }}
              </th>
              <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">
                SKU
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
            <tr
              v-for="(variant, idx) in displayVariants"
              :key="variant.sku"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td class="py-2 px-3 text-gray-900 dark:text-white">
                {{ variant.name }}
              </td>
              <td class="py-2 px-3">
                <code class="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  {{ variant.sku }}
                </code>
              </td>
            </tr>
            <tr v-if="generatedVariants.length > 10" class="bg-gray-50 dark:bg-gray-700">
              <td colspan="2" class="py-2 px-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                +{{ generatedVariants.length - 10 }} {{ $t('common.more') || 'more' }}...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="options.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <Squares2X2Icon class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p class="text-sm">{{ $t('products.noVariantsAdded') }}</p>
      <p class="text-xs mt-1">{{ $t('products.hasVariantsHint') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, TrashIcon, Squares2X2Icon } from '@heroicons/vue/24/outline'

interface VariantOption {
  name: string
  valuesText: string
  values: string[]
}

interface GeneratedVariant {
  name: string
  sku: string
  options: string
  sortOrder: number
  isActive: boolean
  price?: number
  buyingPrice?: number
}

const props = defineProps<{
  parentSku: string
  variants: GeneratedVariant[]
}>()

const emit = defineEmits<{
  (e: 'update:variants', variants: GeneratedVariant[]): void
}>()

const options = ref<VariantOption[]>([])
const generatedVariants = ref<GeneratedVariant[]>([])

// Display only first 10 for preview
const displayVariants = computed(() => generatedVariants.value.slice(0, 10))

// Add new option type
const addOption = () => {
  options.value.push({
    name: '',
    valuesText: '',
    values: []
  })
}

// Remove option type
const removeOption = (index: number) => {
  options.value.splice(index, 1)
  generateVariants()
}

// Parse comma-separated values into array
const parseValues = (option: VariantOption) => {
  option.values = option.valuesText
    .split(',')
    .map(v => v.trim())
    .filter(v => v.length > 0)
}

// Generate Cartesian product of all option values
const cartesianProduct = <T,>(arrays: T[][]): T[][] => {
  if (arrays.length === 0) return [[]]
  if (arrays.length === 1) return arrays[0].map(item => [item])

  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap(a => curr.map(c => [...a, c])),
    [[]]
  )
}

// Normalize string for SKU (remove accents, spaces, special chars)
const normalizeSku = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '-') // Replace non-alphanumeric
    .replace(/-+/g, '-') // Remove multiple dashes
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
}

// Generate all variant combinations
const generateVariants = () => {
  const validOptions = options.value.filter(o => o.name.trim() && o.values.length > 0)

  if (validOptions.length === 0) {
    generatedVariants.value = []
    emit('update:variants', [])
    return
  }

  // Get all value arrays
  const valueArrays = validOptions.map(o => o.values)

  // Generate Cartesian product
  const combinations = cartesianProduct(valueArrays)

  // Create variants
  generatedVariants.value = combinations.map((combo, index) => {
    // Build name: "Red / Medium / Cotton"
    const name = combo.join(' / ')

    // Build SKU: "PARENT-RED-MEDIUM-COTTON"
    const skuParts = combo.map(v => normalizeSku(v))
    const parentPart = props.parentSku ? normalizeSku(props.parentSku) : 'PROD'
    const sku = [parentPart, ...skuParts].join('-')

    // Build options JSON: {"Color": "Red", "Size": "Medium"}
    const optionsObj: Record<string, string> = {}
    validOptions.forEach((opt, i) => {
      optionsObj[opt.name] = combo[i]
    })

    return {
      name,
      sku,
      options: JSON.stringify(optionsObj),
      sortOrder: index,
      isActive: true
    }
  })

  emit('update:variants', generatedVariants.value)
}

// Initialize with one empty option
onMounted(() => {
  if (options.value.length === 0) {
    addOption()
  }
})

// Regenerate when parent SKU changes
watch(() => props.parentSku, () => {
  generateVariants()
})
</script>
