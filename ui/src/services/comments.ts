import api from '@/services/api'
import type { CommentResponse } from '@/services/types'

export async function listComments(postId: number): Promise<CommentResponse[]> {
  const { data } = await api.get<CommentResponse[]>(`/posts/${postId}/comments`)
  return data
}

export async function addComment(postId: number, commentText: string): Promise<CommentResponse> {
  const { data } = await api.post<CommentResponse>(`/posts/${postId}/comments`, { commentText })
  return data
}

export async function deleteComment(commentId: number): Promise<void> {
  await api.delete(`/comments/${commentId}`)
}
