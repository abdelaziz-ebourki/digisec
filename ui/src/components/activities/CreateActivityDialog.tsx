import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarIcon, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createActivity } from '@/services/activities'
import type { ActivityResponse } from '@/services/types'
import { parseApiError } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface CreateActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateActivityDialog({ open, onOpenChange }: CreateActivityDialogProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      createActivity({
        title: title.trim(),
        activityDate: format(date as Date, 'yyyy-MM-dd'),
        message: message.trim(),
        file,
      }),
    onSuccess: (activity: ActivityResponse) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Activité publiée !')
      setTitle('')
      setDate(undefined)
      setMessage('')
      setFile(null)
      onOpenChange(false)
      return activity
    },
    onError: (error) => toast.error(parseApiError(error).message),
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (title.trim() && date && message.trim()) mutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle activité</DialogTitle>
          <DialogDescription>Partagez un événement avec la communauté.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity-title">Titre</Label>
            <Input
              id="activity-title"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex. Atelier Cybersécurité"
            />
          </div>
          <div className="space-y-2">
            <Label>Date de l'activité</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Choisir la date de l'activité"
                  className={cn(
                    'w-full justify-start font-normal',
                    !date && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon />
                  {date ? format(date, 'PPP', { locale: fr }) : 'Choisir une date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={fr}
                  disabled={{ after: new Date(2100, 0, 1) }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-message">Description</Label>
            <Textarea
              id="activity-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez l'événement…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-file">Image (optionnelle)</Label>
            <Input
              id="activity-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !date || !message.trim() || mutation.isPending}
            >
              {mutation.isPending && <LoaderCircle className="animate-spin" />}
              Publier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
