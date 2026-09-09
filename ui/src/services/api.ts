import axios from 'axios'

export interface ApiError {
  status: number
  message: string
  fieldErrors?: Record<string, string>
}

/**
 * Backend user-facing messages are English; the UI is French.
 * Translate known backend messages, pass anything else through untouched
 * (unmapped future messages still surface in English — extend this table
 * when the backend adds new user-facing errors).
 */
const MESSAGE_TRANSLATIONS: Record<string, string> = {
  'Invalid email or password': 'E-mail ou mot de passe invalide',
  'Please verify your email address before logging in':
    'Veuillez vérifier votre adresse e-mail avant de vous connecter',
  'Only JPEG, PNG and WebP images are allowed':
    'Seules les images JPEG, PNG et WebP sont acceptées',
  'An account with this email already exists': 'Un compte existe déjà avec cet e-mail',
  'An account with this code apogée already exists':
    'Un compte existe déjà avec ce code apogée',
  'An account with this phone number already exists':
    'Un compte existe déjà avec ce numéro de téléphone',
  'Invalid or expired verification link': 'Lien de vérification invalide ou expiré',
  'This verification link has expired. Please register again.':
    'Ce lien de vérification a expiré. Veuillez vous réinscrire.',
  'Title is required': 'Le titre est requis',
  'Activity date is required': "La date de l'activité est requise",
  'Message is required': 'Le message est requis',
  'File is required': "L'image est requise",
  'You are not allowed to delete this resource':
    'Vous n’êtes pas autorisé à supprimer cette ressource',
  'Authenticated user no longer exists': 'Session invalide, veuillez vous reconnecter',
}

function translateMessage(message: string): string {
  const exact = MESSAGE_TRANSLATIONS[message]
  if (exact) return exact
  if (message.startsWith('Message must not exceed')) return 'Le message est trop long'
  return message
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
    const rawFieldErrors =
      data && typeof data.errors === 'object' && data.errors !== null
        ? (data.errors as Record<string, string>)
        : undefined
    const fieldErrors = rawFieldErrors
      ? Object.fromEntries(
          Object.entries(rawFieldErrors).map(([field, message]) => [field, translateMessage(message)]),
        )
      : undefined
    return {
      status,
      message: translateMessage(
        (typeof data?.detail === 'string' && data.detail) ||
          (typeof data?.title === 'string' && data.title) ||
          error.message ||
          'Une erreur est survenue',
      ),
      fieldErrors,
    }
  }
  return { status: 0, message: 'Une erreur inattendue est survenue' }
}

export default api
