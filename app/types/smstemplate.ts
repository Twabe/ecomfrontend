// SMS Template types - for automated SMS notifications triggered by order state/phase changes

export interface SmsTemplate {
  id: string
  content: string
  state: string | null    // Order state trigger (e.g., "confirmed", "cancelled")
  phase: string | null    // Order phase trigger
  isActive: boolean
}

export interface CreateSmsTemplateRequest {
  content: string          // Required, 1-500 chars
  state?: string | null
  phase?: string | null
  isActive?: boolean
}

export interface UpdateSmsTemplateRequest {
  id: string
  content: string
  state?: string | null
  phase?: string | null
  isActive?: boolean
}
