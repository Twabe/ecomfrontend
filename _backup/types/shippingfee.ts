export interface ShippingFee {
  id: string
  deliveryCompanyId: string
  deliveryCompanyName: string
  cityId: string
  cityName: string
  deliveredFees: number
  canceledFees: number
  refusedFees: number
  changedFees: number
}

export interface CreateShippingFeeRequest {
  deliveryCompanyId: string
  cityId: string
  deliveredFees: number
  canceledFees: number
  refusedFees: number
  changedFees: number
}

export interface UpdateShippingFeeRequest {
  id: string
  deliveryCompanyId: string
  cityId: string
  deliveredFees: number
  canceledFees: number
  refusedFees: number
  changedFees: number
}
