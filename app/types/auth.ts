// Authentication Types

export interface User {
  id: string
  email: string
  userName: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  emailConfirmed: boolean
  isActive: boolean
  imageUrl?: string
  roles: string[]
  permissions: string[]
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  token: string
  refreshToken: string
  tokenExpiryTime: string
  refreshTokenExpiryTime: string
}

export interface RefreshTokenRequest {
  token: string
  refreshToken: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  userName: string
  password: string
  confirmPassword: string
  phoneNumber?: string
}
