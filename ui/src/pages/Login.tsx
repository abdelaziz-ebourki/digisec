import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { parseApiError } from '@/services/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/forms/FieldError'

export default function Login() {
  const { user, isLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string>()

  if (!isLoading && user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    setGlobalError(undefined)
    try {
      await login(email.trim(), password)
      toast.success('Connexion réussie. Bienvenue !')
      navigate(from, { replace: true })
    } catch (error) {
      const apiError = parseApiError(error)
      if (apiError.fieldErrors) setFieldErrors(apiError.fieldErrors)
      setGlobalError(apiError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>Accédez à votre espace membre DIGISEC.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {globalError && (
              <p role="alert" className="text-destructive rounded-md bg-destructive/10 px-3 py-2 text-sm">
                {globalError}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="prenom.nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
              />
              <FieldError message={fieldErrors.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
              />
              <FieldError message={fieldErrors.password} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-medium text-amber-700 underline dark:text-amber-400">
              Inscrivez-vous
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
