import { ChevronDown } from 'lucide-react'
import { useTypewriter } from '@/hooks/useTypewriter'

const TYPED_PHRASES = [
  'Join US',
  'And be part of',
  ' A dynamic community',
  ' Shaping the future of cybersecurity',
  'Learn - Network - ...',
]

export function Hero() {
  const typed = useTypewriter(TYPED_PHRASES, {
    typeSpeed: 80,
    deleteSpeed: 50,
    holdTime: 700,
  })

  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      <img
        src="/images/home/hero-shield.png"
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover opacity-40"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-neutral-950/30 via-neutral-950/60 to-neutral-950"
      />
      <div
        aria-hidden
        className="bg-primary/20 absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full blur-3xl"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center">
        <h2 className="text-animation min-h-[3.5rem] text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-primary italic">{typed}</span>
          <span aria-hidden className="text-primary animate-pulse">
            |
          </span>
        </h2>
        <h3 className="mt-4 text-xl font-semibold tracking-wide sm:text-2xl">
          <span className="text-primary italic">Digi</span>tal -{' '}
          <span className="text-primary italic">cyber</span>security
        </h3>
        <ChevronDown
          aria-hidden
          className="text-primary mt-10 size-8 animate-bounce [animation-duration:1.8s]"
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 leading-none"
      >
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="block h-12 w-full fill-white md:h-16"
        >
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" />
        </svg>
      </div>
    </section>
  )
}
