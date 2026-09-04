import axios from 'axios'

export interface ApiError {
  status: number
  message: string
  fieldErrors?: Record<string, string>
}

const api = axios.create({
  // Same-origin nginx proxy (`/api`) by default (Docker Compose, Vite dev).
  // Set VITE_API_URL (e.g. https://<render-backend>/api/v1) when the
  // frontend is hosted separately, e.g. on Vercel.
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('digisec.token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const data = error.response?.data as Record<string, unknown> | undefined
    const fieldErrors =
      data && typeof data.errors === 'object' && data.errors !== null
        ? (data.errors as Record<string, string>)
        : undefined
    return {
      status,
      message:
        (typeof data?.detail === 'string' && data.detail) ||
        (typeof data?.title === 'string' && data.title) ||
        error.message ||
        'Une erreur est survenue',
      fieldErrors,
    }
  }
  return { status: 0, message: 'Une erreur inattendue est survenue' }
}

export default api
