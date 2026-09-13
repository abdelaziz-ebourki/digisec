import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { setupServer } from 'msw/node'
import api, { parseApiError } from '@/services/api'
import { login, me, register } from '@/services/auth'
import { createPost, listPosts } from '@/services/posts'
import { deleteUser, listUsers } from '@/services/admin'
import { getStats } from '@/services/stats'
import { handlers } from '@/mocks/handlers'
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, resetMockDb } from '@/mocks/db'

api.defaults.baseURL = 'http://localhost/api/v1'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => {
  server.resetHandlers()
  resetMockDb()
  localStorage.clear()
})
afterEach(() => localStorage.clear())
afterAll(() => server.close())

async function loginAsAdmin(): Promise<void> {
  const response = await login(DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD)
  localStorage.setItem('digisec.token', response.accessToken)
}

describe('mock backend', () => {
  it('registers, logs in and fetches the profile', async () => {
    await register({
      firstName: 'Sara',
      lastName: 'Demo',
      codeApoge: '9900112',
      email: 'sara@demo.local',
      phoneNumber: '+212600111222',
      password: 'password123',
    })
    const response = await login('sara@demo.local', 'password123')
    expect(response.user.email).toBe('sara@demo.local')
    expect(response.user.role).toBe('USER')

    localStorage.setItem('digisec.token', response.accessToken)
    const profile = await me()
    expect(profile.firstName).toBe('Sara')
  })

  it('rejects duplicate emails with EMAIL_ALREADY_EXISTS', async () => {
    const payload = {
      firstName: 'Sara',
      lastName: 'Demo',
      codeApoge: '9900112',
      email: 'sara@demo.local',
      phoneNumber: '+212600111222',
      password: 'password123',
    }
    await register(payload)
    const error = await register({ ...payload, codeApoge: '9900334' }).catch((e) => e)
    const parsed = parseApiError(error)
    expect(parsed.status).toBe(409)
    expect(parsed.message).toBe('Un compte existe déjà avec cet e-mail')
  })

  it('rejects bad passwords with INVALID_CREDENTIALS in French', async () => {
    const error = await login(DEMO_ADMIN_EMAIL, 'wrong-password').catch((e) => e)
    const parsed = parseApiError(error)
    expect(parsed.status).toBe(401)
    expect(parsed.message).toBe('E-mail ou mot de passe invalide')
  })

  it('returns French field errors for invalid registration', async () => {
    const error = await register({
      firstName: '',
      lastName: 'Demo',
      codeApoge: '9900112',
      email: 'not-an-email',
      phoneNumber: '+212600111222',
      password: 'short',
    }).catch((e) => e)
    const parsed = parseApiError(error)
    expect(parsed.status).toBe(400)
    expect(parsed.fieldErrors?.firstName).toBe('Le prénom est requis')
    expect(parsed.fieldErrors?.email).toBe("L'e-mail doit être valide")
    expect(parsed.fieldErrors?.password).toBe('Le mot de passe doit comporter entre 8 et 72 caractères')
  })

  it('persists created posts so they appear in the list', async () => {
    await loginAsAdmin()
    const before = await listPosts()
    await createPost({ title: 'Sujet démo', content: 'Contenu démo' })
    const after = listPosts()
    await expect(after).resolves.toMatchObject({ totalElements: before.totalElements + 1 })
    const titles = (await after).content.map((p) => p.title)
    expect(titles).toContain('Sujet démo')
  })

  it('rejects unauthenticated post creation', async () => {
    const error = await createPost({ title: 'x', content: 'y' }).catch((e) => e)
    expect(parseApiError(error).status).toBe(401)
  })

  it('serves live stats from the seed', async () => {
    await expect(getStats()).resolves.toEqual({ activities: 6, posts: 5, members: 4 })
  })

  it('lists users for admins and forbids self-deletion', async () => {
    await loginAsAdmin()
    const users = await listUsers()
    expect(users).toHaveLength(4)
    const admin = users.find((u) => u.email === DEMO_ADMIN_EMAIL)
    const error = await deleteUser(admin!.id).catch((e) => e)
    const parsed = parseApiError(error)
    expect(parsed.status).toBe(403)
    expect(parsed.message).toBe('Vous ne pouvez pas supprimer votre propre compte')
  })
})
