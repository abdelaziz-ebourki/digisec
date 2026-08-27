import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const mockTyped = vi.hoisted(() => ({ text: 'Join US' }))

vi.mock('@/hooks/useTypewriter', () => ({
  useTypewriter: () => mockTyped.text,
}))

import Home from '@/pages/Home'
import { renderWithProviders } from '@/test/helpers'

describe('Home page', () => {
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
