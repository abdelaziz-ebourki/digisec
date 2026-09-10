import { describe, expect, it } from 'vitest'
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { parseApiError } from '@/services/api'

function axiosErrorWith(status: number, data: unknown): AxiosError {
  const response = {
    status,
    statusText: 'error',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  } as AxiosResponse
  return new AxiosError('Request failed', 'ERR', undefined, undefined, response)
}

describe('parseApiError', () => {
  it('resolves the French message from the backend error code', () => {
    const error = parseApiError(
      axiosErrorWith(409, {
        code: 'EMAIL_ALREADY_EXISTS',
        detail: 'An account with this email already exists',
      }),
    )
    expect(error).toMatchObject({ status: 409, message: 'Un compte existe déjà avec cet e-mail' })
  })

  it.each([
    ['INVALID_CREDENTIALS', 'E-mail ou mot de passe invalide'],
    ['EMAIL_NOT_VERIFIED', 'Veuillez vérifier votre adresse e-mail avant de vous connecter'],
    ['INVALID_IMAGE_TYPE', 'Seules les images JPEG, PNG et WebP sont acceptées'],
    ['PHONE_ALREADY_EXISTS', 'Un compte existe déjà avec ce numéro de téléphone'],
    ['VERIFICATION_LINK_EXPIRED', 'Ce lien de vérification a expiré. Veuillez vous réinscrire.'],
    ['TITLE_REQUIRED', 'Le titre est requis'],
    ['ACTIVITY_DATE_REQUIRED', "La date de l'activité est requise"],
    ['MESSAGE_TOO_LONG', 'Le message est trop long'],
    ['DELETE_NOT_ALLOWED', 'Vous n’êtes pas autorisé à supprimer cette ressource'],
    ['CANNOT_DELETE_SELF', 'Vous ne pouvez pas supprimer votre propre compte'],
    ['USER_HAS_CONTENT', 'Ce membre a des sujets ou commentaires et ne peut pas être supprimé'],
    ['USER_NOT_FOUND', 'Utilisateur introuvable'],
    ['FORBIDDEN', 'Accès interdit'],
    ['RATE_LIMITED', 'Trop de tentatives, réessayez dans une minute'],
  ])('translates the backend code %s to French', (code, french) => {
    const error = parseApiError(axiosErrorWith(400, { code, detail: 'Some English detail' }))
    expect(error.message).toBe(french)
  })

  it('falls back to a generic French message for unknown codes', () => {
    const error = parseApiError(
      axiosErrorWith(400, { code: 'SOME_FUTURE_CODE', detail: 'Some future English detail' }),
    )
    expect(error.message).toBe('Une erreur est survenue')
  })

  it('falls back to the detail when no code is present', () => {
    const error = parseApiError(axiosErrorWith(500, { detail: 'Something without a code' }))
    expect(error.message).toBe('Something without a code')
  })

  it('falls back to the title when detail is missing', () => {
    const error = parseApiError(axiosErrorWith(500, { title: 'Internal Server Error' }))
    expect(error.message).toBe('Internal Server Error')
  })

  it('collects field errors from validation payloads', () => {
    const error = parseApiError(
      axiosErrorWith(400, { code: 'VALIDATION_FAILED', detail: 'Validation failed', errors: { email: 'EMAIL_INVALID' } }),
    )
    expect(error.fieldErrors).toEqual({ email: "L'e-mail doit être valide" })
  })

  it('translates validation field error values to French', () => {
    const error = parseApiError(
      axiosErrorWith(400, {
        code: 'VALIDATION_FAILED',
        detail: 'Validation failed',
        errors: { phoneNumber: 'PHONE_INVALID' },
      }),
    )
    expect(error.fieldErrors).toEqual({ phoneNumber: 'Le numéro de téléphone doit être valide' })
  })

  it('normalizes network failures without a response', () => {
    const networkError = new AxiosError('Network Error')
    const error = parseApiError(networkError)
    expect(error.status).toBe(0)
    expect(error.message).toBe('Network Error')
  })

  it('handles non-axios throwables', () => {
    expect(parseApiError('boom')).toEqual({
      status: 0,
      message: 'Une erreur inattendue est survenue',
    })
  })
})
