import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import About from '@/pages/About'
import { MEMBERS } from '@/data/members'
import { renderWithProviders } from '@/test/helpers'

describe('About page', () => {
  it('renders the three mission cards', () => {
    renderWithProviders(<About />)

    expect(screen.getByText('Digitalisation')).toBeInTheDocument()
    expect(screen.getByText('Sécurité')).toBeInTheDocument()
    expect(screen.getByText('Événements')).toBeInTheDocument()
    expect(screen.getByText(/objectifs/i)).toBeInTheDocument()
    expect(screen.getByText(/vision/i)).toBeInTheDocument()
  })

  it('renders every bureau member with name and role', () => {
    renderWithProviders(<About />)

    for (const member of MEMBERS) {
      expect(screen.getByText(member.name)).toBeInTheDocument()
      const roles = screen.getAllByText(member.role)
      expect(roles.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByAltText(member.name)).toHaveAttribute('src', member.photo)
    }
  })
})
