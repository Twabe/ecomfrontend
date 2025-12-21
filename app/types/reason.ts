export interface Reason {
  id: string
  title: string
}

export interface CreateReasonRequest {
  title: string
}

export interface UpdateReasonRequest {
  id: string
  title: string
}
