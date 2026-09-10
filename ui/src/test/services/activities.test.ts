import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import api from '@/services/api'
import { captured, server } from '@/test/mocks/server'
import { createActivity, listActivities, updateActivity } from '@/services/activities'

// Axios needs an absolute baseURL under node; the app default ('/api/v1')
// only resolves in the browser. Point it at the MSW origin for these tests.
api.defaults.baseURL = 'http://localhost/api/v1'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  captured.clear()
  localStorage.clear()
})
afterAll(() => server.close())

describe('activities service', () => {
  // Multipart bodies cannot be read back through MSW's XHR interception in
  // jsdom, so capture the FormData object at the axios layer instead. This
  // still proves the service builds the exact fields the backend expects.
  let lastForm: FormData | undefined
  const interceptorId = api.interceptors.request.use((config) => {
    if (config.data instanceof FormData) lastForm = config.data
    return config
  })
  afterAll(() => api.interceptors.request.eject(interceptorId))

  it('lists activities with the auth header when logged in', async () => {
    localStorage.setItem('digisec.token', 'test-jwt')

    const activities = await listActivities()

    expect(activities).toHaveLength(1)
    expect(activities[0].title).toBe('Atelier')
    const seen = captured.get('GET /api/v1/activities')
    expect(seen?.headers.authorization).toBe('Bearer test-jwt')
  })

  it('creates an activity as multipart form data', async () => {
    // jsdom File parts hang inside MSW's mocked XHR, so this case swaps in
    // a stub transport: the real service code (payload building) still runs
    // and the interceptor captures the FormData it produces. True multipart
    // upload is covered by E2E against the live backend.
    const realAdapter = api.defaults.adapter
    api.defaults.adapter = async (config) => ({
      data: { id: 1, title: 'Titre', activityDate: '2026-10-15', message: 'Message', imageUrl: null },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    })
    try {
      await createActivity({
        title: 'Titre',
        activityDate: '2026-10-15',
        message: 'Message',
        file: new File(['img'], 'photo.png', { type: 'image/png' }),
      })
    } finally {
      api.defaults.adapter = realAdapter
    }

    expect(lastForm?.get('title')).toBe('Titre')
    expect(lastForm?.get('activityDate')).toBe('2026-10-15')
    expect(lastForm?.get('message')).toBe('Message')
    expect((lastForm?.get('file') as File)?.name).toBe('photo.png')
  })

  it('updates an activity with the removeImage flag', async () => {
    await updateActivity(7, {
      title: 'Titre',
      activityDate: '2026-10-15',
      message: 'Message',
      removeImage: true,
    })

    expect(lastForm?.get('removeImage')).toBe('true')
    expect(lastForm?.get('file')).toBeNull()
  })
})
