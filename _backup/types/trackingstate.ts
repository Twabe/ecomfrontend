export interface TrackingState {
  id: string
  state: string
  color: string
  phases: string
  groupStates?: string
}

export interface CreateTrackingStateRequest {
  state: string
  color: string
  phases: string
  groupStates?: string
}

export interface UpdateTrackingStateRequest {
  id: string
  state: string
  color: string
  phases: string
  groupStates?: string
}
