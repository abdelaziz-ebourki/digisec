import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import api from '@/services/api'
import { captured, server } from '@/test/mocks/server'
import { login, me, register, verify } from '@/services/auth'

api.defaults.baseURL = 'http://localhost/api/v1'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  captured.clear()
  localStorage.clear()
})
afterAll(() => server.close())

describe('auth service', () => {
  it('registers with the full payload', async () => {
    await register({
      firstName: 'Ayoub',
      lastName: 'Tester',
      codeApoge: '2300456',
      email: 'a@d.local',
      phoneNumber: '+212600000001',
      password: 'password123',
    })

    const seen = captured.get('POST /api/v1/auth/register')
    expect(seen?.json).toMatchObject({ email: 'a@d.local', codeApoge: '2300456' })
  })

  it('logs in and fetches the profile with the token attached', async () => {
    const response = await login('t@d.local', 'password123')
    expect(response.accessToken).toBe('mock-jwt')

    localStorage.setItem('digisec.token', response.accessToken)
    const profile = await me()

    expect(profile.email).toBe('t@d.local')
    const seen = captured.get('GET /api/v1/auth/me')
    expect(seen?.headers.authorization).toBe('Bearer mock-jwt')
  })

  it('verifies with the token as query param', async () => {
    await verify('tok-123')

    const seen = captured.get('GET /api/v1/auth/verify')
    expect(seen?.searchParams).toMatchObject({ token: 'tok-123' })
  })
})
