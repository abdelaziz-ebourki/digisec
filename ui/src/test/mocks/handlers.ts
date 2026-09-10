import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost/api/v1'

export interface CapturedRequest {
  method: string
  pathname: string
  searchParams: Record<string, string>
  headers: Record<string, string>
  json?: unknown
}

/** Last request received per "METHOD pathname" key, for assertions. */
export const captured = new Map<string, CapturedRequest>()

function capture(request: Request): CapturedRequest {
  const url = new URL(request.url)
  const entry: CapturedRequest = {
    method: request.method,
    pathname: url.pathname,
    searchParams: Object.fromEntries(url.searchParams.entries()),
    headers: {},
  }
  request.headers.forEach((value, key) => {
    entry.headers[key] = value
  })
  captured.set(`${request.method} ${url.pathname}`, entry)
  return entry
}

async function captureJson(info: { request: Request }) {
  const entry = capture(info.request)
  entry.json = await info.request.json()
  return HttpResponse.json({ ok: true })
}

async function captureForm() {
  return HttpResponse.json({
    id: 1,
    title: 'from-form',
    activityDate: '2026-10-15',
    message: 'from-form',
    imageUrl: null,
  })
}

export const handlers = [
  // Activities
  http.get(`${BASE}/activities`, ({ request }) => {
    capture(request)
    return HttpResponse.json([
      { id: 1, title: 'Atelier', activityDate: '2026-10-15', message: 'm', imageUrl: null },
    ])
  }),
  http.post(`${BASE}/activities`, ({ request }) => {
    capture(request)
    return captureForm()
  }),
  http.put(`${BASE}/activities/:id`, ({ request }) => {
    capture(request)
    return captureForm()
  }),
  http.delete(`${BASE}/activities/:id`, ({ request }) => {
    capture(request)
    return new HttpResponse(null, { status: 204 })
  }),

  // Posts (paged)
  http.get(`${BASE}/posts`, ({ request }) => {
    capture(request)
    return HttpResponse.json({
      content: [
        {
          id: 1,
          authorId: 2,
          authorFirstName: 'Salma',
          title: 'Premier sujet',
          content: 'c',
          createdAt: '2026-09-01T10:00:00',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    })
  }),
  http.post(`${BASE}/posts`, captureJson),
  http.put(`${BASE}/posts/:id`, captureJson),
  http.delete(`${BASE}/posts/:id`, ({ request }) => {
    capture(request)
    return new HttpResponse(null, { status: 204 })
  }),

  // Comments
  http.get(`${BASE}/posts/:postId/comments`, ({ request }) => {
    capture(request)
    return HttpResponse.json([])
  }),
  http.post(`${BASE}/posts/:postId/comments`, captureJson),
  http.delete(`${BASE}/comments/:id`, ({ request }) => {
    capture(request)
    return new HttpResponse(null, { status: 204 })
  }),

  // Auth
  http.post(`${BASE}/auth/register`, captureJson),
  http.post(`${BASE}/auth/login`, ({ request }) => {
    capture(request)
    return HttpResponse.json({
      accessToken: 'mock-jwt',
      user: { id: 2, firstName: 'Test', lastName: 'User', email: 't@d.local', role: 'USER' },
    })
  }),
  http.get(`${BASE}/auth/verify`, ({ request }) => {
    capture(request)
    return HttpResponse.json({ message: 'verified' })
  }),
  http.get(`${BASE}/auth/me`, ({ request }) => {
    capture(request)
    return HttpResponse.json({
      id: 2,
      firstName: 'Test',
      lastName: 'User',
      email: 't@d.local',
      role: 'USER',
    })
  }),

  // Admin
  http.get(`${BASE}/admin/users`, ({ request }) => {
    capture(request)
    return HttpResponse.json([])
  }),
  http.delete(`${BASE}/admin/users/:id`, ({ request }) => {
    capture(request)
    return new HttpResponse(null, { status: 204 })
  }),
]
