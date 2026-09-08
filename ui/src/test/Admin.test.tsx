import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Admin from '@/pages/Admin'
import type { ActivityResponse, AdminUserResponse, PostResponse, User } from '@/services/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

const mockListActivities = vi.fn()
const mockUpdateActivity = vi.fn()
const mockDeleteActivity = vi.fn()
const mockListPosts = vi.fn()
const mockUpdatePost = vi.fn()
const mockDeletePost = vi.fn()
const mockListUsers = vi.fn()
const mockUser: { current: User | null } = { current: null }

vi.mock('@/services/activities', () => ({
  listActivities: (...args: unknown[]) => mockListActivities(...args),
  updateActivity: (...args: unknown[]) => mockUpdateActivity(...args),
  deleteActivity: (...args: unknown[]) => mockDeleteActivity(...args),
}))

vi.mock('@/services/posts', () => ({
  listPosts: (...args: unknown[]) => mockListPosts(...args),
  updatePost: (...args: unknown[]) => mockUpdatePost(...args),
  deletePost: (...args: unknown[]) => mockDeletePost(...args),
}))

vi.mock('@/services/admin', () => ({
  listUsers: (...args: unknown[]) => mockListUsers(...args),
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser.current,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}))

function makeActivity(overrides: Partial<ActivityResponse> = {}): ActivityResponse {
  return {
    id: overrides.id ?? 1,
    title: overrides.title ?? 'Atelier Cybersécurité',
    activityDate: overrides.activityDate ?? '2026-10-15',
    message: overrides.message ?? 'Atelier de sensibilisation',
    imageUrl: null,
  }
}

function makePost(overrides: Partial<PostResponse> = {}): PostResponse {
  return {
    id: overrides.id ?? 1,
    authorId: overrides.authorId ?? 2,
    authorFirstName: overrides.authorFirstName ?? 'Salma',
    title: overrides.title ?? 'Premier sujet',
    content: overrides.content ?? 'Contenu du sujet',
    createdAt: overrides.createdAt ?? '2026-09-01T10:00:00',
  }
}

function makeMember(overrides: Partial<AdminUserResponse> = {}): AdminUserResponse {
  return {
    id: overrides.id ?? 2,
    firstName: overrides.firstName ?? 'Salma',
    lastName: overrides.lastName ?? 'Bennani',
    email: overrides.email ?? 'salma.bennani@digisec.local',
    codeApoge: overrides.codeApoge ?? '2300456',
    phoneNumber: overrides.phoneNumber ?? '+212600000001',
    role: overrides.role ?? 'USER',
    verified: overrides.verified ?? true,
    createdAt: overrides.createdAt ?? '2026-08-01T10:00:00',
  }
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Admin page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.current = { id: 1, firstName: 'A', lastName: 'D', email: 'a@d.local', role: 'ADMIN' }
    mockListActivities.mockResolvedValue([makeActivity()])
    mockListPosts.mockResolvedValue({
      content: [makePost()],
      page: 0,
      size: 50,
      totalElements: 1,
      totalPages: 1,
    })
    mockListUsers.mockResolvedValue([makeMember()])
  })

  it('renders stat cards with counts', async () => {
    renderPage()

    expect(await screen.findByText('Activités')).toBeInTheDocument()
    expect(screen.getByText('Sujets du forum')).toBeInTheDocument()
    expect(screen.getByText('Membres')).toBeInTheDocument()
    expect(mockListActivities).toHaveBeenCalledOnce()
    expect(mockListUsers).toHaveBeenCalledOnce()
  })

  it('renders activities, posts and members tables', async () => {
    renderPage()

    expect(await screen.findByText('Atelier Cybersécurité')).toBeInTheDocument()
    expect(screen.getByText('Premier sujet')).toBeInTheDocument()
    expect(screen.getByText('Salma Bennani')).toBeInTheDocument()
    expect(screen.getByText(/salma.bennani@digisec.local/)).toBeInTheDocument()
    expect(screen.getByText('Vérifié')).toBeInTheDocument()
  })

  it('shows the admin badge and pending badge for members', async () => {
    mockListUsers.mockResolvedValue([
      makeMember({ id: 9, firstName: 'Admin', email: 'admin@digisec.local', role: 'ADMIN' }),
      makeMember({ id: 3, firstName: 'Karim', verified: false }),
    ])
    renderPage()

    expect(await screen.findByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('En attente')).toBeInTheDocument()
  })

  it('deletes an activity after confirmation', async () => {
    mockDeleteActivity.mockResolvedValue(undefined)
    const user = userEvent.setup({ delay: null })
    renderPage()

    await user.click(
      await screen.findByRole('button', { name: /supprimer l'activité atelier cybersécurité/i }),
    )
    await user.click(screen.getByRole('button', { name: /^supprimer$/i }))

    await waitFor(() => expect(mockDeleteActivity).toHaveBeenCalledWith(1))
  })

  it('deletes a post after confirmation', async () => {
    mockDeletePost.mockResolvedValue(undefined)
    const user = userEvent.setup({ delay: null })
    renderPage()

    await user.click(
      await screen.findByRole('button', { name: /supprimer le sujet premier sujet/i }),
    )
    await user.click(screen.getByRole('button', { name: /^supprimer$/i }))

    await waitFor(() => expect(mockDeletePost).toHaveBeenCalledWith(1))
  })

  it('shows an error card with retry on API failure', async () => {
    mockListUsers.mockRejectedValue({
      isAxiosError: true,
      response: { status: 403, data: { detail: 'Forbidden' } },
    })
    const user = userEvent.setup({ delay: null })
    renderPage()

    expect(await screen.findByText(/impossible de charger le panneau/i)).toBeInTheDocument()

    mockListUsers.mockResolvedValue([makeMember()])
    await user.click(screen.getByRole('button', { name: /réessayer/i }))
    expect(await screen.findByText('Salma Bennani')).toBeInTheDocument()
  })

  it('edits an activity from its row', async () => {
    mockUpdateActivity.mockResolvedValue(makeActivity({ title: 'Titre modifié' }))
    const user = userEvent.setup({ delay: null })
    renderPage()

    await user.click(
      await screen.findByRole('button', { name: /modifier l'activité atelier/i }),
    )
    expect(screen.getByLabelText('Titre')).toHaveValue('Atelier Cybersécurité')

    await user.clear(screen.getByLabelText('Titre'))
    await user.type(screen.getByLabelText('Titre'), 'Titre modifié')
    await user.click(screen.getByRole('button', { name: /^modifier$/i }))

    await waitFor(() => expect(mockUpdateActivity).toHaveBeenCalledTimes(1))
    expect(mockUpdateActivity.mock.calls[0][1]).toMatchObject({ title: 'Titre modifié' })
  })

  it('edits a post from its row', async () => {
    mockUpdatePost.mockResolvedValue(makePost({ title: 'Sujet modifié' }))
    const user = userEvent.setup({ delay: null })
    renderPage()

    await user.click(
      await screen.findByRole('button', { name: /modifier le sujet premier sujet/i }),
    )
    expect(screen.getByLabelText('Titre')).toHaveValue('Premier sujet')

    await user.clear(screen.getByLabelText('Titre'))
    await user.type(screen.getByLabelText('Titre'), 'Sujet modifié')
    await user.click(screen.getByRole('button', { name: /^modifier$/i }))

    await waitFor(() =>
      expect(mockUpdatePost).toHaveBeenCalledWith(1, {
        title: 'Sujet modifié',
        content: 'Contenu du sujet',
      }),
    )
  })
})
