export interface SubDeliveryCompany {
  id: string
  name: string
  deliveryCompanyId: string
  deliveryCompanyName?: string
  createdOn?: string
  lastModifiedOn?: string
}

export interface CreateSubDeliveryCompanyRequest {
  name: string
  deliveryCompanyId: string
}

export interface UpdateSubDeliveryCompanyRequest {
  id: string
  name: string
  deliveryCompanyId: string
}
