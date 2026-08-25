import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { createPost } from '@/services/posts'
import { parseApiError } from '@/services/api'
import type { PostResponse } from '@/services/types'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (post: PostResponse) => void
}

export function CreatePostDialog({ open, onOpenChange, onCreated }: CreatePostDialogProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const mutation = useMutation({
    mutationFn: () => createPost({ title: title.trim(), content: content.trim() }),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Sujet publié !')
      setTitle('')
      setContent('')
      onOpenChange(false)
      onCreated?.(post)
    },
    onError: (error) => toast.error(parseApiError(error).message),
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (title.trim() && content.trim()) mutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau sujet</DialogTitle>
          <DialogDescription>Partagez une question ou une idée avec la communauté.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post-title">Titre</Label>
            <Input
              id="post-title"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de votre sujet"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-content">Contenu</Label>
            <Textarea
              id="post-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Décrivez votre sujet…"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!title.trim() || !content.trim() || mutation.isPending}>
              {mutation.isPending ? 'Publication…' : 'Publier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
