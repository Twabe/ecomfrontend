export interface Product {
  id: string
  name: string
  description?: string
  reference?: string
  rate: number
  buyingPrice: number
  shippingPrice: number
  marketingPrice: number
  charges: number
  imagePath?: string
  pictures?: string
  link?: string
  trackStock: boolean
  brandId: string
  brandName: string
  hasVariants?: boolean
  variantCount?: number
}

export interface CreateProductRequest {
  name: string
  description?: string
  reference?: string
  rate?: number
  buyingPrice?: number
  shippingPrice?: number
  marketingPrice?: number
  charges?: number
  link?: string
  trackStock?: boolean
  brandId: string
  image?: FileUploadRequest
  pictures?: FileUploadRequest
}

export interface UpdateProductRequest {
  id: string
  name: string
  description?: string
  reference?: string
  rate?: number
  buyingPrice?: number
  shippingPrice?: number
  marketingPrice?: number
  charges?: number
  link?: string
  trackStock?: boolean
  brandId: string
  image?: FileUploadRequest
  pictures?: FileUploadRequest
  deleteCurrentImage?: boolean
}

export interface FileUploadRequest {
  name: string
  extension: string
  data: string
}

export interface ExportProductsRequest {
  keyword?: string
  brandId?: string
  minimumRate?: number
  maximumRate?: number
}
