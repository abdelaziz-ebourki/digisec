import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Register from '@/pages/Register'

const mockRegister = vi.fn()

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    login: vi.fn(),
    register: mockRegister,
    logout: vi.fn(),
  }),
}))

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Prénom'), 'Ayoub')
  await user.type(screen.getByLabelText('Nom'), 'Hmida')
  await user.type(screen.getByLabelText('Code apogée'), '1900123')
  await user.type(screen.getByLabelText('Adresse e-mail'), 'ayoub@digisec.local')
  await user.type(screen.getByLabelText(/téléphone/i), '+212600000001')
  await user.type(screen.getByLabelText('Mot de passe'), 'password123')
}

describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits the full payload and shows the confirmation screen', async () => {
    mockRegister.mockResolvedValue({ message: 'Registration successful' })
    const user = userEvent.setup({ delay: null })
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    )

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }))

    expect(await screen.findByText(/vérifiez votre boîte mail/i)).toBeInTheDocument()
    expect(mockRegister).toHaveBeenCalledWith({
      firstName: 'Ayoub',
      lastName: 'Hmida',
      codeApoge: '1900123',
      email: 'ayoub@digisec.local',
      phoneNumber: '+212600000001',
      password: 'password123',
    })
  })

  it('maps server field errors onto the matching inputs', async () => {
    mockRegister.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: { detail: 'Duplicate', errors: { email: 'An account with this email already exists' } },
      },
    })
    const user = userEvent.setup({ delay: null })
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    )

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }))

    expect(await screen.findByText(/an account with this email already exists/i)).toBeInTheDocument()
    expect(screen.queryByText(/vérifiez votre boîte mail/i)).not.toBeInTheDocument()
  })

  it('normalizes the email to lowercase before submitting', async () => {
    mockRegister.mockResolvedValue({ message: 'ok' })
    const user = userEvent.setup({ delay: null })
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Prénom'), 'A')
    await user.type(screen.getByLabelText('Nom'), 'B')
    await user.type(screen.getByLabelText('Code apogée'), '1')
    await user.type(screen.getByLabelText('Adresse e-mail'), 'MiXeD@Case.LOCAL')
    await user.type(screen.getByLabelText(/téléphone/i), '+2126')
    await user.type(screen.getByLabelText('Mot de passe'), 'password123')
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }))

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({ email: 'mixed@case.local' })),
    )
  })
})
