export interface City {
  id: string
  name: string
}

export interface CreateCityRequest {
  name: string
}

export interface UpdateCityRequest {
  id: string
  name: string
}
