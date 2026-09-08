import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarIcon, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { updateActivity } from '@/services/activities'
import { parseApiError } from '@/services/api'
import type { ActivityResponse } from '@/services/types'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
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

interface EditActivityDialogProps {
  activity: ActivityResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function parseDate(value: string): Date | undefined {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

export function EditActivityDialog({ activity, open, onOpenChange }: EditActivityDialogProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)

  useEffect(() => {
    if (activity && open) {
      setTitle(activity.title)
      setDate(parseDate(activity.activityDate))
      setMessage(activity.message)
      setFile(null)
      setRemoveImage(false)
    }
  }, [activity, open])

  const mutation = useMutation({
    mutationFn: () =>
      updateActivity(activity?.id as number, {
        title: title.trim(),
        activityDate: format(date as Date, 'yyyy-MM-dd'),
        message: message.trim(),
        file,
        removeImage,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Activité modifiée !')
      onOpenChange(false)
    },
    onError: (error) => toast.error(parseApiError(error).message),
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (activity && title.trim() && date && message.trim()) mutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;activité</DialogTitle>
          <DialogDescription>Mettez à jour les informations de l&apos;événement.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-activity-title">Titre</Label>
            <Input
              id="edit-activity-title"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex. Atelier Cybersécurité"
            />
          </div>
          <div className="space-y-2">
            <Label>Date de l&apos;activité</Label>
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
            <Label htmlFor="edit-activity-message">Description</Label>
            <Textarea
              id="edit-activity-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez l'événement…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-activity-file">Image (optionnelle)</Label>
            {activity?.imageUrl && !file && (
              <img
                src={activity.imageUrl}
                alt="Image actuelle de l'activité"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            )}
            <Input
              id="edit-activity-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {activity?.imageUrl && !file && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={removeImage}
                  onCheckedChange={(checked) => setRemoveImage(checked === true)}
                  aria-label="Supprimer l'image actuelle"
                />
                Supprimer l&apos;image actuelle
              </label>
            )}
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
              Modifier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
