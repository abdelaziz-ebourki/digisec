import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTypewriter } from '@/hooks/useTypewriter'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
    <section className="relative -mt-14 flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 text-white">
      <img
        src="/images/home/hero-shield.webp"
        alt=""
        aria-hidden
        width={1200}
        height={661}
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover "
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-neutral-950/30 via-neutral-950/60 to-neutral-950"
      />
      <div
        aria-hidden
        className="bg-primary/20 pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full blur-3xl"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-20 pt-32 text-center md:pt-36">
        <Badge>
          FSBM · Université Hassan II
        </Badge>
        <h1
          aria-live="polite"
          className="mt-6 min-h-[4.5rem] text-4xl font-bold tracking-tight sm:min-h-[5.5rem] sm:text-5xl md:text-6xl"
        >
          <span className="text-amber-400 italic">{typed}</span>
          <span aria-hidden className="text-amber-400 motion-safe:animate-pulse">
            |
          </span>
        </h1>
        <p className="mt-2 text-xl font-semibold tracking-wide text-white sm:text-2xl">
          <span className="text-amber-400 italic">Digi</span>tal -{' '}
          <span className="text-amber-400 italic">cyber</span>security
        </p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-200 sm:text-lg">
          Une communauté d'étudiants qui apprend, partage et protège le monde numérique de demain.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/register">
              Rejoindre DIGISEC <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white hover:text-neutral-900"
            asChild
          >
            <Link to="/activities">Voir les activités</Link>
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white">
          <span>14 membres</span>
          <span aria-hidden>·</span>
          <span>7 événements</span>
          <span aria-hidden>·</span>
          <span>FSBM Casablanca</span>
        </div>
      </div>
    </section>
  )
}
