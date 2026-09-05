import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Link2Off, LoaderCircle, XCircle } from 'lucide-react'
import { verify } from '@/services/auth'
import { parseApiError } from '@/services/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Verify() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const verification = useQuery({
    queryKey: ['verify', token],
    queryFn: () => verify(token as string),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  })

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      {!token && (
        <Card className="text-center">
          <CardHeader>
            <Link2Off className="text-muted-foreground mx-auto size-12" />
            <CardTitle className="mt-2 text-2xl">Lien invalide</CardTitle>
            <CardDescription>
              Ce lien de vérification est incomplet. Vérifiez votre e-mail et réessayez.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Retour à la connexion</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {token && verification.isPending && (
        <Card className="text-center">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <LoaderCircle className="text-amber-400 size-10 animate-spin" />
            <p className="text-sm text-muted-foreground">Vérification de votre compte en cours…</p>
          </CardContent>
        </Card>
      )}

      {token && verification.isSuccess && (
        <Card className="text-center">
          <CardHeader>
            <CheckCircle2 className="text-amber-400 mx-auto size-12" />
            <CardTitle className="mt-2 text-2xl">Compte vérifié !</CardTitle>
            <CardDescription>{verification.data.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {token && verification.isError && (
        <Card className="text-center">
          <CardHeader>
            <XCircle className="text-destructive mx-auto size-12" />
            <CardTitle className="mt-2 text-2xl">Vérification impossible</CardTitle>
            <CardDescription>{parseApiError(verification.error).message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link to="/register">S'inscrire à nouveau</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/login">Retour à la connexion</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
