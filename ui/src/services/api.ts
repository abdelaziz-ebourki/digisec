import axios from 'axios'

export interface ApiError {
  status: number
  message: string
  fieldErrors?: Record<string, string>
}

/**
 * Backend errors carry a stable `code` (see ErrorCode.java); the UI keys its
 * French user-facing messages off that code. An unknown code resolves to a
 * generic French message — never raw English — so new backend errors fail
 * French-safe. A missing code (network failures, non-API errors) falls back
 * to the legacy detail/title path.
 */
const CODE_TO_FRENCH: Record<string, string> = {
  INVALID_CREDENTIALS: 'E-mail ou mot de passe invalide',
  SESSION_INVALID: 'Session invalide, veuillez vous reconnecter',
  EMAIL_NOT_VERIFIED: 'Veuillez vérifier votre adresse e-mail avant de vous connecter',
  EMAIL_ALREADY_EXISTS: 'Un compte existe déjà avec cet e-mail',
  CODE_APOGEE_ALREADY_EXISTS: 'Un compte existe déjà avec ce code apogée',
  PHONE_ALREADY_EXISTS: 'Un compte existe déjà avec ce numéro de téléphone',
  INVALID_VERIFICATION_LINK: 'Lien de vérification invalide ou expiré',
  VERIFICATION_LINK_EXPIRED: 'Ce lien de vérification a expiré. Veuillez vous réinscrire.',
  TITLE_REQUIRED: 'Le titre est requis',
  ACTIVITY_DATE_REQUIRED: "La date de l'activité est requise",
  MESSAGE_REQUIRED: 'Le message est requis',
  MESSAGE_TOO_LONG: 'Le message est trop long',
  FILE_REQUIRED: "L'image est requise",
  FILE_TOO_LARGE: 'Le fichier est trop volumineux',
  INVALID_IMAGE_TYPE: 'Seules les images JPEG, PNG et WebP sont acceptées',
  INVALID_FILE_PATH: 'Chemin de fichier invalide',
  IMAGE_NOT_FOUND: 'Image introuvable',
  ACTIVITY_HAS_NO_IMAGE: "Cette activité n'a pas d'image",
  POST_NOT_FOUND: 'Sujet introuvable',
  ACTIVITY_NOT_FOUND: 'Activité introuvable',
  COMMENT_NOT_FOUND: 'Commentaire introuvable',
  USER_NOT_FOUND: 'Utilisateur introuvable',
  DELETE_NOT_ALLOWED: 'Vous n’êtes pas autorisé à supprimer cette ressource',
  CANNOT_DELETE_SELF: 'Vous ne pouvez pas supprimer votre propre compte',
  CANNOT_DELETE_ADMIN: 'Les administrateurs ne peuvent pas être supprimés',
  USER_HAS_CONTENT: 'Ce membre a des sujets ou commentaires et ne peut pas être supprimé',
  FORBIDDEN: 'Accès interdit',
  RATE_LIMITED: 'Trop de tentatives, réessayez dans une minute',
  EMAIL_REQUIRED: "L'e-mail est requis",
  EMAIL_INVALID: "L'e-mail doit être valide",
  PASSWORD_REQUIRED: 'Le mot de passe est requis',
  PASSWORD_LENGTH: 'Le mot de passe doit comporter entre 8 et 72 caractères',
  FIRST_NAME_REQUIRED: 'Le prénom est requis',
  FIRST_NAME_TOO_LONG: 'Le prénom doit comporter 100 caractères au maximum',
  LAST_NAME_REQUIRED: 'Le nom est requis',
  LAST_NAME_TOO_LONG: 'Le nom doit comporter 100 caractères au maximum',
  CODE_APOGEE_REQUIRED: 'Le code apogée est requis',
  CODE_APOGEE_TOO_LONG: 'Le code apogée doit comporter 20 caractères au maximum',
  PHONE_REQUIRED: 'Le numéro de téléphone est requis',
  PHONE_INVALID: 'Le numéro de téléphone doit être valide',
  TITLE_TOO_LONG: 'Le titre doit comporter 200 caractères au maximum',
  CONTENT_REQUIRED: 'Le contenu est requis',
  COMMENT_REQUIRED: 'Le commentaire est requis',
  VALIDATION_FAILED: 'Veuillez corriger les champs indiqués',
}

/**
 * Bean Validation failures carry codes as field-error values (see the DTO
 * `message` attributes, which are ErrorCode names by convention).
 */
const FIELD_ERROR_TRANSLATIONS: Record<string, string> = {
  EMAIL_REQUIRED: "L'e-mail est requis",
  EMAIL_INVALID: "L'e-mail doit être valide",
  PASSWORD_REQUIRED: 'Le mot de passe est requis',
  PASSWORD_LENGTH: 'Le mot de passe doit comporter entre 8 et 72 caractères',
  FIRST_NAME_REQUIRED: 'Le prénom est requis',
  FIRST_NAME_TOO_LONG: 'Le prénom doit comporter 100 caractères au maximum',
  LAST_NAME_REQUIRED: 'Le nom est requis',
  LAST_NAME_TOO_LONG: 'Le nom doit comporter 100 caractères au maximum',
  CODE_APOGEE_REQUIRED: 'Le code apogée est requis',
  CODE_APOGEE_TOO_LONG: 'Le code apogée doit comporter 20 caractères au maximum',
  PHONE_REQUIRED: 'Le numéro de téléphone est requis',
  PHONE_INVALID: 'Le numéro de téléphone doit être valide',
  TITLE_REQUIRED: 'Le titre est requis',
  TITLE_TOO_LONG: 'Le titre doit comporter 200 caractères au maximum',
  CONTENT_REQUIRED: 'Le contenu est requis',
  COMMENT_REQUIRED: 'Le commentaire est requis',
}

function translateFieldError(message: string): string {
  return FIELD_ERROR_TRANSLATIONS[message] ?? message
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
          Object.entries(rawFieldErrors).map(([field, message]) => [
            field,
            translateFieldError(message),
          ]),
        )
      : undefined
    const code = typeof data?.code === 'string' ? data.code : undefined
    const message =
      (code ? (CODE_TO_FRENCH[code] ?? 'Une erreur est survenue') : undefined) ??
      ((typeof data?.detail === 'string' && data.detail) ||
        (typeof data?.title === 'string' && data.title) ||
        error.message ||
        'Une erreur est survenue')
    return { status, message, fieldErrors }
  }
  return { status: 0, message: 'Une erreur inattendue est survenue' }
}

export default api
