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
  it('extracts ProblemDetail fields', () => {
    const error = parseApiError(axiosErrorWith(409, { detail: 'An account with this email already exists' }))
    expect(error).toMatchObject({ status: 409, message: 'Un compte existe déjà avec cet e-mail' })
  })

  it('falls back to the title when detail is missing', () => {
    const error = parseApiError(axiosErrorWith(500, { title: 'Internal Server Error' }))
    expect(error.message).toBe('Internal Server Error')
  })

  it('collects field errors from validation payloads', () => {
    const error = parseApiError(
      axiosErrorWith(400, { detail: 'Validation failed', errors: { email: 'Email must be valid' } }),
    )
    expect(error.fieldErrors).toEqual({ email: 'Email must be valid' })
  })

  it('translates field error values to French', () => {
    const error = parseApiError(
      axiosErrorWith(409, {
        detail: 'Duplicate',
        errors: { email: 'An account with this email already exists' },
      }),
    )
    expect(error.fieldErrors).toEqual({ email: 'Un compte existe déjà avec cet e-mail' })
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

  it.each([
    ['Invalid email or password', 'E-mail ou mot de passe invalide'],
    [
      'Please verify your email address before logging in',
      'Veuillez vérifier votre adresse e-mail avant de vous connecter',
    ],
    [
      'Only JPEG, PNG and WebP images are allowed',
      'Seules les images JPEG, PNG et WebP sont acceptées',
    ],
    [
      'An account with this phone number already exists',
      'Un compte existe déjà avec ce numéro de téléphone',
    ],
    [
      'This verification link has expired. Please register again.',
      'Ce lien de vérification a expiré. Veuillez vous réinscrire.',
    ],
    ['Title is required', 'Le titre est requis'],
    ["Activity date is required", "La date de l'activité est requise"],
    ['Message must not exceed 2000 characters', 'Le message est trop long'],
    ['You are not allowed to delete this resource', 'Vous n’êtes pas autorisé à supprimer cette ressource'],
    ['You cannot delete your own account', 'Vous ne pouvez pas supprimer votre propre compte'],
    [
      'User has posts or comments and cannot be deleted',
      'Ce membre a des sujets ou commentaires et ne peut pas être supprimé',
    ],
    ['User not found: 42', 'Utilisateur introuvable'],
  ])('translates the backend message %s to French', (backend, french) => {
    const error = parseApiError(axiosErrorWith(400, { detail: backend }))
    expect(error.message).toBe(french)
  })

  it('passes unmapped messages through untouched', () => {
    const error = parseApiError(axiosErrorWith(500, { detail: 'Something brand new' }))
    expect(error.message).toBe('Something brand new')
  })
})
