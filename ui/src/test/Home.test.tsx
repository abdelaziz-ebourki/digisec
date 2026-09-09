import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockTyped = vi.hoisted(() => ({ text: 'Join US' }))

vi.mock('@/hooks/useTypewriter', () => ({
  useTypewriter: () => mockTyped.text,
}))

const mockGetStats = vi.fn()

vi.mock('@/services/stats', () => ({
  getStats: (...args: unknown[]) => mockGetStats(...args),
}))

import Home from '@/pages/Home'
import { renderWithProviders } from '@/test/helpers'

describe('Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetStats.mockResolvedValue({ activities: 6, posts: 5, members: 4 })
  })

  it('renders the typewriter headline and main sections', async () => {
    renderWithProviders(<Home />)

    expect(await screen.findByText('Join US')).toBeInTheDocument()
    expect(screen.getByText(/Digi.*tal/i)).toBeInTheDocument()
    expect(screen.getByText(/cœur/i, { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('IMPACT')).toBeInTheDocument()
    expect(screen.getByText(/opportunités/i)).toBeInTheDocument()
  })

  it('renders the carousel slides without the opportunites image', () => {
    renderWithProviders(<Home />)

    for (const image of [1, 2, 4, 5, 6, 7]) {
      expect(screen.getByAltText(`Moment fort DIGISEC ${image}`)).toHaveAttribute(
        'src',
        `/images/carousel/${image}.jpg`,
      )
    }
    expect(screen.queryByAltText('Moment fort DIGISEC 3')).not.toBeInTheDocument()
    expect(screen.getByAltText('Atelier DIGISEC')).toHaveAttribute(
      'src',
      '/images/home/opportunites.jpg',
    )
  })

  it('renders live club stats from the API', async () => {
    renderWithProviders(<Home />)

    expect(await screen.findByText('4 membres')).toBeInTheDocument()
    expect(screen.getByText('6 événements')).toBeInTheDocument()
    expect(screen.getByText('5 sujets')).toBeInTheDocument()
    expect(mockGetStats).toHaveBeenCalledOnce()
  })

  it('links the membership duo to the right routes', () => {
    renderWithProviders(<Home />)

    const joinLinks = screen.getAllByRole('link', { name: /rejoindre le club|devenir membre/i })
    for (const link of joinLinks) {
      expect(link.getAttribute('href')).toBe('/register')
    }
    const activitiesLink = screen.getByRole('link', { name: /découvrir nos activités/i })
    expect(activitiesLink.getAttribute('href')).toBe('/activities')
  })
})
