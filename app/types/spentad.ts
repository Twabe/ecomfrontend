// Spent Ad types - for tracking advertising spending per product/platform

export interface SpentAd {
  id: string
  mediaBuyerId: string
  productId: string
  productName: string
  amount: number
  platform: string | null   // "facebook", "google", "tiktok", etc.
  spentDate: string
}

export interface CreateSpentAdRequest {
  mediaBuyerId: string
  productId: string
  amount: number
  platform?: string | null
  spentDate: string
}

export interface UpdateSpentAdRequest {
  id: string
  mediaBuyerId: string
  productId: string
  amount: number
  platform?: string | null
  spentDate: string
}

// Common ad platforms
export const AD_PLATFORMS = [
  { value: 'facebook', label: 'Facebook / Meta' },
  { value: 'google', label: 'Google Ads' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'snapchat', label: 'Snapchat' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'other', label: 'Other' }
]
