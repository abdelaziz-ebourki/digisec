import api from '@/services/api'
import type { AuthResponse, User } from '@/services/types'

export interface RegisterPayload {
  firstName: string
  lastName: string
  codeApoge: string
  email: string
  phoneNumber: string
  password: string
}

export async function register(payload: RegisterPayload): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/auth/register', payload)
  return data
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
  return data
}

export async function verify(token: string): Promise<{ message: string }> {
  const { data } = await api.get<{ message: string }>('/auth/verify', { params: { token } })
  return data
}

export async function me(): Promise<User> {
  const { data } = await api.get<User>('/auth/me')
  return data
}
