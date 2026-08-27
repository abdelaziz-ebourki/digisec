import api from '@/services/api'
import type { PagedResponse, PostResponse } from '@/services/types'

export async function listPosts(page = 0, size = 10): Promise<PagedResponse<PostResponse>> {
  const { data } = await api.get<PagedResponse<PostResponse>>('/posts', { params: { page, size } })
  return data
}

export async function getPost(id: number): Promise<PostResponse> {
  const { data } = await api.get<PostResponse>(`/posts/${id}`)
  return data
}

export async function createPost(payload: { title: string; content: string }): Promise<PostResponse> {
  const { data } = await api.post<PostResponse>('/posts', payload)
  return data
}

export async function deletePost(id: number): Promise<void> {
  await api.delete(`/posts/${id}`)
}
