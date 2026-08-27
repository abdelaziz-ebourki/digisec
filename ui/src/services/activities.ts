import api from '@/services/api'
import type { ActivityResponse } from '@/services/types'

export interface CreateActivityPayload {
  title: string
  activityDate: string
  message: string
  file?: File | null
}

export async function listActivities(): Promise<ActivityResponse[]> {
  const { data } = await api.get<ActivityResponse[]>('/activities')
  return data
}

export async function getActivity(id: number): Promise<ActivityResponse> {
  const { data } = await api.get<ActivityResponse>(`/activities/${id}`)
  return data
}

export async function createActivity(payload: CreateActivityPayload): Promise<ActivityResponse> {
  const formData = new FormData()
  formData.append('title', payload.title)
  formData.append('activityDate', payload.activityDate)
  formData.append('message', payload.message)
  if (payload.file) {
    formData.append('file', payload.file)
  }
  const { data } = await api.post<ActivityResponse>('/activities', formData)
  return data
}

export async function deleteActivity(id: number): Promise<void> {
  await api.delete(`/activities/${id}`)
}
