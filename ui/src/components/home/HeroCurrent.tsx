import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useTypewriter } from '@/hooks/useTypewriter'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const TYPED_PHRASES = [
  'Rejoignez DIGISEC',
  "Façonnez l'avenir de la cybersécurité",
  'Apprendre · Se connecter · Innover',
]

export function HeroCurrent() {
  const typed = useTypewriter(TYPED_PHRASES)

  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      <div
        aria-hidden
        className="bg-primary/20 absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full blur-3xl"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-28 text-center">
        <Badge variant="outline" className="border-primary/50 text-primary mb-6">
          Club FSBM · Digital & Cybersécurité
        </Badge>
        <h1 className="min-h-[3.5rem] text-4xl font-bold tracking-tight sm:text-5xl">
          {typed}
          <span aria-hidden className="text-primary animate-pulse">
            |
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-neutral-300">
          <span className="font-semibold text-primary">Digi</span>tale ·{' '}
          <span className="font-semibold text-primary">cyber</span>sécurité — une communauté
          d'étudiants qui apprend, partage et protège le monde numérique de demain.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/register">
              Devenir membre <ArrowRight />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/digisec">Découvrir le club</Link>
          </Button>
        </div>
        <ChevronDown aria-hidden className="text-primary mt-14 size-8 animate-bounce" />
      </div>
    </section>
  )
}
