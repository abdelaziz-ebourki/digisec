import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-center">
      <p className="text-amber-400 text-7xl font-bold">404</p>
      <h1 className="mt-2 text-2xl font-bold">Page <span className="text-amber-400">introuvable</span></h1>
      <Button asChild className="mt-6">
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </section>
  )
}
