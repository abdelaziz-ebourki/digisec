import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Verify from '@/pages/Verify'

vi.mock('@/services/auth', () => ({
  verify: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  me: vi.fn(),
}))

import { verify } from '@/services/auth'
const mockedVerify = vi.mocked(verify)

function renderAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Verify />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Verify page', () => {
  it('shows an invalid-link card when token is missing', () => {
    renderAt('/verify')

    expect(screen.getByText('Lien invalide')).toBeInTheDocument()
    expect(mockedVerify).not.toHaveBeenCalled()
  })

  it('shows success state after a valid token', async () => {
    mockedVerify.mockResolvedValue({ message: 'Your account has been verified.' })

    renderAt('/verify?token=abc123')

    expect(await screen.findByText('Compte vérifié !')).toBeInTheDocument()
    expect(mockedVerify).toHaveBeenCalledWith('abc123')
  })

  it('shows the API error for an expired or unknown token', async () => {
    mockedVerify.mockRejectedValue({
      isAxiosError: true,
      response: { status: 400, data: { detail: 'This verification link has expired.' } },
    })

    renderAt('/verify?token=expired')

    expect(await screen.findByText('Vérification impossible')).toBeInTheDocument()
    expect(screen.getByText(/link has expired/i)).toBeInTheDocument()
  })
})
