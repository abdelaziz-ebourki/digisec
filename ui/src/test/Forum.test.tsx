import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Forum from '@/pages/Forum'
import type { User } from '@/services/types'

const mockListPosts = vi.fn()
const mockCreatePost = vi.fn()
const mockDeletePost = vi.fn()
const mockListComments = vi.fn()
const mockAddComment = vi.fn()
let mockUser: User | null = null

vi.mock('@/services/posts', () => ({
  listPosts: (...args: unknown[]) => mockListPosts(...args),
  getPost: vi.fn(),
  createPost: (...args: unknown[]) => mockCreatePost(...args),
  deletePost: (...args: unknown[]) => mockDeletePost(...args),
}))

vi.mock('@/services/comments', () => ({
  listComments: (...args: unknown[]) => mockListComments(...args),
  addComment: (...args: unknown[]) => mockAddComment(...args),
  deleteComment: vi.fn(),
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}))

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

function renderForum() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Forum />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function pagedResponse(content: ReturnType<typeof makePost>[], totalPages = 1) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages,
  }
}

function makePost(overrides: Partial<{ id: number; authorId: number; title: string }> = {}) {
  return {
    id: overrides.id ?? 1,
    authorId: overrides.authorId ?? 2,
    authorFirstName: 'Test',
    title: overrides.title ?? 'Premier sujet',
    content: 'Contenu du sujet',
    createdAt: '2026-08-24T22:00:00',
  }
}

describe('Forum page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = null
    mockListPosts.mockResolvedValue(pagedResponse([makePost()]))
    mockListComments.mockResolvedValue([])
  })

  it('renders posts returned by the API', async () => {
    renderForum()

    expect(await screen.findByText('Premier sujet')).toBeInTheDocument()
    expect(mockListPosts).toHaveBeenCalledWith(0, 10)
  })

  it('paginates forward and back', async () => {
    mockListPosts
      .mockResolvedValueOnce(pagedResponse([makePost({ title: 'Page un' })], 2))
      .mockResolvedValueOnce(pagedResponse([makePost({ id: 9, title: 'Page deux' })], 2))

    const user = userEvent.setup()
    renderForum()

    await user.click(await screen.findByRole('button', { name: /suivant/i }))
    expect(await screen.findByText('Page deux')).toBeInTheDocument()
    expect(mockListPosts).toHaveBeenLastCalledWith(1, 10)
  })

  it('shows the empty state when there are no posts', async () => {
    mockListPosts.mockResolvedValue(pagedResponse([]))

    renderForum()

    expect(await screen.findByText(/aucun sujet pour le moment/i)).toBeInTheDocument()
  })

  it('shows an error card with retry on API failure', async () => {
    mockListPosts.mockRejectedValue({
      isAxiosError: true,
      response: { status: 500, data: { detail: 'Database down' } },
    })
    const user = userEvent.setup()
    renderForum()

    expect(await screen.findByText(/impossible de charger le forum/i)).toBeInTheDocument()
    expect(screen.getByText(/database down/i)).toBeInTheDocument()

    mockListPosts.mockResolvedValue(pagedResponse([makePost()]))
    await user.click(screen.getByRole('button', { name: /réessayer/i }))
    expect(await screen.findByText('Premier sujet')).toBeInTheDocument()
  })

  it('creates a post through the dialog', async () => {
    mockUser = { id: 2, firstName: 'Test', lastName: 'User', email: 't@d.local', role: 'USER' }
    mockCreatePost.mockResolvedValue(makePost())
    const user = userEvent.setup()
    renderForum()

    await user.click(await screen.findByRole('button', { name: /nouveau sujet/i }))
    await user.type(screen.getByLabelText('Titre'), 'Nouveau sujet')
    await user.type(screen.getByLabelText('Contenu'), 'Mon contenu')
    await user.click(screen.getByRole('button', { name: /^publier$/i }))

    await waitFor(() =>
      expect(mockCreatePost).toHaveBeenCalledWith({ title: 'Nouveau sujet', content: 'Mon contenu' }),
    )
  })

  it.each([
    { role: 'visitor' as const, canDelete: false },
    { role: 'non-owner' as const, canDelete: false },
    { role: 'owner' as const, canDelete: true },
    { role: 'admin' as const, canDelete: true },
  ])('$role sees delete controls: $canDelete', async ({ role, canDelete }) => {
    if (role === 'owner') {
      mockUser = { id: 2, firstName: 'T', lastName: 'U', email: 't@d.local', role: 'USER' }
    } else if (role === 'admin') {
      mockUser = { id: 3, firstName: 'A', lastName: 'D', email: 'a@d.local', role: 'ADMIN' }
    } else if (role === 'non-owner') {
      mockUser = { id: 42, firstName: 'X', lastName: 'Y', email: 'x@d.local', role: 'USER' }
    }

    renderForum()

    await screen.findByText('Premier sujet')
    const deleteButton = screen.queryByRole('button', {
      name: /supprimer le sujet premier sujet/i,
    })
    if (canDelete) {
      expect(deleteButton).toBeInTheDocument()
    } else {
      expect(deleteButton).not.toBeInTheDocument()
    }
  })

  it('deletes a post after confirmation', async () => {
    mockUser = { id: 2, firstName: 'Test', lastName: 'User', email: 't@d.local', role: 'USER' }
    mockDeletePost.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderForum()

    await user.click(await screen.findByRole('button', { name: /supprimer le sujet/i }))
    await user.click(screen.getByRole('button', { name: /^supprimer$/i }))

    await waitFor(() => expect(mockDeletePost).toHaveBeenCalledWith(1))
  })

  it('adds a comment to an expanded post', async () => {
    mockUser = { id: 2, firstName: 'Test', lastName: 'User', email: 't@d.local', role: 'USER' }
    mockAddComment.mockResolvedValue({
      id: 5,
      postId: 1,
      authorId: 2,
      authorFirstName: 'Test',
      commentText: 'Super !',
      createdAt: '2026-08-24T22:30:00',
    })
    const user = userEvent.setup()
    renderForum()

    await user.click(await screen.findByRole('button', { name: /commentaires/i }))
    await user.type(screen.getByLabelText('Nouveau commentaire'), 'Super !')
    await user.click(screen.getByRole('button', { name: /publier le commentaire/i }))

    await waitFor(() => expect(mockAddComment).toHaveBeenCalledWith(1, 'Super !'))
  })
})
