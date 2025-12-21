// Tenant Types matching backend DTOs

export interface Tenant {
  id: string
  name: string
  identifier: string
  adminEmail: string
  isActive: boolean
  validUpto?: Date | string
  issuer?: string
  connectionString?: string
  createdOn?: Date | string
  modifiedOn?: Date | string
}

export interface CreateTenantRequest {
  id: string
  name: string
  adminEmail: string
  connectionString?: string
  issuer?: string
}

export interface UpdateTenantRequest {
  id: string
  name: string
  identifier: string
  adminEmail: string
  validUpto?: Date | string
  issuer?: string
}

export interface ActivateTenantRequest {
  tenantId: string
}

export interface DeactivateTenantRequest {
  tenantId: string
}

export interface UpgradeSubscriptionRequest {
  tenantId: string
  extendedExpiryDate: Date | string
}
