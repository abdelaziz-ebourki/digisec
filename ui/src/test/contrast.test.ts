import { describe, expect, it } from 'vitest'
import { getContrast } from 'polished'

function contrast(fg: string, bg: string): number {
  return getContrast(fg, bg)
}

function hex(oklch: string): string {
  const map: Record<string, string> = {
    'oklch(0.45 0 0)': '#767676',
    'oklch(0.556 0 0)': '#8a8a8a',
    'oklch(1 0 0)': '#ffffff',
    'oklch(0.795 0.163 70)': '#f59e0b',
    'oklch(0.147 0 0)': '#252525',
    'oklch(0.145 0 0)': '#242424',
    'oklch(0.985 0 0)': '#fbfbfb',
    'oklch(0.708 0 0)': '#b5b5b5',
    'oklch(0.269 0 0)': '#444444',
  }
  return map[oklch] ?? oklch
}

describe('design token contrast (strict AA)', () => {
  it('muted-foreground on white meets AA', () => {
    const ratio = contrast(hex('oklch(0.45 0 0)'), hex('oklch(1 0 0)'))
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('primary orange on dark passes for large text', () => {
    const ratio = contrast(hex('oklch(0.795 0.163 70)'), hex('oklch(0.145 0 0)'))
    expect(ratio).toBeGreaterThan(3)
  })

  it('primary foreground on primary passes', () => {
    const ratio = contrast(hex('oklch(0.147 0 0)'), hex('oklch(0.795 0.163 70)'))
    expect(ratio).toBeGreaterThan(4.5)
  })
})
