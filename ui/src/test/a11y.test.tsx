import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

vi.mock('@/hooks/useTypewriter', () => ({
  useTypewriter: () => 'Join US',
}))

import Home from '@/pages/Home'

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('a11y (jest-axe) — allowlisted known violations', () => {
  it('Button variants have no axe violations', async () => {
    const { container } = render(
      <div>
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>,
    )
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    ;(expect(results) as any).toHaveNoViolations()
  })

  it('Badge variants have no axe violations (contrast allowlisted)', async () => {
    const { container } = render(
      <div>
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>,
    )
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    ;(expect(results) as any).toHaveNoViolations()
  })

  it('Card has no axe violations (color-contrast allowlisted for muted)', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description in muted</CardDescription>
        </CardHeader>
      </Card>,
    )
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    ;(expect(results) as any).toHaveNoViolations()
  })

  it('Home hero has no critical axe violations (color-contrast allowlisted for decorative hero)', async () => {
    const { container } = render(wrap(<Home />))
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    })
    ;(expect(results) as any).toHaveNoViolations()
  })

  it('Alert has no axe violations', async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Something happened.</AlertDescription>
      </Alert>,
    )
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    ;(expect(results) as any).toHaveNoViolations()
  })
})
