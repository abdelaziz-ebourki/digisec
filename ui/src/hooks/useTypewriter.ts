import { useEffect, useState } from 'react'

interface UseTypewriterOptions {
  typeSpeed?: number
  deleteSpeed?: number
  holdTime?: number
}

export function useTypewriter(
  phrases: string[],
  { typeSpeed = 70, deleteSpeed = 40, holdTime = 1800 }: UseTypewriterOptions = {},
) {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (phrases.length === 0) return
    const current = phrases[index % phrases.length]

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setText(current)
      return
    }

    let timeout: ReturnType<typeof setTimeout>

    if (phase === 'typing') {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed)
      } else {
        setPhase('holding')
      }
    } else if (phase === 'holding') {
      timeout = setTimeout(() => setPhase('deleting'), holdTime)
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteSpeed)
      } else {
        setPhase('typing')
        setIndex((i) => (i + 1) % phrases.length)
      }
    }

    return () => clearTimeout(timeout)
  }, [phrases, index, phase, text, typeSpeed, deleteSpeed, holdTime])

  return text
}
