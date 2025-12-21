// Platform Integration types - for connecting external e-commerce platforms

export interface PlatformIntegration {
  id: string
  name: string
  type: PlatformType
  webhookUrl: string | null
  isActive: boolean
  defaultStoreId: string | null
  defaultStoreName: string | null
  defaultMediaBuyerId: string | null
  configuration: string | null
  lastSyncedAt: string | null
  createdOn: string
  lastModifiedOn: string | null
}

export interface CreatePlatformIntegrationRequest {
  name: string
  type: PlatformType
  webhookUrl?: string | null
  webhookSecret?: string | null
  isActive?: boolean
  defaultStoreId?: string | null
  defaultMediaBuyerId?: string | null
  configuration?: string | null
}

export interface UpdatePlatformIntegrationRequest {
  id: string
  name: string
  type: PlatformType
  webhookUrl?: string | null
  webhookSecret?: string | null
  isActive?: boolean
  defaultStoreId?: string | null
  defaultMediaBuyerId?: string | null
  configuration?: string | null
}

// Platform type enum
export enum PlatformType {
  YouCan = 1,
  Shopify = 2,
  WooCommerce = 3,
  LightFunnels = 4,
  Storeep = 5,
  Ameex = 6,
  Ozone = 7,
  Custom = 99
}

// Platform types list
export const PLATFORM_TYPES = [
  { value: PlatformType.YouCan, label: 'YouCan', color: 'blue' },
  { value: PlatformType.Shopify, label: 'Shopify', color: 'green' },
  { value: PlatformType.WooCommerce, label: 'WooCommerce', color: 'purple' },
  { value: PlatformType.LightFunnels, label: 'LightFunnels', color: 'orange' },
  { value: PlatformType.Storeep, label: 'Storeep', color: 'cyan' },
  { value: PlatformType.Ameex, label: 'Ameex', color: 'pink' },
  { value: PlatformType.Ozone, label: 'Ozone', color: 'yellow' },
  { value: PlatformType.Custom, label: 'Custom', color: 'gray' }
]
