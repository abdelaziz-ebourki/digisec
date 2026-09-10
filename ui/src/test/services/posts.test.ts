import { HttpResponse, http } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import api from '@/services/api'
import { parseApiError } from '@/services/api'
import { captured, server } from '@/test/mocks/server'
import { createPost, deletePost, listPosts, updatePost } from '@/services/posts'

api.defaults.baseURL = 'http://localhost/api/v1'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  captured.clear()
  localStorage.clear()
})
afterAll(() => server.close())

describe('posts service', () => {
  it('lists posts with pagination params', async () => {
    const page = await listPosts(2, 5)

    expect(page.totalElements).toBe(1)
    expect(page.content[0].title).toBe('Premier sujet')
    const seen = captured.get('GET /api/v1/posts')
    expect(seen?.searchParams).toMatchObject({ page: '2', size: '5' })
  })

  it('creates and updates posts as JSON with auth header', async () => {
    localStorage.setItem('digisec.token', 'test-jwt')

    await createPost({ title: 'T', content: 'C' })
    const created = captured.get('POST /api/v1/posts')
    expect(created?.json).toEqual({ title: 'T', content: 'C' })
    expect(created?.headers.authorization).toBe('Bearer test-jwt')

    await updatePost(9, { title: 'T2', content: 'C2' })
    const updated = captured.get('PUT /api/v1/posts/9')
    expect(updated?.json).toEqual({ title: 'T2', content: 'C2' })
  })

  it('propagates backend error codes on failure', async () => {
    server.use(
      http.delete('http://localhost/api/v1/posts/:id', () =>
        HttpResponse.json(
          { code: 'DELETE_NOT_ALLOWED', detail: 'You are not allowed' },
          { status: 403 },
        ),
      ),
    )

    const failure = await deletePost(9).catch((error: unknown) => error)
    expect(parseApiError(failure).message).toBe(
      'Vous n’êtes pas autorisé à supprimer cette ressource',
    )
  })
})
