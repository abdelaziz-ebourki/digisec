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
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      <div
        aria-hidden
        className="bg-primary/10 pointer-events-none absolute -top-40 -right-20 size-[40rem] rounded-full blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
        <div className="flex flex-col items-start text-left">
          <Badge variant="outline" className="border-primary/50 text-primary">
            FSBM · Université Hassan II
          </Badge>
          <h1
            aria-live="polite"
            className="mt-6 min-h-[4.5rem] text-4xl font-bold tracking-tight sm:min-h-[5.5rem] sm:text-5xl"
          >
            <span className="text-primary italic">{typed}</span>
            <span
              aria-hidden
              className="text-primary motion-safe:animate-pulse"
            >
              |
            </span>
          </h1>
          <p className="mt-2 text-xl font-semibold tracking-wide text-white">
            <span className="text-primary italic">Digi</span>tal -{' '}
            <span className="text-primary italic">cyber</span>security
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-300">
            Une communauté d'étudiants qui apprend, partage et protège le monde
            numérique de demain.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
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
          <div className="mt-6 flex items-center gap-3 text-sm text-neutral-400">
            <span>14 membres</span>
            <span aria-hidden>·</span>
            <span>7 événements</span>
            <span aria-hidden>·</span>
            <span>FSBM Casablanca</span>
          </div>
        </div>
        <div className="relative">
          <div
            aria-hidden
            className="bg-primary/20 absolute -inset-2 rounded-2xl blur-xl"
          />
          <img
            src="/images/home/hero-shield.webp"
            alt="Illustration cybersécurité — bouclier"
            width={1200}
            height={661}
            fetchPriority="high"
            className="relative w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/10"
          />
        </div>
      </div>
    </section>
  )
}
