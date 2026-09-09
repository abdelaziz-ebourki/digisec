import api from '@/services/api'
import type { StatsResponse } from '@/services/types'

export async function getStats(): Promise<StatsResponse> {
  const { data } = await api.get<StatsResponse>('/stats')
  return data
}
