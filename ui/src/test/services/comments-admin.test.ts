import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import api from '@/services/api'
import { captured, server } from '@/test/mocks/server'
import { addComment, deleteComment, listComments } from '@/services/comments'
import { deleteUser, listUsers } from '@/services/admin'

api.defaults.baseURL = 'http://localhost/api/v1'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  captured.clear()
  localStorage.clear()
})
afterAll(() => server.close())

describe('comments service', () => {
  it('lists, adds and deletes comments on nested routes', async () => {
    await listComments(4)
    expect(captured.get('GET /api/v1/posts/4/comments')).toBeDefined()

    await addComment(4, 'Bravo !')
    expect(captured.get('POST /api/v1/posts/4/comments')?.json).toEqual({
      commentText: 'Bravo !',
    })

    await deleteComment(11)
    expect(captured.get('DELETE /api/v1/comments/11')).toBeDefined()
  })
})

describe('admin service', () => {
  it('lists users and deletes by id', async () => {
    localStorage.setItem('digisec.token', 'admin-jwt')

    await listUsers()
    expect(captured.get('GET /api/v1/admin/users')?.headers.authorization).toBe(
      'Bearer admin-jwt',
    )

    await deleteUser(7)
    expect(captured.get('DELETE /api/v1/admin/users/7')).toBeDefined()
  })
})
