export interface Source {
  id: string
  title: string
}

export interface CreateSourceRequest {
  title: string
}

export interface UpdateSourceRequest {
  id: string
  title: string
}
