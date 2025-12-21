// Store Type enum (mirrors backend StoreType)
export enum StoreType {
  Shopify = 0,
  YouCan = 1,
  WooCommerce = 2,
  LightFunnels = 3,
  StoreEP = 4,
  iStore = 5,
  Generic = 6,
  Leads = 7,
  Custom = 8
}

// Display names for StoreType
export const StoreTypeLabels: Record<StoreType, string> = {
  [StoreType.Shopify]: 'Shopify',
  [StoreType.YouCan]: 'YouCan',
  [StoreType.WooCommerce]: 'WooCommerce',
  [StoreType.LightFunnels]: 'LightFunnels',
  [StoreType.StoreEP]: 'StoreEP',
  [StoreType.iStore]: 'iStore',
  [StoreType.Generic]: 'Generic',
  [StoreType.Leads]: 'Leads',
  [StoreType.Custom]: 'Custom'
}

export interface Store {
  id: string
  name: string
  type: StoreType
  externalStoreId?: string
  storeUrl?: string
  isActive: boolean
  configurationJson?: string
}

export interface CreateStoreRequest {
  name: string
  type?: StoreType
  externalStoreId?: string
  storeUrl?: string
  isActive?: boolean
  configurationJson?: string
}

export interface UpdateStoreRequest {
  id: string
  name: string
  type?: StoreType
  externalStoreId?: string
  storeUrl?: string
  isActive?: boolean
  configurationJson?: string
}
