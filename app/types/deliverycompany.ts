// Delivery Company Type enum (mirrors backend DeliveryCompanyType)
export enum DeliveryCompanyType {
  Ameex = 0,
  OzoneOld = 1,
  OzoneNew = 2,
  Livo = 3,
  Sendit = 4,
  Onessta = 5,
  KargoExpress = 6,
  TawsilexNew = 7,
  LivCash = 8,
  PalExpress = 9,
  Ibex = 10,
  TawsilexOld = 11,
  AtlasLivraison = 12,
  EagleExpress = 13,
  Digylog = 14,
  ColisPrive = 15,
  Imile = 16,
  Manual = 17
}

// Display names for DeliveryCompanyType
export const DeliveryCompanyTypeLabels: Record<DeliveryCompanyType, string> = {
  [DeliveryCompanyType.Ameex]: 'Ameex',
  [DeliveryCompanyType.OzoneOld]: 'Ozone (Old)',
  [DeliveryCompanyType.OzoneNew]: 'Ozone (New)',
  [DeliveryCompanyType.Livo]: 'Livo',
  [DeliveryCompanyType.Sendit]: 'Sendit',
  [DeliveryCompanyType.Onessta]: 'Onessta',
  [DeliveryCompanyType.KargoExpress]: 'Kargo Express',
  [DeliveryCompanyType.TawsilexNew]: 'Tawsilex (New)',
  [DeliveryCompanyType.LivCash]: 'LivCash',
  [DeliveryCompanyType.PalExpress]: 'Pal Express',
  [DeliveryCompanyType.Ibex]: 'Ibex',
  [DeliveryCompanyType.TawsilexOld]: 'Tawsilex (Old)',
  [DeliveryCompanyType.AtlasLivraison]: 'Atlas Livraison',
  [DeliveryCompanyType.EagleExpress]: 'Eagle Express',
  [DeliveryCompanyType.Digylog]: 'Digylog',
  [DeliveryCompanyType.ColisPrive]: 'Colis Prive',
  [DeliveryCompanyType.Imile]: 'Imile',
  [DeliveryCompanyType.Manual]: 'Manual'
}

export interface DeliveryCompany {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string

  // API Integration
  type: DeliveryCompanyType
  customerId?: string
  apiKey?: string
  bearerToken?: string
  baseUrl?: string

  // Settings
  autoInvoice: boolean
  active: boolean

  // Payment Terms
  paymentTermDays: number
  paymentFrequency?: string
  paymentDayOfWeek?: number
  paymentDayOfMonth?: number
}

export interface CreateDeliveryCompanyRequest {
  name: string
  type?: DeliveryCompanyType
  phone?: string
  email?: string
  address?: string
}

export interface UpdateDeliveryCompanyRequest {
  id: string
  name: string
  type?: DeliveryCompanyType
  phone?: string
  email?: string
  address?: string
}

export interface UpdateCredentialsRequest {
  id: string
  customerId?: string
  apiKey?: string
  bearerToken?: string
  baseUrl?: string
}

export interface UpdatePaymentTermsRequest {
  id: string
  paymentTermDays?: number
  paymentFrequency?: string
  paymentDayOfWeek?: number
  paymentDayOfMonth?: number
}

// Payment frequency options
export const PaymentFrequencyOptions = [
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Biweekly', label: 'Biweekly' },
  { value: 'Monthly', label: 'Monthly' }
]

// Day of week options
export const DayOfWeekOptions = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
]
