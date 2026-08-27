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

export interface PostResponse {
  id: number
  authorId: number
  authorFirstName: string
  title: string
  content: string
  createdAt: string
}

export interface CommentResponse {
  id: number
  postId: number
  authorId: number
  authorFirstName: string
  commentText: string
  createdAt: string
}

export interface ActivityResponse {
  id: number
  title: string
  activityDate: string
  message: string
  imageUrl: string | null
}
