import api from '@/services/api'
import type { AdminUserResponse } from '@/services/types'

export async function listUsers(): Promise<AdminUserResponse[]> {
  const { data } = await api.get<AdminUserResponse[]>('/admin/users')
  return data
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/admin/users/${id}`)
}
