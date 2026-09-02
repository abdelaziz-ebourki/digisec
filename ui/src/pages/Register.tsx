import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { MailCheck } from 'lucide-react'
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

interface FormState {
  firstName: string
  lastName: string
  codeApoge: string
  email: string
  phoneNumber: string
  password: string
}

const INITIAL: FormState = {
  firstName: '',
  lastName: '',
  codeApoge: '',
  email: '',
  phoneNumber: '',
  password: '',
}

const FIELDS: { name: keyof FormState; label: string; type: string; autoComplete?: string; placeholder?: string }[] = [
  { name: 'firstName', label: 'Prénom', type: 'text', autoComplete: 'given-name' },
  { name: 'lastName', label: 'Nom', type: 'text', autoComplete: 'family-name' },
  { name: 'codeApoge', label: 'Code apogée', type: 'text', placeholder: 'ex. 2300456' },
  {
    name: 'email',
    label: 'Adresse e-mail',
    type: 'email',
    autoComplete: 'email',
    placeholder: 'prenom.nom@exemple.com',
  },
  { name: 'phoneNumber', label: 'Numéro de téléphone', type: 'tel', autoComplete: 'tel', placeholder: '+212 6 XX XX XX XX' },
  { name: 'password', label: 'Mot de passe', type: 'password', autoComplete: 'new-password' },
]

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string>()
  const [registered, setRegistered] = useState(false)

  if (registered) {
    return (
      <section className="mx-auto max-w-md px-4 py-16">
        <Card className="text-center">
          <CardHeader>
            <MailCheck className="text-primary mx-auto size-12" />
            <CardTitle className="mt-2 text-2xl">Vérifiez votre boîte mail</CardTitle>
            <CardDescription>
              Un lien de vérification vous a été envoyé. Il expire dans 24 heures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Retour à la connexion</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    setGlobalError(undefined)
    try {
      await register({ ...form, email: form.email.trim().toLowerCase() })
      setRegistered(true)
    } catch (error) {
      const apiError = parseApiError(error)
      if (apiError.fieldErrors) setFieldErrors(apiError.fieldErrors)
      setGlobalError(apiError.message)
      toast.error(apiError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Adhésion</CardTitle>
          <CardDescription>Rejoignez la communauté DIGISEC en quelques secondes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {globalError && (
              <p role="alert" className="text-destructive rounded-md bg-destructive/10 px-3 py-2 text-sm">
                {globalError}
              </p>
            )}
            {FIELDS.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  aria-invalid={Boolean(fieldErrors[field.name])}
                />
                <FieldError message={fieldErrors[field.name]} />
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Inscription…' : "Créer mon compte"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Déjà membre ?{' '}
            <Link to="/login" className="font-medium text-amber-700 underline dark:text-amber-400">
              Connectez-vous
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
