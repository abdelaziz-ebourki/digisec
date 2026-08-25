export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'USER' | 'ADMIN'
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
