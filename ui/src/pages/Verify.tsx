import { Link, useSearchParams } from 'react-router-dom'

export default function Verify() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <section className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Vérification du compte</h1>
      {token ? (
        <p className="mt-4 text-muted-foreground">Validation en cours de refonte.</p>
      ) : (
        <p className="mt-4 text-muted-foreground">
          Lien de vérification invalide.{' '}
          <Link to="/login" className="text-primary underline">
            Retour à la connexion
          </Link>
        </p>
      )}
    </section>
  )
}
