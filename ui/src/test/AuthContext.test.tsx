import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import * as authApi from '@/services/auth'
import type { User } from '@/services/types'

vi.mock('@/services/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  verify: vi.fn(),
  me: vi.fn(),
}))

const mockedMe = vi.mocked(authApi.me)
const mockedLogin = vi.mocked(authApi.login)

const fakeUser: User = {
  id: 1,
  firstName: 'Test',
  lastName: 'User',
  email: 'test@digisec.local',
  role: 'USER',
}

function Probe() {
  const { user, isLoading, login } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <button type="button" onClick={() => void login('test@digisec.local', 'password123')}>
        do-login
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('starts with no user when no token is stored', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(mockedMe).not.toHaveBeenCalled()
  })

  it('restores the session from a stored token', async () => {
    localStorage.setItem('digisec.token', 'stored-jwt')
    mockedMe.mockResolvedValue(fakeUser)

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('test@digisec.local'))
  })

  it('clears an invalid stored token', async () => {
    localStorage.setItem('digisec.token', 'expired-jwt')
    mockedMe.mockRejectedValue(new Error('401'))

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'))
    expect(localStorage.getItem('digisec.token')).toBeNull()
  })

  it('stores token and exposes user after login', async () => {
    mockedLogin.mockResolvedValue({ accessToken: 'fresh-jwt', user: fakeUser })

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByText('do-login').click()
    })

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('test@digisec.local'))
    expect(localStorage.getItem('digisec.token')).toBe('fresh-jwt')
  })
})
