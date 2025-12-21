// Legal Invoice types - for official B2B invoices with ICE tax numbers (Morocco)

export interface LegalInvoice {
  id: string
  code: string
  companyName: string
  iceNumber: string           // Morocco ICE tax number
  address: string
  products: string | null     // Comma-separated or JSON
  quantities: string | null
  prices: string | null
  dateAdded: string
}

export interface CreateLegalInvoiceRequest {
  code: string
  companyName: string
  iceNumber: string
  address: string
  products?: string | null
  quantities?: string | null
  prices?: string | null
}

export interface UpdateLegalInvoiceRequest {
  id: string
  code: string
  companyName: string
  iceNumber: string
  address: string
  products?: string | null
  quantities?: string | null
  prices?: string | null
}
