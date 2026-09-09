import { useCallback, useRef } from 'react'

/**
 * Synchronous in-flight guard for mutations.
 *
 * `mutation.isPending` only disables submit buttons after React re-renders,
 * so same-tick multi-clicks (fast double-click, Enter key repeat) would fire
 * duplicate requests. This ref-based guard blocks re-entry synchronously.
 *
 * Usage:
 * ```tsx
 * const singleFlight = useSingleFlight()
 * const mutation = useMutation({ ..., onSettled: singleFlight.release })
 * const handleSubmit = (event: FormEvent) => {
 *   event.preventDefault()
 *   if (valid) singleFlight.run(() => mutation.mutate())
 * }
 * ```
 * Keep validation outside `run`: the guard latches on first invocation and
 * only releases in `onSettled`.
 */
export function useSingleFlight() {
  const inFlight = useRef(false)

  const release = useCallback(() => {
    inFlight.current = false
  }, [])

  const run = useCallback((fn: () => void) => {
    if (inFlight.current) return
    inFlight.current = true
    fn()
  }, [])

  return { run, release }
}
