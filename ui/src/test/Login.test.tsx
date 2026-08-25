import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Login from '@/pages/Login'

const mockLogin = vi.fn()
let mockUser: unknown = null

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
    login: mockLogin,
    register: vi.fn(),
    logout: vi.fn(),
  }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>()
  return { ...original, useNavigate: () => mockNavigate }
})

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  )
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = null
  })

  it('submits credentials and navigates home on success', async () => {
    mockLogin.mockResolvedValue(undefined)
    const user = userEvent.setup({ delay: null })
    renderLogin()

    await user.type(screen.getByLabelText('Adresse e-mail'), 'test@digisec.local')
    await user.type(screen.getByLabelText('Mot de passe'), 'password123')
    await user.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }))
    expect(mockLogin).toHaveBeenCalledWith('test@digisec.local', 'password123')
  })

  it('shows the API error message on failure', async () => {
    mockLogin.mockRejectedValue({
      isAxiosError: true,
      response: { status: 401, data: { detail: 'Invalid email or password' } },
    })
    const user = userEvent.setup({ delay: null })
    renderLogin()

    await user.type(screen.getByLabelText('Adresse e-mail'), 'test@digisec.local')
    await user.type(screen.getByLabelText('Mot de passe'), 'wrong')
    await user.click(screen.getByRole('button', { name: /se connecter/i }))

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('redirects an already authenticated visitor away from the form', async () => {
    mockUser = { id: 1, firstName: 'T', lastName: 'U', email: 't@d.local', role: 'USER' }
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>HOME</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('HOME')).toBeInTheDocument()
    expect(screen.queryByLabelText('Adresse e-mail')).not.toBeInTheDocument()
  })
})
