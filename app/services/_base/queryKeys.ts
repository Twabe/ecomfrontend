/**
 * Centralized Query Keys for Vue Query
 *
 * All query keys are managed here to:
 * - Prevent cache collisions
 * - Enable proper cache invalidation
 * - Maintain consistency across 46 entities
 *
 * Pattern based on TanStack Query best practices:
 * https://tanstack.com/query/latest/docs/framework/vue/guides/query-keys
 */

export type QueryKeyParams = Record<string, unknown>

export interface EntityQueryKeys {
  all: () => readonly string[]
  lists: () => readonly string[]
  list: (params?: QueryKeyParams) => readonly (string | QueryKeyParams)[]
  details: () => readonly string[]
  detail: (id: string) => readonly string[]
}

function createEntityKeys(entity: string): EntityQueryKeys {
  return {
    all: () => [entity] as const,
    lists: () => [entity, 'list'] as const,
    list: (params?: QueryKeyParams) =>
      params ? [entity, 'list', params] as const : [entity, 'list'] as const,
    details: () => [entity, 'detail'] as const,
    detail: (id: string) => [entity, 'detail', id] as const,
  }
}

/**
 * All entity query keys organized by dependency level
 */
export const queryKeys = {
  // ============================================
  // MASTER DATA (No Dependencies)
  // ============================================
  brands: createEntityKeys('brands'),
  cities: createEntityKeys('cities'),
  sources: createEntityKeys('sources'),
  reasons: createEntityKeys('reasons'),
  extraTags: createEntityKeys('extra-tags'),
  trackingStates: createEntityKeys('tracking-states'),
  expenseTypes: createEntityKeys('expense-types'),
  suppliers: createEntityKeys('suppliers'),
  smsTemplates: createEntityKeys('sms-templates'),

  // ============================================
  // SIMPLE ENTITIES (1 Dependency)
  // ============================================
  products: createEntityKeys('products'),
  productVariants: createEntityKeys('product-variants'),
  skuMappings: createEntityKeys('sku-mappings'),
  deliveryCompanies: createEntityKeys('delivery-companies'),
  stores: createEntityKeys('stores'),
  shippingFees: createEntityKeys('shipping-fees'),

  // ============================================
  // CORE ENTITIES (2-3 Dependencies)
  // ============================================
  customers: createEntityKeys('customers'),
  stocks: createEntityKeys('stocks'),
  stockTransactions: createEntityKeys('stock-transactions'),
  purchases: createEntityKeys('purchases'),

  // ============================================
  // COMPLEX AGGREGATES (4+ Dependencies)
  // ============================================
  orders: createEntityKeys('orders'),
  orderAssignments: createEntityKeys('order-assignments'),
  orderHistories: createEntityKeys('order-histories'),
  orderFees: createEntityKeys('order-fees'),
  orderCosts: createEntityKeys('order-costs'),
  invoices: createEntityKeys('invoices'),
  legalInvoices: createEntityKeys('legal-invoices'),
  deliveryNotes: createEntityKeys('delivery-notes'),
  payments: createEntityKeys('payments'),
  shipments: createEntityKeys('shipments'),

  // ============================================
  // EXPENSES & FINANCE
  // ============================================
  expenses: createEntityKeys('expenses'),
  spentAds: createEntityKeys('spent-ads'),
  mediaBuyerExpenses: createEntityKeys('media-buyer-expenses'),
  mediaBuyerInvoices: createEntityKeys('media-buyer-invoices'),

  // ============================================
  // DROPSHIPPING & INTEGRATIONS
  // ============================================
  dropshippings: createEntityKeys('dropshippings'),
  platformIntegrations: createEntityKeys('platform-integrations'),
  youCanIntegration: createEntityKeys('you-can-integration'),
  deliveryWebhooks: createEntityKeys('delivery-webhooks'),
  webhooks: createEntityKeys('webhooks'),

  // ============================================
  // DELIVERY PROVIDER CONNECTIONS
  // ============================================
  deliveryProviderTemplates: createEntityKeys('delivery-provider-templates'),
  tenantDeliveryConnections: createEntityKeys('tenant-delivery-connections'),

  // ============================================
  // SYSTEM & SETTINGS
  // ============================================
  autoAssignmentSettings: createEntityKeys('auto-assignment-settings'),
  workerServiceConfigs: createEntityKeys('worker-service-configs'),
  qualityChecklistItems: createEntityKeys('quality-checklist-items'),
  settings: createEntityKeys('settings'),

  // ============================================
  // USER & ACCESS
  // ============================================
  users: createEntityKeys('users'),
  roles: createEntityKeys('roles'),
  tenants: createEntityKeys('tenants'),
  personal: createEntityKeys('personal'),
  tokens: createEntityKeys('tokens'),

  // ============================================
  // ANALYTICS
  // ============================================
  dashboard: createEntityKeys('dashboard'),
  statistics: createEntityKeys('statistics'),
} as const

export type EntityName = keyof typeof queryKeys
