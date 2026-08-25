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
    expect(error).toMatchObject({ status: 409, message: 'An account with this email already exists' })
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
