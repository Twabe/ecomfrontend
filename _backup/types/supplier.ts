export interface Supplier {
  id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  note?: string
  isActive: boolean
}

export interface CreateSupplierRequest {
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  note?: string
  isActive?: boolean
}

export interface UpdateSupplierRequest {
  id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  note?: string
  isActive?: boolean
}
