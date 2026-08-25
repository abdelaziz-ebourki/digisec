interface FieldErrorTextProps {
  message?: string
}

export function FieldError({ message }: FieldErrorTextProps) {
  if (!message) return null
  return (
    <p role="alert" className="text-destructive text-sm">
      {message}
    </p>
  )
}
