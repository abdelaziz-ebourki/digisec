import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSingleFlight } from '@/hooks/useSingleFlight'

describe('useSingleFlight', () => {
  it('runs the first call and ignores re-entry while latched', () => {
    const { result } = renderHook(() => useSingleFlight())
    const fn = vi.fn()

    // Same-tick multi-invocation: only the first runs.
    result.current.run(fn)
    result.current.run(fn)
    result.current.run(fn)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('runs again after release', () => {
    const { result } = renderHook(() => useSingleFlight())
    const fn = vi.fn()

    result.current.run(fn)
    expect(fn).toHaveBeenCalledTimes(1)

    result.current.release()
    result.current.run(fn)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
