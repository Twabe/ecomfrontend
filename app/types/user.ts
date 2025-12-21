// User Types

export interface User {
  id: string
  userName: string
  firstName?: string
  lastName?: string
  email: string
  phoneNumber?: string
  imageUrl?: string
  isActive: boolean
  emailConfirmed: boolean
}

export interface UserRole {
  roleId: string
  roleName: string
  description?: string
  enabled: boolean
}

export interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  userName: string
  password: string
  confirmPassword: string
  phoneNumber?: string
}

export interface ToggleUserStatusRequest {
  userId: string
  activateUser: boolean
}

export interface AssignRolesRequest {
  userRoles: UserRole[]
}

export interface UpdateUserRequest {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  image?: {
    name: string
    extension: string
    data: string
  }
  deleteCurrentImage?: boolean
}

export interface SetPasswordRequest {
  newPassword: string
  confirmNewPassword: string
}
