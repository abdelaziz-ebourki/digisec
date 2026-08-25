import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 text-center">
      <p className="text-primary text-7xl font-bold">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page introuvable</h1>
      <Button asChild className="mt-6">
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </section>
  )
}
