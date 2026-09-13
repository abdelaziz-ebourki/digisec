/**
 * Stateful MSW handlers that replicate the Spring Boot API surface
 * (all 6 controllers) for prototype mode. Used both by the browser worker
 * (`browser.ts`) and by unit tests via `msw/node`.
 *
 * Conventions mirrored from the backend:
 * - error bodies are `{ code, detail, errors? }` with stable ErrorCode names
 *   so the UI's French mapping (`CODE_TO_FRENCH`) keeps working;
 * - status codes match the backend (201 register/create, 204 deletes,
 *   400 validation, 401 bad login, 403 forbidden, 404 missing, 409 dup);
 * - every mutation persists to localStorage via `db.ts`.
 */

import { delay, http, HttpResponse } from 'msw'
import { loadDb, persist } from './db'
import type { MockActivity, MockComment, MockPost, MockUser } from './db'

// No artificial latency under vitest (MODE === 'test'); in the browser a
// small random delay keeps loading skeletons visible, like real network I/O.
const LATENCY = import.meta.env.MODE === 'test' ? 0 : 1

async function realisticDelay(): Promise<void> {
  if (LATENCY === 0) return
  await delay(150 + Math.random() * 300)
}

interface ApiErrorBody {
  code: string
  detail: string
  errors?: Record<string, string>
}

function err(status: number, code: string, detail: string, errors?: Record<string, string>) {
  return HttpResponse.json<ApiErrorBody>({ code, detail, errors }, { status })
}

function validationFailed(errors: Record<string, string>) {
  return err(400, 'VALIDATION_FAILED', 'Validation failed', errors)
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const PHONE_RE = /^\+?[0-9 .-]{8,30}$/

function bearerUserId(request: Request): number | null {
  const header = request.headers.get('authorization')
  const match = /^Bearer (.+)$/.exec(header ?? '')
  if (!match) return null
  return (loadDb().sessions[match[1]] ?? null) as number | null
}

function currentUser(request: Request): MockUser | null {
  const id = bearerUserId(request)
  if (id == null) return null
  return loadDb().users.find((u) => u.id === id) ?? null
}

function requireAuth(request: Request): MockUser | HttpResponse<ApiErrorBody> {
  const user = currentUser(request)
  if (!user) return err(401, 'SESSION_INVALID', 'Missing or invalid session')
  return user
}

function publicUser(u: MockUser) {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role,
  }
}

function toPost(post: MockPost) {
  const db = loadDb()
  const author = db.users.find((u) => u.id === post.authorId)
  return {
    id: post.id,
    authorId: post.authorId,
    authorFirstName: author?.firstName ?? '?',
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
  }
}

function toComment(comment: MockComment) {
  const db = loadDb()
  const author = db.users.find((u) => u.id === comment.authorId)
  return {
    id: comment.id,
    postId: comment.postId,
    authorId: comment.authorId,
    authorFirstName: author?.firstName ?? '?',
    commentText: comment.commentText,
    createdAt: comment.createdAt,
  }
}

/** Session-only object URLs for freshly uploaded images (not persisted). */
const uploadObjectUrls = new Map<number, string>()

function toActivity(activity: MockActivity) {
  return {
    id: activity.id,
    title: activity.title,
    activityDate: activity.activityDate,
    message: activity.message,
    imageUrl:
      uploadObjectUrls.get(activity.id) ??
      (activity.image ? `/api/v1/activities/${activity.id}/image` : null),
  }
}

