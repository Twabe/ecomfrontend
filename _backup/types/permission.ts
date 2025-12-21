// Permission Types

export interface Permission {
  name: string
  description: string
  action: string
  resource: string
  isBasic?: boolean
  isRoot?: boolean
}

export interface PermissionGroup {
  resource: string
  permissions: Permission[]
}
