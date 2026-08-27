import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Activities from '@/pages/Activities'
import type { ActivityResponse, User } from '@/services/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

const mockListActivities = vi.fn()
const mockCreateActivity = vi.fn()
const mockDeleteActivity = vi.fn()
let mockUser: User | null = null

vi.mock('@/services/activities', () => ({
  listActivities: (...args: unknown[]) => mockListActivities(...args),
  getActivity: vi.fn(),
  createActivity: (...args: unknown[]) => mockCreateActivity(...args),
  deleteActivity: (...args: unknown[]) => mockDeleteActivity(...args),
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

function makeActivity(overrides: Partial<ActivityResponse> = {}): ActivityResponse {
  return {
    id: overrides.id ?? 1,
    title: overrides.title ?? 'Atelier Cybersécurité',
    activityDate: overrides.activityDate ?? '2026-10-15',
    message: overrides.message ?? 'Atelier de sensibilisation',
    imageUrl: overrides.imageUrl !== undefined ? overrides.imageUrl : '/api/v1/activities/1/image',
  }
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Activities />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Activities page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = null
    mockListActivities.mockResolvedValue([makeActivity()])
  })

  it('renders activities returned by the API', async () => {
    renderPage()

    expect(await screen.findByText('Atelier Cybersécurité')).toBeInTheDocument()
    expect(mockListActivities).toHaveBeenCalledOnce()
  })

  it('renders the image with its API url', async () => {
    renderPage()

    const image = await screen.findByRole('img', { name: /atelier cybersécurité/i })
    expect(image).toHaveAttribute('src', '/api/v1/activities/1/image')
  })

  it('shows the branded fallback when there is no image', async () => {
    mockListActivities.mockResolvedValue([makeActivity({ imageUrl: null })])

    renderPage()

    expect(await screen.findByText(/atelier cybersécurité/i)).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it.each([
    { role: 'visitor' as const, isAdmin: false },
    { role: 'user' as const, isAdmin: false },
    { role: 'admin' as const, isAdmin: true },
  ])('$role sees the create button: $isAdmin', async ({ role, isAdmin }) => {
    if (role === 'admin') {
      mockUser = { id: 1, firstName: 'A', lastName: 'D', email: 'a@d.local', role: 'ADMIN' }
    } else if (role === 'user') {
      mockUser = { id: 2, firstName: 'U', lastName: 'S', email: 'u@d.local', role: 'USER' }
    }

    renderPage()

    await screen.findByText(/atelier cybersécurité/i)
    const button = screen.queryByRole('button', { name: /nouvelle activité/i })
    if (isAdmin) {
      expect(button).toBeInTheDocument()
    } else {
      expect(button).not.toBeInTheDocument()
    }
  })

  it('creates an activity with multipart form data', async () => {
    mockUser = { id: 1, firstName: 'A', lastName: 'D', email: 'a@d.local', role: 'ADMIN' }
    mockCreateActivity.mockResolvedValue(makeActivity())
    const user = userEvent.setup({ delay: null })
    renderPage()

    await user.click(await screen.findByRole('button', { name: /nouvelle activité/i }))
    await user.type(screen.getByLabelText('Titre'), 'Hackathon')
    await user.click(screen.getByRole('button', { name: /choisir la date/i }))
    const dayCell = screen.getByRole('gridcell', { name: '15' })
    await user.click(within(dayCell).getByRole('button'))
    await user.keyboard('{Escape}')
    await user.type(screen.getByLabelText('Description'), '48h de cybersécurité')
    const fileInput = screen.getByLabelText(/image \(optionnelle\)/i) as HTMLInputElement
    const file = new File(['png-bytes'], 'poster.png', { type: 'image/png' })
    await user.upload(fileInput, file)
    await user.click(screen.getByRole('button', { name: /^publier$/i }))

    await waitFor(() => expect(mockCreateActivity).toHaveBeenCalledTimes(1))
    const payload = mockCreateActivity.mock.calls[0][0]
    expect(payload.title).toBe('Hackathon')
    expect(payload.activityDate).toMatch(/^\d{4}-\d{2}-15$/)
    expect(payload.message).toBe('48h de cybersécurité')
    expect(payload.file).toBeInstanceOf(File)
    expect(payload.file.name).toBe('poster.png')
  })

  it('deletes an activity after confirmation', async () => {
    mockUser = { id: 1, firstName: 'A', lastName: 'D', email: 'a@d.local', role: 'ADMIN' }
    mockDeleteActivity.mockResolvedValue(undefined)
    const user = userEvent.setup({ delay: null })
    renderPage()

    await user.click(
      await screen.findByRole('button', { name: /supprimer l'activité atelier/i }),
    )
    await user.click(screen.getByRole('button', { name: /^supprimer$/i }))

    await waitFor(() => expect(mockDeleteActivity).toHaveBeenCalledWith(1))
  })

  it('shows an error card with retry on API failure', async () => {
    mockListActivities.mockRejectedValue({
      isAxiosError: true,
      response: { status: 500, data: { detail: 'Database down' } },
    })
    const user = userEvent.setup({ delay: null })
    renderPage()

    expect(await screen.findByText(/impossible de charger les activités/i)).toBeInTheDocument()

    mockListActivities.mockResolvedValue([makeActivity()])
    await user.click(screen.getByRole('button', { name: /réessayer/i }))
    expect(await screen.findByText(/atelier cybersécurité/i)).toBeInTheDocument()
  })
})