function randomToken(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const handlers = [
  // ---------- Auth ----------
  http.post('*/api/v1/auth/register', async ({ request }) => {
    await realisticDelay()
    const db = loadDb()
    const body = (await request.json()) as Record<string, string>
    const errors: Record<string, string> = {}
    if (!body.firstName?.trim()) errors.firstName = 'FIRST_NAME_REQUIRED'
    else if (body.firstName.length > 100) errors.firstName = 'FIRST_NAME_TOO_LONG'
    if (!body.lastName?.trim()) errors.lastName = 'LAST_NAME_REQUIRED'
    else if (body.lastName.length > 100) errors.lastName = 'LAST_NAME_TOO_LONG'
    if (!body.codeApoge?.trim()) errors.codeApoge = 'CODE_APOGEE_REQUIRED'
    else if (body.codeApoge.length > 20) errors.codeApoge = 'CODE_APOGEE_TOO_LONG'
    if (!body.email?.trim()) errors.email = 'EMAIL_REQUIRED'
    else if (!EMAIL_RE.test(body.email.trim())) errors.email = 'EMAIL_INVALID'
    if (!body.phoneNumber?.trim()) errors.phoneNumber = 'PHONE_REQUIRED'
    else if (!PHONE_RE.test(body.phoneNumber.trim())) errors.phoneNumber = 'PHONE_INVALID'
    if (!body.password) errors.password = 'PASSWORD_REQUIRED'
    else if (body.password.length < 8 || body.password.length > 72)
      errors.password = 'PASSWORD_LENGTH'
    if (Object.keys(errors).length > 0) return validationFailed(errors)

    const email = body.email.trim().toLowerCase()
    if (db.users.some((u) => u.email === email))
      return err(409, 'EMAIL_ALREADY_EXISTS', 'An account with this email already exists')
    if (db.users.some((u) => u.codeApoge === body.codeApoge.trim()))
      return err(409, 'CODE_APOGEE_ALREADY_EXISTS', 'An account with this code apogée already exists')
    if (db.users.some((u) => u.phoneNumber === body.phoneNumber.trim()))
      return err(409, 'PHONE_ALREADY_EXISTS', 'An account with this phone number already exists')

    // Prototype: no mail server, so accounts are auto-verified instantly.
    const user: MockUser = {
      id: db.seq.user++,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email,
      codeApoge: body.codeApoge.trim(),
      phoneNumber: body.phoneNumber.trim(),
      password: body.password,
      role: 'USER',
      verified: true,
      createdAt: new Date().toISOString(),
    }
    db.users.push(user)
    db.verifyTokens[randomToken('mock-verify')] = user.id
    persist()
    return HttpResponse.json(
      { message: 'Compte créé et activé (démonstration). Vous pouvez vous connecter.' },
      { status: 201 },
    )
  }),

  http.get('*/api/v1/auth/verify', async ({ request }) => {
    await realisticDelay()
    const db = loadDb()
    const token = new URL(request.url).searchParams.get('token')
    const userId = (token && db.verifyTokens[token]) || null
    if (userId == null) return err(400, 'INVALID_VERIFICATION_LINK', 'Invalid verification link')
    const user = db.users.find((u) => u.id === userId)
    if (!user) return err(400, 'INVALID_VERIFICATION_LINK', 'Invalid verification link')
    user.verified = true
    persist()
    return HttpResponse.json({ message: 'Votre compte a été vérifié. Vous pouvez vous connecter.' })
  }),

  http.post('*/api/v1/auth/login', async ({ request }) => {
    await realisticDelay()
    const db = loadDb()
    const body = (await request.json()) as Record<string, string>
    const errors: Record<string, string> = {}
    if (!body.email?.trim()) errors.email = 'EMAIL_REQUIRED'
    else if (!EMAIL_RE.test(body.email.trim())) errors.email = 'EMAIL_INVALID'
    if (!body.password) errors.password = 'PASSWORD_REQUIRED'
    if (Object.keys(errors).length > 0) return validationFailed(errors)

    const user = db.users.find((u) => u.email === body.email.trim().toLowerCase())
    if (!user || user.password !== body.password)
      return err(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
    if (!user.verified)
      return err(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email address before logging in')
    const accessToken = randomToken(`mock-${user.id}`)
    db.sessions[accessToken] = user.id
    persist()
    return HttpResponse.json({ accessToken, user: publicUser(user) })
  }),

  http.get('*/api/v1/auth/me', async ({ request }) => {
    await realisticDelay()
    const user = requireAuth(request)
    if (user instanceof HttpResponse) return user
    return HttpResponse.json(publicUser(user))
  }),

  // ---------- Activities ----------
  http.get('*/api/v1/activities', async () => {
    await realisticDelay()
    const db = loadDb()
    return HttpResponse.json(
      [...db.activities]
        .sort((a, b) => b.activityDate.localeCompare(a.activityDate))
        .map(toActivity),
    )
  }),

  http.get('*/api/v1/activities/:id', async ({ params }) => {
    await realisticDelay()
    const activity = loadDb().activities.find((a) => a.id === Number(params.id))
    if (!activity) return err(404, 'ACTIVITY_NOT_FOUND', `Activity not found: ${params.id}`)
    return HttpResponse.json(toActivity(activity))
  }),

  http.get('*/api/v1/activities/:id/image', async ({ params, request }) => {
    await realisticDelay()
    const activity = loadDb().activities.find((a) => a.id === Number(params.id))
    const uploaded = uploadObjectUrls.get(Number(params.id))
    if (uploaded) return HttpResponse.redirect(uploaded)
    if (!activity) return err(404, 'ACTIVITY_NOT_FOUND', `Activity not found: ${params.id}`)
    if (!activity.image)
      return err(404, 'ACTIVITY_HAS_NO_IMAGE', `Activity has no image: ${params.id}`)
    try {
      // Serve the bundled placeholder bytes so imageUrl behaves like the backend.
      const origin = new URL(request.url).origin
      const file = await fetch(origin + activity.image)
      if (!file.ok) throw new Error('placeholder missing')
      const bytes = await file.arrayBuffer()
      const contentType = activity.image.endsWith('.png') ? 'image/png' : 'image/jpeg'
      return new HttpResponse(bytes, {
        headers: { 'Content-Type': contentType, 'Cache-Control': 'max-age=86400' },
      })
    } catch {
      return err(404, 'IMAGE_NOT_FOUND', 'Image not found')
    }
  }),

  http.post('*/api/v1/activities', async ({ request }) => {
    await realisticDelay()
    const auth = requireAuth(request)
    if (auth instanceof HttpResponse) return auth
    if (auth.role !== 'ADMIN') return err(403, 'FORBIDDEN', 'Admin only')
    const form = await request.formData()
    const title = String(form.get('title') ?? '')
    const activityDate = String(form.get('activityDate') ?? '')
    const message = String(form.get('message') ?? '')
    const errors: Record<string, string> = {}
    if (!title.trim()) errors.title = 'TITLE_REQUIRED'
    if (!activityDate) errors.activityDate = 'ACTIVITY_DATE_REQUIRED'
    if (!message.trim()) errors.message = 'MESSAGE_REQUIRED'
    if (Object.keys(errors).length > 0) return validationFailed(errors)

    const db = loadDb()
    const activity: MockActivity = {
      id: db.seq.activity++,
      title: title.trim(),
      activityDate,
      message: message.trim(),
      image: null,
    }
    const file = form.get('file')
    if (file instanceof File && file.size > 0) {
      try {
        uploadObjectUrls.set(activity.id, URL.createObjectURL(file))
      } catch {
        // jsdom / non-browser contexts: image stays null.
      }
    }
    db.activities.push(activity)
    persist()
    return HttpResponse.json(toActivity(activity), { status: 201 })
  }),

  http.put('*/api/v1/activities/:id', async ({ params, request }) => {
    await realisticDelay()
    const auth = requireAuth(request)
    if (auth instanceof HttpResponse) return auth
    if (auth.role !== 'ADMIN') return err(403, 'FORBIDDEN', 'Admin only')
    const db = loadDb()
    const activity = db.activities.find((a) => a.id === Number(params.id))
    if (!activity) return err(404, 'ACTIVITY_NOT_FOUND', `Activity not found: ${params.id}`)
    const form = await request.formData()
    const title = String(form.get('title') ?? '')
    const activityDate = String(form.get('activityDate') ?? '')
    const message = String(form.get('message') ?? '')
    const errors: Record<string, string> = {}
    if (!title.trim()) errors.title = 'TITLE_REQUIRED'
    if (!activityDate) errors.activityDate = 'ACTIVITY_DATE_REQUIRED'
    if (!message.trim()) errors.message = 'MESSAGE_REQUIRED'
    if (Object.keys(errors).length > 0) return validationFailed(errors)

    activity.title = title.trim()
    activity.activityDate = activityDate
    activity.message = message.trim()
    const file = form.get('file')
    if (file instanceof File && file.size > 0) {
      try {
        uploadObjectUrls.set(activity.id, URL.createObjectURL(file))
      } catch {
        // ignore (non-browser contexts)
      }
    } else if (String(form.get('removeImage') ?? '') === 'true') {
      activity.image = null
      uploadObjectUrls.delete(activity.id)
    }
    persist()
    return HttpResponse.json(toActivity(activity))
  }),

  http.delete('*/api/v1/activities/:id', async ({ params, request }) => {
    await realisticDelay()
    const auth = requireAuth(request)
    if (auth instanceof HttpResponse) return auth
    if (auth.role !== 'ADMIN') return err(403, 'FORBIDDEN', 'Admin only')
    const db = loadDb()
    const index = db.activities.findIndex((a) => a.id === Number(params.id))
    if (index === -1) return err(404, 'ACTIVITY_NOT_FOUND', `Activity not found: ${params.id}`)
    db.activities.splice(index, 1)
    uploadObjectUrls.delete(Number(params.id))
    persist()
    return new HttpResponse(null, { status: 204 })
  }),

  // ---------- Posts ----------
  http.get('*/api/v1/posts', async ({ request }) => {
    await realisticDelay()
    const db = loadDb()
    const url = new URL(request.url)
    const page = Math.max(0, Number(url.searchParams.get('page') ?? 0) || 0)
    const size = Math.max(1, Number(url.searchParams.get('size') ?? 10) || 10)
    const sorted = [...db.posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const content = sorted.slice(page * size, page * size + size).map(toPost)
    return HttpResponse.json({
      content,
      page,
      size,
      totalElements: sorted.length,
      totalPages: Math.max(1, Math.ceil(sorted.length / size)),
    })
  }),

  http.get('*/api/v1/posts/:id', async ({ params }) => {
    await realisticDelay()
    const post = loadDb().posts.find((p) => p.id === Number(params.id))
    if (!post) return err(404, 'POST_NOT_FOUND', `Post not found: ${params.id}`)
    return HttpResponse.json(toPost(post))
  }),

  http.post('*/api/v1/posts', async ({ request }) => {
    await realisticDelay()
    const auth = requireAuth(request)
    if (auth instanceof HttpResponse) return auth
    const body = (await request.json()) as Record<string, string>
    const errors: Record<string, string> = {}
    if (!body.title?.trim()) errors.title = 'TITLE_REQUIRED'
    else if (body.title.trim().length > 200) errors.title = 'TITLE_TOO_LONG'
    if (!body.content?.trim()) errors.content = 'CONTENT_REQUIRED'
    if (Object.keys(errors).length > 0) return validationFailed(errors)

    const db = loadDb()
    const post: MockPost = {
      id: db.seq.post++,
      authorId: auth.id,
      title: body.title.trim(),
      content: body.content.trim(),
      createdAt: new Date().toISOString(),
    }
    db.posts.push(post)
    persist()
    return HttpResponse.json(toPost(post), { status: 201 })
  }),

  http.put('*/api/v1/posts/:id', async ({ params, request }) => {
    await realisticDelay()
    const auth = requireAuth(request)
    if (auth instanceof HttpResponse) return auth
    const db = loadDb()
    const post = db.posts.find((p) => p.id === Number(params.id))
    if (!post) return err(404, 'POST_NOT_FOUND', `Post not found: ${params.id}`)
    if (post.authorId !== auth.id && auth.role !== 'ADMIN')
      return err(403, 'DELETE_NOT_ALLOWED', 'You are not allowed to modify this resource')
    const body = (await request.json()) as Record<string, string>
    const errors: Record<string, string> = {}
    if (!body.title?.trim()) errors.title = 'TITLE_REQUIRED'
    else if (body.title.trim().length > 200) errors.title = 'TITLE_TOO_LONG'
    if (!body.content?.trim()) errors.content = 'CONTENT_REQUIRED'
    if (Object.keys(errors).length > 0) return validationFailed(errors)

    post.title = body.title.trim()
    post.content = body.content.trim()
    persist()
    return HttpResponse.json(toPost(post))
  }),

  http.delete('*/api/v1/posts/:id', async ({ params, request }) => {
    await realisticDelay()
    const auth = requireAuth(request)
    if (auth instanceof HttpResponse) return auth
    const db = loadDb()
    const index = db.posts.findIndex((p) => p.id === Number(params.id))
    if (index === -1) return err(404, 'POST_NOT_FOUND', `Post not found: ${params.id}`)
    if (db.posts[index].authorId !== auth.id && auth.role !== 'ADMIN')
      return err(403, 'DELETE_NOT_ALLOWED', 'You are not allowed to delete this resource')
    const [removed] = db.posts.splice(index, 1)
    db.comments = db.comments.filter((c) => c.postId !== removed.id)
    persist()
    return new HttpResponse(null, { status: 204 })
  }),

  // ---------- Comments ----------
  http.get('*/api/v1/posts/:postId/comments', async ({ params }) => {
    await realisticDelay()
    const db = loadDb()
    const postId = Number(params.postId)
    if (!db.posts.some((p) => p.id === postId))
      return err(404, 'POST_NOT_FOUND', `Post not found: ${params.postId}`)
    return HttpResponse.json(
      db.comments
        .filter((c) => c.postId === postId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map(toComment),
    )
  }),

  http.post('*/api/v1/posts/:postId/comments', async ({ params, request }) => {
    await realisticDelay()
    const auth = requireAuth(request)
    if (auth instanceof HttpResponse) return auth
    const db = loadDb()
    const postId = Number(params.postId)
    if (!db.posts.some((p) => p.id === postId))
      return err(404, 'POST_NOT_FOUND', `Post not found: ${params.postId}`)
    const body = (await request.json()) as Record<string, string>
    if (!body.commentText?.trim()) return validationFailed({ commentText: 'COMMENT_REQUIRED' })

    const comment: MockComment = {
      id: db.seq.comment++,
      postId,
      authorId: auth.id,
      commentText: body.commentText.trim(),
      createdAt: new Date().toISOString(),
    }
    db.comments.push(comment)
    persist()
    return HttpResponse.json(toComment(comment), { status: 201 })
  }),

  http.delete('*/api/v1/comments/:id', async ({ params, request }) => {
    await realisticDelay()
    const auth = requireAuth(request)
    if (auth instanceof HttpResponse) return auth
    const db = loadDb()
    const index = db.comments.findIndex((c) => c.id === Number(params.id))
    if (index === -1) return err(404, 'COMMENT_NOT_FOUND', `Comment not found: ${params.id}`)
    if (db.comments[index].authorId !== auth.id && auth.role !== 'ADMIN')
      return err(403, 'DELETE_NOT_ALLOWED', 'You are not allowed to delete this resource')
    db.comments.splice(index, 1)
    persist()
    return new HttpResponse(null, { status: 204 })
  }),

  // ---------- Admin ----------
  http.get('*/api/v1/admin/users', async ({ request }) => {
    await realisticDelay()
    const auth = requireAuth(request)
    if (auth instanceof HttpResponse) return auth
    if (auth.role !== 'ADMIN') return err(403, 'FORBIDDEN', 'Admin only')
    return HttpResponse.json(
      loadDb().users.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        codeApoge: u.codeApoge,
        phoneNumber: u.phoneNumber,
        role: u.role,
        verified: u.verified,
        createdAt: u.createdAt,
      })),
    )
  }),

  http.delete('*/api/v1/admin/users/:id', async ({ params, request }) => {
    await realisticDelay()
    const auth = requireAuth(request)
    if (auth instanceof HttpResponse) return auth
    if (auth.role !== 'ADMIN') return err(403, 'FORBIDDEN', 'Admin only')
    const db = loadDb()
    const id = Number(params.id)
    const target = db.users.find((u) => u.id === id)
    if (!target) return err(404, 'USER_NOT_FOUND', `User not found: ${params.id}`)
    if (target.id === auth.id)
      return err(403, 'CANNOT_DELETE_SELF', 'You cannot delete your own account')
    if (target.role === 'ADMIN')
      return err(403, 'CANNOT_DELETE_ADMIN', 'Administrators cannot be deleted')
    const hasContent =
      db.posts.some((p) => p.authorId === id) || db.comments.some((c) => c.authorId === id)
    if (hasContent)
      return err(409, 'USER_HAS_CONTENT', 'User has posts or comments and cannot be deleted')
    db.users = db.users.filter((u) => u.id !== id)
    persist()
    return new HttpResponse(null, { status: 204 })
  }),

  // ---------- Stats ----------
  http.get('*/api/v1/stats', async () => {
    await realisticDelay()
    const db = loadDb()
    return HttpResponse.json({
      activities: db.activities.length,
      posts: db.posts.length,
      members: db.users.length,
    })
  }),
]
