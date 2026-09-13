import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PrototypeModal } from '@/components/PrototypeModal'
import {
  PROTOTYPE_MODAL_HIDE_KEY,
  SHOW_PROTOTYPE_MODAL_EVENT,
  requestPrototypeModal,
} from '@/mocks/env'

beforeEach(() => {
  vi.stubEnv('VITE_MOCK_API', 'true')
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllEnvs()
  localStorage.clear()
})

describe('PrototypeModal', () => {
  it('opens on first visit in mock mode', () => {
    render(<PrototypeModal />)
    expect(screen.getByText('Bienvenue sur la démo DIGISEC')).toBeInTheDocument()
  })

  it('stays hidden when the visitor opted out', () => {
    localStorage.setItem(PROTOTYPE_MODAL_HIDE_KEY, '1')
    render(<PrototypeModal />)
    expect(screen.queryByText('Bienvenue sur la démo DIGISEC')).not.toBeInTheDocument()
  })

  it('persists the opt-out when closing with the checkbox ticked', async () => {
    const user = userEvent.setup()
    render(<PrototypeModal />)
    await user.click(screen.getByLabelText('Ne plus afficher ce message'))
    await user.click(screen.getByRole('button', { name: 'Explorer la démo' }))
    expect(localStorage.getItem(PROTOTYPE_MODAL_HIDE_KEY)).toBe('1')
  })

  it('reopens on the footer event even after opt-out', async () => {
    const user = userEvent.setup()
    localStorage.setItem(PROTOTYPE_MODAL_HIDE_KEY, '1')
    render(<PrototypeModal />)
    expect(screen.queryByText('Bienvenue sur la démo DIGISEC')).not.toBeInTheDocument()
    requestPrototypeModal()
    expect(await screen.findByText('Bienvenue sur la démo DIGISEC')).toBeInTheDocument()
    expect(SHOW_PROTOTYPE_MODAL_EVENT).toBe('digisec:show-prototype-modal')
    await user.click(screen.getByRole('button', { name: 'Explorer la démo' }))
  })

  it('renders nothing outside mock mode', () => {
    vi.stubEnv('VITE_MOCK_API', '')
    render(<PrototypeModal />)
    expect(screen.queryByText('Bienvenue sur la démo DIGISEC')).not.toBeInTheDocument()
  })
})
